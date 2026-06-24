using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using BizFlow.Domain.Entities;
using BizFlow.Domain.Enums;
using BizFlow.Infrastructure.Persistence;
using BizFlow.Infrastructure.Services;
using Xunit;

namespace BizFlow.Tests;

public class OrderServiceTests
{
    private class MockNotificationService : BizFlow.Application.Interfaces.INotificationService
    {
        public Task SendToTenantAsync(Guid tenantId, string message) => Task.CompletedTask;
        public Task SendToUserAsync(Guid userId, string message) => Task.CompletedTask;
    }

    private class MockInventoryService : BizFlow.Application.Interfaces.IInventoryService
    {
        public Task<BizFlow.Application.DTOs.Inventory.ReceiptDto> CreateReceiptAsync(Guid tenantId, BizFlow.Application.DTOs.Inventory.CreateReceiptRequest request, Guid? userId = null) => Task.FromResult(new BizFlow.Application.DTOs.Inventory.ReceiptDto());
        public Task CancelReceiptAsync(Guid tenantId, Guid receiptId, BizFlow.Application.DTOs.Inventory.CancelReceiptRequest request, Guid? userId = null) => Task.CompletedTask;
        public Task<BizFlow.Application.DTOs.Common.PagedResult<BizFlow.Application.DTOs.Inventory.ReceiptDto>> GetReceiptsAsync(Guid tenantId, int type = -1, int pageNumber = 1, int pageSize = 10) => Task.FromResult(new BizFlow.Application.DTOs.Common.PagedResult<BizFlow.Application.DTOs.Inventory.ReceiptDto>());
        public Task<BizFlow.Application.DTOs.Inventory.S2LedgerReportDto> GetS2LedgerAsync(Guid tenantId, Guid productId, DateTime? startDate = null, DateTime? endDate = null, int pageNumber = 1, int pageSize = 10) => Task.FromResult(new BizFlow.Application.DTOs.Inventory.S2LedgerReportDto());
        public Task RecordExportForOrderAsync(Guid tenantId, Guid orderId, Guid productId, decimal quantity, string description, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task RecordImportForReturnAsync(Guid tenantId, Guid orderId, Guid productId, decimal quantity, string description, CancellationToken cancellationToken = default) => Task.CompletedTask;
    }

    // A subclass of ApplicationDbContext to simulate database failures during SaveChangesAsync
    private class TestDbContext : ApplicationDbContext
    {
        public bool ThrowOnCustomerUpdate { get; set; } = false;

        public TestDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            if (ThrowOnCustomerUpdate)
            {
                var customerModified = ChangeTracker.Entries<Customer>()
                    .Any(e => e.State == EntityState.Modified || e.State == EntityState.Added);
                if (customerModified)
                {
                    throw new InvalidOperationException("Simulated database failure on customer debt update!");
                }
            }
            return base.SaveChangesAsync(cancellationToken);
        }
    }

    private (TestDbContext context, SqliteConnection connection) GetDatabaseContext()
    {
        var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;

        var context = new TestDbContext(options);
        context.Database.EnsureCreated();

        return (context, connection);
    }

    private async Task SeedDataAsync(ApplicationDbContext context, Guid tenantId, Guid productId, int productUnitId, Guid customerId)
    {
        // 1. Seed Subscription Plan
        var plan = new SubscriptionPlan
        {
            Id = 999,
            Name = "Plan 999",
            Price = 100000,
            DurationMonths = 12,
            Description = "Test Plan"
        };
        context.SubscriptionPlans.Add(plan);

        // 2. Seed Tenant
        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "Test Store",
            OwnerName = "Owner",
            SubscriptionPlanId = plan.Id
        };
        context.Tenants.Add(tenant);

        // 3. Seed Category
        var category = new Category
        {
            Id = 99,
            TenantId = tenantId,
            Name = "Nước giải khát"
        };
        context.Categories.Add(category);

        // 4. Seed Product (Coca-Cola, BaseUnit = "Lon")
        var product = new Product
        {
            Id = productId,
            TenantId = tenantId,
            CategoryId = category.Id,
            Code = "8934588012111",
            Name = "Coca-Cola",
            BaseUnit = "Lon",
            StockQuantity = 100
        };
        context.Products.Add(product);

        // 5. Seed Product Units
        var unitLon = new ProductUnit
        {
            Id = 101,
            ProductId = productId,
            UnitName = "Lon",
            ConversionRate = 1,
            Price = 10000,
            IsDefault = true
        };
        var unitThung = new ProductUnit
        {
            Id = productUnitId,
            ProductId = productId,
            UnitName = "Thùng",
            ConversionRate = 24,
            Price = 220000,
            IsDefault = false
        };
        context.ProductUnits.AddRange(unitLon, unitThung);

        // 6. Seed Customer
        var customer = new Customer
        {
            Id = customerId,
            TenantId = tenantId,
            Fullname = "Khách Hàng A",
            Phone = "0987654321",
            TotalDebt = 0.00m
        };
        context.Customers.Add(customer);

        await context.SaveChangesAsync();
    }

    [Fact]
    public async Task UnitConversion_SellingCase_CorrectlyReducesBaseUnitInventory()
    {
        // Arrange
        var (context, connection) = GetDatabaseContext();
        try
        {
            var tenantId = Guid.NewGuid();
            var productId = Guid.NewGuid();
            var unitId = 202;
            var customerId = Guid.NewGuid();

            await SeedDataAsync(context, tenantId, productId, unitId, customerId);

            var orderService = new OrderService(context, new MockNotificationService(), new MockInventoryService());

            var order = new Order
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                CustomerId = customerId,
                PaymentMethod = PaymentMethod.Cash,
                OrderSource = OrderSource.Manual,
                Status = OrderStatus.Draft
            };

            order.OrderItems.Add(new OrderItem
            {
                ProductId = productId,
                ProductUnitId = unitId, // "Thùng" (conversion = 24)
                Quantity = 2 // 2 thùng
            });

            // Act
            var result = await orderService.CreateOrderAsync(order);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(OrderStatus.Completed, result.Status);
            Assert.Equal(440000m, result.TotalAmount); // 2 * 220,000

            // Verify inventory transaction
            var invTx = await context.InventoryTransactions
                .FirstOrDefaultAsync(t => t.ProductId == productId && t.TenantId == tenantId);

            Assert.NotNull(invTx);
            Assert.Equal(InventoryTransactionType.Export, invTx.Type);
            Assert.Equal(48, invTx.Quantity); // 2 thùng * 24 lon/thùng = 48 lon
        }
        finally
        {
            connection.Close();
        }
    }

    [Fact]
    public async Task DebtPayment_WithoutCustomer_ThrowsValidationException()
    {
        // Arrange
        var (context, connection) = GetDatabaseContext();
        try
        {
            var tenantId = Guid.NewGuid();
            var productId = Guid.NewGuid();
            var unitId = 303;
            var customerId = Guid.NewGuid();

            await SeedDataAsync(context, tenantId, productId, unitId, customerId);

            var orderService = new OrderService(context, new MockNotificationService(), new MockInventoryService());

            var order = new Order
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                CustomerId = null, // Missing customer ID for debt
                PaymentMethod = PaymentMethod.Debt,
                OrderSource = OrderSource.Manual,
                Status = OrderStatus.Draft
            };

            order.OrderItems.Add(new OrderItem
            {
                ProductId = productId,
                ProductUnitId = unitId,
                Quantity = 1
            });

            // Act & Assert
            var exception = await Assert.ThrowsAsync<ArgumentException>(() => orderService.CreateOrderAsync(order));
            Assert.Equal("Vui lòng chọn khách hàng đăng ký để thực hiện ghi nợ", exception.Message);
        }
        finally
        {
            connection.Close();
        }
    }

    [Fact]
    public async Task Integration_SimulatedCustomerDebtFailure_RollsBackInventoryAndOrder()
    {
        // Arrange
        var (context, connection) = GetDatabaseContext();
        try
        {
            var tenantId = Guid.NewGuid();
            var productId = Guid.NewGuid();
            var unitId = 404;
            var customerId = Guid.NewGuid();

            await SeedDataAsync(context, tenantId, productId, unitId, customerId);

            // Turn on failure toggle
            context.ThrowOnCustomerUpdate = true;

            var orderService = new OrderService(context, new MockNotificationService(), new MockInventoryService());

            var order = new Order
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                CustomerId = customerId,
                PaymentMethod = PaymentMethod.Debt,
                OrderSource = OrderSource.Manual,
                Status = OrderStatus.Draft
            };

            order.OrderItems.Add(new OrderItem
            {
                ProductId = productId,
                ProductUnitId = unitId, // "Thùng"
                Quantity = 1
            });

            // Act & Assert
            // Placing order should throw because context fails on customer debt update
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => orderService.CreateOrderAsync(order));
            Assert.Contains("Simulated database failure on customer debt update!", exception.Message);

            // Disable fail trigger to verify state of DB
            context.ThrowOnCustomerUpdate = false;

            // Verify database state by creating a fresh DbContext sharing the same connection
            var verifyOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite(connection)
                .Options;
            using var verifyContext = new ApplicationDbContext(verifyOptions);

            // Verify order was NOT inserted
            var savedOrder = await verifyContext.Orders.FirstOrDefaultAsync(o => o.Id == order.Id);
            Assert.Null(savedOrder);

            // Verify inventory transaction was NOT inserted
            var invTxs = await verifyContext.InventoryTransactions.Where(i => i.ProductId == productId).ToListAsync();
            Assert.Empty(invTxs); // Rollback was successful: inventory not exported

            // Verify customer debt was NOT modified
            var customer = await verifyContext.Customers.FirstOrDefaultAsync(c => c.Id == customerId);
            Assert.NotNull(customer);
            Assert.Equal(0.00m, customer.TotalDebt);

        }
        finally
        {
            connection.Close();
        }
    }

    [Fact]
    public async Task E2E_POS_Checkout_And_Cancellation_Succeeds()
    {
        // Arrange
        var (context, connection) = GetDatabaseContext();
        try
        {
            var tenantId = Guid.NewGuid();
            var productId = Guid.NewGuid();
            var unitId = 505;
            var customerId = Guid.NewGuid();

            await SeedDataAsync(context, tenantId, productId, unitId, customerId);

            var orderService = new OrderService(context, new MockNotificationService(), new MockInventoryService());

            // E2E Check step 1: Place a normal Cash order
            var cashOrder = new Order
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                CustomerId = customerId,
                PaymentMethod = PaymentMethod.Cash,
                OrderSource = OrderSource.AI_Voice,
                Status = OrderStatus.Draft
            };
            cashOrder.OrderItems.Add(new OrderItem
            {
                ProductId = productId,
                ProductUnitId = unitId, // Thùng
                Quantity = 1
            });

            var createdCashOrder = await orderService.CreateOrderAsync(cashOrder);
            Assert.Equal(220000m, createdCashOrder.TotalAmount);
            Assert.Equal(OrderStatus.Completed, createdCashOrder.Status);

            // Verify accounting entry created
            var entry = await context.AccountingEntries.FirstOrDefaultAsync(ae => ae.DocumentRefId == createdCashOrder.Id.ToString());
            Assert.NotNull(entry);
            Assert.Equal(DocumentType.Sales, entry.DocumentType);
            Assert.Equal(AccountCategory.Revenue_Goods, entry.AccountCategory);
            Assert.Equal(220000m, entry.Amount);

            // E2E Check step 2: Cancel the cash order
            var cancelledOrder = await orderService.CancelOrderAsync(createdCashOrder.Id, tenantId);
            Assert.Equal(OrderStatus.Cancelled, cancelledOrder.Status);

            // Verify reversing accounting entry created (Negative amount)
            var reverseEntry = await context.AccountingEntries
                .FirstOrDefaultAsync(ae => ae.DocumentRefId == createdCashOrder.Id.ToString() && ae.Amount < 0);
            Assert.NotNull(reverseEntry);
            Assert.Equal(-220000m, reverseEntry.Amount);

            // Verify inventory adjustment entry created to return stock
            var adjustInv = await context.InventoryTransactions
                .FirstOrDefaultAsync(i => i.ProductId == productId && i.Type == InventoryTransactionType.Adjustment);
            Assert.NotNull(adjustInv);
            Assert.Equal(24, adjustInv.Quantity); // Returned 24 base units (1 thùng)
        }
        finally
        {
            connection.Close();
        }
    }
}
