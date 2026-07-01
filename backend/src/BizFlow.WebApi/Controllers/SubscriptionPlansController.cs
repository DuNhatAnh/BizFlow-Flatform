using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BizFlow.WebApi.Controllers;

public class SubscriptionPlansController : ApiControllerBase
{
    private readonly IApplicationDbContext _context;

    public SubscriptionPlansController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetPlans()
    {
        var plans = await _context.SubscriptionPlans
            .OrderBy(p => p.Price)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Price,
                p.DurationMonths,
                p.Description,
                p.MaxOrdersPerMonth,
                p.Features,
                p.CreatedAt,
                IsFree = p.Price == 0,
            })
            .ToListAsync();
        return Ok(plans);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SubscriptionPlan>> GetPlan(int id)
    {
        var plan = await _context.SubscriptionPlans.FindAsync(id);
        if (plan == null) return NotFound(new { message = "Không tìm thấy gói dịch vụ." });
        return Ok(plan);
    }

    [HttpPost]
    [Authorize(Roles = "PlatformAdmin")]
    public async Task<ActionResult<SubscriptionPlan>> CreatePlan([FromBody] SubscriptionPlan plan)
    {
        _context.SubscriptionPlans.Add(plan);
        await _context.SaveChangesAsync(CancellationToken.None);
        return CreatedAtAction(nameof(GetPlan), new { id = plan.Id }, plan);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "PlatformAdmin")]
    public async Task<IActionResult> UpdatePlan(int id, [FromBody] SubscriptionPlan planUpdate)
    {
        if (id != planUpdate.Id) return BadRequest(new { message = "Mã gói dịch vụ không khớp." });

        var plan = await _context.SubscriptionPlans.FindAsync(id);
        if (plan == null) return NotFound(new { message = "Không tìm thấy gói dịch vụ." });

        plan.Name = planUpdate.Name;
        plan.Price = planUpdate.Price;
        plan.DurationMonths = planUpdate.DurationMonths;
        plan.Description = planUpdate.Description;
        plan.MaxOrdersPerMonth = planUpdate.MaxOrdersPerMonth;
        plan.Features = planUpdate.Features;

        await _context.SaveChangesAsync(CancellationToken.None);
        return Ok(plan);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "PlatformAdmin")]
    public async Task<IActionResult> DeletePlan(int id)
    {
        var plan = await _context.SubscriptionPlans.FindAsync(id);
        if (plan == null) return NotFound(new { message = "Không tìm thấy gói dịch vụ." });

        // Check if there are active tenants on this plan
        var hasTenants = await _context.Tenants.AnyAsync(t => t.SubscriptionPlanId == id);
        if (hasTenants)
        {
            return BadRequest(new { message = "Không thể xóa gói dịch vụ đang có hộ kinh doanh sử dụng." });
        }

        _context.SubscriptionPlans.Remove(plan);
        await _context.SaveChangesAsync(CancellationToken.None);
        return NoContent();
    }

    [HttpGet("my-subscription")]
    [Authorize]
    public async Task<IActionResult> GetMySubscription()
    {
        var tenantIdClaim = User.FindFirst("tenant_id")?.Value;
        if (!Guid.TryParse(tenantIdClaim, out var tenantId))
        {
            return Unauthorized();
        }

        var tenant = await _context.Tenants
            .Include(t => t.SubscriptionPlan)
            .Include(t => t.PendingSubscriptionPlan)
            .FirstOrDefaultAsync(t => t.Id == tenantId);

        if (tenant == null) return NotFound(new { message = "Không tìm thấy thông tin doanh nghiệp." });

        return Ok(new
        {
            currentPlan = tenant.SubscriptionPlan,
            pendingPlan = tenant.PendingSubscriptionPlan,
            isActive = tenant.IsActive
        });
    }

    [HttpPost("request-upgrade")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> RequestUpgrade([FromBody] int planId)
    {
        var tenantIdClaim = User.FindFirst("tenant_id")?.Value;
        if (!Guid.TryParse(tenantIdClaim, out var tenantId))
        {
            return Unauthorized();
        }

        var tenant = await _context.Tenants.FindAsync(tenantId);
        if (tenant == null) return NotFound(new { message = "Không tìm thấy thông tin doanh nghiệp." });

        var planExists = await _context.SubscriptionPlans.AnyAsync(p => p.Id == planId);
        if (!planExists) return BadRequest(new { message = "Gói dịch vụ không tồn tại." });

        tenant.PendingSubscriptionPlanId = planId;
        await _context.SaveChangesAsync(CancellationToken.None);

        return Ok(new { message = "Yêu cầu nâng cấp gói dịch vụ thành công, đang chờ quản trị viên phê duyệt." });
    }
}
