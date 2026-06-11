using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Domain.Entities;

namespace BizFlow.WebApi.Controllers;

public class OrdersController : ApiControllerBase
{
    private readonly IApplicationDbContext _context;

    public OrdersController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Order>>> GetOrders([FromQuery] Guid tenantId)
    {
        return await _context.Orders
            .Where(o => o.TenantId == tenantId)
            .Include(o => o.Customer)
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder(Order order)
    {
        _context.Orders.Add(order);
        await _context.SaveChangesAsync(CancellationToken.None);
        return Ok(order);
    }
}
