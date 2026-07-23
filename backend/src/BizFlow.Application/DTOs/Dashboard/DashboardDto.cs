using BizFlow.Domain.Enums;

namespace BizFlow.Application.DTOs.Dashboard;

public class DashboardHomeDto
{
    public List<DashboardWidgetDto> Widgets { get; set; } = new List<DashboardWidgetDto>();
}

public class DashboardWidgetDto
{
    public string WidgetId { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // "Kpi", "Chart", "List", "Alert"
    public string Title { get; set; } = string.Empty;
    public int Order { get; set; }
    public int ColSpan { get; set; } 
    
    public DashboardKpiDataDto? KpiData { get; set; }
    public DashboardChartDataDto? ChartData { get; set; }
    public DashboardListDataDto? ListData { get; set; }
    public DashboardAlertDataDto? AlertData { get; set; }
    
    public string[] RequiredPermissions { get; set; } = System.Array.Empty<string>();
}

public class DashboardKpiDataDto
{
    public decimal Value { get; set; }
    public decimal PreviousValue { get; set; }
    public decimal TrendPercentage { get; set; }
    public string Format { get; set; } = "currency"; // "currency", "number", "percentage"
    public Dictionary<string, decimal>? BreakdownValues { get; set; }
}

public class DashboardChartDataDto
{
    public List<string> Labels { get; set; } = new List<string>();
    public List<ChartDatasetDto> Datasets { get; set; } = new List<ChartDatasetDto>();
}

public class ChartDatasetDto
{
    public string Label { get; set; } = string.Empty;
    public List<decimal> Data { get; set; } = new List<decimal>();
    public string? Color { get; set; }
}

public class DashboardListDataDto
{
    public List<DashboardListItemDto> Items { get; set; } = new List<DashboardListItemDto>();
}

public class DashboardListItemDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public decimal Value { get; set; }
}

public class DashboardAlertDataDto
{
    public string Message { get; set; } = string.Empty;
    public AlertSeverity Severity { get; set; } = AlertSeverity.Info;
    public string? ActionUrl { get; set; }
}
