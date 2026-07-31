using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Application.DTOs.Cash;
using BizFlow.Application.DTOs.Common;
using BizFlow.Application.Interfaces;
using BizFlow.Domain.Entities;
using BizFlow.Domain.Enums;

namespace BizFlow.Infrastructure.Services;

public class CashService : ICashService
{
    private readonly IApplicationDbContext _context;
    private readonly INumberSequenceService _sequenceService;

    public CashService(IApplicationDbContext context, INumberSequenceService sequenceService)
    {
        _context = context;
        _sequenceService = sequenceService;
    }

    public async Task<PagedResult<CashTransactionDto>> GetTransactionsAsync(Guid tenantId, int pageNumber = 1, int pageSize = 10)
    {
        var query = _context.CashTransactions
            .Where(c => c.TenantId == tenantId)
            .AsNoTracking()
            .OrderByDescending(c => c.CreatedAt);

        var totalCount = await query.CountAsync();

        var entities = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var relatedUserIds = entities.Where(e => e.RelatedUserId.HasValue).Select(e => e.RelatedUserId.Value).Distinct().ToList();
        var userNames = new Dictionary<Guid, string>();
        if (relatedUserIds.Any())
        {
            userNames = await _context.Users
                .Where(u => relatedUserIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.Fullname);
        }

        var items = entities.Select(c => new CashTransactionDto
        {
            Id = c.Id,
            Type = c.Type,
            PaymentMethod = c.PaymentMethod,
            Amount = c.Amount,
            TransactionDate = c.TransactionDate,
            TransactionCode = c.TransactionCode,
            Reason = c.Reason,
            ReferenceDocument = c.ReferenceDocument,
            RelatedUserId = c.RelatedUserId,
            PayerReceiverName = c.PayerReceiverName,
            Address = c.Address,
            AttachedDocuments = c.AttachedDocuments,
            CreatedAt = c.CreatedAt,
            CreatorName = c.RelatedUserId.HasValue && userNames.ContainsKey(c.RelatedUserId.Value)
                ? userNames[c.RelatedUserId.Value]
                : null
        }).ToList();

        return new PagedResult<CashTransactionDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<decimal> GetCashBalanceAsync(Guid tenantId)
    {
        var totalIn = await _context.CashTransactions
            .Where(c => c.TenantId == tenantId && c.Type == CashTransactionType.Receipt)
            .SumAsync(c => c.Amount);

        var totalOut = await _context.CashTransactions
            .Where(c => c.TenantId == tenantId && c.Type == CashTransactionType.Payment)
            .SumAsync(c => c.Amount);

        return totalIn - totalOut;
    }

    public async Task<CashTransactionDto> CreateTransactionAsync(Guid tenantId, CreateCashTransactionRequest request, Guid userId)
    {
        // Business Validation: Không cho phép âm quỹ
        if (request.Type == CashTransactionType.Payment)
        {
            var currentBalance = await GetCashBalanceAsync(tenantId);
            if (currentBalance < request.Amount)
            {
                throw new InvalidOperationException($"Không thể chi số tiền ({request.Amount:N0}). Số dư quỹ hiện tại ({currentBalance:N0}) không đủ.");
            }
        }

        // Generate TransactionCode according to TT88
        var prefix = request.Type == CashTransactionType.Receipt ? "PT" : "PC";
        var txCode = await _sequenceService.GetNextSequenceAsync(tenantId, prefix);

        var transaction = new CashTransaction
        {
            TenantId = tenantId,
            Type = request.Type,
            PaymentMethod = request.PaymentMethod,
            Amount = request.Amount,
            TransactionDate = DateTime.UtcNow,
            TransactionCode = txCode,
            Reason = request.Reason,
            ReferenceDocument = request.ReferenceDocument,
            RelatedUserId = request.RelatedUserId ?? userId,
            PayerReceiverName = request.PayerReceiverName,
            Address = request.Address,
            AttachedDocuments = request.AttachedDocuments,
            CreatedAt = DateTime.UtcNow
        };

        _context.CashTransactions.Add(transaction);

        // Double-entry bookkeeping: If it's a payment and marked as an expense, create an ExpenseRecord for Sổ S3
        if (request.IsExpense && request.Type == CashTransactionType.Payment && request.ExpenseCategory.HasValue)
        {
            var expense = new ExpenseRecord
            {
                TenantId = tenantId,
                Category = request.ExpenseCategory.Value,
                Amount = request.Amount,
                ExpenseDate = DateTime.UtcNow,
                Description = request.Reason ?? "Chi phí kinh doanh",
                ReferenceDocument = txCode, // Link back to the payment voucher code
                RelatedUserId = request.RelatedUserId ?? userId,
                CreatedAt = DateTime.UtcNow
            };
            _context.ExpenseRecords.Add(expense);
        }

        var log = new AuditLog
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = userId,
            Action = "Create",
            EntityName = "CashTransaction",
            EntityId = transaction.Id.ToString(),
            Timestamp = DateTime.UtcNow,
            Details = $"Created cash transaction #{transaction.TransactionCode} for {transaction.Amount:N0}"
        };
        _context.AuditLogs.Add(log);

        await _context.SaveChangesAsync();

        return new CashTransactionDto
        {
            Id = transaction.Id,
            Type = transaction.Type,
            PaymentMethod = transaction.PaymentMethod,
            Amount = transaction.Amount,
            TransactionDate = transaction.TransactionDate,
            TransactionCode = transaction.TransactionCode,
            Reason = transaction.Reason,
            ReferenceDocument = transaction.ReferenceDocument,
            RelatedUserId = transaction.RelatedUserId,
            PayerReceiverName = transaction.PayerReceiverName,
            Address = transaction.Address,
            AttachedDocuments = transaction.AttachedDocuments,
            CreatedAt = transaction.CreatedAt
        };
    }
}
