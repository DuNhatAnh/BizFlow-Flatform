using System;
using BizFlow.Domain.Enums;

namespace BizFlow.Application.DTOs.Attendance;

public class AttendanceRecordDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string StaffName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    
    public DateTime? CheckInTime { get; set; }
    public DateTime? CheckOutTime { get; set; }
    
    public AttendanceStatus Status { get; set; }
    
    public string? CheckInIpAddress { get; set; }
    public string? CheckInWifiMac { get; set; }
    public string? CheckInPhotoUrl { get; set; }
    public double? CheckInLatitude { get; set; }
    public double? CheckInLongitude { get; set; }
    
    public string? CheckOutIpAddress { get; set; }
    public string? CheckOutWifiMac { get; set; }
    public string? CheckOutPhotoUrl { get; set; }

    public double TotalHours { get; set; }
}
