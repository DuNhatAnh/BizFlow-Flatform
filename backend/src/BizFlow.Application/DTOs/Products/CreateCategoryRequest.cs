using System;

namespace BizFlow.Application.DTOs.Products;

public class CreateCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public int? ParentId { get; set; }
}
