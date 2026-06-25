using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Application.Interfaces;
using BizFlow.Domain.Entities;
using BizFlow.Domain.Enums;

namespace BizFlow.WebApi.Controllers;

public class OrdersController : ApiControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly IOrderService _orderService;
    private readonly INotificationService _notificationService;

    public OrdersController(IApplicationDbContext context, IOrderService orderService, INotificationService notificationService)
    {
        _context = context;
        _orderService = orderService;
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Order>>> GetOrders([FromQuery] Guid tenantId, [FromQuery] string? dateStr, [FromQuery] string? sourceStr, [FromQuery] Guid? createdBy)
    {
        var query = _context.Orders
            .Where(o => o.TenantId == tenantId)
            .Include(o => o.Customer)
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.ProductUnit)
            .AsQueryable();

        if (createdBy.HasValue && createdBy.Value != Guid.Empty)
        {
            query = query.Where(o => o.CreatedBy == createdBy.Value);
        }

        // Optional date filter: yyyy-MM-dd
        if (!string.IsNullOrEmpty(dateStr) && DateTime.TryParse(dateStr, out var filterDate))
        {
            var startDate = DateTime.SpecifyKind(filterDate.Date, DateTimeKind.Utc);
            var endDate = DateTime.SpecifyKind(startDate.AddDays(1), DateTimeKind.Utc);
            query = query.Where(o => o.CreatedAt >= startDate && o.CreatedAt < endDate);
        }

        // Optional source filter: Manual, AI_Voice, AI_Text
        if (!string.IsNullOrEmpty(sourceStr) && Enum.TryParse<OrderSource>(sourceStr, out var filterSource))
        {
            query = query.Where(o => o.OrderSource == filterSource);
        }

        var orders = await query.OrderByDescending(o => o.CreatedAt).ToListAsync();

        // Populate TotalCostPrice from Ledger
        // Since we don't have OrderId in the Ledger, we match by ProductId and time proximity (within 5 seconds)
        foreach (var order in orders)
        {
            decimal orderCost = 0;
            foreach (var item in order.OrderItems)
            {
                // Find ledger export entry around the time of the order creation
                var ledgerEntries = await _context.AccountingLedgerS2s
                    .Where(l => l.TenantId == tenantId && l.ProductId == item.ProductId && l.Type == ReceiptType.Export)
                    .Where(l => l.ReceiptId == order.Id || (l.Date >= order.CreatedAt.AddMinutes(-2) && l.Date <= order.CreatedAt.AddMinutes(2)))
                    .ToListAsync();
                    
                var exactMatch = ledgerEntries.FirstOrDefault(l => l.ReceiptId == order.Id);
                var ledgerEntry = exactMatch ?? ledgerEntries.OrderBy(l => Math.Abs((l.Date - order.CreatedAt).TotalMilliseconds)).FirstOrDefault();

                if (ledgerEntry != null)
                {
                    // Approximate cost if exact quantity matches, otherwise use unit cost
                    if (ledgerEntry.QuantityOut == item.Quantity)
                    {
                        orderCost += ledgerEntry.ValueOut;
                    }
                    else if (ledgerEntry.QuantityOut > 0)
                    {
                        orderCost += (ledgerEntry.ValueOut / ledgerEntry.QuantityOut) * item.Quantity;
                    }
                }
            }
            order.TotalCostPrice = orderCost;
        }

        return Ok(orders);
    }

    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder([FromBody] Order order)
    {
        try
        {
            var createdOrder = await _orderService.CreateOrderAsync(order, CancellationToken.None);
            try
            {
                await _notificationService.SendToTenantAsync(createdOrder.TenantId, "STOCK_CHANGED");
            }
            catch
            {
                // Soft fail to avoid blocking order creation if SignalR Hub is not running
            }
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
            try
            {
                await _notificationService.SendToTenantAsync(tenantId, "STOCK_CHANGED");
            }
            catch
            {
                // Soft fail
            }
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

        try
        {
            await _notificationService.SendToTenantAsync(order.TenantId, "NEW_DRAFT_ORDER");
        }
        catch
        {
            // Soft fail to avoid blocking order creation if SignalR Hub is not running
        }

        return Ok(order);
    }

    [HttpPost("{id}/confirm")]
    public async Task<IActionResult> ConfirmDraft(Guid id, [FromBody] Order updatedOrder)
    {
        try
        {
            var confirmedOrder = await _orderService.ConfirmDraftOrderAsync(id, updatedOrder, CancellationToken.None);
            try
            {
                await _notificationService.SendToTenantAsync(confirmedOrder.TenantId, "STOCK_CHANGED");
            }
            catch
            {
                // Soft fail
            }
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

    [HttpPost("{id}/return")]
    public async Task<IActionResult> ReturnOrder(Guid id, [FromQuery] Guid tenantId, [FromBody] ReturnOrderRequest request)
    {
        try
        {
            var returnedOrder = await _orderService.ReturnOrderAsync(id, tenantId, request.Items, request.PerformedBy, CancellationToken.None);
            try
            {
                await _notificationService.SendToTenantAsync(tenantId, "STOCK_CHANGED");
            }
            catch
            {
                // Soft fail
            }
            return Ok(new { Message = "Đổi trả hàng thành công", Order = returnedOrder });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Lỗi hệ thống khi thực hiện đổi trả hàng", Detail = ex.Message });
        }
    }

    [HttpPost("{id}/report-ai-error")]
    public async Task<IActionResult> ReportAIError(Guid id, [FromQuery] Guid tenantId, [FromBody] AIErrorRequest request)
    {
        try
        {
            var userId = request.PerformedBy;
            if (userId == Guid.Empty)
            {
                var tenantUser = await _context.Users.FirstOrDefaultAsync(u => u.TenantId == tenantId);
                userId = tenantUser?.Id ?? Guid.Parse("aaaabbbb-cccc-dddd-eeee-777788889999");
            }

            var auditLog = new AuditLog
            {
                TenantId = tenantId,
                UserId = userId,
                Action = "AI_TRANSLATION_ERROR",
                EntityName = "Order",
                EntityId = id.ToString(),
                Details = $"Báo lỗi AI dịch sai.\n" +
                          $"- Câu lệnh thô gốc: \"{request.RawTranscript}\"\n" +
                          $"- Phân loại lỗi: {request.ErrorType}\n" +
                          $"- Chi tiết lỗi/Ghi chú: {request.FeedbackMessage}\n" +
                          $"- Giỏ hàng sau khi nhân viên đã sửa đổi: {request.CorrectedCartSummary}",
                Timestamp = DateTime.UtcNow
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync(CancellationToken.None);

            return Ok(new { Message = "Đã ghi nhận phản hồi lỗi AI thành công" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Lỗi hệ thống khi gửi báo cáo lỗi AI", Detail = ex.Message });
        }
    }
}

public class ReturnOrderRequest
{
    public List<ReturnOrderItemDto> Items { get; set; } = new();
    public Guid PerformedBy { get; set; }
}

public class AIErrorRequest
{
    public Guid PerformedBy { get; set; }
    public string RawTranscript { get; set; } = string.Empty;
    public string ErrorType { get; set; } = string.Empty;
    public string FeedbackMessage { get; set; } = string.Empty;
    public string CorrectedCartSummary { get; set; } = string.Empty;
}

