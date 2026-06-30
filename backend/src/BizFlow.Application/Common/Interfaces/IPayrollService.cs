using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BizFlow.Application.DTOs.Common;
using BizFlow.Application.DTOs.Payroll;

namespace BizFlow.Application.Common.Interfaces;

public interface IPayrollService
{
    Task<PagedResult<PayrollDto>> GetPayrollRecordsAsync(Guid tenantId, int year, int month, int pageNumber = 1, int pageSize = 10);
    Task<IEnumerable<PayrollDto>> GeneratePayrollForMonthAsync(Guid tenantId, int year, int month);
}
