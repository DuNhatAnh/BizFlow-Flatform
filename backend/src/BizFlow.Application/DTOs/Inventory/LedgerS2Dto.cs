using System;
using BizFlow.Domain.Enums;

namespace BizFlow.Application.DTOs.Inventory;

public class LedgerS2Dto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public ReceiptType Type { get; set; }
    public string DocumentRef { get; set; } = string.Empty;
    
    public decimal QuantityIn { get; set; }
    public decimal ValueIn { get; set; }
    
    public decimal QuantityOut { get; set; }
    public decimal ValueOut { get; set; }
    
    public decimal QuantityBalance { get; set; }
    public decimal ValueBalance { get; set; }
}
