using System.ComponentModel.DataAnnotations;

namespace BizFlow.Application.DTOs.Store;

public class UpdateStoreDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? TaxCode { get; set; }
    public string? Email { get; set; }
    public string? LogoUrl { get; set; }
    
    // VAT Settings
    public bool? EnableVat { get; set; }
    public string? DefaultVatRate { get; set; }
    public string? AvailableVatRates { get; set; }
}
