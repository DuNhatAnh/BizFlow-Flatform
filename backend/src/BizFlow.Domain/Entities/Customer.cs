using System;
using System.Collections.Generic;

namespace BizFlow.Domain.Entities;

public class Customer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public string Fullname { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public decimal TotalDebt { get; set; } = 0.00m;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<DebtTransaction> DebtTransactions { get; set; } = new List<DebtTransaction>();
}
