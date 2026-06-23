using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BizFlow.Application.DTOs.Products;

namespace BizFlow.Application.Interfaces;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllAsync(Guid tenantId);
    Task<CategoryDto> CreateAsync(Guid tenantId, CreateCategoryRequest request);
    Task<CategoryDto> UpdateAsync(Guid tenantId, int categoryId, UpdateCategoryRequest request);
    Task<bool> DeleteAsync(Guid tenantId, int categoryId);
}
