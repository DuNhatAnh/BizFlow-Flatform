using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Application.DTOs.Dashboard;
using BizFlow.Domain.Constants;
using BizFlow.Domain.Enums;

namespace BizFlow.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly ITenantSettingService _tenantSettingService;
    private readonly ICurrentUserService _currentUserService;

    public DashboardService(IApplicationDbContext context, ICurrentTenantService currentTenantService, ITenantSettingService tenantSettingService, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentTenantService = currentTenantService;
        _tenantSettingService = tenantSettingService;
        _currentUserService = currentUserService;
    }

    public async Task<DashboardHomeDto> GetDashboardHomeAsync(DateTime fromDate, DateTime toDate, int timezoneOffsetMinutes = 0, CancellationToken cancellationToken = default)
    {
        var tenantId = _currentTenantService.TenantId;
        if (!tenantId.HasValue) throw new UnauthorizedAccessException();

        var isOwner = _currentUserService.IsInRole("Owner");
        var userPermissions = _currentUserService.Permissions.ToList();

        bool HasPerm(string perm) => isOwner || userPermissions.Contains(perm);

        var fromUtc = DateTime.SpecifyKind(fromDate, DateTimeKind.Unspecified).AddMinutes(timezoneOffsetMinutes);
        fromUtc = DateTime.SpecifyKind(fromUtc, DateTimeKind.Utc);
        
        var toUtc = DateTime.SpecifyKind(toDate, DateTimeKind.Unspecified).AddMinutes(timezoneOffsetMinutes);
        toUtc = DateTime.SpecifyKind(toUtc, DateTimeKind.Utc);

        var home = new DashboardHomeDto();

        // 1. Get Revenue & Orders KPI
        if (HasPerm(Permissions.DashboardViewRevenue) || HasPerm(Permissions.DashboardViewOrders))
        {
            var (revWidget, ordersWidget) = await GetRevenueAndOrdersKpiAsync(tenantId.Value, fromUtc, toUtc, cancellationToken);
            if (HasPerm(Permissions.DashboardViewRevenue)) home.Widgets.Add(revWidget);
            if (HasPerm(Permissions.DashboardViewOrders)) home.Widgets.Add(ordersWidget);
        }

        // 2. Get Profit KPI
        if (HasPerm(Permissions.DashboardViewProfit))
        {
            var profitKpi = await GetProfitKpiAsync(tenantId.Value, fromUtc, toUtc, cancellationToken);
            home.Widgets.Add(profitKpi);
        }

        // 3. Get Cash In Hand KPI
        if (HasPerm(Permissions.DashboardViewCash))
        {
            var cashKpi = await GetCashKpiAsync(tenantId.Value, fromUtc, toUtc, cancellationToken);
            home.Widgets.Add(cashKpi);
        }
        
        // 4. Get Inventory Value KPI
        if (HasPerm(Permissions.DashboardViewInventory))
        {
            var inventoryKpi = await GetInventoryValueKpiAsync(tenantId.Value, fromUtc, toUtc, cancellationToken);
            home.Widgets.Add(inventoryKpi);
            
            var inventoryQuantityKpi = await GetInventoryQuantityKpiAsync(tenantId.Value, fromUtc, toUtc, cancellationToken);
            home.Widgets.Add(inventoryQuantityKpi);
            
            var alertWidget = await GetLowStockAlertAsync(tenantId.Value, cancellationToken);
            if (alertWidget != null)
            {
                home.Widgets.Add(alertWidget);
            }
        }
        
        // 5. Revenue & Profit Trend Chart
        if (HasPerm(Permissions.DashboardViewRevenue) || HasPerm(Permissions.DashboardViewProfit))
        {
            var trendChart = await GetRevenueTrendChartAsync(tenantId.Value, fromUtc, toUtc, timezoneOffsetMinutes, cancellationToken);
            home.Widgets.Add(trendChart);
        }
        
        // 6. Cash Flow Trend Chart
        if (HasPerm(Permissions.DashboardViewCash))
        {
            var cashFlowChart = await GetCashFlowChartAsync(tenantId.Value, fromUtc, toUtc, timezoneOffsetMinutes, cancellationToken);
            home.Widgets.Add(cashFlowChart);
        }
        
        // 7. Top Selling Products
        if (HasPerm(Permissions.DashboardViewProducts))
        {
            var topProducts = await GetTopProductsListAsync(tenantId.Value, fromUtc, toUtc, 5, cancellationToken);
            home.Widgets.Add(topProducts);
        }
        
        // 8. Top Debt Customers
        if (HasPerm(Permissions.DashboardViewCustomers))
        {
            var topDebt = await GetTopDebtCustomersListAsync(tenantId.Value, 5, cancellationToken);
            home.Widgets.Add(topDebt);
        }
        
        return home;
    }

    public async Task<DashboardWidgetDto> GetWidgetDataAsync(string widgetId, DateTime fromDate, DateTime toDate, int timezoneOffsetMinutes = 0, int limit = 5, CancellationToken cancellationToken = default)
    {
        var tenantId = _currentTenantService.TenantId;
        if (!tenantId.HasValue) throw new UnauthorizedAccessException();

        var fromUtc = DateTime.SpecifyKind(fromDate, DateTimeKind.Unspecified).AddMinutes(timezoneOffsetMinutes);
        fromUtc = DateTime.SpecifyKind(fromUtc, DateTimeKind.Utc);
        
        var toUtc = DateTime.SpecifyKind(toDate, DateTimeKind.Unspecified).AddMinutes(timezoneOffsetMinutes);
        toUtc = DateTime.SpecifyKind(toUtc, DateTimeKind.Utc);

        var widget = widgetId switch
        {
            DashboardWidgetIds.KpiInventoryValue => await GetInventoryValueKpiAsync(tenantId.Value, fromUtc, toUtc, cancellationToken),
            DashboardWidgetIds.KpiInventoryQuantity => await GetInventoryQuantityKpiAsync(tenantId.Value, fromUtc, toUtc, cancellationToken),
            DashboardWidgetIds.ChartRevenueTrend => await GetRevenueTrendChartAsync(tenantId.Value, fromUtc, toUtc, timezoneOffsetMinutes, cancellationToken),
            DashboardWidgetIds.ChartCashFlowTrend => await GetCashFlowChartAsync(tenantId.Value, fromUtc, toUtc, timezoneOffsetMinutes, cancellationToken),
            DashboardWidgetIds.ListTopProducts => await GetTopProductsListAsync(tenantId.Value, fromUtc, toUtc, limit, cancellationToken),
            DashboardWidgetIds.ListTopDebtCustomers => await GetTopDebtCustomersListAsync(tenantId.Value, limit, cancellationToken),
            _ => throw new ArgumentException("Widget không hợp lệ hoặc không hỗ trợ load độc lập")
        };

        var isOwner = _currentUserService.IsInRole("Owner");
        var userPermissions = _currentUserService.Permissions.ToList();

        if (widget.RequiredPermissions.Length > 0 && !isOwner && !widget.RequiredPermissions.Any(p => userPermissions.Contains(p)))
        {
            throw new UnauthorizedAccessException("Bạn không có quyền xem widget này.");
        }

        return widget;
    }

    private async Task<(DashboardWidgetDto revenue, DashboardWidgetDto orders)> GetRevenueAndOrdersKpiAsync(Guid tenantId, DateTime from, DateTime to, CancellationToken ct)
    {
        // Calculate current period
        var currentData = await _context.Orders
            .Where(o => o.TenantId == tenantId && o.Status == OrderStatus.Completed && o.CreatedAt >= from && o.CreatedAt <= to)
            .GroupBy(x => 1)
            .Select(g => new { Revenue = g.Sum(x => x.TotalAmount), Count = g.Count() })
            .FirstOrDefaultAsync(ct);

        var revWidget = new DashboardWidgetDto
        {
            WidgetId = DashboardWidgetIds.KpiRevenue,
            Type = "Kpi",
            Title = "Doanh thu",
            Order = 10,
            ColSpan = 3,
            KpiData = new DashboardKpiDataDto
            {
                Value = currentData?.Revenue ?? 0,
                PreviousValue = 0,
                TrendPercentage = 0,
                Format = "currency"
            },
            RequiredPermissions = new[] { Permissions.DashboardViewRevenue }
        };

        var ordersWidget = new DashboardWidgetDto
        {
            WidgetId = DashboardWidgetIds.KpiOrders,
            Type = "Kpi",
            Title = "Số đơn hàng",
            Order = 30,
            ColSpan = 3,
            KpiData = new DashboardKpiDataDto
            {
                Value = currentData?.Count ?? 0,
                PreviousValue = 0,
                TrendPercentage = 0,
                Format = "number"
            },
            RequiredPermissions = new[] { Permissions.DashboardViewOrders }
        };

        return (revWidget, ordersWidget);
    }

    private async Task<DashboardWidgetDto> GetProfitKpiAsync(Guid tenantId, DateTime from, DateTime to, CancellationToken ct)
    {
        // 1. Get total revenue of completed orders in period
        var revenue = await _context.Orders
            .Where(o => o.TenantId == tenantId && o.Status == OrderStatus.Completed && o.CreatedAt >= from && o.CreatedAt <= to)
            .SumAsync(o => o.TotalAmount, ct);

        // 2. Get COGS from AccountingLedgerS2 mapped to these completed orders
        // Note: Using subquery or Join is better
        var cogs = await _context.Orders
            .Where(o => o.TenantId == tenantId && o.Status == OrderStatus.Completed && o.CreatedAt >= from && o.CreatedAt <= to)
            .Join(_context.AccountingLedgerS2s.Where(l => l.TenantId == tenantId && l.Type == ReceiptType.Export),
                  o => o.Id,
                  l => l.ReceiptId,
                  (o, l) => l.ValueOut)
            .SumAsync(ct);

        var profit = revenue - cogs;

        return new DashboardWidgetDto
        {
            WidgetId = DashboardWidgetIds.KpiProfit,
            Type = "Kpi",
            Title = "Lợi nhuận gộp",
            Order = 20,
            ColSpan = 3,
            KpiData = new DashboardKpiDataDto
            {
                Value = profit,
                PreviousValue = 0,
                TrendPercentage = 0,
                BreakdownValues = new Dictionary<string, decimal> 
                { 
                    { "Doanh thu", revenue }, 
                    { "Giá vốn hàng bán", cogs } 
                }
            },
            RequiredPermissions = new[] { Permissions.DashboardViewProfit }
        };
    }

    private async Task<DashboardWidgetDto> GetCashKpiAsync(Guid tenantId, DateTime from, DateTime to, CancellationToken ct)
    {
        var cashIn = await _context.CashTransactions
            .Where(c => c.TenantId == tenantId && c.Type == CashTransactionType.Receipt && c.CreatedAt >= from && c.CreatedAt <= to)
            .SumAsync(c => c.Amount, ct);

        var cashOut = await _context.CashTransactions
            .Where(c => c.TenantId == tenantId && c.Type == CashTransactionType.Payment && c.CreatedAt >= from && c.CreatedAt <= to)
            .SumAsync(c => c.Amount, ct);

        return new DashboardWidgetDto
        {
            WidgetId = DashboardWidgetIds.KpiCash,
            Type = "Kpi",
            Title = "Dòng tiền thuần",
            Order = 40,
            ColSpan = 3,
            KpiData = new DashboardKpiDataDto
            {
                Value = cashIn - cashOut,
                PreviousValue = 0,
                TrendPercentage = 0,
                BreakdownValues = new Dictionary<string, decimal> 
                { 
                    { "Tổng tiền Thu", cashIn }, 
                    { "Tổng tiền Chi", cashOut } 
                }
            },
            RequiredPermissions = new[] { Permissions.DashboardViewCash }
        };
    }

    private async Task<DashboardWidgetDto> GetRevenueTrendChartAsync(Guid tenantId, DateTime from, DateTime to, int timezoneOffsetMinutes, CancellationToken ct)
    {
        // 1. Determine granularity based on date range
        var totalDays = (to - from).TotalDays;
        string dateFormat = "yyyy-MM-dd";
        
        // Fetch raw data to group in memory since EF Core DateTrunc can be tricky with timezone and varying DB providers.
        // For production with massive data, we'd use EF.Functions.DateTrunc. Since it's MVP and filtered by Tenant + Date, in-memory is acceptable.
        // We will fetch only necessary fields.
        var orders = await _context.Orders
            .Where(o => o.TenantId == tenantId && o.Status == OrderStatus.Completed && o.CreatedAt >= from && o.CreatedAt <= to)
            .Select(o => new { o.Id, o.CreatedAt, o.TotalAmount })
            .ToListAsync(ct);

        var cogs = await _context.Orders
            .Where(o => o.TenantId == tenantId && o.Status == OrderStatus.Completed && o.CreatedAt >= from && o.CreatedAt <= to)
            .Join(_context.AccountingLedgerS2s.Where(l => l.TenantId == tenantId && l.Type == ReceiptType.Export),
                  o => o.Id,
                  l => l.ReceiptId,
                  (o, l) => new { o.CreatedAt, l.ValueOut })
            .ToListAsync(ct);

        // Grouping logic with Timezone Offset applied
        Func<DateTime, string> groupKeySelector = d => d.AddMinutes(-timezoneOffsetMinutes).ToString("yyyy-MM-dd");
        if (totalDays > 180)
            groupKeySelector = d => d.AddMinutes(-timezoneOffsetMinutes).ToString("yyyy-MM"); // Group by Month
        else if (totalDays > 31)
            groupKeySelector = d => {
                var localTime = d.AddMinutes(-timezoneOffsetMinutes);
                var cal = System.Globalization.DateTimeFormatInfo.CurrentInfo.Calendar;
                int week = cal.GetWeekOfYear(localTime, System.Globalization.CalendarWeekRule.FirstDay, DayOfWeek.Monday);
                return $"{localTime.Year}-W{week:D2}"; // Group by Week
            };

        var revenueDict = orders
            .GroupBy(o => groupKeySelector(o.CreatedAt))
            .ToDictionary(g => g.Key, g => g.Sum(o => o.TotalAmount));

        var cogsDict = cogs
            .GroupBy(c => groupKeySelector(c.CreatedAt))
            .ToDictionary(g => g.Key, g => g.Sum(c => c.ValueOut));

        var allLabels = revenueDict.Keys.Union(cogsDict.Keys).OrderBy(k => k).ToList();
        
        var revenueData = allLabels.Select(l => revenueDict.TryGetValue(l, out var val) ? val : 0).ToList();
        var profitData = allLabels.Select(l => {
            var rev = revenueDict.TryGetValue(l, out var r) ? r : 0;
            var c = cogsDict.TryGetValue(l, out var cv) ? cv : 0;
            return rev - c;
        }).ToList();

        return new DashboardWidgetDto
        {
            WidgetId = DashboardWidgetIds.ChartRevenueTrend,
            Type = "Chart",
            Title = "Xu hướng Doanh thu & Lợi nhuận",
            Order = 80,
            ColSpan = 12,
            ChartData = new DashboardChartDataDto
            {
                Labels = allLabels,
                Datasets = new List<ChartDatasetDto>
                {
                    new ChartDatasetDto { Label = "Doanh thu", Data = revenueData },
                    new ChartDatasetDto { Label = "Lợi nhuận gộp", Data = profitData }
                }
            },
            RequiredPermissions = new[] { Permissions.DashboardViewRevenue, Permissions.DashboardViewProfit }
        };
    }

    private async Task<DashboardWidgetDto> GetTopProductsListAsync(Guid tenantId, DateTime from, DateTime to, int limit, CancellationToken ct)
    {
        var topProducts = await _context.OrderItems
            .Where(oi => oi.Order.TenantId == tenantId && oi.Order.Status == OrderStatus.Completed && oi.Order.CreatedAt >= from && oi.Order.CreatedAt <= to)
            .GroupBy(oi => new { oi.ProductId, oi.Product.Name })
            .Select(g => new
            {
                g.Key.ProductId,
                ProductName = g.Key.Name,
                Quantity = g.Sum(x => x.Quantity),
                Revenue = g.Sum(x => x.TotalPrice)
            })
            .OrderByDescending(x => x.Revenue)
            .Take(limit)
            .ToListAsync(ct);

        var listItems = topProducts.Select(p => new DashboardListItemDto
        {
            Id = p.ProductId.ToString(),
            Title = p.ProductName,
            Subtitle = $"Đã bán: {p.Quantity:N0} SP",
            Value = p.Revenue
        }).ToList();

        return new DashboardWidgetDto
        {
            WidgetId = DashboardWidgetIds.ListTopProducts,
            Type = "List",
            Title = $"Sản phẩm bán chạy (Top {limit})",
            Order = 100,
            ColSpan = 6,
            ListData = new DashboardListDataDto
            {
                Items = listItems
            },
            RequiredPermissions = new[] { Permissions.DashboardViewProducts }
        };
    }
    
    private async Task<DashboardWidgetDto> GetCashFlowChartAsync(Guid tenantId, DateTime from, DateTime to, int timezoneOffsetMinutes, CancellationToken ct)
    {
        var totalDays = (to - from).TotalDays;
        
        var cashTransactions = await _context.CashTransactions
            .Where(c => c.TenantId == tenantId && c.CreatedAt >= from && c.CreatedAt <= to)
            .Select(c => new { c.Type, c.Amount, c.CreatedAt })
            .ToListAsync(ct);

        Func<DateTime, string> groupKeySelector = d => d.AddMinutes(-timezoneOffsetMinutes).ToString("yyyy-MM-dd");
        if (totalDays > 180)
            groupKeySelector = d => d.AddMinutes(-timezoneOffsetMinutes).ToString("yyyy-MM");
        else if (totalDays > 31)
            groupKeySelector = d => {
                var localTime = d.AddMinutes(-timezoneOffsetMinutes);
                var cal = System.Globalization.DateTimeFormatInfo.CurrentInfo.Calendar;
                int week = cal.GetWeekOfYear(localTime, System.Globalization.CalendarWeekRule.FirstDay, DayOfWeek.Monday);
                return $"{localTime.Year}-W{week:D2}";
            };

        var cashInDict = cashTransactions
            .Where(c => c.Type == CashTransactionType.Receipt)
            .GroupBy(c => groupKeySelector(c.CreatedAt))
            .ToDictionary(g => g.Key, g => g.Sum(c => c.Amount));

        var cashOutDict = cashTransactions
            .Where(c => c.Type == CashTransactionType.Payment)
            .GroupBy(c => groupKeySelector(c.CreatedAt))
            .ToDictionary(g => g.Key, g => g.Sum(c => c.Amount));

        var allLabels = cashInDict.Keys.Union(cashOutDict.Keys).OrderBy(k => k).ToList();
        
        var cashInData = allLabels.Select(l => cashInDict.TryGetValue(l, out var val) ? val : 0).ToList();
        var cashOutData = allLabels.Select(l => cashOutDict.TryGetValue(l, out var val) ? val : 0).ToList();

        return new DashboardWidgetDto
        {
            WidgetId = DashboardWidgetIds.ChartCashFlowTrend,
            Type = "Chart",
            Title = "Thu và Chi theo thời gian",
            Order = 90,
            ColSpan = 12,
            ChartData = new DashboardChartDataDto
            {
                Labels = allLabels,
                Datasets = new List<ChartDatasetDto>
                {
                    new ChartDatasetDto { Label = "Thu", Data = cashInData, Color = "#10b981" },
                    new ChartDatasetDto { Label = "Chi", Data = cashOutData, Color = "#ef4444" }
                }
            },
            RequiredPermissions = new[] { Permissions.DashboardViewCash }
        };
    }
    
    private async Task<DashboardWidgetDto> GetTopDebtCustomersListAsync(Guid tenantId, int limit, CancellationToken ct)
    {
        var topCustomers = await _context.Customers
            .Where(c => c.TenantId == tenantId && c.TotalDebt > 0)
            .OrderByDescending(c => c.TotalDebt)
            .Select(c => new { c.Id, c.Fullname, c.TotalDebt, c.Phone })
            .Take(limit)
            .ToListAsync(ct);

        var listItems = topCustomers.Select(c => new DashboardListItemDto
        {
            Id = c.Id.ToString(),
            Title = c.Fullname,
            Subtitle = string.IsNullOrEmpty(c.Phone) ? "Chưa có SĐT" : c.Phone,
            Value = c.TotalDebt
        }).ToList();

        return new DashboardWidgetDto
        {
            WidgetId = DashboardWidgetIds.ListTopDebtCustomers,
            Type = "List",
            Title = $"Khách hàng nợ cao nhất (Top {limit})",
            Order = 110,
            ColSpan = 6,
            ListData = new DashboardListDataDto
            {
                Items = listItems
            },
            RequiredPermissions = new[] { Permissions.DashboardViewCustomers }
        };
    }

    private async Task<DashboardWidgetDto?> GetLowStockAlertAsync(Guid tenantId, CancellationToken ct)
    {
        var threshold = await _tenantSettingService.GetSettingAsync<int>(TenantSettingKeys.DashboardAlertLowStock, ct);
        if (threshold <= 0)
        {
            threshold = 5;
        }

        // We count products whose latest S2 balance is less than or equal to threshold
        var lowStockCount = await _context.Products
            .Where(p => p.TenantId == tenantId && p.IsActive)
            .CountAsync(p => _context.AccountingLedgerS2s
                .Where(l => l.TenantId == tenantId && l.ProductId == p.Id)
                .OrderByDescending(l => l.Date)
                .Select(l => l.QuantityBalance)
                .FirstOrDefault() <= threshold, ct);

        if (lowStockCount == 0) return null;

        AlertSeverity severity = AlertSeverity.Medium;
        if (lowStockCount > 0) 
        {
            // We should ideally calculate severity per product, but for a high level summary:
            // Since we know they are all <= threshold, we can set default to Warning.
            // A more advanced approach queries MIN(QuantityBalance)
            var minStock = await _context.Products
                .Where(p => p.TenantId == tenantId && p.IsActive)
                .Select(p => _context.AccountingLedgerS2s
                    .Where(l => l.TenantId == tenantId && l.ProductId == p.Id)
                    .OrderByDescending(l => l.Date)
                    .Select(l => l.QuantityBalance)
                    .FirstOrDefault())
                .Where(q => q <= threshold)
                .MinAsync(ct);
                
            if (minStock <= 0) severity = AlertSeverity.Critical;
            else if (minStock <= threshold / 2) severity = AlertSeverity.High;
        }
        
        return new DashboardWidgetDto
        {
            WidgetId = DashboardWidgetIds.AlertLowStock,
            Type = "Alert",
            Title = "Cảnh báo kho hàng",
            Order = 70,
            ColSpan = 12,
            AlertData = new DashboardAlertDataDto
            {
                Message = $"Có {lowStockCount} sản phẩm sắp hết hàng (<= {threshold} SP)",
                Severity = severity,
                ActionUrl = "/inventory"
            },
            RequiredPermissions = new[] { Permissions.DashboardViewInventory }
        };
    }
    private async Task<DashboardWidgetDto> GetInventoryValueKpiAsync(Guid tenantId, DateTime from, DateTime to, CancellationToken ct)
    {
        var products = await _context.Products.Where(p => p.TenantId == tenantId).Select(p => p.Id).ToListAsync(ct);
        
        var ledgersAtTo = await _context.AccountingLedgerS2s
            .Where(l => l.TenantId == tenantId && l.Date <= to)
            .GroupBy(l => l.ProductId)
            .Select(g => g.OrderByDescending(l => l.Date).FirstOrDefault())
            .ToListAsync(ct);
            
        var totalValue = ledgersAtTo.Where(l => l != null).Sum(l => l!.ValueBalance);
        
        var ledgersAtFrom = await _context.AccountingLedgerS2s
            .Where(l => l.TenantId == tenantId && l.Date < from)
            .GroupBy(l => l.ProductId)
            .Select(g => g.OrderByDescending(l => l.Date).FirstOrDefault())
            .ToListAsync(ct);
            
        var prevTotalValue = ledgersAtFrom.Where(l => l != null).Sum(l => l!.ValueBalance);

        var trend = prevTotalValue == 0 ? 0 : ((totalValue - prevTotalValue) / prevTotalValue) * 100m;

        return new DashboardWidgetDto
        {
            WidgetId = DashboardWidgetIds.KpiInventoryValue,
            Type = "Kpi",
            Title = "Giá trị tồn kho",
            Order = 50,
            ColSpan = 3,
            KpiData = new DashboardKpiDataDto
            {
                Value = totalValue,
                PreviousValue = prevTotalValue,
                TrendPercentage = trend
            },
            RequiredPermissions = new[] { Permissions.DashboardViewInventory }
        };
    }

    private async Task<DashboardWidgetDto> GetInventoryQuantityKpiAsync(Guid tenantId, DateTime from, DateTime to, CancellationToken ct)
    {
        var ledgersAtTo = await _context.AccountingLedgerS2s
            .Where(l => l.TenantId == tenantId && l.Date <= to)
            .GroupBy(l => l.ProductId)
            .Select(g => g.OrderByDescending(l => l.Date).FirstOrDefault())
            .ToListAsync(ct);
            
        var totalQuantity = ledgersAtTo.Where(l => l != null).Sum(l => l!.QuantityBalance);
        
        var ledgersAtFrom = await _context.AccountingLedgerS2s
            .Where(l => l.TenantId == tenantId && l.Date < from)
            .GroupBy(l => l.ProductId)
            .Select(g => g.OrderByDescending(l => l.Date).FirstOrDefault())
            .ToListAsync(ct);
            
        var prevTotalQuantity = ledgersAtFrom.Where(l => l != null).Sum(l => l!.QuantityBalance);

        var trend = prevTotalQuantity == 0 ? 0 : ((totalQuantity - prevTotalQuantity) / prevTotalQuantity) * 100m;

        return new DashboardWidgetDto
        {
            WidgetId = DashboardWidgetIds.KpiInventoryQuantity,
            Type = "Kpi",
            Title = "Số lượng tồn kho",
            Order = 60,
            ColSpan = 3,
            KpiData = new DashboardKpiDataDto
            {
                Value = totalQuantity,
                PreviousValue = prevTotalQuantity,
                TrendPercentage = trend,
                Format = "number" // We need a number format here, not currency
            },
            RequiredPermissions = new[] { Permissions.DashboardViewInventory }
        };
    }
}
