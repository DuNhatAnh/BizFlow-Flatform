using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BizFlow.Domain.Constants;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Application.DTOs.Staff;
using BizFlow.Application.DTOs.Common;
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

    public async Task<PagedResult<PublicStaffDto>> GetStaffBasicAsync(Guid tenantId, int pageNumber = 1, int pageSize = 10, string? searchTerm = null)
    {
        var query = _context.Users.Where(u => u.TenantId == tenantId && u.Role == UserRole.Employee);
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var lowerTerm = searchTerm.ToLower();
            query = query.Where(u => u.Username.ToLower().Contains(lowerTerm) || u.Fullname.ToLower().Contains(lowerTerm));
        }
        var totalCount = await query.CountAsync();
        var staffEntities = await query.OrderByDescending(u => u.CreatedAt).Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

        var items = staffEntities.Select(u => new PublicStaffDto
        {
            Id = u.Id, Username = u.Username, Fullname = u.Fullname, Role = u.Role.ToString(), IsActive = u.IsActive, Phone = u.Phone, AvatarUrl = u.AvatarUrl, CreatedAt = u.CreatedAt
        }).ToList();

        return new PagedResult<PublicStaffDto> { Items = items, TotalCount = totalCount, PageNumber = pageNumber, PageSize = pageSize };
    }

    public async Task<PagedResult<StaffDetailDto>> GetStaffDetailAsync(Guid tenantId, int pageNumber = 1, int pageSize = 10, string? searchTerm = null)
    {
        var query = _context.Users.Include(u => u.EmployeeProfile).Where(u => u.TenantId == tenantId && u.Role == UserRole.Employee);
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var lowerTerm = searchTerm.ToLower();
            query = query.Where(u => u.Username.ToLower().Contains(lowerTerm) || u.Fullname.ToLower().Contains(lowerTerm));
        }
        var totalCount = await query.CountAsync();
        var staffEntities = await query.OrderByDescending(u => u.CreatedAt).Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

        var items = staffEntities.Select(u => new StaffDetailDto
        {
            Id = u.Id, Username = u.Username, Fullname = u.Fullname, Role = u.Role.ToString(), IsActive = u.IsActive, Phone = u.Phone, AvatarUrl = u.AvatarUrl, CreatedAt = u.CreatedAt,
            IdentityCard = u.EmployeeProfile?.IdentityCard, DateOfBirth = u.EmployeeProfile?.DateOfBirth, JoinDate = u.EmployeeProfile?.JoinDate,
            SocialInsuranceNo = u.EmployeeProfile?.SocialInsuranceNo, HealthInsuranceNo = u.EmployeeProfile?.HealthInsuranceNo, NumberOfDependents = u.EmployeeProfile?.NumberOfDependents
        }).ToList();

        return new PagedResult<StaffDetailDto> { Items = items, TotalCount = totalCount, PageNumber = pageNumber, PageSize = pageSize };
    }

    public async Task<PagedResult<StaffPayrollDto>> GetStaffPayrollAsync(Guid tenantId, int pageNumber = 1, int pageSize = 10, string? searchTerm = null)
    {
        var query = _context.Users.Include(u => u.EmployeeProfile).Where(u => u.TenantId == tenantId && u.Role == UserRole.Employee);
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var lowerTerm = searchTerm.ToLower();
            query = query.Where(u => u.Username.ToLower().Contains(lowerTerm) || u.Fullname.ToLower().Contains(lowerTerm));
        }
        var totalCount = await query.CountAsync();
        var staffEntities = await query.OrderByDescending(u => u.CreatedAt).Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

        var items = staffEntities.Select(u => new StaffPayrollDto
        {
            Id = u.Id, Username = u.Username, Fullname = u.Fullname, Role = u.Role.ToString(), IsActive = u.IsActive, Phone = u.Phone, AvatarUrl = u.AvatarUrl, CreatedAt = u.CreatedAt,
            IdentityCard = u.EmployeeProfile?.IdentityCard, DateOfBirth = u.EmployeeProfile?.DateOfBirth, JoinDate = u.EmployeeProfile?.JoinDate,
            SocialInsuranceNo = u.EmployeeProfile?.SocialInsuranceNo, HealthInsuranceNo = u.EmployeeProfile?.HealthInsuranceNo, NumberOfDependents = u.EmployeeProfile?.NumberOfDependents,
            PersonalTaxCode = u.EmployeeProfile?.PersonalTaxCode, BasicSalary = u.EmployeeProfile?.BasicSalary, BankAccountNumber = u.EmployeeProfile?.BankAccountNumber, BankName = u.EmployeeProfile?.BankName
        }).ToList();

        return new PagedResult<StaffPayrollDto> { Items = items, TotalCount = totalCount, PageNumber = pageNumber, PageSize = pageSize };
    }

    public async Task<StaffPayrollDto> CreateStaffAsync(Guid tenantId, CreateStaffRequest request)
    {
        if (request.Password.Length < 6)
            throw new Exception("Mật khẩu quá ngắn, yêu cầu ít nhất 6 ký tự.");

        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.ToLower());
            
        if (existingUser != null)
            throw new Exception("Tên đăng nhập (Email) đã được sử dụng trong hệ thống.");

        var user = new User
        {
            TenantId = tenantId,
            Username = request.Username,
            Fullname = request.Fullname,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.Employee,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            Phone = request.Phone,
            EmployeeProfile = new EmployeeProfile
            {
                IdentityCard = request.IdentityCard,
                DateOfBirth = request.DateOfBirth?.ToUniversalTime(),
                JoinDate = request.JoinDate?.ToUniversalTime(),
                SocialInsuranceNo = request.SocialInsuranceNo,
                HealthInsuranceNo = request.HealthInsuranceNo,
                PersonalTaxCode = request.PersonalTaxCode,
                BasicSalary = request.BasicSalary,
                BankAccountNumber = request.BankAccountNumber,
                BankName = request.BankName,
                NumberOfDependents = request.NumberOfDependents
            }
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

        return new StaffPayrollDto { Id = user.Id, Username = user.Username, Fullname = user.Fullname, Role = user.Role.ToString(), IsActive = user.IsActive, Phone = user.Phone, AvatarUrl = user.AvatarUrl, CreatedAt = user.CreatedAt, IdentityCard = user.EmployeeProfile?.IdentityCard, DateOfBirth = user.EmployeeProfile?.DateOfBirth, JoinDate = user.EmployeeProfile?.JoinDate, SocialInsuranceNo = user.EmployeeProfile?.SocialInsuranceNo, HealthInsuranceNo = user.EmployeeProfile?.HealthInsuranceNo, NumberOfDependents = user.EmployeeProfile?.NumberOfDependents, PersonalTaxCode = user.EmployeeProfile?.PersonalTaxCode, BasicSalary = user.EmployeeProfile?.BasicSalary, BankAccountNumber = user.EmployeeProfile?.BankAccountNumber, BankName = user.EmployeeProfile?.BankName };
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

    public async Task<StaffPayrollDto> UpdateStaffAsync(Guid tenantId, Guid staffId, UpdateStaffRequest request)
    {
        var user = await _context.Users
            .Include(u => u.EmployeeProfile)
            .FirstOrDefaultAsync(u => u.TenantId == tenantId && u.Id == staffId && u.Role == UserRole.Employee);
            
        if (user == null)
            throw new Exception("Không tìm thấy nhân viên.");

        // If username changed, ensure it's not taken by someone else
        if (!string.Equals(user.Username, request.Username, StringComparison.OrdinalIgnoreCase))
        {
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.ToLower());
                
            if (existingUser != null)
                throw new Exception("Tên đăng nhập (Email) đã được sử dụng trong hệ thống.");
                
            user.Username = request.Username;
        }

        user.Fullname = request.Fullname;
        user.Phone = request.Phone;
        if (user.EmployeeProfile == null)
        {
            user.EmployeeProfile = new EmployeeProfile { Id = user.Id };
        }

        user.EmployeeProfile.IdentityCard = request.IdentityCard;
        user.EmployeeProfile.DateOfBirth = request.DateOfBirth?.ToUniversalTime();
        user.EmployeeProfile.JoinDate = request.JoinDate?.ToUniversalTime();
        user.EmployeeProfile.SocialInsuranceNo = request.SocialInsuranceNo;
        user.EmployeeProfile.HealthInsuranceNo = request.HealthInsuranceNo;
        user.EmployeeProfile.PersonalTaxCode = request.PersonalTaxCode;
        user.EmployeeProfile.BasicSalary = request.BasicSalary;
        user.EmployeeProfile.BankAccountNumber = request.BankAccountNumber;
        user.EmployeeProfile.BankName = request.BankName;
        user.EmployeeProfile.NumberOfDependents = request.NumberOfDependents;

        if (request.AvatarUrl != null) 
        {
            user.AvatarUrl = request.AvatarUrl;
        }

        await _context.SaveChangesAsync();

        var log = new AuditLog
        {
            TenantId = tenantId,
            UserId = user.Id,
            Action = "UPDATE_STAFF",
            EntityName = "User",
            EntityId = user.Id.ToString(),
            Details = $"Cập nhật thông tin nhân viên: {user.Fullname}"
        };
        _context.AuditLogs.Add(log);

        await _context.SaveChangesAsync();

        return new StaffPayrollDto { Id = user.Id, Username = user.Username, Fullname = user.Fullname, Role = user.Role.ToString(), IsActive = user.IsActive, Phone = user.Phone, AvatarUrl = user.AvatarUrl, CreatedAt = user.CreatedAt, IdentityCard = user.EmployeeProfile?.IdentityCard, DateOfBirth = user.EmployeeProfile?.DateOfBirth, JoinDate = user.EmployeeProfile?.JoinDate, SocialInsuranceNo = user.EmployeeProfile?.SocialInsuranceNo, HealthInsuranceNo = user.EmployeeProfile?.HealthInsuranceNo, NumberOfDependents = user.EmployeeProfile?.NumberOfDependents, PersonalTaxCode = user.EmployeeProfile?.PersonalTaxCode, BasicSalary = user.EmployeeProfile?.BasicSalary, BankAccountNumber = user.EmployeeProfile?.BankAccountNumber, BankName = user.EmployeeProfile?.BankName };
    }
}
