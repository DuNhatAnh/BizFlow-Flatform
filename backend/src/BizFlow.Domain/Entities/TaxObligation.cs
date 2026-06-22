using System;
using BizFlow.Domain.Enums;

namespace BizFlow.Domain.Entities;

public class TaxObligation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public TaxType TaxType { get; set; }
    public int Year { get; set; }
    public int Month { get; set; } // 0 if annual
    public decimal AmountDue { get; set; }
    public decimal AmountPaid { get; set; }
    public DateTime? DueDate { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Tenant Tenant { get; set; } = null!;
}
