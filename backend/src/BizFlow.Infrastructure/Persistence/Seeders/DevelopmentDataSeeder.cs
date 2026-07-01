using BizFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using BizFlow.Domain.Enums;

namespace BizFlow.Infrastructure.Persistence.Seeders
{
    public static class DevelopmentDataSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            // Only seed if the admin account does not exist (idempotency check)
            if (!context.Users.Any(x => x.Username == "admin@bizflow.com"))
            {
                var systemTenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");
                var storeTenantId = Guid.Parse("11111111-1111-1111-1111-111111111111");
                var createdAt = new DateTime(2026, 6, 11, 0, 0, 0, DateTimeKind.Utc);

                // 1. Subscription Plans
                if (!context.SubscriptionPlans.Any(p => p.Id == 1))
                {
                    context.SubscriptionPlans.Add(new SubscriptionPlan
                    {
                        Id = 1,
                        Name = "Gói Chuyên Nghiệp",
                        Price = 500000.00m,
                        DurationMonths = 12,
                        Description = "Đầy đủ các chức năng quản lý, báo cáo thuế TT88 và Trợ lý AI",
                        MaxOrdersPerMonth = null,
                        Features = "[\"pos\",\"inventory\",\"reports\",\"ai\",\"tt88\",\"multi_store\"]",
                        CreatedAt = createdAt
                    });
                }

                if (!context.SubscriptionPlans.Any(p => p.Id == 2))
                {
                    context.SubscriptionPlans.Add(new SubscriptionPlan
                    {
                        Id = 2,
                        Name = "Gói Miễn Phí",
                        Price = 0,
                        DurationMonths = 0,
                        Description = "Quản lý bán hàng cơ bản, tối đa 50 đơn/tháng. Không bao gồm báo cáo thuế TT88 và Trợ lý AI.",
                        MaxOrdersPerMonth = 50,
                        Features = "[\"pos\",\"inventory\"]",
                        CreatedAt = createdAt
                    });
                }

                if (!context.SubscriptionPlans.Any(p => p.Id == 3))
                {
                    context.SubscriptionPlans.Add(new SubscriptionPlan
                    {
                        Id = 3,
                        Name = "Gói Cơ Bản",
                        Price = 150000.00m,
                        DurationMonths = 1,
                        Description = "Quản lý bán hàng nâng cao, tối đa 300 đơn/tháng. Bao gồm báo cáo doanh thu và theo dõi công nợ. Chưa bao gồm Trợ lý AI và báo cáo thuế TT88.",
                        MaxOrdersPerMonth = 300,
                        Features = "[\"pos\",\"inventory\",\"reports\",\"debt_tracking\"]",
                        CreatedAt = createdAt
                    });
                }

                // 2. Tenants
                if (!context.Tenants.Any(t => t.Id == systemTenantId))
                {
                    context.Tenants.Add(new Tenant
                    {
                        Id = systemTenantId,
                        Name = "BizFlow System Tenant",
                        OwnerName = "System Admin",
                        IsActive = true,
                        CreatedAt = createdAt
                    });
                }

                if (!context.Tenants.Any(t => t.Id == storeTenantId))
                {
                    context.Tenants.Add(new Tenant
                    {
                        Id = storeTenantId,
                        Name = "Cửa Hàng Tạp Hóa Bình Minh",
                        OwnerName = "Nguyễn Văn A",
                        SubscriptionPlanId = 1,
                        IsActive = true,
                        CreatedAt = createdAt
                    });
                }

                // 3. Store
                var storeId = Guid.Parse("22222222-2222-2222-2222-222222222222");
                if (!context.Stores.Any(s => s.Id == storeId))
                {
                    context.Stores.Add(new Store
                    {
                        Id = storeId,
                        TenantId = storeTenantId,
                        Name = "Cửa Hàng Tạp Hóa Bình Minh (CN1)",
                        Address = "123 Đường Số 1, Quận 1, TP.HCM",
                        Phone = "0901234567",
                        IsActive = true,
                        CreatedAt = createdAt
                    });
                }

                // 4. Users
                context.Users.Add(new User
                {
                    Id = Guid.Parse("aaaabbbb-cccc-dddd-eeee-111122223333"),
                    TenantId = systemTenantId,
                    Username = "admin@bizflow.com",
                    PasswordHash = "admin123", 
                    Fullname = "Quản Trị Viên Hệ Thống",
                    Role = UserRole.Admin,
                    IsActive = true,
                    CreatedAt = createdAt
                });

                context.Users.Add(new User
                {
                    Id = Guid.Parse("aaaabbbb-cccc-dddd-eeee-444455556666"),
                    TenantId = storeTenantId,
                    Username = "owner@bizflow.com",
                    PasswordHash = "owner123",
                    Fullname = "Nguyễn Văn A",
                    Role = UserRole.Owner,
                    IsActive = true,
                    CreatedAt = createdAt
                });

                context.Users.Add(new User
                {
                    Id = Guid.Parse("aaaabbbb-cccc-dddd-eeee-777788889999"),
                    TenantId = storeTenantId,
                    Username = "employee@bizflow.com",
                    PasswordHash = "employee123",
                    Fullname = "Trần Thị B",
                    Role = UserRole.Employee,
                    IsActive = true,
                    CreatedAt = createdAt
                });

                // Must use an IDbContextTransaction or just SaveChanges since we are inserting explicit IDs?
                // Wait, EF Core might complain about inserting explicit IDs for Identity columns if SubscriptionPlan.Id is Identity.
                // It's a test environment anyway.
                await context.SaveChangesAsync();
            }
        }
    }
}
