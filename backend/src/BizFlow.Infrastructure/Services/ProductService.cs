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
            .Where(p => p.TenantId == tenantId && !p.IsDeleted)
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

        var duplicateUnit = request.Units.GroupBy(u => u.UnitName.Trim().ToLower())
                                         .FirstOrDefault(g => g.Count() > 1);
        if (duplicateUnit != null)
            throw new ArgumentException($"Tên đơn vị '{duplicateUnit.Key}' bị trùng lặp.");

        if (request.Units.Any(u => u.ConversionRate <= 0))
            throw new ArgumentException("Tỷ lệ quy đổi phải lớn hơn 0.");

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
        
        // Audit log
        _context.ProductHistories.Add(new ProductHistory
        {
            TenantId = tenantId,
            ProductId = product.Id,
            ActionName = "Tạo mới",
            ChangeDetails = $"Tạo sản phẩm: {product.Name} (Mã: {product.Code}) với {product.ProductUnits.Count} đơn vị tính.",
            ActionBy = "User" // We can extract from Claims later
        });

        await _context.SaveChangesAsync();

        return MapToDto(product);
    }

    public async Task<ProductDto?> UpdateAsync(Guid tenantId, Guid productId, UpdateProductRequest request)
    {
        var product = await _context.Products
            .Include(p => p.ProductUnits)
            .FirstOrDefaultAsync(p => p.TenantId == tenantId && p.Id == productId && !p.IsDeleted);

        if (product == null) return null;

        var duplicateUnit = request.Units.GroupBy(u => u.UnitName.Trim().ToLower())
                                         .FirstOrDefault(g => g.Count() > 1);
        if (duplicateUnit != null)
            throw new ArgumentException($"Tên đơn vị '{duplicateUnit.Key}' bị trùng lặp.");

        if (request.Units.Any(u => u.ConversionRate <= 0))
            throw new ArgumentException("Tỷ lệ quy đổi phải lớn hơn 0.");

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

            // Track specific changes
            var changes = new List<string>();

            if (product.Code != request.Code) changes.Add($"Mã: '{product.Code}' -> '{request.Code}'");
            if (product.Name != request.Name) changes.Add($"Tên: '{product.Name}' -> '{request.Name}'");
            if (product.CategoryId != request.CategoryId) changes.Add("Danh mục bị thay đổi");
            if (product.BaseUnit != request.BaseUnit) changes.Add($"Đơn vị: '{product.BaseUnit}' -> '{request.BaseUnit}'");
            
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
                changes.Add($"Xóa đơn vị '{unit.UnitName}'");
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
                        if (existingUnit.Price != unitRequest.Price) 
                            changes.Add($"Giá bán ({existingUnit.UnitName}): {existingUnit.Price:N0}đ -> {unitRequest.Price:N0}đ");
                        if (existingUnit.UnitName != unitRequest.UnitName)
                            changes.Add($"Tên đơn vị: '{existingUnit.UnitName}' -> '{unitRequest.UnitName}'");

                        existingUnit.UnitName = unitRequest.UnitName;
                        existingUnit.ConversionRate = unitRequest.ConversionRate;
                        existingUnit.Price = unitRequest.Price;
                        existingUnit.IsDefault = unitRequest.IsDefault;
                    }
                }
                else
                {
                    changes.Add($"Thêm mới đơn vị '{unitRequest.UnitName}' (Giá: {unitRequest.Price:N0}đ)");
                    product.ProductUnits.Add(new ProductUnit
                    {
                        UnitName = unitRequest.UnitName,
                        ConversionRate = unitRequest.ConversionRate,
                        Price = unitRequest.Price,
                        IsDefault = unitRequest.IsDefault
                    });
                }
            }

            // Audit log
            if (changes.Any())
            {
                _context.ProductHistories.Add(new ProductHistory
                {
                    TenantId = tenantId,
                    ProductId = product.Id,
                    ActionName = "Cập nhật",
                    ChangeDetails = $"Cập nhật sản phẩm: {product.Name}. Chi tiết: {string.Join(", ", changes)}",
                    ActionBy = "User"
                });
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
            .FirstOrDefaultAsync(p => p.TenantId == tenantId && p.Id == productId && !p.IsDeleted);

        if (product == null) return false;

        product.IsDeleted = true;
        product.IsActive = false;
        
        // Audit log
        _context.ProductHistories.Add(new ProductHistory
        {
            TenantId = tenantId,
            ProductId = product.Id,
            ActionName = "Ngừng kinh doanh / Đã xóa",
            ChangeDetails = $"Đánh dấu xóa / ngừng kinh doanh sản phẩm.",
            ActionBy = "User"
        });

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

    public async Task<List<ProductHistoryDto>> GetHistoryAsync(Guid tenantId, Guid productId)
    {
        var histories = await _context.ProductHistories
            .Where(h => h.TenantId == tenantId && h.ProductId == productId)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();

        return histories.Select(h => new ProductHistoryDto
        {
            Id = h.Id,
            ProductId = h.ProductId,
            ActionName = h.ActionName,
            ChangeDetails = h.ChangeDetails,
            ActionBy = h.ActionBy,
            CreatedAt = h.CreatedAt
        }).ToList();
    }

    public async Task<List<ProductHistoryDto>> GetAllHistoryAsync(Guid tenantId)
    {
        var histories = await _context.ProductHistories
            .Where(h => h.TenantId == tenantId)
            .OrderByDescending(h => h.CreatedAt)
            .Take(100) // Limit to latest 100 for global view
            .ToListAsync();

        return histories.Select(h => new ProductHistoryDto
        {
            Id = h.Id,
            ProductId = h.ProductId,
            ActionName = h.ActionName,
            ChangeDetails = h.ChangeDetails,
            ActionBy = h.ActionBy,
            CreatedAt = h.CreatedAt
        }).ToList();
    }
}
