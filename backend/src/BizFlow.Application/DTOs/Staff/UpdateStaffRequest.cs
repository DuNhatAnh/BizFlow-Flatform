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

    public string? SocialInsuranceNo { get; set; }
    public string? HealthInsuranceNo { get; set; }
    public string? PersonalTaxCode { get; set; }
    public decimal? BasicSalary { get; set; }
    public string? BankAccountNumber { get; set; }
    public string? BankName { get; set; }
    public int? NumberOfDependents { get; set; }
    public string? AvatarUrl { get; set; }
}
