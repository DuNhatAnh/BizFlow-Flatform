using System;

namespace BizFlow.Application.DTOs.Products;

public class ProductHistoryDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ActionName { get; set; } = string.Empty;
    public string ChangeDetails { get; set; } = string.Empty;
    public string ActionBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
