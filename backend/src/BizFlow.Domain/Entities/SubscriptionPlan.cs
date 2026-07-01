using System;
using System.Collections.Generic;

namespace BizFlow.Domain.Entities;

public class SubscriptionPlan
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int DurationMonths { get; set; } = 1;
    public string? Description { get; set; }
    /// <summary>Số đơn hàng tối đa mỗi tháng. Null = không giới hạn.</summary>
    public int? MaxOrdersPerMonth { get; set; }
    /// <summary>JSON array danh sách tính năng, ví dụ: ["pos","inventory","ai","tt88"]</summary>
    public string? Features { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Helper
    public bool IsFree => Price == 0;

    // Navigation properties
    public ICollection<Tenant> Tenants { get; set; } = new List<Tenant>();
}
