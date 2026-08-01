using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Domain.Entities;
using BizFlow.Domain.Enums;
using BizFlow.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace BizFlow.WebApi.Controllers;

[Authorize(Roles = "PlatformAdmin")]
public class TenantsController : ApiControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly ITenantManagementService _tenantManagementService;
    private readonly IEmailService _emailService;
    private readonly IDistributedCache _cache;

    public TenantsController(IApplicationDbContext context, ITenantManagementService tenantManagementService, IEmailService emailService, IDistributedCache cache)
    {
        _context = context;
        _tenantManagementService = tenantManagementService;
        _emailService = emailService;
        _cache = cache;
    }

    [HttpGet]
    public async Task<ActionResult> GetTenants()
    {
        var tenants = await _context.Tenants
            .IgnoreQueryFilters()
            .Include(t => t.SubscriptionPlan)
            .Include(t => t.PendingSubscriptionPlan)
            .Include(t => t.Users)
            .Include(t => t.Stores)
            .Where(t => t.IsApproved && t.Id != Guid.Parse("00000000-0000-0000-0000-000000000001"))
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        var result = tenants.Select(t => new
        {
            t.Id,
            t.Name,
            TaxCode = !string.IsNullOrWhiteSpace(t.TaxCode) ? t.TaxCode : t.Stores.FirstOrDefault()?.TaxCode,
            t.OwnerName,
            OwnerPhone = t.Users.FirstOrDefault(u => u.Role == UserRole.Owner)?.Phone ?? t.Phone,
            Address = !string.IsNullOrWhiteSpace(t.Address) ? t.Address : t.Stores.FirstOrDefault()?.Address,
            Phone = !string.IsNullOrWhiteSpace(t.Stores.FirstOrDefault()?.Phone) ? t.Stores.FirstOrDefault()?.Phone : t.Phone,
            t.SubscriptionPlanId,
            t.PendingSubscriptionPlanId,
            t.IsActive,
            t.IsApproved,
            t.CogsMethod,
            t.CreatedAt,
            subscriptionStartDate = t.SubscriptionStartDate,
            subscriptionEndDate = t.SubscriptionEndDate,
            totalSpent = t.TotalSpent,
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
            .IgnoreQueryFilters()
            .Include(t => t.SubscriptionPlan)
            .Include(t => t.PendingSubscriptionPlan)
            .Include(t => t.Users)
            .Include(t => t.Stores)
            .Where(t => !t.IsApproved && t.Id != Guid.Parse("00000000-0000-0000-0000-000000000001"))
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        var result = tenants.Select(t => new
        {
            t.Id,
            t.Name,
            TaxCode = !string.IsNullOrWhiteSpace(t.TaxCode) ? t.TaxCode : t.Stores.FirstOrDefault()?.TaxCode,
            t.OwnerName,
            OwnerPhone = t.Users.FirstOrDefault(u => u.Role == UserRole.Owner)?.Phone ?? t.Phone,
            Address = !string.IsNullOrWhiteSpace(t.Address) ? t.Address : t.Stores.FirstOrDefault()?.Address,
            Phone = !string.IsNullOrWhiteSpace(t.Stores.FirstOrDefault()?.Phone) ? t.Stores.FirstOrDefault()?.Phone : t.Phone,
            t.SubscriptionPlanId,
            t.PendingSubscriptionPlanId,
            t.IsActive,
            t.IsApproved,
            t.CogsMethod,
            t.CreatedAt,
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
        var userExists = await _context.Users.IgnoreQueryFilters().AnyAsync(u => u.Username.ToLower() == req.OwnerEmail.ToLower());
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
        var tenant = await _context.Tenants.IgnoreQueryFilters().Include(t => t.Users).FirstOrDefaultAsync(t => t.Id == id);
        if (tenant == null) return NotFound(new { message = "Không tìm thấy doanh nghiệp" });

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
        try
        {
            await _tenantManagementService.ChangeSubscriptionAsync(id, planId);
            var reloadedTenant = await _context.Tenants
                .Include(t => t.SubscriptionPlan)
                .FirstOrDefaultAsync(t => t.Id == id);

            return Ok(reloadedTenant);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    public class UpdateSubscriptionDateRequest
    {
        public DateTime? EndDate { get; set; }
    }

    [HttpPut("{id}/subscription-end-date")]
    public async Task<IActionResult> UpdateSubscriptionEndDate(Guid id, [FromBody] UpdateSubscriptionDateRequest req)
    {
        try
        {
            await _tenantManagementService.UpdateSubscriptionEndDateAsync(id, req.EndDate);
            return Ok(new { message = "Cập nhật thời hạn gói thành công.", endDate = req.EndDate });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    public class UpdateTenantAdminRequest
    {
        public string OwnerName { get; set; } = string.Empty;
        public string? Phone { get; set; }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTenantAdmin(Guid id, [FromBody] UpdateTenantAdminRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.OwnerName))
        {
            return BadRequest(new { message = "Tên chủ sở hữu không được để trống." });
        }

        var tenant = await _context.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == id);
        if (tenant == null) return NotFound(new { message = "Không tìm thấy doanh nghiệp." });

        tenant.OwnerName = req.OwnerName;
        tenant.Phone = req.Phone;

        // Cũng cập nhật OwnerName và Phone trong Users nếu cần thiết
        var ownerUser = await _context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.TenantId == id && u.Role == UserRole.Owner);
        if (ownerUser != null)
        {
            ownerUser.Fullname = req.OwnerName;
            ownerUser.Phone = req.Phone;
        }

        await _context.SaveChangesAsync(CancellationToken.None);
        return Ok(new { message = "Cập nhật thông tin doanh nghiệp thành công." });
    }

    [HttpPost("{id}/approve")]
    public async Task<IActionResult> ApproveTenant(Guid id)
    {
        var tenant = await _context.Tenants.IgnoreQueryFilters().Include(t => t.Users).FirstOrDefaultAsync(t => t.Id == id);
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
            .IgnoreQueryFilters()
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
    public async Task<ActionResult> RegisterTenant([FromBody] RegisterTenantRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name) || string.IsNullOrWhiteSpace(req.OwnerName) || string.IsNullOrWhiteSpace(req.OwnerEmail) || string.IsNullOrWhiteSpace(req.OwnerPassword))
        {
            return BadRequest(new { message = "Tên doanh nghiệp, tên chủ sở hữu, email và mật khẩu không được để trống." });
        }

        var userExists = await _context.Users.IgnoreQueryFilters().AnyAsync(u => u.Username.ToLower() == req.OwnerEmail.ToLower());
        if (userExists)
        {
            return BadRequest(new { message = "Email/Tên đăng nhập của chủ sở hữu đã tồn tại trên hệ thống." });
        }

        try
        {
            // Generate 6-char OTP (Alphanumeric uppercase)
            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            var otpCode = new string(Enumerable.Repeat(chars, 6).Select(s => s[random.Next(s.Length)]).ToArray());

            // Save to Redis
            var cacheKey = $"RegisterOTP_{req.OwnerEmail.ToLower()}";
            var cacheData = new { Req = req, Otp = otpCode };
            await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(cacheData), new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
            });

            // Send HTML Email
            string emailBody = $@"
<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E5EAF3; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);'>
    <div style='background-color: #FAFCFF; padding: 24px; text-align: center; border-bottom: 1px solid #E5EAF3;'>
        <h1 style='color: #2E5CE6; margin: 0; font-size: 24px; letter-spacing: 1px;'>BIZFLOW PLATFORM</h1>
    </div>
    <div style='padding: 32px; background-color: #ffffff; text-align: left;'>
        <h2 style='color: #111827; margin-top: 0; font-size: 20px; text-align: center;'>Xác thực mở gian hàng mới</h2>
        <p style='color: #5B667A; font-size: 15px; line-height: 1.6;'>Xin chào <strong>{req.OwnerName}</strong>,</p>
        <p style='color: #5B667A; font-size: 15px; line-height: 1.6;'>Bạn vừa yêu cầu tạo một tài khoản quản trị cho gian hàng <strong>{req.Name}</strong>. Vui lòng sử dụng mã xác thực dưới đây để hoàn tất đăng ký:</p>
        <div style='background-color: #F0F5FF; border: 2px dashed #2E5CE6; border-radius: 8px; padding: 24px; text-align: center; margin: 32px 0;'>
            <div style='font-size: 36px; font-weight: bold; color: #2E5CE6; letter-spacing: 8px; margin-bottom: 12px; cursor: text; user-select: all;'>{otpCode}</div>
            <div style='font-size: 13px; color: #5B667A; font-weight: 500;'>☝️ Nhấp đúp vào mã trên để sao chép</div>
        </div>
        <p style='color: #5B667A; font-size: 14px; margin-bottom: 0; text-align: center;'><em>Mã này sẽ hết hạn sau 05 phút. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</em></p>
    </div>
</div>";

            await _emailService.SendEmailAsync(req.OwnerEmail, "Mã Xác Thực BizFlow Platform", emailBody, true);

            return Ok(new { message = "Mã xác thực đã được gửi đến email của bạn." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi gửi email xác thực.", error = ex.Message });
        }
    }

    public class VerifyOtpRequest
    {
        public string Email { get; set; } = string.Empty;
        public string OtpCode { get; set; } = string.Empty;
    }

    [AllowAnonymous]
    [HttpPost("verify-otp")]
    public async Task<ActionResult> VerifyOtp([FromBody] VerifyOtpRequest verifyReq)
    {
        var cacheKey = $"RegisterOTP_{verifyReq.Email.ToLower()}";
        var cacheStr = await _cache.GetStringAsync(cacheKey);

        if (string.IsNullOrEmpty(cacheStr))
        {
            return BadRequest(new { message = "Mã xác thực đã hết hạn hoặc không tồn tại." });
        }

        var cacheData = JsonSerializer.Deserialize<JsonElement>(cacheStr);
        var cachedOtp = cacheData.GetProperty("Otp").GetString();
        var reqStr = cacheData.GetProperty("Req").GetRawText();
        var req = JsonSerializer.Deserialize<RegisterTenantRequest>(reqStr, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (cachedOtp != verifyReq.OtpCode.ToUpper())
        {
            return BadRequest(new { message = "Mã xác thực không chính xác." });
        }

        if (req == null) return BadRequest(new { message = "Dữ liệu đăng ký bị lỗi." });

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
                    IsApproved = true, // DUYỆT TỰ ĐỘNG
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

                // Xoá cache
                await _cache.RemoveAsync(cacheKey);

                return Ok(new { message = "Xác thực thành công. Tài khoản đã được tạo và tự động duyệt." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lưu dữ liệu đăng ký.", error = ex.Message });
            }
        }
    }

    [HttpPost("{id}/approve-upgrade")]
    public async Task<IActionResult> ApproveTenantUpgrade(Guid id)
    {
        try
        {
            await _tenantManagementService.ApproveTenantUpgradeAsync(id);
            var tenant = await _context.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == id);
            return Ok(new { id = tenant!.Id, subscriptionPlanId = tenant.SubscriptionPlanId });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/reject-upgrade")]
    public async Task<IActionResult> RejectTenantUpgrade(Guid id)
    {
        var tenant = await _context.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == id);
        if (tenant == null) return NotFound(new { message = "Không tìm thấy doanh nghiệp" });

        tenant.PendingSubscriptionPlanId = null;
        await _context.SaveChangesAsync(CancellationToken.None);

        return Ok(new { message = "Đã hủy yêu cầu nâng cấp gói dịch vụ." });
    }
}
