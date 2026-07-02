using System;
using BizFlow.Domain.Enums;

namespace BizFlow.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Fullname { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Employee;
    public bool IsActive { get; set; } = true;
    public string? Phone { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string? AvatarUrl { get; set; }

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public EmployeeProfile? EmployeeProfile { get; set; }
}
