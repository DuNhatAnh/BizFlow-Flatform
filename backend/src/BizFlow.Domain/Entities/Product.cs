using System;
using System.Collections.Generic;

namespace BizFlow.Domain.Entities;

public class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public int? CategoryId { get; set; }
    public string? Code { get; set; } // SKU / Barcode
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string BaseUnit { get; set; } = string.Empty; // e.g. Lon, Cái, Bao
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public Category? Category { get; set; }
    public ICollection<ProductUnit> ProductUnits { get; set; } = new List<ProductUnit>();
    public ICollection<InventoryTransaction> InventoryTransactions { get; set; } = new List<InventoryTransaction>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
