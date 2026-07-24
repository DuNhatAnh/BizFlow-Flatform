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
    public async Task<IActionResult> GetS1Ledger([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        if (startDate == default)
            startDate = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        
        if (endDate == default)
            endDate = startDate.AddMonths(1).AddDays(-1);

        var data = await _reportsService.GetS1LedgerAsync(startDate, endDate);
        return Ok(data);
    }
}
