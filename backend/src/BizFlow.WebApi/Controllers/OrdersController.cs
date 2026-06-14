using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Domain.Entities;
using BizFlow.Domain.Enums;

namespace BizFlow.WebApi.Controllers;

public class OrdersController : ApiControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly IOrderService _orderService;

    public OrdersController(IApplicationDbContext context, IOrderService orderService)
    {
        _context = context;
        _orderService = orderService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Order>>> GetOrders([FromQuery] Guid tenantId, [FromQuery] string? dateStr, [FromQuery] string? sourceStr)
    {
        var query = _context.Orders
            .Where(o => o.TenantId == tenantId)
            .Include(o => o.Customer)
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.ProductUnit)
            .AsQueryable();

        // Optional date filter: yyyy-MM-dd
        if (!string.IsNullOrEmpty(dateStr) && DateTime.TryParse(dateStr, out var filterDate))
        {
            var startDate = filterDate.Date;
            var endDate = startDate.AddDays(1);
            query = query.Where(o => o.CreatedAt >= startDate && o.CreatedAt < endDate);
        }

        // Optional source filter: Manual, AI_Voice, AI_Text
        if (!string.IsNullOrEmpty(sourceStr) && Enum.TryParse<OrderSource>(sourceStr, out var filterSource))
        {
            query = query.Where(o => o.OrderSource == filterSource);
        }

        return await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder([FromBody] Order order)
    {
        try
        {
            var createdOrder = await _orderService.CreateOrderAsync(order, CancellationToken.None);
            return Ok(createdOrder);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Lỗi hệ thống khi tạo đơn hàng", Detail = ex.Message });
        }
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelOrder(Guid id, [FromQuery] Guid tenantId)
    {
        try
        {
            var cancelledOrder = await _orderService.CancelOrderAsync(id, tenantId, CancellationToken.None);
            return Ok(new { Message = "Hủy đơn hàng thành công", Order = cancelledOrder });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("drafts")]
    public async Task<ActionResult<IEnumerable<Order>>> GetDrafts([FromQuery] Guid tenantId)
    {
        return await _context.Orders
            .Where(o => o.TenantId == tenantId && o.Status == OrderStatus.Draft)
            .Include(o => o.Customer)
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.ProductUnit)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    [HttpPost("draft")]
    public async Task<ActionResult<Order>> CreateDraftOrder([FromBody] Order order)
    {
        order.Status = OrderStatus.Draft;
        order.CreatedAt = DateTime.UtcNow;

        _context.Orders.Add(order);
        await _context.SaveChangesAsync(CancellationToken.None);

        return Ok(order);
    }

    [HttpPost("{id}/confirm")]
    public async Task<IActionResult> ConfirmDraft(Guid id, [FromBody] Order updatedOrder)
    {
        try
        {
            var confirmedOrder = await _orderService.ConfirmDraftOrderAsync(id, updatedOrder, CancellationToken.None);
            return Ok(confirmedOrder);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Lỗi khi duyệt đơn hàng nháp", Detail = ex.Message });
        }
    }

    [HttpPost("{id}/reject")]
    public async Task<IActionResult> RejectDraft(Guid id, [FromQuery] Guid tenantId)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.Id == id && o.TenantId == tenantId);

        if (order == null)
        {
            return NotFound(new { Message = "Không tìm thấy đơn hàng nháp" });
        }

        order.Status = OrderStatus.Cancelled;
        await _context.SaveChangesAsync(CancellationToken.None);

        return Ok(new { Message = "Đã hủy đơn hàng nháp" });
    }
}

