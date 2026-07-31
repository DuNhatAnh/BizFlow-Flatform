using System;
using System.ComponentModel.DataAnnotations;

namespace BizFlow.Domain.Entities;

public class BankAccount
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    
    [Required]
    public string BankName { get; set; } = string.Empty;
    
    [Required]
    public string BranchName { get; set; } = string.Empty;
    
    [Required]
    public string AccountNumber { get; set; } = string.Empty;
    
    [Required]
    public string AccountHolder { get; set; } = string.Empty;
    
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Timestamp]
    public byte[]? RowVersion { get; set; }

    public Tenant Tenant { get; set; } = null!;
}
