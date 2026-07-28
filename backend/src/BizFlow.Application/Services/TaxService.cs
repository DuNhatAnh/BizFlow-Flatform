using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Application.DTOs.Taxes;
using BizFlow.Application.DTOs.Tax;
using BizFlow.Application.Interfaces;
using BizFlow.Domain.Entities;
using BizFlow.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace BizFlow.Application.Services;

public class TaxService : ITaxService
{
    private readonly IApplicationDbContext _context;
    private readonly ICashService _cashService;

    public TaxService(IApplicationDbContext context, ICashService cashService)
    {
        _context = context;
        _cashService = cashService;
    }

    public async Task<IEnumerable<TaxObligationDto>> GetS4LedgerAsync(Guid tenantId, int? year, int? month, CancellationToken cancellationToken)
    {
        var query = _context.TaxLedgerEntries.Where(t => t.TenantId == tenantId);
        
        if (year.HasValue)
            query = query.Where(t => t.Year == year.Value);
            
        if (month.HasValue)
            query = query.Where(t => t.Month == month.Value);

        var entries = await query.ToListAsync(cancellationToken);

        // Group by the "Incurred" entry (which acts as the main bill).
        // Since it's a ledger, we aggregate based on LinkedEntryId or the Id itself.
        var obligations = entries
            .Where(e => e.EntryType == TaxEntryType.Incurred)
            .Select(incurred => 
            {
                var payments = entries.Where(p => p.LinkedEntryId == incurred.Id && p.EntryType == TaxEntryType.Payment).Sum(p => p.Amount);
                var adjustments = entries.Where(a => a.LinkedEntryId == incurred.Id && a.EntryType == TaxEntryType.Adjustment).Sum(a => a.Amount);
                
                return new TaxObligationDto
                {
                    Id = incurred.Id,
                    TaxType = incurred.TaxType,
                    Year = incurred.Year,
                    Month = incurred.Month,
                    AmountDue = incurred.Amount + adjustments,
                    AmountPaid = payments,
                    DueDate = incurred.DueDate,
                    Note = incurred.Note,
                    CreatedAt = incurred.CreatedAt
                };
            })
            .OrderByDescending(o => o.Year)
            .ThenByDescending(o => o.Month)
            .ThenByDescending(o => o.CreatedAt)
            .ToList();

        return obligations;
    }

    public async Task<TaxObligationDto> CreateTaxObligationAsync(Guid tenantId, CreateTaxObligationDto request, CancellationToken cancellationToken)
    {
        var entry = new TaxLedgerEntry
        {
            TenantId = tenantId,
            TaxType = request.TaxType,
            EntryType = TaxEntryType.Incurred,
            Year = request.Year,
            Month = request.Month,
            Amount = request.AmountDue,
            DueDate = request.DueDate,
            Note = request.Note,
            CreatedAt = DateTime.UtcNow
        };

        _context.TaxLedgerEntries.Add(entry);
        await _context.SaveChangesAsync(cancellationToken);

        return new TaxObligationDto
        {
            Id = entry.Id,
            TaxType = entry.TaxType,
            Year = entry.Year,
            Month = entry.Month,
            AmountDue = entry.Amount,
            AmountPaid = 0,
            DueDate = entry.DueDate,
            Note = entry.Note,
            CreatedAt = entry.CreatedAt
        };
    }

    public async Task<TaxObligationDto> PayTaxAsync(Guid tenantId, Guid taxId, Guid userId, PayTaxRequestDto request, CancellationToken cancellationToken)
    {
        // Ideally use a transaction, but IApplicationDbContext doesn't expose it directly.
        // Can be refactored to use IUnitOfWork pattern.
        
        try
        {
            var incurredEntry = await _context.TaxLedgerEntries
                .FirstOrDefaultAsync(t => t.Id == taxId && t.TenantId == tenantId && t.EntryType == TaxEntryType.Incurred, cancellationToken);
                
            if (incurredEntry == null)
            {
                throw new Exception("Tax obligation not found.");
            }

            // Create Cash Transaction for Payment
            var createCashTxRequest = new BizFlow.Application.DTOs.Cash.CreateCashTransactionRequest
            {
                Type = CashTransactionType.Payment,
                Amount = request.AmountToPay,
                PaymentMethod = request.PaymentMethod,
                Reason = $"Nộp thuế {incurredEntry.TaxType} kỳ {incurredEntry.Month}/{incurredEntry.Year}" + (string.IsNullOrEmpty(request.Note) ? "" : $" - {request.Note}"),
                ReferenceDocument = incurredEntry.Id.ToString()
            };

            var cashTx = await _cashService.CreateTransactionAsync(tenantId, createCashTxRequest, userId);

            // Create Payment Entry in Tax Ledger
            var paymentEntry = new TaxLedgerEntry
            {
                TenantId = tenantId,
                TaxType = incurredEntry.TaxType,
                EntryType = TaxEntryType.Payment,
                Year = incurredEntry.Year,
                Month = incurredEntry.Month,
                Amount = request.AmountToPay, // Positive amount stored, representing the payment magnitude
                LinkedEntryId = incurredEntry.Id,
                ReferenceTransactionId = cashTx.Id,
                Note = request.Note,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.TaxLedgerEntries.Add(paymentEntry);
            await _context.SaveChangesAsync(cancellationToken);
            
            // No manual transaction commit needed as SaveChanges is handled or should be refactored to IUnitOfWork
            
            // Re-calculate the balance to return
            var allRelatedEntries = await _context.TaxLedgerEntries
                .Where(t => t.TenantId == tenantId && (t.Id == taxId || t.LinkedEntryId == taxId))
                .ToListAsync(cancellationToken);
                
            var payments = allRelatedEntries.Where(e => e.EntryType == TaxEntryType.Payment).Sum(e => e.Amount);
            var adjustments = allRelatedEntries.Where(e => e.EntryType == TaxEntryType.Adjustment).Sum(e => e.Amount);
            
            return new TaxObligationDto
            {
                Id = incurredEntry.Id,
                TaxType = incurredEntry.TaxType,
                Year = incurredEntry.Year,
                Month = incurredEntry.Month,
                AmountDue = incurredEntry.Amount + adjustments,
                AmountPaid = payments,
                DueDate = incurredEntry.DueDate,
                Note = incurredEntry.Note,
                CreatedAt = incurredEntry.CreatedAt
            };
        }
        catch
        {
            throw;
        }
    }

    public async Task CalculateMonthlyTaxAsync(Guid tenantId, Guid userId, CalculateTaxRequest request, CancellationToken cancellationToken)
    {
        // 1. Check if taxes are already calculated for this month
        var existingTaxes = await _context.TaxLedgerEntries
            .Where(t => t.TenantId == tenantId && t.Year == request.Year && t.Month == request.Month && t.EntryType == TaxEntryType.Incurred)
            .AnyAsync(cancellationToken);

        if (existingTaxes)
        {
            throw new Exception($"Nghĩa vụ thuế kỳ {request.Month}/{request.Year} đã được chốt trước đó.");
        }

        // 2. Query completed orders for the specified month and year
        var completedOrders = await _context.Orders
            .Where(o => o.TenantId == tenantId 
                     && o.Status == OrderStatus.Completed 
                     && o.CreatedAt.Year == request.Year 
                     && o.CreatedAt.Month == request.Month)
            .ToListAsync(cancellationToken);

        if (!completedOrders.Any())
        {
            throw new Exception($"Không có đơn hàng nào hoàn thành trong kỳ {request.Month}/{request.Year} để tính thuế.");
        }

        // 3. Calculate VAT from aggregated TotalVatAmount of orders
        decimal totalVat = completedOrders.Sum(o => o.TotalVatAmount);

        var newEntries = new List<TaxLedgerEntry>();

        if (totalVat > 0)
        {
            newEntries.Add(new TaxLedgerEntry
            {
                TenantId = tenantId,
                TaxType = TaxType.VAT,
                EntryType = TaxEntryType.Incurred,
                Year = request.Year,
                Month = request.Month,
                Amount = totalVat,
                Note = $"Tự động bóc tách từ {completedOrders.Count} hóa đơn (Tháng {request.Month}/{request.Year})",
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow
            });
        }

        if (newEntries.Any())
        {
            _context.TaxLedgerEntries.AddRange(newEntries);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
