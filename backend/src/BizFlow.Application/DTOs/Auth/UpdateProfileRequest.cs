using System;

namespace BizFlow.Application.DTOs.Auth;

public class UpdateProfileRequest
{
    public string? Phone { get; set; }
    public string? IdentityCard { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public DateTime? JoinDate { get; set; }
    public string? AvatarUrl { get; set; }
}
