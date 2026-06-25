using Microsoft.AspNetCore.Mvc;
using BizFlow.Application.DTOs.Inventory;
using BizFlow.Application.DTOs.Inventory;
using BizFlow.Application.DTOs.Common;
using BizFlow.Application.Interfaces;

namespace BizFlow.WebApi.Controllers;

public class InventoryController : ApiControllerBase
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpPost("receipts")]
    public async Task<IActionResult> CreateReceipt([FromHeader(Name = "X-Tenant-Id")] Guid tenantId, [FromBody] CreateReceiptRequest request)
    {
        // Validation will be handled by Model State automatically thanks to [ApiController]
        var receipt = await _inventoryService.CreateReceiptAsync(tenantId, request);
        return Ok(receipt);
    }

    [HttpPost("receipts/{id}/cancel")]
    public async Task<IActionResult> CancelReceipt([FromHeader(Name = "X-Tenant-Id")] Guid tenantId, Guid id, [FromBody] CancelReceiptRequest request)
    {
        try
        {
            await _inventoryService.CancelReceiptAsync(tenantId, id, request);
            return Ok(new { message = "Hủy phiếu thành công" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("receipts")]
    public async Task<ActionResult<PagedResult<ReceiptDto>>> GetReceipts(
        [FromHeader(Name = "X-Tenant-Id")] Guid tenantId,
        [FromQuery] int type = -1,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        if (tenantId == Guid.Empty) return BadRequest("TenantId is required.");

        var receipts = await _inventoryService.GetReceiptsAsync(tenantId, type, page, pageSize);
        return Ok(receipts);
    }

    [HttpGet("reports/s2")]
    public async Task<ActionResult<S2LedgerReportDto>> GetS2Ledger(
        [FromHeader(Name = "X-Tenant-Id")] Guid tenantId, 
        [FromQuery] Guid productId, 
        [FromQuery] DateTime? startDate, 
        [FromQuery] DateTime? endDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        if (tenantId == Guid.Empty) return BadRequest("TenantId is required.");
        if (productId == Guid.Empty) return BadRequest("ProductId is required.");

        var ledger = await _inventoryService.GetS2LedgerAsync(tenantId, productId, startDate, endDate, page, pageSize);
        return Ok(ledger);
    }

    [HttpGet("cost-price/{productId}")]
    public async Task<IActionResult> GetCostPrice([FromHeader(Name = "X-Tenant-Id")] Guid tenantId, Guid productId)
    {
        var costPrice = await _inventoryService.GetCostPriceAsync(tenantId, productId);
        return Ok(new { costPrice });
    }
}
