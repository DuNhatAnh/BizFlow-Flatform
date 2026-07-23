export enum AlertSeverity {
  Info = 'Info',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export interface DashboardWidgetDto {
  widgetId: string;
  type: string; // 'Kpi', 'Chart', 'List', 'Alert'
  title: string;
  order: number;
  colSpan: number;
  requiredPermissions: string[];
  data: any; // Will be casted inside components
}

export interface DashboardHomeDto {
  widgets: DashboardWidgetDto[];
}

export interface DashboardKpiDataDto {
  value: number;
  previousValue: number;
  trendPercentage: number;
  isPositiveTrend: boolean;
  format: string; // 'currency', 'number', 'percentage'
  breakdownValues?: Record<string, number>;
}

export interface DashboardChartDataDto {
  labels: string[];
  datasets: ChartDatasetDto[];
}

export interface ChartDatasetDto {
  label: string;
  data: number[];
  color: string;
}

export interface DashboardListDataDto {
  items: ListItemDto[];
}

export interface ListItemDto {
  id: string;
  title: string;
  subtitle: string;
  value: number;
  format: string;
}

export interface DashboardAlertDataDto {
  severity: AlertSeverity;
  message: string;
  actionUrl: string;
}
