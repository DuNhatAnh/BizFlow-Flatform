using System;
using BizFlow.Domain.Enums;

namespace BizFlow.Domain.Entities;

public class InventoryTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Guid ProductId { get; set; }
    public InventoryTransactionType Type { get; set; }
    public int Quantity { get; set; } // Số lượng thay đổi (tính theo base_unit)
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid? CreatedBy { get; set; }
    public string? Note { get; set; }


    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public Product Product { get; set; } = null!;
    public User? Creator { get; set; }
}
