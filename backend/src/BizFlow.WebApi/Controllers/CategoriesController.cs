using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using BizFlow.Application.DTOs.Products;
using BizFlow.Application.Interfaces;

namespace BizFlow.WebApi.Controllers;

public class CategoriesController : ApiControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetCategories([FromHeader(Name = "X-Tenant-Id")] Guid tenantId)
    {
        if (tenantId == Guid.Empty) return BadRequest("TenantId is required.");
        
        var categories = await _categoryService.GetAllAsync(tenantId);
        return Ok(categories);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> CreateCategory([FromHeader(Name = "X-Tenant-Id")] Guid tenantId, [FromBody] CreateCategoryRequest request)
    {
        if (tenantId == Guid.Empty) return BadRequest("TenantId is required.");
        if (string.IsNullOrWhiteSpace(request.Name)) return BadRequest("Name is required.");

        var category = await _categoryService.CreateAsync(tenantId, request);
        return Ok(category);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCategory([FromHeader(Name = "X-Tenant-Id")] Guid tenantId, int id)
    {
        if (tenantId == Guid.Empty) return BadRequest("TenantId is required.");

        var success = await _categoryService.DeleteAsync(tenantId, id);
        if (!success)
            return BadRequest("Không thể xóa danh mục. Có thể danh mục này đang chứa sản phẩm hoặc không tồn tại.");

        return NoContent();
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CategoryDto>> UpdateCategory([FromHeader(Name = "X-Tenant-Id")] Guid tenantId, int id, [FromBody] UpdateCategoryRequest request)
    {
        if (tenantId == Guid.Empty) return BadRequest("TenantId is required.");
        if (string.IsNullOrWhiteSpace(request.Name)) return BadRequest("Name is required.");

        try
        {
            var category = await _categoryService.UpdateAsync(tenantId, id, request);
            if (category == null) return NotFound();
            return Ok(category);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
