using System;
using System.Collections.Generic;

namespace BizFlow.Application.DTOs.Products;

public class ProductDto
{
    public Guid Id { get; set; }
    public string? Code { get; set; }
    public string Name { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public string BaseUnit { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal StockQuantity { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public List<ProductUnitDto> Units { get; set; } = new();
}
