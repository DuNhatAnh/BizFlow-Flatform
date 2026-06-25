using Microsoft.AspNetCore.Mvc;
using BizFlow.Application.DTOs.Products;
using BizFlow.Application.DTOs.Products;
using BizFlow.Application.DTOs.Common;
using BizFlow.Application.Interfaces;

namespace BizFlow.WebApi.Controllers;

public class ProductsController : ApiControllerBase
{
    private readonly IProductService _productService;
    private readonly INotificationService _notificationService;

    public ProductsController(IProductService productService, INotificationService notificationService)
    {
        _productService = productService;
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetProducts(
        [FromHeader(Name = "X-Tenant-Id")] Guid? tenantId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        var id = tenantId ?? Guid.Parse("11111111-1111-1111-1111-111111111111");
        try {
            var products = await _productService.GetAllAsync(id, page, pageSize, search);
            return Ok(products);
        } catch (Exception ex) {
            return Ok(new { error = ex.Message, inner = ex.InnerException?.Message, stack = ex.StackTrace });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetProduct(Guid id, [FromHeader(Name = "X-Tenant-Id")] Guid tenantId)
    {
        if (tenantId == Guid.Empty) return BadRequest("TenantId is required.");

        var product = await _productService.GetByIdAsync(tenantId, id);
        if (product == null) return NotFound();

        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromHeader(Name = "X-Tenant-Id")] Guid tenantId, [FromBody] CreateProductRequest request)
    {
        if (tenantId == Guid.Empty) return BadRequest("TenantId is required.");

        var product = await _productService.CreateAsync(tenantId, request);
        try
        {
            await _notificationService.SendToTenantAsync(tenantId, "STOCK_CHANGED");
        }
        catch
        {
            // Soft fail to avoid blocking if SignalR is not running
        }
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id, tenantId }, product);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProductDto>> UpdateProduct(Guid id, [FromHeader(Name = "X-Tenant-Id")] Guid tenantId, [FromBody] UpdateProductRequest request)
    {
        if (tenantId == Guid.Empty) return BadRequest("TenantId is required.");
        
        if (!ModelState.IsValid)
        {
            var errors = ModelState
                .Where(x => x.Value?.Errors.Any() == true)
                .ToDictionary(
                    kv => kv.Key,
                    kv => kv.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
                );
            return BadRequest(new { message = "Dữ liệu không hợp lệ", errors });
        }

        var product = await _productService.UpdateAsync(tenantId, id, request);
        if (product == null) return NotFound();

        try
        {
            await _notificationService.SendToTenantAsync(tenantId, "STOCK_CHANGED");
        }
        catch
        {
            // Soft fail
        }

        return Ok(product);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteProduct(Guid id, [FromHeader(Name = "X-Tenant-Id")] Guid tenantId)
    {
        if (tenantId == Guid.Empty) return BadRequest("TenantId is required.");

        var result = await _productService.DeleteAsync(tenantId, id);
        if (!result) return NotFound();

        try
        {
            await _notificationService.SendToTenantAsync(tenantId, "STOCK_CHANGED");
        }
        catch
        {
            // Soft fail
        }

        return NoContent();
    }

    [HttpGet("{id}/history")]
    public async Task<ActionResult<List<ProductHistoryDto>>> GetProductHistory(Guid id, [FromHeader(Name = "X-Tenant-Id")] Guid tenantId)
    {
        if (tenantId == Guid.Empty) return BadRequest("TenantId is required.");

        var histories = await _productService.GetHistoryAsync(tenantId, id);
        return Ok(histories);
    }

    [HttpGet("history/all")]
    public async Task<ActionResult<List<ProductHistoryDto>>> GetGlobalHistory([FromHeader(Name = "X-Tenant-Id")] Guid tenantId)
    {
        if (tenantId == Guid.Empty) return BadRequest("TenantId is required.");

        var histories = await _productService.GetAllHistoryAsync(tenantId);
        return Ok(histories);
    }
}

