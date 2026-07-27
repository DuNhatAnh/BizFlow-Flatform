using System.Collections.Generic;
using BizFlow.Application.DTOs.Common;

namespace BizFlow.Application.DTOs.Reports;

public class S1LedgerReportDto
{
    public decimal TotalCol1_Distribution { get; set; }
    public decimal TotalCol2_Services { get; set; }
    public decimal TotalCol3_Production { get; set; }
    public decimal TotalCol4_Other { get; set; }
    public PagedResult<S1LedgerRowDto> Records { get; set; } = new();
}
