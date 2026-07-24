using System;

namespace BizFlow.Application.DTOs.Reports;

public class S1LedgerRowDto
{
    public DateTime Date { get; set; }
    public string ReceiptNo { get; set; } = string.Empty;
    public DateTime ReceiptDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Col1_Distribution { get; set; } // Phân phối, cung cấp
    public decimal Col2_Services { get; set; } // Dịch vụ, xây dựng không bao thầu NVL
    public decimal Col3_Production { get; set; } // Sản xuất, vận tải
    public decimal Col4_Other { get; set; } // Hoạt động kinh doanh khác
    public string Notes { get; set; } = string.Empty;
}
