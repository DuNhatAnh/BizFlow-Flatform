using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Application.DTOs.Products;
using BizFlow.Application.Interfaces;

namespace BizFlow.Infrastructure.Services;

public class CategoryService : ICategoryService
{
    private readonly IApplicationDbContext _context;

    public CategoryService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CategoryDto>> GetAllAsync(Guid tenantId)
    {
        var categories = await _context.Categories
            .Where(c => c.TenantId == tenantId)
            .ToListAsync();

        return categories.Select(c => new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            ParentId = c.ParentId
        }).ToList();
    }
    public async Task<CategoryDto> CreateAsync(Guid tenantId, CreateCategoryRequest request)
    {
        var category = new BizFlow.Domain.Entities.Category
        {
            TenantId = tenantId,
            Name = request.Name,
            ParentId = request.ParentId
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            ParentId = category.ParentId
        };
    }

    public async Task<CategoryDto> UpdateAsync(Guid tenantId, int categoryId, UpdateCategoryRequest request)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.TenantId == tenantId && c.Id == categoryId);

        if (category == null)
            return null; // Let controller handle 404

        // Update fields
        category.Name = request.Name;
        
        // Prevent setting parent to itself
        if (request.ParentId.HasValue && request.ParentId.Value == categoryId)
        {
            throw new InvalidOperationException("A category cannot be its own parent.");
        }
        category.ParentId = request.ParentId;

        await _context.SaveChangesAsync();

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            ParentId = category.ParentId
        };
    }

    public async Task<bool> DeleteAsync(Guid tenantId, int categoryId)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.TenantId == tenantId && c.Id == categoryId);

        if (category == null)
            return false;

        // Check if products are attached
        var hasProducts = await _context.Products.AnyAsync(p => p.TenantId == tenantId && p.CategoryId == categoryId);
        if (hasProducts)
            return false;

        // Check if it has subcategories
        var hasSubcategories = await _context.Categories.AnyAsync(c => c.TenantId == tenantId && c.ParentId == categoryId);
        if (hasSubcategories)
            return false;

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return true;
    }
}
