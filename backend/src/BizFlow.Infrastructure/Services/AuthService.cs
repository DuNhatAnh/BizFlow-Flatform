using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Application.DTOs.Auth;
using BizFlow.Application.Interfaces;
using BCrypt.Net;

namespace BizFlow.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _context;
    private readonly IConfiguration _config;

    public AuthService(IApplicationDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.ToLower());

        if (user == null || !user.IsActive)
        {
            throw new UnauthorizedAccessException("Tên đăng nhập hoặc mật khẩu không đúng!");
        }

        bool isPasswordValid = false;

        // Check if the password in DB is a BCrypt hash (usually starts with $2a$ or $2b$ or $2y$)
        if (user.PasswordHash.StartsWith("$2"))
        {
            isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        }
        else
        {
            // Fallback for old plain-text passwords
            if (user.PasswordHash == request.Password)
            {
                isPasswordValid = true;
                
                // Seamless Migration: Hash the password and save it
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
                await _context.SaveChangesAsync();
            }
        }

        if (!isPasswordValid)
        {
            throw new UnauthorizedAccessException("Tên đăng nhập hoặc mật khẩu không đúng!");
        }

        var token = GenerateJwtToken(user);

        return new LoginResponse
        {
            Token = token,
            User = new UserInfoDto
            {
                Id = user.Id,
                Username = user.Username,
                Fullname = user.Fullname,
                Role = user.Role.ToString(),
                RoleName = GetRoleName(user.Role.ToString()),
                TenantId = user.TenantId
            }
        };
    }

    private string GenerateJwtToken(BizFlow.Domain.Entities.User user)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"];
        var issuer = jwtSettings["Issuer"];
        var audience = jwtSettings["Audience"];
        var expiryMinutes = int.Parse(jwtSettings["ExpiryMinutes"] ?? "1440");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Username),
            new Claim("tenant_id", user.TenantId.ToString()),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("fullname", user.Fullname)
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<UserProfileResponse> GetUserProfileAsync(Guid userId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) throw new UnauthorizedAccessException("Không tìm thấy người dùng");

        return new UserProfileResponse
        {
            Id = user.Id,
            Username = user.Username,
            Fullname = user.Fullname,
            Role = user.Role.ToString(),
            RoleName = GetRoleName(user.Role.ToString()),
            TenantId = user.TenantId,
            Phone = user.Phone,
            IdentityCard = user.IdentityCard,
            DateOfBirth = user.DateOfBirth,
            JoinDate = user.JoinDate ?? user.CreatedAt
        };
    }

    public async Task UpdateUserProfileAsync(Guid userId, UpdateProfileRequest request, BizFlow.Domain.Enums.UserRole currentUserRole)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) throw new UnauthorizedAccessException("Không tìm thấy người dùng");

        user.Phone = request.Phone;
        user.DateOfBirth = request.DateOfBirth;

        if (currentUserRole == BizFlow.Domain.Enums.UserRole.Owner || currentUserRole == BizFlow.Domain.Enums.UserRole.Manager)
        {
            user.IdentityCard = request.IdentityCard;
            user.JoinDate = request.JoinDate;
        }

        await _context.SaveChangesAsync();
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) throw new UnauthorizedAccessException("Không tìm thấy người dùng");

        bool isPasswordValid = false;
        if (user.PasswordHash.StartsWith("$2"))
        {
            isPasswordValid = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash);
        }
        else
        {
            if (user.PasswordHash == request.CurrentPassword)
            {
                isPasswordValid = true;
            }
        }

        if (!isPasswordValid)
        {
            throw new InvalidOperationException("Mật khẩu hiện tại không đúng.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _context.SaveChangesAsync();
    }


    private string GetRoleName(string role)
    {
        return role switch
        {
            "PlatformAdmin" => "Quản trị viên hệ thống",
            "Owner" => "Chủ cửa hàng",
            "Manager" => "Quản lý",
            "Cashier" => "Thu ngân",
            "Accountant" => "Kế toán",
            "Warehouse" => "Thủ kho",
            _ => "Nhân viên"
        };
    }
}
