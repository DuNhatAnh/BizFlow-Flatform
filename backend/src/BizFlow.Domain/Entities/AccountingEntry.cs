using System;
using BizFlow.Domain.Enums;

namespace BizFlow.Domain.Entities;

public class AccountingEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
    public DocumentType DocumentType { get; set; }
    public string? DocumentRefId { get; set; } // Link to order_id or import slip ID
    public AccountCategory AccountCategory { get; set; }
    public decimal Amount { get; set; } = 0.00m;
    public string? Description { get; set; }

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
}
