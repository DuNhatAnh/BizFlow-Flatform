using System;
using BizFlow.Domain.Enums;

namespace BizFlow.Domain.Entities;

public class AccountingLedgerS2
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Guid ProductId { get; set; }
    public Guid? ReceiptId { get; set; } // Liên kết với Phiếu nhập/xuất nếu có
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public ReceiptType Type { get; set; } // Import or Export

    // Số lượng và giá trị nhập
    public decimal QuantityIn { get; set; }
    public decimal ValueIn { get; set; }

    // Số lượng và giá trị xuất
    public decimal QuantityOut { get; set; }
    public decimal ValueOut { get; set; }

    // Tồn cuối kỳ
    public decimal QuantityBalance { get; set; }
    public decimal ValueBalance { get; set; }

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public Product Product { get; set; } = null!;
    public InventoryReceipt? Receipt { get; set; }
}
