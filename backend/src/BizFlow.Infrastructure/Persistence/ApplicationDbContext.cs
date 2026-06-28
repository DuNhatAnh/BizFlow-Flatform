using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Domain.Entities;
using BizFlow.Domain.Enums;

namespace BizFlow.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

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
            entity.HasOne(e => e.SubscriptionPlan)
                .WithMany(s => s.Tenants)
                .HasForeignKey(e => e.SubscriptionPlanId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // 2.5. Store configurations
        modelBuilder.Entity<Store>(entity =>
        {
            entity.ToTable("stores");
            entity.HasOne(e => e.Tenant)
                  .WithMany(t => t.Stores)
                  .HasForeignKey(e => e.TenantId)
                  .OnDelete(DeleteBehavior.Cascade);
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
            entity.HasOne(e => e.Parent)
                  .WithMany(e => e.SubCategories)
                  .HasForeignKey(e => e.ParentId)
                  .OnDelete(DeleteBehavior.Restrict);
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
        });

        // 9. Order configurations
        modelBuilder.Entity<Order>(entity =>
        {
            entity.ToTable("orders");
            entity.Property(e => e.TotalAmount).HasPrecision(15, 2);
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

        // 13. InventoryReceipt configurations
        modelBuilder.Entity<InventoryReceipt>(entity =>
        {
            entity.ToTable("inventory_receipts");
            entity.Property(e => e.Type).HasConversion<string>();
            entity.Property(e => e.TotalAmount).HasPrecision(15, 2);
            
            entity.HasOne(e => e.Creator)
                .WithMany()
                .HasForeignKey(e => e.CreatedBy);
        });

        // 14. InventoryReceiptDetail configurations
        modelBuilder.Entity<InventoryReceiptDetail>(entity =>
        {
            entity.ToTable("inventory_receipt_details");
            entity.Property(e => e.Quantity).HasPrecision(18, 4);
            entity.Property(e => e.UnitPrice).HasPrecision(15, 2);
            entity.Property(e => e.TotalPrice).HasPrecision(15, 2);
        });

        // 15. AccountingLedgerS2 configurations
        modelBuilder.Entity<AccountingLedgerS2>(entity =>
        {
            entity.ToTable("accounting_ledger_s2");
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
            entity.Property(e => e.Amount).HasPrecision(15, 2);
            entity.Property(e => e.Type).HasConversion<string>();
            entity.Property(e => e.PaymentMethod).HasConversion<string>();
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
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed default subscription plan
        modelBuilder.Entity<SubscriptionPlan>().HasData(
            new SubscriptionPlan
            {
                Id = 1,
                Name = "Gói Chuyên Nghiệp",
                Price = 500000.00m,
                DurationMonths = 12,
                Description = "Đầy đủ các chức năng quản lý, báo cáo thuế TT88 và Trợ lý AI",
                CreatedAt = new DateTime(2026, 6, 11, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        // Seed default tenants
        var systemTenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");
        var storeTenantId = Guid.Parse("11111111-1111-1111-1111-111111111111");


        modelBuilder.Entity<Tenant>().HasData(
            new Tenant
            {
                Id = systemTenantId,
                Name = "BizFlow System Tenant",
                OwnerName = "System Admin",
                IsActive = true,
                CreatedAt = new DateTime(2026, 6, 11, 0, 0, 0, DateTimeKind.Utc)
            },
            new Tenant
            {
                Id = storeTenantId,
                Name = "Cửa Hàng Tạp Hóa Bình Minh",
                OwnerName = "Nguyễn Văn A",
                SubscriptionPlanId = 1,
                IsActive = true,
                CreatedAt = new DateTime(2026, 6, 11, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        // Seed default store
        modelBuilder.Entity<Store>().HasData(
            new Store
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                TenantId = storeTenantId,
                Name = "Cửa Hàng Tạp Hóa Bình Minh (CN1)",
                Address = "123 Đường Số 1, Quận 1, TP.HCM",
                Phone = "0901234567",
                IsActive = true,
                CreatedAt = new DateTime(2026, 6, 11, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        // Seed default users (Admin, Owner, Employee)
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = Guid.Parse("aaaabbbb-cccc-dddd-eeee-111122223333"),
                TenantId = systemTenantId,
                Username = "admin@bizflow.com",
                PasswordHash = "admin123", // In a real app, hash this password (e.g. BCrypt)
                Fullname = "Quản Trị Viên Hệ Thống",
                Role = UserRole.Admin,
                IsActive = true,
                CreatedAt = new DateTime(2026, 6, 11, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = Guid.Parse("aaaabbbb-cccc-dddd-eeee-444455556666"),
                TenantId = storeTenantId,
                Username = "owner@bizflow.com",
                PasswordHash = "owner123",
                Fullname = "Nguyễn Văn A",
                Role = UserRole.Owner,
                IsActive = true,
                CreatedAt = new DateTime(2026, 6, 11, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = Guid.Parse("aaaabbbb-cccc-dddd-eeee-777788889999"),
                TenantId = storeTenantId,
                Username = "employee@bizflow.com",
                PasswordHash = "employee123",
                Fullname = "Trần Thị B",
                Role = UserRole.Employee,
                IsActive = true,
                CreatedAt = new DateTime(2026, 6, 11, 0, 0, 0, DateTimeKind.Utc)
            }
        );


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

