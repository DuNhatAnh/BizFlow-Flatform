using System.Collections.Generic;
using BizFlow.Application.DTOs.Common;

namespace BizFlow.Application.DTOs.Reports;

public class S3LedgerReportDto
{
    public decimal TotalCol1_Labor { get; set; }
    public decimal TotalCol2_Electricity { get; set; }
    public decimal TotalCol3_Water { get; set; }
    public decimal TotalCol4_Telecom { get; set; }
    public decimal TotalCol5_Rent { get; set; }
    public decimal TotalCol6_Management { get; set; }
    public decimal TotalCol7_Other { get; set; }
    public PagedResult<S3LedgerRowDto> Records { get; set; } = new();
}
