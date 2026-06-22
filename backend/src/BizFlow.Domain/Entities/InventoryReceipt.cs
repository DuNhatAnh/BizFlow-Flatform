using System;
using System.Collections.Generic;
using BizFlow.Domain.Enums;

namespace BizFlow.Domain.Entities;

public class InventoryReceipt
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public string ReceiptCode { get; set; } = string.Empty; // Mã chứng từ (VD: PN0001)
    public ReceiptType Type { get; set; } // 0: Import (03-VT), 1: Export (04-VT)
    public DateTime Date { get; set; } = DateTime.UtcNow; // Ngày chứng từ
    public decimal TotalAmount { get; set; } // Tổng tiền
    public string? Note { get; set; }
    
    // Bổ sung các trường chuẩn TT88 Mẫu 03-VT / 04-VT
    public string? DelivererReceiverName { get; set; } // Họ tên người giao/nhận hàng
    public string? ReferenceDocumentNo { get; set; } // Theo chứng từ số...
    public DateTime? ReferenceDocumentDate { get; set; } // Ngày chứng từ gốc
    public string? ReferenceDocumentIssuer { get; set; } // Của cơ quan/đơn vị ban hành
    public string? WarehouseLocation { get; set; } // Địa điểm nhập/xuất kho

    // Status and Cancel properties
    public DocumentStatus Status { get; set; } = DocumentStatus.Completed; // Mặc định là Completed vì ghi sổ ngay
    public DateTime? CancelledAt { get; set; }
    public Guid? CancelledBy { get; set; }
    public string? CancelReason { get; set; }

    public Guid? CreatedBy { get; set; }

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public User? Creator { get; set; }
    public ICollection<InventoryReceiptDetail> Details { get; set; } = new List<InventoryReceiptDetail>();
}
