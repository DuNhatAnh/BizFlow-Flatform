using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace BizFlow.WebApi.Controllers;

[Authorize(Roles = "PlatformAdmin")]
[Route("api/platform")]
public class PlatformController : ApiControllerBase
{
    private readonly IApplicationDbContext _context;

    public PlatformController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetPlatformStats()
    {
        var totalTenants = await _context.Tenants.CountAsync();
        var activeTenants = await _context.Tenants.CountAsync(t => t.IsActive);
        var inactiveTenants = totalTenants - activeTenants;
        var totalUsers = await _context.Users.CountAsync();

        // AI stats
        decimal totalAiCost = 0;
        int totalAiRequests = 0;
        List<object> aiByType = new();
        List<object> recentRequests = new();

        try
        {
            totalAiCost = await _context.AiRequestLogs.SumAsync(l => l.Cost);
            totalAiRequests = await _context.AiRequestLogs.CountAsync();

            aiByType = (await _context.AiRequestLogs
                .GroupBy(l => l.RequestType)
                .Select(g => new
                {
                    RequestType = g.Key,
                    Count = g.Count(),
                    TotalCost = g.Sum(l => l.Cost)
                })
                .ToListAsync())
                .Cast<object>()
                .ToList();

            recentRequests = (await _context.AiRequestLogs
                .OrderByDescending(l => l.Timestamp)
                .Take(20)
                .Select(l => new
                {
                    l.Id,
                    l.TenantId,
                    l.RequestType,
                    l.ModelName,
                    l.TotalTokens,
                    l.Cost,
                    l.DurationMs,
                    l.Timestamp
                })
                .ToListAsync())
                .Cast<object>()
                .ToList();
        }
        catch (Exception)
        {
            // Table may be empty — treat as zero
        }

        // Tenants by plan
        var tenantsByPlan = (await _context.Tenants
            .Include(t => t.SubscriptionPlan)
            .GroupBy(t => t.SubscriptionPlan != null ? t.SubscriptionPlan.Name : "Chưa có gói")
            .Select(g => new { PlanName = g.Key, Count = g.Count() })
            .ToListAsync())
            .Cast<object>()
            .ToList();

        return Ok(new
        {
            TotalTenants = totalTenants,
            ActiveTenants = activeTenants,
            InactiveTenants = inactiveTenants,
            TotalUsers = totalUsers,
            TotalAiRequests = totalAiRequests,
            TotalAiCost = totalAiCost,
            AiRequestsByType = aiByType,
            TenantsByPlan = tenantsByPlan,
            RecentAiRequests = recentRequests
        });
    }
}
