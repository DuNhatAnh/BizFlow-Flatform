using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BizFlow.Application.Interfaces;
using BizFlow.Domain.Constants;

namespace BizFlow.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ApiControllerBase
{
    private readonly IReportsService _reportsService;

    public ReportsController(IReportsService reportsService)
    {
        _reportsService = reportsService;
    }

    [HttpGet("s1-hkd")]
    [Authorize(Roles = "Owner,Manager")]
    public async Task<IActionResult> GetS1Ledger([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (startDate == default)
            startDate = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        else
            startDate = DateTime.SpecifyKind(startDate, DateTimeKind.Utc);
        
        if (endDate == default)
            endDate = startDate.AddMonths(1).AddDays(-1);
        else
            endDate = DateTime.SpecifyKind(endDate, DateTimeKind.Utc);

        var data = await _reportsService.GetS1LedgerAsync(startDate, endDate, page, pageSize);
        return Ok(data);
    }

    [HttpGet("s3-hkd")]
    [Authorize(Roles = "Owner,Manager")]
    public async Task<IActionResult> GetS3Ledger([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (startDate == default)
            startDate = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        else
            startDate = DateTime.SpecifyKind(startDate, DateTimeKind.Utc);
        
        if (endDate == default)
            endDate = startDate.AddMonths(1).AddDays(-1);
        else
            endDate = DateTime.SpecifyKind(endDate, DateTimeKind.Utc);

        var data = await _reportsService.GetS3LedgerAsync(startDate, endDate, page, pageSize);
        return Ok(data);
    }
}
