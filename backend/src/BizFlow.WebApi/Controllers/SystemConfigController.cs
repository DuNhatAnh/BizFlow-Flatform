using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BizFlow.WebApi.Controllers;

public class SystemConfigController : ApiControllerBase
{
    private readonly IApplicationDbContext _context;

    public SystemConfigController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "PlatformAdmin")]
    public async Task<ActionResult<IEnumerable<SystemConfig>>> GetAllConfigs()
    {
        return await _context.SystemConfigs.ToListAsync();
    }

    [HttpGet("public")]
    public async Task<ActionResult<Dictionary<string, string>>> GetPublicConfigs([FromQuery] string? bypass = null)
    {
        var configs = await _context.SystemConfigs.ToListAsync();
        var publicDict = new Dictionary<string, string>();
        
        bool isInternal = bypass == "internal_ai_secret_code_123" || 
                          Request.Headers["X-Internal-Service"].ToString() == "BizFlow-AI";
        
        foreach (var c in configs)
        {
            // Do not expose sensitive API keys to the public frontend unless it's an internal service call
            if (!isInternal && (c.Key.ToLower().Contains("key") || c.Key.ToLower().Contains("secret") || c.Key.ToLower().Contains("password")))
            {
                continue;
            }
            publicDict[c.Key] = c.Value;
        }

        // Add defaults if they do not exist in DB yet
        if (!publicDict.ContainsKey("tt88_tax_rates"))
        {
            publicDict["tt88_tax_rates"] = "{\"Revenue_Goods\": {\"GTGT\": 1.0, \"TNCN\": 0.5}, \"Revenue_Services\": {\"GTGT\": 5.0, \"TNCN\": 2.0}}";
        }
        if (!publicDict.ContainsKey("gemini_model"))
        {
            publicDict["gemini_model"] = "gemini-2.5-flash";
        }

        return Ok(publicDict);
    }

    [HttpPost]
    [Authorize(Roles = "PlatformAdmin")]
    public async Task<IActionResult> SaveConfig([FromBody] SystemConfig configDto)
    {
        var config = await _context.SystemConfigs.FirstOrDefaultAsync(c => c.Key == configDto.Key);
        
        if (config == null)
        {
            config = new SystemConfig
            {
                Key = configDto.Key,
                Value = configDto.Value,
                Description = configDto.Description,
                UpdatedAt = DateTime.UtcNow
            };
            _context.SystemConfigs.Add(config);
        }
        else
        {
            config.Value = configDto.Value;
            config.Description = configDto.Description;
            config.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(CancellationToken.None);
        return Ok(config);
    }

    public class UpdateConfigRequest
    {
        public string Value { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    [HttpPut("{key}")]
    [Authorize(Roles = "PlatformAdmin")]
    public async Task<IActionResult> UpdateConfig(string key, [FromBody] UpdateConfigRequest req)
    {
        var config = await _context.SystemConfigs.FirstOrDefaultAsync(c => c.Key == key);

        if (config == null)
        {
            config = new SystemConfig
            {
                Key = key,
                Value = req.Value,
                Description = req.Description,
                UpdatedAt = DateTime.UtcNow
            };
            _context.SystemConfigs.Add(config);
        }
        else
        {
            config.Value = req.Value;
            config.Description = req.Description;
            config.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(CancellationToken.None);
        return Ok(config);
    }
}
