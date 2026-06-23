using System;

namespace BizFlow.Application.DTOs.Products;

public class UpdateCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public int? ParentId { get; set; }
}
