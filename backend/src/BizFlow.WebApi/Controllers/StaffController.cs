using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using BizFlow.Application.DTOs.Staff;
using BizFlow.Application.DTOs.Common;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Application.DTOs.Staff;

namespace BizFlow.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StaffController : ControllerBase
{
    private readonly IStaffService _staffService;

    public StaffController(IStaffService staffService)
    {
        _staffService = staffService;
    }

    // Helper method to get TenantId from request headers or claims.
    // In a real app, this should be handled by an authorization middleware/filter.
    private Guid GetTenantId()
    {
        if (Request.Headers.TryGetValue("X-Tenant-Id", out var tenantIdStr) && Guid.TryParse(tenantIdStr, out var tenantId))
        {
            return tenantId;
        }
        throw new UnauthorizedAccessException("Tenant ID is missing.");
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<StaffDto>>> GetStaffMembers(
        [FromHeader(Name = "X-Tenant-Id")] Guid? tenantId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        var id = tenantId ?? Guid.Parse("11111111-1111-1111-1111-111111111111");
        try {
            var staff = await _staffService.GetStaffMembersAsync(id, page, pageSize, search);
            return Ok(staff);
        } catch (Exception ex) {
            return Ok(new { error = ex.Message });
        }
    }

    [HttpGet("debug-all")]
    public async Task<ActionResult> GetAllUsers([FromServices] BizFlow.Application.Common.Interfaces.IApplicationDbContext dbContext)
    {
        var allUsers = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync(dbContext.Users);
        return Ok(allUsers);
    }

    [HttpPost]
    public async Task<ActionResult<StaffDto>> CreateStaff([FromBody] CreateStaffRequest request)
    {
        try
        {
            var tenantId = GetTenantId();
            var staff = await _staffService.CreateStaffAsync(tenantId, request);
            return CreatedAtAction(nameof(GetStaffMembers), new { id = staff.Id }, staff);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, inner = ex.InnerException?.Message });
        }
    }

    [HttpPut("{id}/toggle-status")]
    public async Task<IActionResult> ToggleStatus(Guid id)
    {
        var tenantId = GetTenantId();
        var result = await _staffService.ToggleStaffStatusAsync(tenantId, id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPut("{id}/reset-password")]
    public async Task<IActionResult> ResetPassword(Guid id, [FromBody] string newPassword)
    {
        var tenantId = GetTenantId();
        var result = await _staffService.ResetStaffPasswordAsync(tenantId, id, newPassword);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<StaffDto>> UpdateStaff(Guid id, [FromBody] UpdateStaffRequest request)
    {
        try
        {
            var tenantId = GetTenantId();
            var staff = await _staffService.UpdateStaffAsync(tenantId, id, request);
            return Ok(staff);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}/audit-logs")]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetAuditLogs(Guid id)
    {
        var tenantId = GetTenantId();
        var logs = await _staffService.GetStaffAuditLogsAsync(tenantId, id);
        return Ok(logs);
    }
}
