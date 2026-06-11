using System;

namespace BizFlow.Domain.Entities;

public class OrderItem
{
    public int Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public int? ProductUnitId { get; set; }
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; } = 0.00m;
    public decimal TotalPrice { get; set; } = 0.00m;

    // Navigation properties
    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
    public ProductUnit? ProductUnit { get; set; }
}
