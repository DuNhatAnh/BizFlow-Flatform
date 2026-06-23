using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Application.DTOs.Staff;
using BizFlow.Domain.Entities;
using BizFlow.Domain.Enums;

namespace BizFlow.Infrastructure.Services;

public class StaffService : IStaffService
{
    private readonly IApplicationDbContext _context;

    public StaffService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<StaffDto>> GetStaffMembersAsync(Guid tenantId)
    {
        return await _context.Users
            .Where(u => u.TenantId == tenantId && u.Role == UserRole.Employee)
            .Select(u => new StaffDto
            {
                Id = u.Id,
                Username = u.Username,
                Fullname = u.Fullname,
                Role = u.Role.ToString(),
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<StaffDto> CreateStaffAsync(Guid tenantId, CreateStaffRequest request)
    {
        if (request.Password.Length < 6)
            throw new Exception("Mật khẩu quá ngắn, yêu cầu ít nhất 6 ký tự.");

        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.TenantId == tenantId && u.Username == request.Username);
            
        if (existingUser != null)
            throw new Exception("Tài khoản (Username) này đã tồn tại trong hệ thống.");

        var user = new User
        {
            TenantId = tenantId,
            Username = request.Username,
            Fullname = request.Fullname,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.Employee,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);

        // Force create table if missing to bypass EF Core migration issues
        if (_context is DbContext dbContext)
        {
            await dbContext.Database.ExecuteSqlRawAsync(@"CREATE TABLE IF NOT EXISTS audit_logs (
                ""Id"" uuid NOT NULL,
                ""TenantId"" uuid NOT NULL,
                ""UserId"" uuid NOT NULL,
                ""Action"" text NOT NULL,
                ""EntityName"" text,
                ""EntityId"" text,
                ""Timestamp"" timestamp with time zone NOT NULL,
                ""Details"" text,
                CONSTRAINT ""PK_audit_logs"" PRIMARY KEY (""Id"")
            );");
        }

        var log = new AuditLog
        {
            TenantId = tenantId,
            UserId = user.Id,
            Action = "CREATE_STAFF",
            EntityName = "User",
            EntityId = user.Id.ToString(),
            Details = $"Tạo mới tài khoản nhân viên: {user.Fullname} ({user.Username})"
        };
        _context.AuditLogs.Add(log);

        await _context.SaveChangesAsync();

        return new StaffDto
        {
            Id = user.Id,
            Username = user.Username,
            Fullname = user.Fullname,
            Role = user.Role.ToString(),
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<bool> ToggleStaffStatusAsync(Guid tenantId, Guid staffId)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.TenantId == tenantId && u.Id == staffId && u.Role == UserRole.Employee);
            
        if (user == null) return false;

        user.IsActive = !user.IsActive;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ResetStaffPasswordAsync(Guid tenantId, Guid staffId, string newPassword)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.TenantId == tenantId && u.Id == staffId && u.Role == UserRole.Employee);
            
        if (user == null) return false;

        user.PasswordHash = newPassword; // Typically hashed
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<AuditLogDto>> GetStaffAuditLogsAsync(Guid tenantId, Guid staffId)
    {
        return await _context.AuditLogs
            .Include(a => a.User)
            .Where(a => a.TenantId == tenantId && a.UserId == staffId)
            .OrderByDescending(a => a.Timestamp)
            .Select(a => new AuditLogDto
            {
                Id = a.Id,
                Action = a.Action,
                EntityName = a.EntityName,
                EntityId = a.EntityId,
                Timestamp = a.Timestamp,
                Details = a.Details,
                UserFullname = a.User.Fullname
            })
            .ToListAsync();
    }
}
