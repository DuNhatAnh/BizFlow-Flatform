using System.Collections.Generic;

namespace BizFlow.Application.DTOs.Inventory;

public class S2LedgerReportDto
{
    public decimal OpeningQuantity { get; set; }
    public decimal OpeningValue { get; set; }
    
    public decimal TotalQuantityIn { get; set; }
    public decimal TotalValueIn { get; set; }
    
    public decimal TotalQuantityOut { get; set; }
    public decimal TotalValueOut { get; set; }
    
    public decimal ClosingQuantity { get; set; }
    public decimal ClosingValue { get; set; }
    
    public List<LedgerS2Dto> Records { get; set; } = new();
}
