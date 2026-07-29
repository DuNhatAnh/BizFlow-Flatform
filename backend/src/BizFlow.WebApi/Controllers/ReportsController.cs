using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BizFlow.Application.Interfaces;
using BizFlow.Domain.Constants;
using BizFlow.Application.Common.Interfaces;

namespace BizFlow.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ApiControllerBase
{
    private readonly IReportsService _reportsService;
    private readonly ICurrentTenantService _currentTenantService;

    public ReportsController(IReportsService reportsService, ICurrentTenantService currentTenantService)
    {
        _reportsService = reportsService;
        _currentTenantService = currentTenantService;
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

    [HttpPost("validate-s2-replay")]
    [Authorize(Roles = "Owner,Manager")]
    public async Task<IActionResult> ValidateS2Replay()
    {
        var tenantId = _currentTenantService.TenantId;
        if (!tenantId.HasValue || tenantId == Guid.Empty)
        {
            return Unauthorized(new { Message = "Tenant context is missing" });
        }

        var isValid = await _reportsService.RebuildS2LedgerValidationAsync(tenantId.Value);
        
        if (isValid)
        {
            return Ok(new { Message = "S2 Ledger Replay Validation PASS: Toàn bộ dữ liệu tồn kho khớp hoàn toàn với chứng từ gốc." });
        }
        else
        {
            return BadRequest(new { Message = "S2 Ledger Replay Validation FAIL: Có sai lệch giữa tồn kho hiện tại và lịch sử chứng từ." });
        }
    }
}
