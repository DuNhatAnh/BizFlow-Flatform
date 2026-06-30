using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Application.DTOs.Common;
using BizFlow.Application.DTOs.Payroll;

namespace BizFlow.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PayrollController : ControllerBase
{
    private readonly IPayrollService _payrollService;

    public PayrollController(IPayrollService payrollService)
    {
        _payrollService = payrollService;
    }

    private Guid GetTenantId()
    {
        if (Request.Headers.TryGetValue("X-Tenant-Id", out var tenantIdStr) && Guid.TryParse(tenantIdStr, out var tenantId))
        {
            return tenantId;
        }
        throw new UnauthorizedAccessException("Tenant ID is missing.");
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<PayrollDto>>> GetPayrollRecords(
        [FromQuery] int year,
        [FromQuery] int month,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100)
    {
        try
        {
            var tenantId = GetTenantId();
            var records = await _payrollService.GetPayrollRecordsAsync(tenantId, year, month, page, pageSize);
            return Ok(records);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("generate")]
    public async Task<ActionResult<IEnumerable<PayrollDto>>> GeneratePayroll([FromQuery] int year, [FromQuery] int month)
    {
        try
        {
            var tenantId = GetTenantId();
            var records = await _payrollService.GeneratePayrollForMonthAsync(tenantId, year, month);
            return Ok(records);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
