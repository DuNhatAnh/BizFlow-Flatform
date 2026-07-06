using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BizFlow.Application.Interfaces;
using BizFlow.Application.Common.Interfaces;
using BizFlow.WebApi.Extensions;
using System.Linq;

namespace BizFlow.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ShiftsController : ControllerBase
{
    private readonly IShiftService _shiftService;
    private readonly ICurrentTenantService _currentTenantService;

    public ShiftsController(IShiftService shiftService, ICurrentTenantService currentTenantService)
    {
        _shiftService = shiftService;
        _currentTenantService = currentTenantService;
    }

    private Guid GetTenantId()
    {
        var tenantId = _currentTenantService.TenantId;
        if (!tenantId.HasValue || tenantId == Guid.Empty)
        {
            throw new UnauthorizedAccessException("Tenant ID not found");
        }
        return tenantId.Value;
    }

    [HttpGet]
    public async Task<IActionResult> GetShifts()
    {
        var tenantId = GetTenantId();
        var shifts = await _shiftService.GetShiftsAsync(tenantId);
        return Ok(shifts);
    }

    public class CreateShiftRequest
    {
        public string Name { get; set; } = string.Empty;
        public string StartTime { get; set; } = string.Empty; // "HH:mm"
        public string EndTime { get; set; } = string.Empty; // "HH:mm"
        public int GracePeriodMinutes { get; set; }
        public int MinimumStaffCount { get; set; } = 1;
    }

    [HttpPost]
    public async Task<IActionResult> CreateShift([FromBody] CreateShiftRequest req)
    {
        try
        {
            var tenantId = GetTenantId();
            var start = TimeSpan.Parse(req.StartTime);
            var end = TimeSpan.Parse(req.EndTime);
            var shift = await _shiftService.CreateShiftAsync(tenantId, req.Name, start, end, req.GracePeriodMinutes, req.MinimumStaffCount);
            return Ok(shift);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.ToString());
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateShift(Guid id, [FromBody] CreateShiftRequest req)
    {
        try
        {
            var tenantId = GetTenantId();
            var start = TimeSpan.Parse(req.StartTime);
            var end = TimeSpan.Parse(req.EndTime);
            var shift = await _shiftService.UpdateShiftAsync(tenantId, id, req.Name, start, end, req.GracePeriodMinutes, req.MinimumStaffCount);
            return Ok(shift);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.ToString());
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteShift(Guid id)
    {
        var tenantId = GetTenantId();
        await _shiftService.DeleteShiftAsync(tenantId, id);
        return Ok(new { success = true });
    }

    [HttpGet("assignments")]
    public async Task<IActionResult> GetAssignments([FromQuery] string startDate, [FromQuery] string endDate)
    {
        var tenantId = GetTenantId();
        var start = DateTime.Parse(startDate).ToUniversalTime();
        var end = DateTime.Parse(endDate).ToUniversalTime();
        var assignments = await _shiftService.GetAssignmentsAsync(tenantId, start, end);
        
        var result = assignments.Select(a => new {
            a.Id,
            a.UserId,
            UserName = a.User?.Fullname,
            a.WorkShiftId,
            ShiftName = a.WorkShift?.Name,
            a.Date,
            a.Status
        });
        
        return Ok(result);
    }

    public class AssignShiftRequest
    {
        public Guid UserId { get; set; }
        public Guid WorkShiftId { get; set; }
        public string Date { get; set; } = string.Empty; // "yyyy-MM-dd"
        public string Status { get; set; } = "Draft";
    }

    [HttpPost("assignments")]
    public async Task<IActionResult> AssignShift([FromBody] AssignShiftRequest req)
    {
        var tenantId = GetTenantId();
        var date = DateTime.Parse(req.Date).ToUniversalTime();
        var assignment = await _shiftService.AssignShiftAsync(tenantId, req.UserId, req.WorkShiftId, date, req.Status);
        return Ok(new {
            assignment.Id,
            assignment.UserId,
            UserName = assignment.User?.Fullname,
            assignment.WorkShiftId,
            ShiftName = assignment.WorkShift?.Name,
            assignment.Date,
            assignment.Status
        });
    }

    [HttpDelete("assignments/{id}")]
    public async Task<IActionResult> DeleteAssignment(Guid id)
    {
        try
        {
            var tenantId = GetTenantId();
            await _shiftService.DeleteAssignmentAsync(tenantId, id);
            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.ToString());
        }
    }
    
    [HttpGet("my-shift-today")]
    public async Task<IActionResult> GetMyShiftToday()
    {
        var tenantId = GetTenantId();
        var userId = User.GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var today = DateTime.UtcNow.Date;
        var assignment = await _shiftService.GetAssignmentForUserOnDateAsync(tenantId, userId, today);
        if (assignment == null) return Ok(null);
        
        return Ok(new {
            assignment.Id,
            assignment.WorkShiftId,
            assignment.WorkShift?.Name,
            StartTime = assignment.WorkShift?.StartTime.ToString(@"hh\:mm"),
            EndTime = assignment.WorkShift?.EndTime.ToString(@"hh\:mm"),
            assignment.WorkShift?.GracePeriodMinutes
        });
    }

    public class PublishAssignmentsRequest
    {
        public string StartDate { get; set; } = string.Empty;
        public string EndDate { get; set; } = string.Empty;
    }

    [HttpPost("assignments/publish")]
    public async Task<IActionResult> PublishAssignments([FromBody] PublishAssignmentsRequest req)
    {
        try
        {
            var tenantId = GetTenantId();
            var startDate = DateTime.Parse(req.StartDate).ToUniversalTime();
            var endDate = DateTime.Parse(req.EndDate).ToUniversalTime();
            
            var publishedCount = await _shiftService.PublishAssignmentsAsync(tenantId, startDate, endDate);
            return Ok(new { success = true, publishedCount });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.ToString());
        }
    }

    [HttpPost("assignments/unpublish")]
    public async Task<IActionResult> UnpublishAssignments([FromBody] PublishAssignmentsRequest req)
    {
        try
        {
            var tenantId = GetTenantId();
            var startDate = DateTime.Parse(req.StartDate).ToUniversalTime();
            var endDate = DateTime.Parse(req.EndDate).ToUniversalTime();
            
            var unpublishedCount = await _shiftService.UnpublishAssignmentsAsync(tenantId, startDate, endDate);
            return Ok(new { success = true, unpublishedCount });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.ToString());
        }
    }
}
