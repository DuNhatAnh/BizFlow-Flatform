using System;
using BizFlow.Domain.Enums;

namespace BizFlow.Domain.Entities;

public class CashTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public CashTransactionType Type { get; set; } // Receipt or Payment
    public PaymentMethod PaymentMethod { get; set; } // Cash for S6, Transfer for S7
    public decimal Amount { get; set; }
    public DateTime TransactionDate { get; set; }
    public string TransactionCode { get; set; } = string.Empty; // Mã phiếu: PT-YYMMDD-xxx
    public string? Reason { get; set; }
    public string? ReferenceDocument { get; set; } // e.g., Invoice No
    public Guid? RelatedUserId { get; set; } // The person who paid or received
    public string? PayerReceiverName { get; set; } // Name of payer/receiver if not a user
    public string? Address { get; set; } // Địa chỉ (TT88)
    public string? AttachedDocuments { get; set; } // Kèm theo chứng từ gốc (TT88)
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Tenant Tenant { get; set; } = null!;
}
