using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Application.DTOs.Attendance;
using BizFlow.Domain.Entities;
using BizFlow.Domain.Enums;

namespace BizFlow.Infrastructure.Services;

public class AttendanceService : IAttendanceService
{
    private readonly IApplicationDbContext _context;
    
    // Bán kính cho phép (mét)
    private const double ALLOWED_DISTANCE_METERS = 100;

    public AttendanceService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AttendanceRecordDto> CheckInAsync(Guid tenantId, Guid userId, CheckInRequest request)
    {
        var today = DateTime.UtcNow.Date;
        
        // Kiểm tra xem đã check-in hôm nay chưa
        var existingRecord = await _context.AttendanceRecords
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.UserId == userId && x.CheckInTime.Date == today);

        if (existingRecord != null)
        {
            throw new Exception("Bạn đã check-in trong ngày hôm nay rồi.");
        }

        // Tính toán khoảng cách (Geofencing)
        if (request.Latitude.HasValue && request.Longitude.HasValue)
        {
            var store = await _context.Stores.FirstOrDefaultAsync(s => s.TenantId == tenantId);
            if (store != null && store.Latitude.HasValue && store.Longitude.HasValue)
            {
                var distance = CalculateDistance(request.Latitude.Value, request.Longitude.Value, store.Latitude.Value, store.Longitude.Value);
                if (distance > ALLOWED_DISTANCE_METERS)
                {
                    throw new Exception($"Vị trí của bạn quá xa cửa hàng (cách {Math.Round(distance)}m). Vui lòng di chuyển đến cửa hàng để vào ca.");
                }
            }
        }

        var currentTime = DateTime.UtcNow;
        var localTime = currentTime.AddHours(7); // Use local time for shift comparison
        
        var assignment = await _context.ShiftAssignments
            .Include(a => a.WorkShift)
            .FirstOrDefaultAsync(a => a.TenantId == tenantId && a.UserId == userId && a.Date.Date == today);

        var status = AttendanceStatus.Present;
        string? notes = null;

        if (assignment != null && assignment.WorkShift != null)
        {
            var expectedStart = assignment.WorkShift.StartTime.Add(TimeSpan.FromMinutes(assignment.WorkShift.GracePeriodMinutes));
            if (localTime.TimeOfDay > expectedStart)
            {
                status = AttendanceStatus.Late;
            }
        }
        else
        {
            notes = "Làm ngoài ca (Không có phân công)";
        }

        var record = new AttendanceRecord
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = userId,
            CheckInTime = currentTime,
            CheckInIpAddress = request.IpAddress,
            CheckInWifiMac = request.WifiMac,
            CheckInLatitude = request.Latitude,
            CheckInLongitude = request.Longitude,
            CheckInPhotoUrl = request.PhotoUrl,
            Status = status,
            Notes = notes
        };

        _context.AttendanceRecords.Add(record);
        await _context.SaveChangesAsync(default);

        return await MapToDtoAsync(record);
    }

    public async Task<AttendanceRecordDto> CheckOutAsync(Guid tenantId, Guid userId, CheckOutRequest request)
    {
        var today = DateTime.UtcNow.Date;
        
        var record = await _context.AttendanceRecords
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.UserId == userId && x.CheckInTime.Date == today);

        if (record == null)
        {
            throw new Exception("Bạn chưa check-in trong ngày hôm nay.");
        }

        if (record.CheckOutTime.HasValue)
        {
            throw new Exception("Bạn đã check-out trong ngày hôm nay rồi.");
        }

        record.CheckOutTime = DateTime.UtcNow;
        record.CheckOutIpAddress = request.IpAddress;
        record.CheckOutWifiMac = request.WifiMac;
        record.CheckOutLatitude = request.Latitude;
        record.CheckOutLongitude = request.Longitude;
        record.CheckOutPhotoUrl = request.PhotoUrl;

        // Tính tổng giờ làm
        if (record.CheckInTime != default)
        {
            var duration = record.CheckOutTime.Value - record.CheckInTime;
            var totalHours = Math.Round(duration.TotalHours, 2);
            
            var assignment = await _context.ShiftAssignments
                .Include(a => a.WorkShift)
                .FirstOrDefaultAsync(a => a.TenantId == tenantId && a.UserId == userId && a.Date.Date == today);

            if (assignment != null && assignment.WorkShift != null)
            {
                var localCheckOutTime = record.CheckOutTime.Value.AddHours(7);
                if (localCheckOutTime.TimeOfDay < assignment.WorkShift.EndTime && record.Status == AttendanceStatus.Present)
                {
                    record.Status = AttendanceStatus.LeaveEarly;
                }
            }
            else
            {
                if (totalHours < 8 && record.Status == AttendanceStatus.Present)
                {
                    record.Status = AttendanceStatus.LeaveEarly;
                }
            }
        }

        await _context.SaveChangesAsync(default);

        return await MapToDtoAsync(record);
    }

    public async Task<IEnumerable<AttendanceRecordDto>> GetAttendanceRecordsAsync(Guid tenantId, DateTime startDate, DateTime endDate)
    {
        var records = await _context.AttendanceRecords
            .Include(x => x.User)
            .Where(x => x.TenantId == tenantId && x.CheckInTime.Date >= startDate.Date && x.CheckInTime.Date <= endDate.Date)
            .OrderByDescending(x => x.CheckInTime)
            .ToListAsync();

        return records.Select(r => new AttendanceRecordDto
        {
            Id = r.Id,
            TenantId = r.TenantId,
            UserId = r.UserId,
            StaffName = r.User != null ? r.User.Fullname : "Unknown",
            Date = r.CheckInTime.Date,
            CheckInTime = r.CheckInTime,
            CheckOutTime = r.CheckOutTime,
            Status = r.Status,
            CheckInIpAddress = r.CheckInIpAddress,
            CheckInWifiMac = r.CheckInWifiMac,
            CheckInPhotoUrl = r.CheckInPhotoUrl,
            CheckInLatitude = r.CheckInLatitude,
            CheckInLongitude = r.CheckInLongitude,
            CheckOutIpAddress = r.CheckOutIpAddress,
            CheckOutWifiMac = r.CheckOutWifiMac,
            CheckOutPhotoUrl = r.CheckOutPhotoUrl,
            TotalHours = r.CheckOutTime.HasValue ? Math.Round((r.CheckOutTime.Value - r.CheckInTime).TotalHours, 2) : 0
        });
    }

    private async Task<AttendanceRecordDto> MapToDtoAsync(AttendanceRecord record)
    {
        // Load User to get name if not loaded
        if (record.User == null)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == record.UserId);
            record.User = user!;
        }

        return new AttendanceRecordDto
        {
            Id = record.Id,
            TenantId = record.TenantId,
            UserId = record.UserId,
            StaffName = record.User != null ? record.User.Fullname : "Unknown",
            Date = record.CheckInTime.Date,
            CheckInTime = record.CheckInTime,
            CheckOutTime = record.CheckOutTime,
            Status = record.Status,
            CheckInIpAddress = record.CheckInIpAddress,
            CheckInWifiMac = record.CheckInWifiMac,
            CheckInPhotoUrl = record.CheckInPhotoUrl,
            CheckInLatitude = record.CheckInLatitude,
            CheckInLongitude = record.CheckInLongitude,
            CheckOutIpAddress = record.CheckOutIpAddress,
            CheckOutWifiMac = record.CheckOutWifiMac,
            CheckOutPhotoUrl = record.CheckOutPhotoUrl,
            TotalHours = record.CheckOutTime.HasValue ? Math.Round((record.CheckOutTime.Value - record.CheckInTime).TotalHours, 2) : 0
        };
    }

    // Công thức Haversine tính khoảng cách đường chim bay (mét)
    private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        var dLat = (lat2 - lat1) * Math.PI / 180.0;
        var dLon = (lon2 - lon1) * Math.PI / 180.0;

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180.0) * Math.Cos(lat2 * Math.PI / 180.0) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        // Bán kính Trái đất = 6371 km
        var distanceKm = 6371 * c;
        return distanceKm * 1000; // Trả về mét
    }
}
