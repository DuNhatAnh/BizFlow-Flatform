using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BizFlow.Application.DTOs.Products;

namespace BizFlow.Application.Interfaces;

public interface IProductService
{
    Task<List<ProductDto>> GetAllAsync(Guid tenantId);
    Task<ProductDto?> GetByIdAsync(Guid tenantId, Guid productId);
    Task<ProductDto> CreateAsync(Guid tenantId, CreateProductRequest request);
    Task<ProductDto?> UpdateAsync(Guid tenantId, Guid productId, UpdateProductRequest request);
    Task<bool> DeleteAsync(Guid tenantId, Guid productId);
    Task<List<ProductHistoryDto>> GetHistoryAsync(Guid tenantId, Guid productId);
    Task<List<ProductHistoryDto>> GetAllHistoryAsync(Guid tenantId);
}
