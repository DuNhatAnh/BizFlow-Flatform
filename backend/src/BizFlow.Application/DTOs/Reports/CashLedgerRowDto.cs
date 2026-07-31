using System;

namespace BizFlow.Application.DTOs.Reports;

public class CashLedgerRowDto
{
    public Guid Id { get; set; }
    public DateTime TransactionDate { get; set; }
    public DateTime DocumentDate { get; set; }
    public string DocumentCode { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal ReceiptAmount { get; set; } // Số tiền thu/gửi vào
    public decimal PaymentAmount { get; set; } // Số tiền chi/rút ra
    public decimal RunningBalance { get; set; } // Số dư lũy kế tại dòng này
}
