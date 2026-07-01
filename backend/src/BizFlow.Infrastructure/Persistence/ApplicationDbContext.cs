using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Domain.Entities;
using BizFlow.Domain.Enums;

namespace BizFlow.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    private readonly ICurrentTenantService? _tenantService;

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ICurrentTenantService? tenantService = null)
        : base(options)
    {
        _tenantService = tenantService;
    }

    public Guid? CurrentTenantId => _tenantService?.TenantId;

    public DbSet<SubscriptionPlan> SubscriptionPlans => Set<SubscriptionPlan>();
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Store> Stores => Set<Store>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductUnit> ProductUnits => Set<ProductUnit>();
    public DbSet<ProductHistory> ProductHistories => Set<ProductHistory>();
    public DbSet<InventoryTransaction> InventoryTransactions => Set<InventoryTransaction>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<DebtTransaction> DebtTransactions => Set<DebtTransaction>();
    public DbSet<AccountingEntry> AccountingEntries => Set<AccountingEntry>();
    public DbSet<InventoryReceipt> InventoryReceipts => Set<InventoryReceipt>();
    public DbSet<InventoryReceiptDetail> InventoryReceiptDetails => Set<InventoryReceiptDetail>();
    public DbSet<AccountingLedgerS2> AccountingLedgerS2s => Set<AccountingLedgerS2>();
    public DbSet<CashTransaction> CashTransactions => Set<CashTransaction>();
    public DbSet<ExpenseRecord> ExpenseRecords => Set<ExpenseRecord>();
    public DbSet<TaxObligation> TaxObligations => Set<TaxObligation>();
    public DbSet<PayrollRecord> PayrollRecords => Set<PayrollRecord>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

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
            entity.Property(e => e.CogsMethod).HasDefaultValue(CogsMethod.WeightedAverage);
            entity.HasOne(e => e.SubscriptionPlan)
                .WithMany(s => s.Tenants)
                .HasForeignKey(e => e.SubscriptionPlanId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // 2.5. Store configurations
        modelBuilder.Entity<Store>(entity =>
        {
            entity.ToTable("stores");
            entity.Property(e => e.EnableVat).HasDefaultValue(false);
            entity.Property(e => e.DefaultVatRate).HasDefaultValue("10");
            entity.Property(e => e.AvailableVatRates).HasDefaultValue("0,5,8,8.5,10,KCT");
            entity.HasIndex(e => e.TenantId);
            entity.HasOne(e => e.Tenant)
                  .WithMany(t => t.Stores)
                  .HasForeignKey(e => e.TenantId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 3. User configurations
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasIndex(e => e.Username).IsUnique();
            entity.Property(e => e.Role).HasConversion<string>();
        });

        // 4. Category configurations
        modelBuilder.Entity<Category>(entity =>
        {
            entity.ToTable("categories");
            entity.HasOne(e => e.Parent)
                  .WithMany(e => e.SubCategories)
                  .HasForeignKey(e => e.ParentId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // 5. Product configurations
        modelBuilder.Entity<Product>(entity =>
        {
            entity.ToTable("products");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.IsDeleted).HasDefaultValue(false);
            entity.Property(e => e.VatRate).HasDefaultValue("10");
            entity.Property(e => e.PriceIncludesVat).HasDefaultValue(true);
        });

        // 6. ProductUnit configurations
        modelBuilder.Entity<ProductUnit>(entity =>
        {
            entity.ToTable("product_units");
            entity.Property(e => e.Price).HasPrecision(15, 2);
        });

        // 6.5. ProductHistory configurations
        modelBuilder.Entity<ProductHistory>(entity =>
        {
            entity.ToTable("product_histories");
            entity.HasOne(e => e.Product)
                .WithMany() // Assuming we don't necessarily need a collection on Product entity to keep it simple, or we can add it. Let's assume we don't add navigation collection to Product to avoid loading large histories by default.
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // 7. InventoryTransaction configurations
        modelBuilder.Entity<InventoryTransaction>(entity =>
        {
            entity.ToTable("inventory_transactions");
            entity.Property(e => e.Type).HasConversion<string>();
            entity.Property(e => e.Quantity).HasPrecision(15, 4);
            entity.Property(e => e.UnitPrice).HasPrecision(18, 4).HasDefaultValue(0m);
            entity.Property(e => e.PriceType).HasDefaultValue(InventoryPriceType.CostPrice);
            entity.HasOne(e => e.Creator)
                .WithMany()
                .HasForeignKey(e => e.CreatedBy)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // 8. Customer configurations
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.ToTable("customers");
            entity.Property(e => e.TotalDebt).HasPrecision(15, 2);
            entity.Property(e => e.DebtLimit).HasPrecision(15, 2).HasDefaultValue(10000000.00m);
        });

        // 9. Order configurations
        modelBuilder.Entity<Order>(entity =>
        {
            entity.ToTable("orders");
            entity.Property(e => e.TotalAmount).HasPrecision(15, 2);
            entity.Property(e => e.TotalVatAmount).HasPrecision(18, 2).HasDefaultValue(0.00m);
            entity.Property(e => e.PaymentMethod).HasConversion<string>();
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.OrderSource).HasConversion<string>();
            entity.HasOne(e => e.Creator)
                .WithMany()
                .HasForeignKey(e => e.CreatedBy)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // 10. OrderItem configurations
        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.ToTable("order_items");
            entity.Property(e => e.Quantity).HasPrecision(15, 4);
            entity.Property(e => e.UnitPrice).HasPrecision(15, 2);
            entity.Property(e => e.TotalPrice).HasPrecision(15, 2);
            entity.Property(e => e.VatAmount).HasPrecision(18, 2).HasDefaultValue(0.00m);
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

        // 13. InventoryReceipt configurations
        modelBuilder.Entity<InventoryReceipt>(entity =>
        {
            entity.ToTable("inventory_receipts");
            entity.HasIndex(e => e.TenantId);
            entity.Property(e => e.Type).HasConversion<string>();
            entity.Property(e => e.TotalAmount).HasPrecision(15, 2);
            entity.Property(e => e.TotalVatAmount).HasPrecision(18, 2).HasDefaultValue(0.00m);
            entity.Property(e => e.Status).HasDefaultValue(DocumentStatus.Completed);
            
            entity.HasOne(e => e.Creator)
                .WithMany()
                .HasForeignKey(e => e.CreatedBy);
        });

        // 14. InventoryReceiptDetail configurations
        modelBuilder.Entity<InventoryReceiptDetail>(entity =>
        {
            entity.ToTable("inventory_receipt_details");
            entity.Property(e => e.DocumentQuantity).HasPrecision(18, 4).HasDefaultValue(0m);
            entity.Property(e => e.Quantity).HasPrecision(18, 4);
            entity.Property(e => e.UnitPrice).HasPrecision(15, 2);
            entity.Property(e => e.TotalPrice).HasPrecision(15, 2);
            entity.Property(e => e.VatAmount).HasPrecision(18, 2).HasDefaultValue(0.00m);
        });

        // 15. AccountingLedgerS2 configurations
        modelBuilder.Entity<AccountingLedgerS2>(entity =>
        {
            entity.ToTable("accounting_ledger_s2");
            entity.HasIndex(e => new { e.TenantId, e.ProductId, e.Date }).IsDescending(false, false, true);
            entity.Property(e => e.Type).HasConversion<string>();
            entity.Property(e => e.QuantityIn).HasPrecision(18, 4);
            entity.Property(e => e.ValueIn).HasPrecision(15, 2);
            entity.Property(e => e.QuantityOut).HasPrecision(18, 4);
            entity.Property(e => e.ValueOut).HasPrecision(15, 2);
            entity.Property(e => e.QuantityBalance).HasPrecision(18, 4);
            entity.Property(e => e.ValueBalance).HasPrecision(15, 2);
        });

        // 16. CashTransaction configurations
        modelBuilder.Entity<CashTransaction>(entity =>
        {
            entity.ToTable("cash_transactions");
            entity.HasIndex(e => e.TenantId);
            entity.Property(e => e.Amount).HasPrecision(15, 2);
            entity.Property(e => e.Type).HasConversion<string>();
            entity.Property(e => e.PaymentMethod).HasConversion<string>().HasDefaultValue(PaymentMethod.Cash);
        });

        // 17. ExpenseRecord configurations
        modelBuilder.Entity<ExpenseRecord>(entity =>
        {
            entity.ToTable("expense_records");
            entity.Property(e => e.Amount).HasPrecision(15, 2);
            entity.Property(e => e.Category).HasConversion<string>();
        });

        // 18. TaxObligation configurations
        modelBuilder.Entity<TaxObligation>(entity =>
        {
            entity.ToTable("tax_obligations");
            entity.Property(e => e.AmountDue).HasPrecision(15, 2);
            entity.Property(e => e.AmountPaid).HasPrecision(15, 2);
            entity.Property(e => e.TaxType).HasConversion<string>();
        });

        // 19. PayrollRecord configurations
        modelBuilder.Entity<PayrollRecord>(entity =>
        {
            entity.ToTable("payroll_records");
            entity.Property(e => e.BaseSalary).HasPrecision(15, 2);
            entity.Property(e => e.Allowances).HasPrecision(15, 2);
            entity.Property(e => e.Deductions).HasPrecision(15, 2);
            entity.Property(e => e.NetPay).HasPrecision(15, 2);
        });

        // 20. AuditLog configurations
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("audit_logs");
            entity.HasIndex(e => e.TenantId);
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ==========================================
        // GLOBAL QUERY FILTERS FOR TENANT ISOLATION
        // ==========================================
        modelBuilder.Entity<Store>().HasQueryFilter(e => CurrentTenantId == null || e.TenantId == CurrentTenantId);
        modelBuilder.Entity<User>().HasQueryFilter(e => CurrentTenantId == null || e.TenantId == CurrentTenantId);
        modelBuilder.Entity<Category>().HasQueryFilter(e => CurrentTenantId == null || e.TenantId == CurrentTenantId);
        modelBuilder.Entity<Product>().HasQueryFilter(e => CurrentTenantId == null || e.TenantId == CurrentTenantId);
        // ProductUnit does not have TenantId
        modelBuilder.Entity<ProductHistory>().HasQueryFilter(e => CurrentTenantId == null || e.TenantId == CurrentTenantId);
        modelBuilder.Entity<InventoryTransaction>().HasQueryFilter(e => CurrentTenantId == null || e.TenantId == CurrentTenantId);
        modelBuilder.Entity<Customer>().HasQueryFilter(e => CurrentTenantId == null || e.TenantId == CurrentTenantId);
        modelBuilder.Entity<Order>().HasQueryFilter(e => CurrentTenantId == null || e.TenantId == CurrentTenantId);
        // OrderItem does not have TenantId
        modelBuilder.Entity<DebtTransaction>().HasQueryFilter(e => CurrentTenantId == null || e.TenantId == CurrentTenantId);
        modelBuilder.Entity<AccountingEntry>().HasQueryFilter(e => CurrentTenantId == null || e.TenantId == CurrentTenantId);
        modelBuilder.Entity<InventoryReceipt>().HasQueryFilter(e => CurrentTenantId == null || e.TenantId == CurrentTenantId);
        // InventoryReceiptDetail does not have TenantId
        modelBuilder.Entity<AccountingLedgerS2>().HasQueryFilter(e => CurrentTenantId == null || e.TenantId == CurrentTenantId);
        modelBuilder.Entity<CashTransaction>().HasQueryFilter(e => CurrentTenantId == null || e.TenantId == CurrentTenantId);
        modelBuilder.Entity<ExpenseRecord>().HasQueryFilter(e => CurrentTenantId == null || e.TenantId == CurrentTenantId);
        modelBuilder.Entity<TaxObligation>().HasQueryFilter(e => CurrentTenantId == null || e.TenantId == CurrentTenantId);
        modelBuilder.Entity<PayrollRecord>().HasQueryFilter(e => CurrentTenantId == null || e.TenantId == CurrentTenantId);
        modelBuilder.Entity<AuditLog>().HasQueryFilter(e => CurrentTenantId == null || e.TenantId == CurrentTenantId);





    }

    public async Task<Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        return await Database.BeginTransactionAsync(cancellationToken);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return base.SaveChangesAsync(cancellationToken);
    }
}

