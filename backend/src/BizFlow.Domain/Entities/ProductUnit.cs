using System;

namespace BizFlow.Domain.Entities;

public class ProductUnit
{
    public int Id { get; set; }
    public Guid ProductId { get; set; }
    public string UnitName { get; set; } = string.Empty; // e.g. Thùng, Lốc
    public int ConversionRate { get; set; } = 1; // e.g. Thùng = 24 (quy ra base_unit)
    public decimal Price { get; set; }
    public bool IsDefault { get; set; } = false;

    // Navigation properties
    public Product Product { get; set; } = null!;
}
