using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BizFlow.Application.DTOs.Staff;
using BizFlow.Application.DTOs.Common;
using BizFlow.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace BizFlow.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class StaffController : ControllerBase
{
    private readonly IStaffService _staffService;
    private readonly ICurrentTenantService _currentTenantService;

    public StaffController(IStaffService staffService, ICurrentTenantService currentTenantService)
    {
        _staffService = staffService;
        _currentTenantService = currentTenantService;
    }

    private Guid GetTenantId()
    {
        var tenantId = _currentTenantService.TenantId;
        if (!tenantId.HasValue || tenantId == Guid.Empty)
        {
            throw new UnauthorizedAccessException("Tenant ID is missing.");
        }
        return tenantId.Value;
    }

    [HttpGet("basic")]
    [Authorize(Policy = BizFlow.Domain.Constants.Permissions.StaffRead)]
    public async Task<ActionResult<PagedResult<PublicStaffDto>>> GetStaffBasic(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        var id = GetTenantId();
        var staff = await _staffService.GetStaffBasicAsync(id, page, pageSize, search);
        return Ok(staff);
    }

    [HttpGet]
    [Authorize(Policy = BizFlow.Domain.Constants.Permissions.StaffRead)]
    public async Task<ActionResult<PagedResult<StaffDetailDto>>> GetStaffDetail(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        var id = GetTenantId();
        var staff = await _staffService.GetStaffDetailAsync(id, page, pageSize, search);
        return Ok(staff);
    }

    [HttpGet("payroll")]
    [Authorize(Policy = BizFlow.Domain.Constants.Permissions.PayrollRead)]
    public async Task<ActionResult<PagedResult<StaffPayrollDto>>> GetStaffPayroll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        var id = GetTenantId();
        var staff = await _staffService.GetStaffPayrollAsync(id, page, pageSize, search);
        return Ok(staff);
    }

    [HttpGet("debug-all")]
    [Authorize(Policy = BizFlow.Domain.Constants.Permissions.StaffRead)]
    public async Task<ActionResult> GetAllUsers([FromServices] BizFlow.Application.Common.Interfaces.IApplicationDbContext dbContext)
    {
        var allUsers = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync(dbContext.Users);
        return Ok(allUsers);
    }

    [HttpPost]
    [Authorize(Policy = BizFlow.Domain.Constants.Permissions.StaffManage)]
    public async Task<ActionResult<StaffPayrollDto>> CreateStaff([FromBody] CreateStaffRequest request)
    {
        try
        {
            var tenantId = GetTenantId();
            var staff = await _staffService.CreateStaffAsync(tenantId, request);
            return CreatedAtAction(nameof(GetStaffDetail), new { }, staff);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, inner = ex.InnerException?.Message });
        }
    }

    [HttpPut("{id}/toggle-status")]
    [Authorize(Policy = BizFlow.Domain.Constants.Permissions.StaffManage)]
    public async Task<IActionResult> ToggleStatus(Guid id)
    {
        var tenantId = GetTenantId();
        var result = await _staffService.ToggleStaffStatusAsync(tenantId, id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPut("{id}/reset-password")]
    [Authorize(Policy = BizFlow.Domain.Constants.Permissions.StaffManage)]
    public async Task<IActionResult> ResetPassword(Guid id, [FromBody] string newPassword)
    {
        var tenantId = GetTenantId();
        var result = await _staffService.ResetStaffPasswordAsync(tenantId, id, newPassword);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPut("{id}")]
    [Authorize(Policy = BizFlow.Domain.Constants.Permissions.StaffManage)]
    public async Task<ActionResult<StaffPayrollDto>> UpdateStaff(Guid id, [FromBody] UpdateStaffRequest request)
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
    [Authorize(Policy = BizFlow.Domain.Constants.Permissions.StaffManage)]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetAuditLogs(Guid id)
    {
        var tenantId = GetTenantId();
        var logs = await _staffService.GetStaffAuditLogsAsync(tenantId, id);
        return Ok(logs);
    }
}
