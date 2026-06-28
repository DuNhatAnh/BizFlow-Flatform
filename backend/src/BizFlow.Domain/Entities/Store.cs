using System;

namespace BizFlow.Domain.Entities;

public class Store
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? TaxCode { get; set; }
    public string? Email { get; set; }
    public string? LogoUrl { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // VAT Settings
    public bool EnableVat { get; set; } = false;
    public string DefaultVatRate { get; set; } = "10";
    public string AvailableVatRates { get; set; } = "0,5,8,8.5,10,KCT";

    // Navigation property
    public Tenant Tenant { get; set; } = null!;
}
