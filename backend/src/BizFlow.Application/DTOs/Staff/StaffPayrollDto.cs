using System;

namespace BizFlow.Application.DTOs.Staff;

public class StaffPayrollDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Fullname { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Detail level
    public string? IdentityCard { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public DateTime? JoinDate { get; set; }
    public string? SocialInsuranceNo { get; set; }
    public string? HealthInsuranceNo { get; set; }
    public int? NumberOfDependents { get; set; }

    // Payroll / Owner level
    public string? PersonalTaxCode { get; set; }
    public decimal? BasicSalary { get; set; }
    public string? BankAccountNumber { get; set; }
    public string? BankName { get; set; }
}
