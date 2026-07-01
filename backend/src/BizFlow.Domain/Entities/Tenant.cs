using System;
using System.Collections.Generic;

namespace BizFlow.Domain.Entities;

public class Tenant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string? TaxCode { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public int? SubscriptionPlanId { get; set; }
    public int? PendingSubscriptionPlanId { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsApproved { get; set; } = true;
    public BizFlow.Domain.Enums.CogsMethod CogsMethod { get; set; } = BizFlow.Domain.Enums.CogsMethod.WeightedAverage;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public SubscriptionPlan? SubscriptionPlan { get; set; }
    public SubscriptionPlan? PendingSubscriptionPlan { get; set; }
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Category> Categories { get; set; } = new List<Category>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
    public ICollection<Customer> Customers { get; set; } = new List<Customer>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<InventoryTransaction> InventoryTransactions { get; set; } = new List<InventoryTransaction>();
    public ICollection<DebtTransaction> DebtTransactions { get; set; } = new List<DebtTransaction>();
    public ICollection<AccountingEntry> AccountingEntries { get; set; } = new List<AccountingEntry>();
    public ICollection<Store> Stores { get; set; } = new List<Store>();
}
