using Microsoft.AspNetCore.Mvc;
using BizFlow.Application.DTOs.Products;
using BizFlow.Application.DTOs.Common;
using BizFlow.Application.Interfaces;
using BizFlow.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace BizFlow.WebApi.Controllers;

public class ProductsController : ApiControllerBase
{
    private readonly IProductService _productService;
    private readonly INotificationService _notificationService;
    private readonly ICurrentTenantService _currentTenantService;

    public ProductsController(IProductService productService, INotificationService notificationService, ICurrentTenantService currentTenantService)
    {
        _productService = productService;
        _notificationService = notificationService;
        _currentTenantService = currentTenantService;
    }

    private Guid GetTenantId()
    {
        var tenantId = _currentTenantService.TenantId;
        if (!tenantId.HasValue || tenantId == Guid.Empty)
        {
            throw new UnauthorizedAccessException("Tenant ID is missing.");
        }
        return tenantId.Value;
    }

    [HttpGet]
    [Authorize(Policy = BizFlow.Domain.Constants.Permissions.ProductsRead)]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        var id = GetTenantId();
        try {
            var products = await _productService.GetAllAsync(id, page, pageSize, search);
            return Ok(products);
        } catch (Exception ex) {
            return Ok(new { error = ex.Message, inner = ex.InnerException?.Message, stack = ex.StackTrace });
        }
    }

    [HttpGet("{id}")]
    [Authorize(Policy = BizFlow.Domain.Constants.Permissions.ProductsRead)]
    public async Task<ActionResult<ProductDto>> GetProduct(Guid id)
    {
        var tenantId = GetTenantId();
        var product = await _productService.GetByIdAsync(tenantId, id);
        if (product == null) return NotFound();

        return Ok(product);
    }

    [HttpPost]
    [Authorize(Policy = BizFlow.Domain.Constants.Permissions.ProductsManage)]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductRequest request)
    {
        var tenantId = GetTenantId();
        var product = await _productService.CreateAsync(tenantId, request);
        try
        {
            await _notificationService.SendToTenantAsync(tenantId, "STOCK_CHANGED");
        }
        catch
        {
            // Soft fail to avoid blocking if SignalR is not running
        }
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = BizFlow.Domain.Constants.Permissions.ProductsManage)]
    public async Task<ActionResult<ProductDto>> UpdateProduct(Guid id, [FromBody] UpdateProductRequest request)
    {
        var tenantId = GetTenantId();
        
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
    [Authorize(Policy = BizFlow.Domain.Constants.Permissions.ProductsManage)]
    public async Task<ActionResult> DeleteProduct(Guid id)
    {
        var tenantId = GetTenantId();

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
    [Authorize(Policy = BizFlow.Domain.Constants.Permissions.ProductsRead)]
    public async Task<ActionResult<List<ProductHistoryDto>>> GetProductHistory(Guid id)
    {
        var tenantId = GetTenantId();

        var histories = await _productService.GetHistoryAsync(tenantId, id);
        return Ok(histories);
    }

    [HttpGet("history/all")]
    public async Task<ActionResult<List<ProductHistoryDto>>> GetGlobalHistory()
    {
        var tenantId = GetTenantId();

        var histories = await _productService.GetAllHistoryAsync(tenantId);
        return Ok(histories);
    }
}

