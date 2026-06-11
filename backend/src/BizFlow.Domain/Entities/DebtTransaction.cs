using System;
using BizFlow.Domain.Enums;

namespace BizFlow.Domain.Entities;

public class DebtTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid? OrderId { get; set; }
    public DebtTransactionType Type { get; set; }
    public decimal Amount { get; set; } = 0.00m;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public Customer Customer { get; set; } = null!;
    public Order? Order { get; set; }
}
