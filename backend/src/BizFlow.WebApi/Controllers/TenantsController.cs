using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Domain.Entities;

namespace BizFlow.WebApi.Controllers;

public class TenantsController : ApiControllerBase
{
    private readonly IApplicationDbContext _context;

    public TenantsController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Tenant>>> GetTenants()
    {
        return await _context.Tenants
            .Include(t => t.SubscriptionPlan)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Tenant>> CreateTenant(Tenant tenant)
    {
        _context.Tenants.Add(tenant);
        await _context.SaveChangesAsync(CancellationToken.None);
        return Ok(tenant);
    }
}
