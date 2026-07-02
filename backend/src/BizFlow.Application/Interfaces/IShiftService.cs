using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BizFlow.Domain.Entities;

namespace BizFlow.Application.Interfaces;

public interface IShiftService
{
    Task<List<WorkShift>> GetShiftsAsync(Guid tenantId);
    Task<WorkShift> CreateShiftAsync(Guid tenantId, string name, TimeSpan startTime, TimeSpan endTime, int gracePeriodMinutes, int minimumStaffCount);
    Task<WorkShift> UpdateShiftAsync(Guid tenantId, Guid shiftId, string name, TimeSpan startTime, TimeSpan endTime, int gracePeriodMinutes, int minimumStaffCount);
    Task DeleteShiftAsync(Guid tenantId, Guid shiftId);
    
    Task<List<ShiftAssignment>> GetAssignmentsAsync(Guid tenantId, DateTime startDate, DateTime endDate);
    Task<ShiftAssignment> AssignShiftAsync(Guid tenantId, Guid userId, Guid workShiftId, DateTime date, string status);
    Task DeleteAssignmentAsync(Guid tenantId, Guid assignmentId);
    Task<ShiftAssignment?> GetAssignmentForUserOnDateAsync(Guid tenantId, Guid userId, DateTime date);
    Task<int> PublishAssignmentsAsync(Guid tenantId, DateTime startDate, DateTime endDate);
    Task<int> UnpublishAssignmentsAsync(Guid tenantId, DateTime startDate, DateTime endDate);
}
