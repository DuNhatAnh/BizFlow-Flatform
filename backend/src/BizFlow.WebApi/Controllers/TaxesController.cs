using System;
using System.Threading;
using System.Threading.Tasks;
using BizFlow.Application.DTOs.Taxes;
using BizFlow.Application.DTOs.Tax;
using BizFlow.Application.Interfaces;
using BizFlow.Application.Common.Interfaces;
using BizFlow.WebApi.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BizFlow.WebApi.Controllers;

[Authorize]
[Route("api/[controller]")]
public class TaxesController : ApiControllerBase
{
    private readonly ITaxService _taxService;
    private readonly ICurrentTenantService _currentTenantService;

    public TaxesController(ITaxService taxService, ICurrentTenantService currentTenantService)
    {
        _taxService = taxService;
        _currentTenantService = currentTenantService;
    }

    private Guid GetTenantId()
    {
        var tenantId = _currentTenantService.TenantId;
        if (!tenantId.HasValue || tenantId == Guid.Empty)
        {
            throw new UnauthorizedAccessException("Tenant context is missing");
        }
        return tenantId.Value;
    }

    /// <summary>
    /// Lấy danh sách nghĩa vụ thuế (Sổ S4)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Owner,Admin")]
    public async Task<IActionResult> GetS4Ledger([FromQuery] int? year, [FromQuery] int? month, CancellationToken cancellationToken)
    {
        var tenantId = GetTenantId();
        var result = await _taxService.GetS4LedgerAsync(tenantId, year, month, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Tạo mới một nghĩa vụ thuế (thủ công)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Owner,Admin")]
    public async Task<IActionResult> CreateTaxObligation([FromBody] CreateTaxObligationDto request, CancellationToken cancellationToken)
    {
        var tenantId = GetTenantId();
        var result = await _taxService.CreateTaxObligationAsync(tenantId, request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Đóng thuế (Nộp tiền thuế)
    /// </summary>
    [HttpPost("{id}/pay")]
    [Authorize(Roles = "Owner,Admin")]
    public async Task<IActionResult> PayTax([FromRoute] Guid id, [FromBody] PayTaxRequestDto request, CancellationToken cancellationToken)
    {
        var tenantId = GetTenantId();
        var userId = User.GetUserId();
        var result = await _taxService.PayTaxAsync(tenantId, id, userId, request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Tự động tính thuế tháng dựa trên doanh thu
    /// </summary>
    [HttpPost("calculate")]
    [Authorize(Roles = "Owner,Admin")]
    public async Task<IActionResult> CalculateMonthlyTax([FromBody] CalculateTaxRequest request, CancellationToken cancellationToken)
    {
        var tenantId = GetTenantId();
        var userId = User.GetUserId();
        
        try
        {
            await _taxService.CalculateMonthlyTaxAsync(tenantId, userId, request, cancellationToken);
            return Ok(new { message = "Tính thuế thành công" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
