using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BizFlow.Application.DTOs.Store;
using BizFlow.Application.Interfaces;

namespace BizFlow.WebApi.Controllers;

[Authorize]
[Route("api/[controller]")]
public class StoresController : ApiControllerBase
{
    private readonly IStoreService _storeService;

    public StoresController(IStoreService storeService)
    {
        _storeService = storeService;
    }

    [HttpGet]
    public async Task<IActionResult> GetStores()
    {
        var tenantIdClaim = User.FindFirst("tenant_id")?.Value;
        if (!Guid.TryParse(tenantIdClaim, out var tenantId))
        {
            return Unauthorized();
        }

        var stores = await _storeService.GetStoresByTenantAsync(tenantId);
        return Ok(stores);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetStore(Guid id)
    {
        var tenantIdClaim = User.FindFirst("tenant_id")?.Value;
        if (!Guid.TryParse(tenantIdClaim, out var tenantId))
        {
            return Unauthorized();
        }

        var store = await _storeService.GetStoreByIdAsync(tenantId, id);
        if (store == null) return NotFound();

        return Ok(store);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStore(Guid id, [FromBody] UpdateStoreDto dto)
    {
        var tenantIdClaim = User.FindFirst("tenant_id")?.Value;
        if (!Guid.TryParse(tenantIdClaim, out var tenantId))
        {
            return Unauthorized();
        }

        try
        {
            var updatedStore = await _storeService.UpdateStoreAsync(tenantId, id, dto);
            return Ok(updatedStore);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateStore([FromBody] UpdateStoreDto dto)
    {
        var tenantIdClaim = User.FindFirst("tenant_id")?.Value;
        if (!Guid.TryParse(tenantIdClaim, out var tenantId))
        {
            return Unauthorized();
        }

        try
        {
            var createdStore = await _storeService.CreateStoreAsync(tenantId, dto);
            return Ok(createdStore);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
