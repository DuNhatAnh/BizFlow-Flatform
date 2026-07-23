using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Application.DTOs.Dashboard;
using BizFlow.Domain.Enums;

namespace BizFlow.WebApi.Controllers;

public class DashboardController : ApiControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly IDashboardService _dashboardService;

    public DashboardController(IApplicationDbContext context, IDashboardService dashboardService)
    {
        _context = context;
        _dashboardService = dashboardService;
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<DashboardHomeDto>> GetDashboardHome(
        [FromQuery] DateTime fromDate, 
        [FromQuery] DateTime toDate,
        [FromQuery] int timezoneOffsetMinutes = 0,
        CancellationToken cancellationToken = default)
    {
        var result = await _dashboardService.GetDashboardHomeAsync(fromDate, toDate, timezoneOffsetMinutes, cancellationToken);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("widgets/{widgetId}/data")]
    public async Task<ActionResult<DashboardWidgetDto>> GetWidgetData(
        string widgetId,
        [FromQuery] DateTime fromDate, 
        [FromQuery] DateTime toDate,
        [FromQuery] int timezoneOffsetMinutes = 0,
        [FromQuery] int limit = 5,
        CancellationToken cancellationToken = default)
    {
        var result = await _dashboardService.GetWidgetDataAsync(widgetId, fromDate, toDate, timezoneOffsetMinutes, limit, cancellationToken);
        return Ok(result);
    }

    [HttpGet("shift-summary")]
    public async Task<IActionResult> GetShiftSummary([FromQuery] Guid tenantId, [FromQuery] Guid userId)
    {
        var today = DateTime.UtcNow.Date;

        // Completed orders created by the employee today
        var orders = await _context.Orders
            .Where(o => o.TenantId == tenantId && o.CreatedBy == userId && o.Status == OrderStatus.Completed && o.CreatedAt >= today)
            .ToListAsync();

        var totalOrdersCount = orders.Count;
        var totalSales = orders.Sum(o => o.TotalAmount);

        var cashSales = orders.Where(o => o.PaymentMethod == PaymentMethod.Cash).Sum(o => o.TotalAmount);
        var transferSales = orders.Where(o => o.PaymentMethod == PaymentMethod.Transfer).Sum(o => o.TotalAmount);
        var debtSales = orders.Where(o => o.PaymentMethod == PaymentMethod.Debt).Sum(o => o.TotalAmount);

        // Debt collection transactions processed by this tenant today
        // Wait, since DebtTransaction doesn't have a CreatedBy, we can query all DebtTransactions of Type Decrease for this Tenant today.
        var debtCollections = await _context.DebtTransactions
            .Where(dt => dt.TenantId == tenantId && dt.Type == DebtTransactionType.Decrease && dt.CreatedAt >= today)
            .SumAsync(dt => dt.Amount);

        return Ok(new ShiftSummaryResponse
        {
            EmployeeId = userId,
            ShiftStart = today, // Assuming shift started today
            TotalOrders = totalOrdersCount,
            TotalRevenue = totalSales,
            CashRevenue = cashSales,
            TransferRevenue = transferSales,
            DebtRevenue = debtSales,
            DebtCollected = debtCollections,
            NetCashInHand = cashSales + debtCollections // Cash sales + actual debt cash/transfer collected
        });
    }
}

public class ShiftSummaryResponse
{
    public Guid EmployeeId { get; set; }
    public DateTime ShiftStart { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal CashRevenue { get; set; }
    public decimal TransferRevenue { get; set; }
    public decimal DebtRevenue { get; set; }
    public decimal DebtCollected { get; set; }
    public decimal NetCashInHand { get; set; }
}
