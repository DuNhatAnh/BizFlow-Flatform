using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BizFlow.Application.DTOs.Reports;

namespace BizFlow.Application.Interfaces;

public interface IReportsService
{
    Task<List<S1LedgerRowDto>> GetS1LedgerAsync(DateTime startDate, DateTime endDate);
}
