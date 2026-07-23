import React from 'react';
import { DashboardWidgetDto } from '../../types/dashboard';
import { KpiWidget } from './Widgets/KpiWidget';
import { ChartWidget } from './Widgets/ChartWidget';
import { ListWidget } from './Widgets/ListWidget';
import { AlertWidget } from './Widgets/AlertWidget';
import { UnknownWidget } from './Widgets/UnknownWidget';

export const widgetRegistry: Record<string, React.FC<{ widget: DashboardWidgetDto }>> = {
  Kpi: KpiWidget,
  Chart: ChartWidget,
  List: ListWidget,
  Alert: AlertWidget,
};

export const WidgetFactory: React.FC<{ widget: DashboardWidgetDto }> = ({ widget }) => {
  const Component = widgetRegistry[widget.type] ?? UnknownWidget;
  return <Component widget={widget} />;
};
