using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using BizFlow.Application.Common.Interfaces;

namespace BizFlow.Infrastructure.Services;

public class CurrentTenantService : ICurrentTenantService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private Guid? _tenantId;

    public CurrentTenantService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? TenantId
    {
        get
        {
            if (_tenantId.HasValue) return _tenantId.Value;

            var tenantClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("tenant_id")?.Value;
            if (Guid.TryParse(tenantClaim, out var parsedTenantId))
            {
                return parsedTenantId;
            }

            return null;
        }
    }

    public void SetTenant(Guid tenantId)
    {
        _tenantId = tenantId;
    }
}
