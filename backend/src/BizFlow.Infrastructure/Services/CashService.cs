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

    public CashService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<CashTransactionDto>> GetTransactionsAsync(Guid tenantId, int pageNumber = 1, int pageSize = 10)
    {
        var query = _context.CashTransactions
            .Where(c => c.TenantId == tenantId)
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
        // Generate TransactionCode according to TT88
        var prefix = request.Type == CashTransactionType.Receipt ? "PT" : "PC";
        var dateStr = DateTime.UtcNow.ToString("yyMMdd");
        
        // Count today's transactions to generate sequential number
        var today = DateTime.UtcNow.Date;
        var countToday = await _context.CashTransactions
            .Where(c => c.TenantId == tenantId && c.Type == request.Type && c.CreatedAt >= today)
            .CountAsync();
            
        var seq = (countToday + 1).ToString("D3");
        var txCode = $"{prefix}-{dateStr}-{seq}";

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
