using Microsoft.AspNetCore.Mvc;
using BizFlow.Application.DTOs.Products;
using BizFlow.Application.Interfaces;

namespace BizFlow.WebApi.Controllers;

public class ProductsController : ApiControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProductDto>>> GetProducts([FromQuery] Guid tenantId)
    {
        if (tenantId == Guid.Empty) return BadRequest("TenantId is required.");
        
        var products = await _productService.GetAllAsync(tenantId);
        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetProduct(Guid id, [FromQuery] Guid tenantId)
    {
        if (tenantId == Guid.Empty) return BadRequest("TenantId is required.");

        var product = await _productService.GetByIdAsync(tenantId, id);
        if (product == null) return NotFound();

        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromQuery] Guid tenantId, [FromBody] CreateProductRequest request)
    {
        if (tenantId == Guid.Empty) return BadRequest("TenantId is required.");

        var product = await _productService.CreateAsync(tenantId, request);
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id, tenantId }, product);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProductDto>> UpdateProduct(Guid id, [FromQuery] Guid tenantId, [FromBody] UpdateProductRequest request)
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

        return Ok(product);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteProduct(Guid id, [FromQuery] Guid tenantId)
    {
        if (tenantId == Guid.Empty) return BadRequest("TenantId is required.");

        var result = await _productService.DeleteAsync(tenantId, id);
        if (!result) return NotFound();

        return NoContent();
    }
}
