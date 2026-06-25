using System;

namespace BizFlow.Application.DTOs.Staff;

public class StaffDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Fullname { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string? Phone { get; set; }
    public string? IdentityCard { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public DateTime? JoinDate { get; set; }
    public DateTime CreatedAt { get; set; }
}
