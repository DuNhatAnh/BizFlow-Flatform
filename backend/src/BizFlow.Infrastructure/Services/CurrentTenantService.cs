using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using BizFlow.Application.Common.Interfaces;

namespace BizFlow.Infrastructure.Services;

public class CurrentTenantService : ICurrentTenantService
{
    private Guid? _tenantId;

    public Guid? TenantId => _tenantId;

    public void SetTenant(Guid tenantId)
    {
        _tenantId = tenantId;
    }
}
