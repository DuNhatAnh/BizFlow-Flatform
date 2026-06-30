using System;
using System.Collections.Generic;
using BizFlow.Domain.Enums;

namespace BizFlow.Application.DTOs.Inventory;

public class ReceiptDto
{
    public Guid Id { get; set; }
    public string ReceiptCode { get; set; } = string.Empty;
    public ReceiptType Type { get; set; }
    public DateTime Date { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal TotalVatAmount { get; set; }
    public decimal TotalCostPrice { get; set; }
    public string? Note { get; set; }
    public string? CreatorName { get; set; }
    
    // TT88 Fields
    public string? DelivererReceiverName { get; set; }
    public string? ReferenceDocumentNo { get; set; }
    public DateTime? ReferenceDocumentDate { get; set; }
    public string? ReferenceDocumentIssuer { get; set; }
    public string? WarehouseLocation { get; set; }
    public DocumentStatus Status { get; set; }
    public string? CancelReason { get; set; }
    public DateTime? CancelledAt { get; set; }
    public List<ReceiptDetailDto> Details { get; set; } = new();
}

public class ReceiptDetailDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal DocumentQuantity { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public string? VatRate { get; set; }
    public decimal VatAmount { get; set; }
}
