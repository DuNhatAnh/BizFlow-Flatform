using Microsoft.EntityFrameworkCore;
using BizFlow.Domain.Entities;

namespace BizFlow.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<SubscriptionPlan> SubscriptionPlans { get; }
    DbSet<Tenant> Tenants { get; }
    DbSet<User> Users { get; }
    DbSet<Category> Categories { get; }
    DbSet<Product> Products { get; }
    DbSet<ProductUnit> ProductUnits { get; }
    DbSet<InventoryTransaction> InventoryTransactions { get; }
    DbSet<Customer> Customers { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<DebtTransaction> DebtTransactions { get; }
    DbSet<AccountingEntry> AccountingEntries { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
