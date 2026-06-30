using System;

namespace BizFlow.Domain.Entities;

public class OrderItem
{
    public int Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public int? ProductUnitId { get; set; }
    public decimal Quantity { get; set; } = 1m;
    public decimal UnitPrice { get; set; } = 0.00m;
    public decimal TotalPrice { get; set; } = 0.00m;
    
    public string? VatRate { get; set; }
    public decimal VatAmount { get; set; } = 0.00m;

    // Navigation properties
    public Order? Order { get; set; }
    public Product? Product { get; set; }
    public ProductUnit? ProductUnit { get; set; }
}
