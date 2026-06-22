using System;

namespace BizFlow.Domain.Entities;

public class InventoryReceiptDetail
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ReceiptId { get; set; }
    public Guid ProductId { get; set; }
    public decimal DocumentQuantity { get; set; } // Số lượng theo chứng từ / yêu cầu
    public decimal Quantity { get; set; } // Số lượng thực nhập / thực xuất
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }

    // Navigation properties
    public InventoryReceipt Receipt { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
