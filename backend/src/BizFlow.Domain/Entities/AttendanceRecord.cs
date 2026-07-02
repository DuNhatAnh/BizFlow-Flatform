using System;
using BizFlow.Domain.Enums;

namespace BizFlow.Domain.Entities;

public class AttendanceRecord
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }

    public DateTime CheckInTime { get; set; }
    public DateTime? CheckOutTime { get; set; }

    // Thông tin chống gian lận (Anti-fraud fields)
    public string? CheckInIpAddress { get; set; }
    public string? CheckOutIpAddress { get; set; }
    public string? CheckInWifiMac { get; set; }
    public string? CheckOutWifiMac { get; set; }

    public double? CheckInLatitude { get; set; }
    public double? CheckInLongitude { get; set; }
    public double? CheckOutLatitude { get; set; }
    public double? CheckOutLongitude { get; set; }

    public string? CheckInPhotoUrl { get; set; }
    public string? CheckOutPhotoUrl { get; set; }

    public AttendanceStatus Status { get; set; } = AttendanceStatus.Present;
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public User User { get; set; } = null!;
}
