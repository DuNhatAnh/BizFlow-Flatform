using System;

namespace BizFlow.Application.DTOs.Staff;

public class UpdateStaffRequest
{
    public string Username { get; set; } = string.Empty;
    public string Fullname { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? IdentityCard { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public DateTime? JoinDate { get; set; }
}
