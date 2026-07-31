using System.Collections.Generic;
using BizFlow.Application.DTOs.Common;

namespace BizFlow.Application.DTOs.Reports;

public class CashLedgerReportDto
{
    public decimal OpeningBalance { get; set; }
    public decimal ClosingBalance { get; set; }
    public decimal TotalReceipt { get; set; }
    public decimal TotalPayment { get; set; }
    
    // For S7 Bank Details
    public string? BankName { get; set; }
    public string? BranchName { get; set; }
    public string? AccountNumber { get; set; }

    public PagedResult<CashLedgerRowDto> Transactions { get; set; } = new();
}
