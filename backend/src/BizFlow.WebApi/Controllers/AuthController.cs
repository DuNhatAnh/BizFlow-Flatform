using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;

namespace BizFlow.WebApi.Controllers;

public class AuthController : ApiControllerBase
{
    private readonly IApplicationDbContext _context;

    public AuthController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // Search user in DB (triggered by hot reload)
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.ToLower() && u.IsActive);

        if (user == null || user.PasswordHash != request.Password)
        {
            return Unauthorized(new { Message = "Tên đăng nhập hoặc mật khẩu không chính xác" });
        }

        // For simplicity, token is a base64 encoded representation of user details
        var tokenRaw = $"{user.Id}:{user.TenantId}:{user.Role}:{user.Username}";
        var tokenBytes = System.Text.Encoding.UTF8.GetBytes(tokenRaw);
        var token = Convert.ToBase64String(tokenBytes);

        return Ok(new LoginResponse
        {
            AccessToken = token,
            TenantId = user.TenantId,
            UserId = user.Id,
            Fullname = user.Fullname,
            Role = user.Role.ToString()
        });
    }
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string Fullname { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
