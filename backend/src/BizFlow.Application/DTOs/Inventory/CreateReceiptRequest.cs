using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using BizFlow.Domain.Enums;

namespace BizFlow.Application.DTOs.Inventory;

public class CreateReceiptRequest
{
    public ReceiptType Type { get; set; }
    public DateTime? Date { get; set; } // Ngày lập phiếu (nếu có)
    public string? Note { get; set; }
    
    // TT88 Fields
    [Required(ErrorMessage = "Họ tên người giao/nhận hàng là bắt buộc")]
    public string? DelivererReceiverName { get; set; }
    
    [Required(ErrorMessage = "Số chứng từ gốc là bắt buộc")]
    public string? ReferenceDocumentNo { get; set; }
    
    public DateTime? ReferenceDocumentDate { get; set; }
    public string? ReferenceDocumentIssuer { get; set; }
    public string? WarehouseLocation { get; set; }
    public bool UseSellingPrice { get; set; } = false;

    public List<CreateReceiptItemRequest> Items { get; set; } = new();
}

public class CreateReceiptItemRequest
{
    public Guid ProductId { get; set; }
    public decimal? DocumentQuantity { get; set; } // Tùy chọn, nếu null sẽ lấy bằng Quantity
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string? VatRate { get; set; } // Thuế suất VAT (VD: "8", "10", "KCT")
    public bool? PriceIncludesVat { get; set; } // Giá đã bao gồm thuế hay chưa
}
