using System;

namespace BizFlow.Application.DTOs.Store;

public class StoreDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? TaxCode { get; set; }
    public string? Email { get; set; }
    public string? LogoUrl { get; set; }
    public bool IsActive { get; set; }
    
    // VAT Settings
    public bool EnableVat { get; set; }
    public string DefaultVatRate { get; set; } = string.Empty;
    public string AvailableVatRates { get; set; } = string.Empty;
}
