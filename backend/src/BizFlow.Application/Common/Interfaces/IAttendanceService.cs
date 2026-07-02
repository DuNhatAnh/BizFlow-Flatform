using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BizFlow.Application.DTOs.Attendance;

namespace BizFlow.Application.Common.Interfaces;

public interface IAttendanceService
{
    Task<AttendanceRecordDto> CheckInAsync(Guid tenantId, Guid userId, CheckInRequest request);
    Task<AttendanceRecordDto> CheckOutAsync(Guid tenantId, Guid userId, CheckOutRequest request);
    Task<IEnumerable<AttendanceRecordDto>> GetAttendanceRecordsAsync(Guid tenantId, DateTime startDate, DateTime endDate);
}
