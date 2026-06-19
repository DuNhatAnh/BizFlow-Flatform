using System;

namespace BizFlow.Domain.Entities;

public class ProductHistory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Guid ProductId { get; set; }
    
    public string ActionName { get; set; } = string.Empty; // Tạo mới, Cập nhật, Xóa
    public string ChangeDetails { get; set; } = string.Empty; // JSON or text
    public string ActionBy { get; set; } = "System";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Product Product { get; set; } = null!;
}
