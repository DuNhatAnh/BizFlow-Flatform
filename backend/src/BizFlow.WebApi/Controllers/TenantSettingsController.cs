using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Application.DTOs.TenantSettings;
using BizFlow.Domain.Constants;

namespace BizFlow.WebApi.Controllers;

[Authorize(Roles = "Owner")]
[ApiController]
[Route("api/[controller]")]
public class TenantSettingsController : ControllerBase
{
    private readonly ITenantSettingService _tenantSettingService;

    public TenantSettingsController(ITenantSettingService tenantSettingService)
    {
        _tenantSettingService = tenantSettingService;
    }

    [HttpGet]
    public async Task<ActionResult<Dictionary<string, string>>> GetAllSettings()
    {
        var settings = await _tenantSettingService.GetAllSettingsAsync();
        
        // Merge with defaults so UI gets a complete set
        var merged = new Dictionary<string, string>(TenantSettingKeys.Defaults);
        foreach (var kvp in settings)
        {
            merged[kvp.Key] = kvp.Value;
        }

        return Ok(merged);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateTenantSettingsDto request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }

        await _tenantSettingService.SetSettingsAsync(request.Settings, userId);
        
        return NoContent();
    }
}
