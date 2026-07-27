using System;

namespace BizFlow.Application.DTOs.Reports;

public class S3LedgerRowDto
{
    public DateTime Date { get; set; }
    public string ReceiptNo { get; set; } = string.Empty;
    public DateTime ReceiptDate { get; set; }
    public string Description { get; set; } = string.Empty;
    
    // Cột 1: Chi phí nhân công
    public decimal Col1_Labor { get; set; }
    
    // Cột 2: Chi phí điện, nước, viễn thông
    public decimal Col2_Utilities { get; set; }
    
    // Cột 3: Chi phí thuê kho bãi, mặt bằng cửa hàng
    public decimal Col3_Rent { get; set; }
    
    // Cột 4: Chi phí quản lý
    public decimal Col4_Management { get; set; }
    
    // Cột 5: Chi phí khác
    public decimal Col5_Other { get; set; }
    
    public string Notes { get; set; } = string.Empty;
}
