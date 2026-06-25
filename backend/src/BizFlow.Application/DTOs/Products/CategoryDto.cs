using System;

namespace BizFlow.Application.DTOs.Products;

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int? ParentId { get; set; }
    public string? Color { get; set; }
}
