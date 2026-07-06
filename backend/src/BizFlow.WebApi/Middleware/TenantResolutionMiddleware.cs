using BizFlow.Application.Common.Interfaces;
using BizFlow.Domain.Constants;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace BizFlow.WebApi.Middleware;

public class TenantResolutionMiddleware
{
    private readonly RequestDelegate _next;

    public TenantResolutionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ICurrentTenantService currentTenantService, IApplicationDbContext dbContext)
    {
        var user = context.User;

        if (user.Identity?.IsAuthenticated == true)
        {
            var isPlatformAdmin = user.IsInRole("PlatformAdmin");

            if (isPlatformAdmin && context.Request.Headers.TryGetValue("X-Tenant-Id", out var headerVal))
            {
                var headerValStr = headerVal.FirstOrDefault();
                if (Guid.TryParse(headerValStr, out var tenantOverrideId))
                {
                    // Validate override tenant exists, is active, and is approved
                    var tenantExists = await dbContext.Tenants.AnyAsync(t => t.Id == tenantOverrideId && t.IsActive && t.IsApproved);
                    if (!tenantExists)
                    {
                        context.Response.StatusCode = StatusCodes.Status400BadRequest;
                        await context.Response.WriteAsJsonAsync(new { error = "Requested override Tenant is invalid, inactive, or not approved." });
                        return;
                    }
                    currentTenantService.SetTenant(tenantOverrideId);
                }
                else
                {
                    context.Response.StatusCode = StatusCodes.Status400BadRequest;
                    await context.Response.WriteAsJsonAsync(new { error = "Invalid X-Tenant-Id format." });
                    return;
                }
            }
            else
            {
                var tenantClaim = user.FindFirst(ClaimConstants.TenantId)?.Value;
                if (Guid.TryParse(tenantClaim, out var tenantId))
                {
                    currentTenantService.SetTenant(tenantId);
                }
                else
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsJsonAsync(new { error = "Invalid or missing tenant context." });
                    return;
                }
            }
        }

        await _next(context);
    }
}
