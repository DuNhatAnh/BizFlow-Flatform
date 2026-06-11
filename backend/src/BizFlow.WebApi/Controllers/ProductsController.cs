using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Domain.Entities;

namespace BizFlow.WebApi.Controllers;

public class ProductsController : ApiControllerBase
{
    private readonly IApplicationDbContext _context;

    public ProductsController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts([FromQuery] Guid tenantId)
    {
        return await _context.Products
            .Where(p => p.TenantId == tenantId)
            .Include(p => p.Category)
            .Include(p => p.ProductUnits)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync(CancellationToken.None);
        return Ok(product);
    }
}
