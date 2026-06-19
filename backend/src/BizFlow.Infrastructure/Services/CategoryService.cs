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
            Name = c.Name
        }).ToList();
    }
    public async Task<CategoryDto> CreateAsync(Guid tenantId, CreateCategoryRequest request)
    {
        var category = new BizFlow.Domain.Entities.Category
        {
            TenantId = tenantId,
            Name = request.Name
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name
        };
    }

    public async Task<bool> DeleteAsync(Guid tenantId, int categoryId)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.TenantId == tenantId && c.Id == categoryId);

        if (category == null)
            return false;

        // Optionally check if products are attached to this category and prevent deletion or handle it
        var hasProducts = await _context.Products.AnyAsync(p => p.TenantId == tenantId && p.CategoryId == categoryId);
        if (hasProducts)
            return false;

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return true;
    }
}
