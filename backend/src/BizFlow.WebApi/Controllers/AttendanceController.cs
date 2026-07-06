using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Application.DTOs.Attendance;
using BizFlow.WebApi.Extensions;

namespace BizFlow.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _attendanceService;
    private readonly ICurrentTenantService _currentTenantService;

    public AttendanceController(IAttendanceService attendanceService, ICurrentTenantService currentTenantService)
    {
        _attendanceService = attendanceService;
        _currentTenantService = currentTenantService;
    }

    private Guid GetTenantId()
    {
        var tenantId = _currentTenantService.TenantId;
        if (!tenantId.HasValue || tenantId == Guid.Empty)
        {
            throw new UnauthorizedAccessException("TenantId is missing or invalid.");
        }
        return tenantId.Value;
    }

    private Guid GetUserId()
    {
        var userId = User.GetUserId();
        if (userId == Guid.Empty)
        {
            throw new UnauthorizedAccessException("UserId is missing or invalid.");
        }
        return userId;
    }

    [HttpPost("check-in")]
    public async Task<ActionResult<AttendanceRecordDto>> CheckIn([FromBody] CheckInRequest request)
    {
        try
        {
            var tenantId = GetTenantId();
            var userId = GetUserId();
            var result = await _attendanceService.CheckInAsync(tenantId, userId, request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("check-out")]
    public async Task<ActionResult<AttendanceRecordDto>> CheckOut([FromBody] CheckOutRequest request)
    {
        try
        {
            var tenantId = GetTenantId();
            var userId = GetUserId();
            var result = await _attendanceService.CheckOutAsync(tenantId, userId, request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AttendanceRecordDto>>> GetAttendanceRecords([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        try
        {
            var tenantId = GetTenantId();
            var start = startDate ?? DateTime.UtcNow.Date.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow.Date;

            var results = await _attendanceService.GetAttendanceRecordsAsync(tenantId, start, end);
            return Ok(results);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
