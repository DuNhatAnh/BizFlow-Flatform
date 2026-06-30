using System;
using System.Collections.Generic;

namespace BizFlow.Application.DTOs.Products;

public class UpdateProductUnitRequest
{
    public int? Id { get; set; } // Null if new unit
    public string UnitName { get; set; } = string.Empty;
    public decimal ConversionRate { get; set; }
    public decimal Price { get; set; }
    public bool IsDefault { get; set; }
}

public class UpdateProductRequest
{
    public string? Code { get; set; }
    public string Name { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public string BaseUnit { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    public string? VatRate { get; set; }
    public bool? PriceIncludesVat { get; set; }

    public List<UpdateProductUnitRequest> Units { get; set; } = new();
}
