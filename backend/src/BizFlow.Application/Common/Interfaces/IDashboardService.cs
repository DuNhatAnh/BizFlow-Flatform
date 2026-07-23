using System;
using System.Threading;
using System.Threading.Tasks;
using BizFlow.Application.DTOs.Dashboard;

namespace BizFlow.Application.Common.Interfaces;

public interface IDashboardService
{
    Task<DashboardHomeDto> GetDashboardHomeAsync(DateTime fromDate, DateTime toDate, int timezoneOffsetMinutes = 0, CancellationToken cancellationToken = default);
    Task<DashboardWidgetDto> GetWidgetDataAsync(string widgetId, DateTime fromDate, DateTime toDate, int timezoneOffsetMinutes = 0, int limit = 5, CancellationToken cancellationToken = default);
}
