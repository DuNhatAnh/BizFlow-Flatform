using System;
using System.Threading;
using System.Threading.Tasks;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BizFlow.Application.Services;

public class TenantManagementService : ITenantManagementService
{
    private readonly IApplicationDbContext _context;

    public TenantManagementService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task ApproveTenantUpgradeAsync(Guid tenantId)
    {
        var tenant = await _context.Tenants
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Id == tenantId);
            
        if (tenant == null) 
            throw new Exception("Không tìm thấy doanh nghiệp");

        if (tenant.PendingSubscriptionPlanId == null)
            throw new Exception("Doanh nghiệp không có yêu cầu nâng cấp gói nào.");

        var plan = await _context.SubscriptionPlans.FindAsync(tenant.PendingSubscriptionPlanId.Value);
        if (plan == null)
            throw new Exception("Không tìm thấy thông tin gói dịch vụ.");

        tenant.SubscriptionPlanId = tenant.PendingSubscriptionPlanId;
        tenant.PendingSubscriptionPlanId = null;

        // Cập nhật thông tin gói (TotalSpent, StartDate, EndDate)
        tenant.TotalSpent += plan.Price;
        tenant.SubscriptionStartDate = DateTime.UtcNow;
        // Nếu gói vĩnh viễn (ví dụ 100 năm) hoặc tính theo DurationMonths
        tenant.SubscriptionEndDate = DateTime.UtcNow.AddMonths(plan.DurationMonths);

        await _context.SaveChangesAsync(CancellationToken.None);
    }

    public async Task ChangeSubscriptionAsync(Guid tenantId, int? planId)
    {
        var tenant = await _context.Tenants
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Id == tenantId);

        if (tenant == null) 
            throw new Exception("Không tìm thấy doanh nghiệp.");

        if (planId.HasValue)
        {
            var plan = await _context.SubscriptionPlans.FindAsync(planId.Value);
            if (plan == null) 
                throw new Exception("Gói dịch vụ không tồn tại.");

            tenant.TotalSpent += plan.Price;
            tenant.SubscriptionStartDate = DateTime.UtcNow;
            tenant.SubscriptionEndDate = DateTime.UtcNow.AddMonths(plan.DurationMonths);
        }

        tenant.SubscriptionPlanId = planId;
        await _context.SaveChangesAsync(CancellationToken.None);
    }

    public async Task UpdateSubscriptionEndDateAsync(Guid tenantId, DateTime? newEndDate)
    {
        var tenant = await _context.Tenants
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Id == tenantId);

        if (tenant == null) 
            throw new Exception("Không tìm thấy doanh nghiệp.");

        tenant.SubscriptionEndDate = newEndDate.HasValue ? DateTime.SpecifyKind(newEndDate.Value, DateTimeKind.Utc) : null;
        await _context.SaveChangesAsync(CancellationToken.None);
    }
}
