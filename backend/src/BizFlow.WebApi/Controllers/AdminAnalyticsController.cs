using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace BizFlow.WebApi.Controllers;

[Authorize(Roles = "PlatformAdmin")]
public class AdminAnalyticsController : ApiControllerBase
{
    private readonly IApplicationDbContext _context;

    public AdminAnalyticsController(IApplicationDbContext context)
    {
        _context = context;
    }

    public class AdminAnalyticsOverviewDto
    {
        public int TotalTenants { get; set; }
        public int TotalUsers { get; set; }
        public decimal MonthlySaasRevenue { get; set; }
        public decimal AiCost { get; set; }
        public object[] RecentTenants { get; set; } = Array.Empty<object>();
    }

    [HttpGet("overview")]
    public async Task<ActionResult<AdminAnalyticsOverviewDto>> GetOverview()
    {
        var totalTenants = await _context.Tenants.CountAsync();
        var totalUsers = await _context.Users.CountAsync(u => u.IsActive);
        
        // Compute revenue from subscription plans of active tenants
        var activeTenantsWithPlans = await _context.Tenants
            .Where(t => t.IsActive && t.SubscriptionPlanId != null)
            .Include(t => t.SubscriptionPlan)
            .ToListAsync();
            
        var monthlyRevenue = activeTenantsWithPlans
            .Where(t => t.SubscriptionPlan != null)
            .Sum(t => t.SubscriptionPlan!.Price);

        // Compute AI logs cost sum
        decimal aiCost = 0;
        try
        {
            aiCost = await _context.AiRequestLogs.SumAsync(l => l.Cost);
        }
        catch (Exception)
        {
            // Fallback in case table is empty or calculation fails
            aiCost = 0;
        }

        // Get 5 most recent tenants
        var recentTenantsRaw = await _context.Tenants
            .Include(t => t.SubscriptionPlan)
            .OrderByDescending(t => t.CreatedAt)
            .Take(5)
            .ToListAsync();

        var recentTenants = recentTenantsRaw.Select(t => new
        {
            id = t.Id,
            name = t.Name,
            ownerName = t.OwnerName,
            planName = t.SubscriptionPlan?.Name ?? "Miễn phí / Chưa có",
            isActive = t.IsActive,
            createdAt = t.CreatedAt
        }).ToArray();

        return Ok(new AdminAnalyticsOverviewDto
        {
            TotalTenants = totalTenants,
            TotalUsers = totalUsers,
            MonthlySaasRevenue = monthlyRevenue,
            AiCost = aiCost,
            RecentTenants = recentTenants
        });
    }
}
