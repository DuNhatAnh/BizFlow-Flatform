using System;

namespace BizFlow.Application.DTOs.Attendance;

public class CheckOutRequest
{
    public string? IpAddress { get; set; }
    public string? WifiMac { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? PhotoUrl { get; set; }
}
