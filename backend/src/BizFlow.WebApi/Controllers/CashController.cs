using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BizFlow.Application.DTOs.Cash;
using BizFlow.Application.DTOs.Common;
using BizFlow.Application.Interfaces;

namespace BizFlow.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CashController : ControllerBase
{
    private readonly ICashService _cashService;

    public CashController(ICashService cashService)
    {
        _cashService = cashService;
    }

    private Guid GetTenantId()
    {
        var tenantClaim = User.FindFirst("tenant_id")?.Value;
        if (Guid.TryParse(tenantClaim, out var tenantId))
            return tenantId;
        return Guid.Empty;
    }

    private Guid GetUserId()
    {
        var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(idClaim, out var userId))
            return userId;
        return Guid.Empty;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<CashTransactionDto>>> GetTransactions(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var tenantId = GetTenantId();
        if (tenantId == Guid.Empty) return Unauthorized();

        try
        {
            var result = await _cashService.GetTransactionsAsync(tenantId, page, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { 
                message = ex.Message, 
                stackTrace = ex.StackTrace, 
                inner = ex.InnerException?.Message 
            });
        }
    }

    [HttpGet("balance")]
    public async Task<ActionResult<decimal>> GetBalance()
    {
        var tenantId = GetTenantId();
        if (tenantId == Guid.Empty) return Unauthorized();

        var result = await _cashService.GetCashBalanceAsync(tenantId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<CashTransactionDto>> CreateTransaction([FromBody] CreateCashTransactionRequest request)
    {
        var tenantId = GetTenantId();
        var userId = GetUserId();
        if (tenantId == Guid.Empty || userId == Guid.Empty) return Unauthorized();

        var result = await _cashService.CreateTransactionAsync(tenantId, request, userId);
        return Ok(result);
    }
}
