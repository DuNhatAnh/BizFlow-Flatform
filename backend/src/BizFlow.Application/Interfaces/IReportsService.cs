using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BizFlow.Application.DTOs.Reports;

namespace BizFlow.Application.Interfaces;

public interface IReportsService
{
    Task<S1LedgerReportDto> GetS1LedgerAsync(DateTime startDate, DateTime endDate, int pageNumber = 1, int pageSize = 20);
    Task<S3LedgerReportDto> GetS3LedgerAsync(DateTime startDate, DateTime endDate, int pageNumber = 1, int pageSize = 20);
}
