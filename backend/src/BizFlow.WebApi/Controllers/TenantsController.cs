using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Domain.Entities;
using BizFlow.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BizFlow.WebApi.Controllers;

[Authorize(Roles = "PlatformAdmin")]
public class TenantsController : ApiControllerBase
{
    private readonly IApplicationDbContext _context;

    public TenantsController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult> GetTenants()
    {
        var tenants = await _context.Tenants
            .Include(t => t.SubscriptionPlan)
            .Include(t => t.PendingSubscriptionPlan)
            .Include(t => t.Users)
            .Where(t => t.IsApproved)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        var result = tenants.Select(t => new
        {
            t.Id, t.Name, t.TaxCode, t.OwnerName, t.Address, t.Phone,
            t.SubscriptionPlanId, t.PendingSubscriptionPlanId, t.IsActive, t.IsApproved, t.CogsMethod, t.CreatedAt,
            subscriptionPlan = t.SubscriptionPlan,
            pendingSubscriptionPlan = t.PendingSubscriptionPlan,
            users = t.Users.Select(u => new { u.Id, u.Username, u.Fullname, u.Role, u.IsActive }).ToList()
        });

        return Ok(result);
    }

    [HttpGet("pending")]
    public async Task<ActionResult> GetPendingTenants()
    {
        var tenants = await _context.Tenants
            .Include(t => t.SubscriptionPlan)
            .Include(t => t.PendingSubscriptionPlan)
            .Include(t => t.Users)
            .Where(t => !t.IsApproved)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        var result = tenants.Select(t => new
        {
            t.Id, t.Name, t.TaxCode, t.OwnerName, t.Address, t.Phone,
            t.SubscriptionPlanId, t.PendingSubscriptionPlanId, t.IsActive, t.IsApproved, t.CogsMethod, t.CreatedAt,
            subscriptionPlan = t.SubscriptionPlan,
            pendingSubscriptionPlan = t.PendingSubscriptionPlan,
            users = t.Users.Select(u => new { u.Id, u.Username, u.Fullname, u.Role, u.IsActive }).ToList()
        });

        return Ok(result);
    }

    public class CreateTenantRequest
    {
        public string Name { get; set; } = string.Empty;
        public string OwnerName { get; set; } = string.Empty;
        public string OwnerEmail { get; set; } = string.Empty;
        public string OwnerPassword { get; set; } = "owner123";
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? TaxCode { get; set; }
        public int? SubscriptionPlanId { get; set; }
    }

    [HttpPost]
    public async Task<ActionResult<Tenant>> CreateTenant([FromBody] CreateTenantRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name) || string.IsNullOrWhiteSpace(req.OwnerName) || string.IsNullOrWhiteSpace(req.OwnerEmail))
        {
            return BadRequest(new { message = "Tên doanh nghiệp, tên chủ sở hữu và email chủ sở hữu không được để trống." });
        }

        // Check if username already exists globally
        var userExists = await _context.Users.AnyAsync(u => u.Username.ToLower() == req.OwnerEmail.ToLower());
        if (userExists)
        {
            return BadRequest(new { message = "Email/Tên đăng nhập của chủ sở hữu đã tồn tại trên hệ thống." });
        }

        using (var transaction = await _context.BeginTransactionAsync(CancellationToken.None))
        {
            try
            {
                // 1. Create Tenant
                var tenant = new Tenant
                {
                    Id = Guid.NewGuid(),
                    Name = req.Name,
                    OwnerName = req.OwnerName,
                    TaxCode = req.TaxCode,
                    Address = req.Address,
                    Phone = req.Phone,
                    SubscriptionPlanId = req.SubscriptionPlanId,
                    IsActive = true,
                    CogsMethod = CogsMethod.WeightedAverage,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Tenants.Add(tenant);

                // 2. Create Default Store for Tenant
                var store = new Store
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenant.Id,
                    Name = $"{req.Name} - Chi nhánh chính",
                    Address = req.Address,
                    Phone = req.Phone,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    EnableVat = false,
                    DefaultVatRate = "10",
                    AvailableVatRates = "0,5,8,8.5,10,KCT"
                };

                _context.Stores.Add(store);

                // 3. Create Default Owner User for Tenant
                // Hash the password using BCrypt
                string passwordHash = BCrypt.Net.BCrypt.HashPassword(req.OwnerPassword);
                var user = new User
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenant.Id,
                    Username = req.OwnerEmail,
                    PasswordHash = passwordHash,
                    Fullname = req.OwnerName,
                    Role = UserRole.Owner,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);

                await _context.SaveChangesAsync(CancellationToken.None);
                await transaction.CommitAsync(CancellationToken.None);

                // Reload tenant with subscription details
                var reloadedTenant = await _context.Tenants
                    .Include(t => t.SubscriptionPlan)
                    .FirstOrDefaultAsync(t => t.Id == tenant.Id);

                return Ok(reloadedTenant);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi đăng ký Tenant mới.", error = ex.Message });
            }
        }
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> ToggleTenantStatus(Guid id)
    {
        var tenant = await _context.Tenants.FindAsync(id);
        if (tenant == null) return NotFound(new { message = "Không tìm thấy doanh nghiệp." });

        tenant.IsActive = !tenant.IsActive;
        await _context.SaveChangesAsync(CancellationToken.None);

        // Deactivate all users of this tenant if deactivated
        if (!tenant.IsActive)
        {
            var tenantUsers = await _context.Users.Where(u => u.TenantId == id).ToListAsync();
            foreach (var u in tenantUsers)
            {
                u.IsActive = false;
            }
            await _context.SaveChangesAsync(CancellationToken.None);
        }

        return Ok(new { id = tenant.Id, isActive = tenant.IsActive });
    }

    [HttpPost("{id}/change-subscription")]
    public async Task<IActionResult> ChangeSubscription(Guid id, [FromBody] int? planId)
    {
        var tenant = await _context.Tenants.FindAsync(id);
        if (tenant == null) return NotFound(new { message = "Không tìm thấy doanh nghiệp." });

        if (planId.HasValue)
        {
            var planExists = await _context.SubscriptionPlans.AnyAsync(p => p.Id == planId.Value);
            if (!planExists) return BadRequest(new { message = "Gói dịch vụ không tồn tại." });
        }

        tenant.SubscriptionPlanId = planId;
        await _context.SaveChangesAsync(CancellationToken.None);

        var reloadedTenant = await _context.Tenants
            .Include(t => t.SubscriptionPlan)
            .FirstOrDefaultAsync(t => t.Id == id);

        return Ok(reloadedTenant);
    }

    [HttpPost("{id}/approve")]
    public async Task<IActionResult> ApproveTenant(Guid id)
    {
        var tenant = await _context.Tenants.FindAsync(id);
        if (tenant == null) return NotFound(new { message = "Không tìm thấy doanh nghiệp." });

        tenant.IsApproved = true;
        tenant.IsActive = true;
        await _context.SaveChangesAsync(CancellationToken.None);

        return Ok(new { id = tenant.Id, isApproved = tenant.IsApproved });
    }

    [HttpPost("{id}/reject")]
    public async Task<IActionResult> RejectTenant(Guid id)
    {
        var tenant = await _context.Tenants
            .Include(t => t.Users)
            .Include(t => t.Stores)
            .FirstOrDefaultAsync(t => t.Id == id);
            
        if (tenant == null) return NotFound(new { message = "Không tìm thấy doanh nghiệp." });

        _context.Users.RemoveRange(tenant.Users);
        _context.Stores.RemoveRange(tenant.Stores);
        _context.Tenants.Remove(tenant);

        await _context.SaveChangesAsync(CancellationToken.None);

        return Ok(new { message = "Đã từ chối và xóa yêu cầu đăng ký." });
    }

    public class RegisterTenantRequest
    {
        public string Name { get; set; } = string.Empty;
        public string OwnerName { get; set; } = string.Empty;
        public string OwnerEmail { get; set; } = string.Empty;
        public string OwnerPassword { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? TaxCode { get; set; }
        public int? SubscriptionPlanId { get; set; }
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<Tenant>> RegisterTenant([FromBody] RegisterTenantRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name) || string.IsNullOrWhiteSpace(req.OwnerName) || string.IsNullOrWhiteSpace(req.OwnerEmail) || string.IsNullOrWhiteSpace(req.OwnerPassword))
        {
            return BadRequest(new { message = "Tên doanh nghiệp, tên chủ sở hữu, email và mật khẩu không được để trống." });
        }

        var userExists = await _context.Users.AnyAsync(u => u.Username.ToLower() == req.OwnerEmail.ToLower());
        if (userExists)
        {
            return BadRequest(new { message = "Email/Tên đăng nhập của chủ sở hữu đã tồn tại trên hệ thống." });
        }

        using (var transaction = await _context.BeginTransactionAsync(CancellationToken.None))
        {
            try
            {
                var tenant = new Tenant
                {
                    Id = Guid.NewGuid(),
                    Name = req.Name,
                    OwnerName = req.OwnerName,
                    TaxCode = req.TaxCode,
                    Address = req.Address,
                    Phone = req.Phone,
                    SubscriptionPlanId = req.SubscriptionPlanId ?? 2, // Mặc định gói Free
                    IsActive = true,
                    IsApproved = false,
                    CogsMethod = CogsMethod.WeightedAverage,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Tenants.Add(tenant);

                var store = new Store
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenant.Id,
                    Name = $"{req.Name} - Chi nhánh chính",
                    Address = req.Address,
                    Phone = req.Phone,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    EnableVat = false,
                    DefaultVatRate = "10",
                    AvailableVatRates = "0,5,8,8.5,10,KCT"
                };

                _context.Stores.Add(store);

                string passwordHash = BCrypt.Net.BCrypt.HashPassword(req.OwnerPassword);
                var user = new User
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenant.Id,
                    Username = req.OwnerEmail,
                    PasswordHash = passwordHash,
                    Fullname = req.OwnerName,
                    Role = UserRole.Owner,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);

                await _context.SaveChangesAsync(CancellationToken.None);
                await transaction.CommitAsync(CancellationToken.None);

                return Ok(new { message = "Đăng ký thành công! Yêu cầu của bạn đang chờ quản trị viên phê duyệt." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi đăng ký Tenant mới.", error = ex.Message });
            }
        }
    }

    [HttpPost("{id}/approve-upgrade")]
    public async Task<IActionResult> ApproveUpgrade(Guid id)
    {
        var tenant = await _context.Tenants.FindAsync(id);
        if (tenant == null) return NotFound(new { message = "Không tìm thấy doanh nghiệp." });

        if (tenant.PendingSubscriptionPlanId == null)
        {
            return BadRequest(new { message = "Doanh nghiệp không có yêu cầu nâng cấp gói nào." });
        }

        tenant.SubscriptionPlanId = tenant.PendingSubscriptionPlanId;
        tenant.PendingSubscriptionPlanId = null;
        await _context.SaveChangesAsync(CancellationToken.None);

        return Ok(new { id = tenant.Id, subscriptionPlanId = tenant.SubscriptionPlanId });
    }

    [HttpPost("{id}/reject-upgrade")]
    public async Task<IActionResult> RejectUpgrade(Guid id)
    {
        var tenant = await _context.Tenants.FindAsync(id);
        if (tenant == null) return NotFound(new { message = "Không tìm thấy doanh nghiệp." });

        tenant.PendingSubscriptionPlanId = null;
        await _context.SaveChangesAsync(CancellationToken.None);

        return Ok(new { message = "Đã hủy yêu cầu nâng cấp gói dịch vụ." });
    }
}
