using System;

namespace BizFlow.Domain.Entities;

public class WorkShift
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty; // e.g., "Ca Sáng"
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    
    // Optional grace period in minutes
    public int GracePeriodMinutes { get; set; } = 0; 
    
    // Minimum staff required for this shift
    public int MinimumStaffCount { get; set; } = 1;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Tenant? Tenant { get; set; }
}
