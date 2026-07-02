using System;

namespace BizFlow.Domain.Entities;

public class ShiftAssignment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    
    // N-1 to User (Employee)
    public Guid UserId { get; set; }
    public User? User { get; set; }
    
    // N-1 to WorkShift
    public Guid WorkShiftId { get; set; }
    public WorkShift? WorkShift { get; set; }
    
    // Date assigned
    public DateTime Date { get; set; }
    
    // Status: Draft, Published
    public string Status { get; set; } = "Draft";
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Tenant? Tenant { get; set; }
}
