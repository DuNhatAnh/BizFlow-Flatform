using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Application.DTOs.Products;
using BizFlow.Application.Interfaces;
using BizFlow.Domain.Entities;

namespace BizFlow.Infrastructure.Services;

public class ProductService : IProductService
{
    private readonly IApplicationDbContext _context;

    public ProductService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductDto>> GetAllAsync(Guid tenantId)
    {
        var products = await _context.Products
            .Include(p => p.ProductUnits)
            .Where(p => p.TenantId == tenantId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return products.Select(p => MapToDto(p)).ToList();
    }

    public async Task<ProductDto?> GetByIdAsync(Guid tenantId, Guid productId)
    {
        var product = await _context.Products
            .Include(p => p.ProductUnits)
            .FirstOrDefaultAsync(p => p.TenantId == tenantId && p.Id == productId);

        if (product == null) return null;

        return MapToDto(product);
    }

    public async Task<ProductDto> CreateAsync(Guid tenantId, CreateProductRequest request)
    {
        if (request.CategoryId.HasValue)
        {
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == request.CategoryId.Value);
            if (!categoryExists)
            {
                request.CategoryId = null; // Prevent Foreign Key violation if category is missing
            }
        }

        var product = new Product
        {
            TenantId = tenantId,
            Code = request.Code,
            Name = request.Name,
            CategoryId = request.CategoryId,
            BaseUnit = request.BaseUnit,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow
        };

        foreach (var unitRequest in request.Units)
        {
            product.ProductUnits.Add(new ProductUnit
            {
                UnitName = unitRequest.UnitName,
                ConversionRate = unitRequest.ConversionRate,
                Price = unitRequest.Price,
                IsDefault = unitRequest.IsDefault
            });
        }

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return MapToDto(product);
    }

    public async Task<ProductDto?> UpdateAsync(Guid tenantId, Guid productId, UpdateProductRequest request)
    {
        var product = await _context.Products
            .Include(p => p.ProductUnits)
            .FirstOrDefaultAsync(p => p.TenantId == tenantId && p.Id == productId);

        if (product == null) return null;

        using var transaction = await _context.BeginTransactionAsync();
        try
        {
            if (request.CategoryId.HasValue)
            {
                var categoryExists = await _context.Categories.AnyAsync(c => c.Id == request.CategoryId.Value);
                if (!categoryExists)
                {
                    request.CategoryId = null;
                }
            }

            product.Code = request.Code;
            product.Name = request.Name;
            product.CategoryId = request.CategoryId;
            product.BaseUnit = request.BaseUnit;
            product.Description = request.Description;

            // Handle units update
            var existingUnits = product.ProductUnits.ToList();

            // 1. Delete removed units
            var requestUnitIds = request.Units.Where(u => u.Id.HasValue).Select(u => u.Id.Value).ToList();
            var unitsToRemove = existingUnits.Where(u => !requestUnitIds.Contains(u.Id)).ToList();
            foreach (var unit in unitsToRemove)
            {
                _context.ProductUnits.Remove(unit);
            }

            // 2. Update or Add units
            foreach (var unitRequest in request.Units)
            {
                if (unitRequest.Id.HasValue && unitRequest.Id.Value > 0)
                {
                    var existingUnit = existingUnits.FirstOrDefault(u => u.Id == unitRequest.Id.Value);
                    if (existingUnit != null)
                    {
                        existingUnit.UnitName = unitRequest.UnitName;
                        existingUnit.ConversionRate = unitRequest.ConversionRate;
                        existingUnit.Price = unitRequest.Price;
                        existingUnit.IsDefault = unitRequest.IsDefault;
                    }
                }
                else
                {
                    product.ProductUnits.Add(new ProductUnit
                    {
                        UnitName = unitRequest.UnitName,
                        ConversionRate = unitRequest.ConversionRate,
                        Price = unitRequest.Price,
                        IsDefault = unitRequest.IsDefault
                    });
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return MapToDto(product);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> DeleteAsync(Guid tenantId, Guid productId)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.TenantId == tenantId && p.Id == productId);

        if (product == null) return false;

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return true;
    }

    private static ProductDto MapToDto(Product product)
    {
        return new ProductDto
        {
            Id = product.Id,
            Code = product.Code,
            Name = product.Name,
            CategoryId = product.CategoryId,
            BaseUnit = product.BaseUnit,
            Description = product.Description,
            CreatedAt = product.CreatedAt,
            Units = product.ProductUnits.Select(u => new ProductUnitDto
            {
                Id = u.Id,
                UnitName = u.UnitName,
                ConversionRate = u.ConversionRate,
                Price = u.Price,
                IsDefault = u.IsDefault
            }).ToList()
        };
    }
}
