using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Domain.Entities;

namespace BizFlow.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<SubscriptionPlan> SubscriptionPlans => Set<SubscriptionPlan>();
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductUnit> ProductUnits => Set<ProductUnit>();
    public DbSet<InventoryTransaction> InventoryTransactions => Set<InventoryTransaction>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<DebtTransaction> DebtTransactions => Set<DebtTransaction>();
    public DbSet<AccountingEntry> AccountingEntries => Set<AccountingEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply Global Configurations

        // 1. SubscriptionPlan configurations
        modelBuilder.Entity<SubscriptionPlan>(entity =>
        {
            entity.ToTable("subscription_plans");
            entity.Property(e => e.Price).HasPrecision(15, 2);
        });

        // 2. Tenant configurations
        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.ToTable("tenants");
            entity.HasOne(e => e.SubscriptionPlan)
                .WithMany(s => s.Tenants)
                .HasForeignKey(e => e.SubscriptionPlanId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // 3. User configurations
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasIndex(e => new { e.TenantId, e.Username }).IsUnique();
            entity.Property(e => e.Role).HasConversion<string>();
        });

        // 4. Category configurations
        modelBuilder.Entity<Category>(entity =>
        {
            entity.ToTable("categories");
        });

        // 5. Product configurations
        modelBuilder.Entity<Product>(entity =>
        {
            entity.ToTable("products");
        });

        // 6. ProductUnit configurations
        modelBuilder.Entity<ProductUnit>(entity =>
        {
            entity.ToTable("product_units");
            entity.Property(e => e.Price).HasPrecision(15, 2);
        });

        // 7. InventoryTransaction configurations
        modelBuilder.Entity<InventoryTransaction>(entity =>
        {
            entity.ToTable("inventory_transactions");
            entity.Property(e => e.Type).HasConversion<string>();
        });

        // 8. Customer configurations
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.ToTable("customers");
            entity.Property(e => e.TotalDebt).HasPrecision(15, 2);
        });

        // 9. Order configurations
        modelBuilder.Entity<Order>(entity =>
        {
            entity.ToTable("orders");
            entity.Property(e => e.TotalAmount).HasPrecision(15, 2);
            entity.Property(e => e.PaymentMethod).HasConversion<string>();
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.OrderSource).HasConversion<string>();
        });

        // 10. OrderItem configurations
        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.ToTable("order_items");
            entity.Property(e => e.UnitPrice).HasPrecision(15, 2);
            entity.Property(e => e.TotalPrice).HasPrecision(15, 2);
        });

        // 11. DebtTransaction configurations
        modelBuilder.Entity<DebtTransaction>(entity =>
        {
            entity.ToTable("debt_transactions");
            entity.Property(e => e.Amount).HasPrecision(15, 2);
            entity.Property(e => e.Type).HasConversion<string>();
        });

        // 12. AccountingEntry configurations
        modelBuilder.Entity<AccountingEntry>(entity =>
        {
            entity.ToTable("accounting_entries");
            entity.Property(e => e.Amount).HasPrecision(15, 2);
            entity.Property(e => e.DocumentType).HasConversion<string>();
            entity.Property(e => e.AccountCategory).HasConversion<string>();
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return base.SaveChangesAsync(cancellationToken);
    }
}
