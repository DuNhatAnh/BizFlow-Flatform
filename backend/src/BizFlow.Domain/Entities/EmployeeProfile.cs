using System;

namespace BizFlow.Domain.Entities;

public class EmployeeProfile
{
    public Guid Id { get; set; }
    
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

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
}
