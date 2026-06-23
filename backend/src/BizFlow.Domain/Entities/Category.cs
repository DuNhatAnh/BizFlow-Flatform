using System;
using System.Collections.Generic;

namespace BizFlow.Domain.Entities;

public class Category
{
    public int Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int? ParentId { get; set; }

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public Category? Parent { get; set; }
    public ICollection<Category> SubCategories { get; set; } = new List<Category>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
