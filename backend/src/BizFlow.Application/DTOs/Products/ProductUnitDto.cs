using System;

namespace BizFlow.Application.DTOs.Products;

public class ProductUnitDto
{
    public int Id { get; set; }
    public string UnitName { get; set; } = string.Empty;
    public decimal ConversionRate { get; set; }
    public decimal Price { get; set; }
    public bool IsDefault { get; set; }
}
