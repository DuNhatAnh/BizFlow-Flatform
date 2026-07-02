using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Application.Interfaces;
using BizFlow.Domain.Entities;

namespace BizFlow.Infrastructure.Services;

public class ShiftService : IShiftService
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationService _notificationService;

    public ShiftService(IApplicationDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<List<WorkShift>> GetShiftsAsync(Guid tenantId)
    {
        return await _context.WorkShifts
            .Where(s => s.TenantId == tenantId)
            .OrderBy(s => s.StartTime)
            .ToListAsync();
    }

    public async Task<WorkShift> CreateShiftAsync(Guid tenantId, string name, TimeSpan startTime, TimeSpan endTime, int gracePeriodMinutes, int minimumStaffCount)
    {
        var shift = new WorkShift
        {
            TenantId = tenantId,
            Name = name,
            StartTime = startTime,
            EndTime = endTime,
            GracePeriodMinutes = gracePeriodMinutes,
            MinimumStaffCount = minimumStaffCount
        };

        _context.WorkShifts.Add(shift);
        await _context.SaveChangesAsync();
        return shift;
    }

    public async Task<WorkShift> UpdateShiftAsync(Guid tenantId, Guid shiftId, string name, TimeSpan startTime, TimeSpan endTime, int gracePeriodMinutes, int minimumStaffCount)
    {
        var shift = await _context.WorkShifts.FirstOrDefaultAsync(s => s.Id == shiftId && s.TenantId == tenantId);
        if (shift == null) throw new Exception("Ca làm việc không tồn tại.");

        shift.Name = name;
        shift.StartTime = startTime;
        shift.EndTime = endTime;
        shift.GracePeriodMinutes = gracePeriodMinutes;
        shift.MinimumStaffCount = minimumStaffCount;

        _context.WorkShifts.Update(shift);
        await _context.SaveChangesAsync();
        return shift;
    }

    public async Task DeleteShiftAsync(Guid tenantId, Guid shiftId)
    {
        var shift = await _context.WorkShifts.FirstOrDefaultAsync(s => s.Id == shiftId && s.TenantId == tenantId);
        if (shift == null) throw new Exception("Ca làm việc không tồn tại.");
        
        _context.WorkShifts.Remove(shift);
        await _context.SaveChangesAsync();
    }

    public async Task<List<ShiftAssignment>> GetAssignmentsAsync(Guid tenantId, DateTime startDate, DateTime endDate)
    {
        return await _context.ShiftAssignments
            .Include(a => a.User)
            .Include(a => a.WorkShift)
            .Where(a => a.TenantId == tenantId && a.Date >= startDate && a.Date <= endDate)
            .ToListAsync();
    }

    public async Task<ShiftAssignment> AssignShiftAsync(Guid tenantId, Guid userId, Guid workShiftId, DateTime date, string status)
    {
        var existing = await _context.ShiftAssignments
            .FirstOrDefaultAsync(a => a.TenantId == tenantId && a.UserId == userId && a.WorkShiftId == workShiftId && a.Date.Date == date.Date);

        if (existing != null)
        {
            existing.WorkShiftId = workShiftId;
            existing.Status = status;
            _context.ShiftAssignments.Update(existing);
            await _context.SaveChangesAsync();
            
            // Reload with relations
            return await _context.ShiftAssignments
                .Include(a => a.User)
                .Include(a => a.WorkShift)
                .FirstAsync(a => a.Id == existing.Id);
        }

        var assignment = new ShiftAssignment
        {
            TenantId = tenantId,
            UserId = userId,
            WorkShiftId = workShiftId,
            Date = date.Date,
            Status = status
        };

        _context.ShiftAssignments.Add(assignment);
        await _context.SaveChangesAsync();
        
        // Reload with relations
        return await _context.ShiftAssignments
            .Include(a => a.User)
            .Include(a => a.WorkShift)
            .FirstAsync(a => a.Id == assignment.Id);
    }

    public async Task DeleteAssignmentAsync(Guid tenantId, Guid assignmentId)
    {
        var assignment = await _context.ShiftAssignments.FirstOrDefaultAsync(a => a.Id == assignmentId && a.TenantId == tenantId);
        if (assignment == null) throw new Exception("Phân công không tồn tại.");
        
        _context.ShiftAssignments.Remove(assignment);
        await _context.SaveChangesAsync();
    }

    public async Task<ShiftAssignment?> GetAssignmentForUserOnDateAsync(Guid tenantId, Guid userId, DateTime date)
    {
        return await _context.ShiftAssignments
            .Include(a => a.WorkShift)
            .FirstOrDefaultAsync(a => a.TenantId == tenantId && a.UserId == userId && a.Date.Date == date.Date);
    }

    public async Task<int> PublishAssignmentsAsync(Guid tenantId, DateTime startDate, DateTime endDate)
    {
        var drafts = await _context.ShiftAssignments
            .Where(a => a.TenantId == tenantId && a.Status == "Draft" && a.Date.Date >= startDate.Date && a.Date.Date <= endDate.Date)
            .ToListAsync();

        if (!drafts.Any()) return 0;

        foreach (var assignment in drafts)
        {
            assignment.Status = "Published";
        }
        _context.ShiftAssignments.UpdateRange(drafts);
        await _context.SaveChangesAsync(default);

        // Notify affected users
        var userIds = drafts.Select(a => a.UserId).Distinct().ToList();
        foreach (var userId in userIds)
        {
            await _notificationService.CreateNotificationAsync(
                tenantId, 
                userId, 
                "Cập nhật lịch làm việc", 
                "Quản lý vừa chốt lịch ca làm việc cho bạn trong tuần này. Vui lòng kiểm tra lịch làm việc.", 
                "Shift"
            );
        }

        return drafts.Count;
    }

    public async Task<int> UnpublishAssignmentsAsync(Guid tenantId, DateTime startDate, DateTime endDate)
    {
        var published = await _context.ShiftAssignments
            .Where(a => a.TenantId == tenantId && a.Status == "Published" && a.Date.Date >= startDate.Date && a.Date.Date <= endDate.Date)
            .ToListAsync();

        if (!published.Any()) return 0;

        foreach (var assignment in published)
        {
            assignment.Status = "Draft";
        }
        _context.ShiftAssignments.UpdateRange(published);
        await _context.SaveChangesAsync(default);

        // Notify affected users
        var userIds = published.Select(a => a.UserId).Distinct().ToList();
        foreach (var userId in userIds)
        {
            await _notificationService.CreateNotificationAsync(
                tenantId, 
                userId, 
                "Hủy chốt lịch làm việc", 
                "Quản lý vừa thu hồi lịch ca làm việc đã chốt trong tuần này. Lịch hiện đang ở trạng thái nháp.", 
                "Shift_Revoked"
            );
        }

        return published.Count;
    }
}
