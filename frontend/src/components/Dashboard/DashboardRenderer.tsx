import React, { useEffect, useState } from 'react';
import { DashboardWidgetDto } from '../../types/dashboard';
import { WidgetFactory } from './WidgetRegistry';

const getColSpanClass = (colSpan: number) => {
  switch (colSpan) {
    case 1: return 'lg:col-span-1';
    case 2: return 'lg:col-span-2';
    case 3: return 'lg:col-span-3';
    case 4: return 'lg:col-span-4';
    case 5: return 'lg:col-span-5';
    case 6: return 'lg:col-span-6';
    case 7: return 'lg:col-span-7';
    case 8: return 'lg:col-span-8';
    case 9: return 'lg:col-span-9';
    case 10: return 'lg:col-span-10';
    case 11: return 'lg:col-span-11';
    case 12: return 'lg:col-span-12';
    default: return 'lg:col-span-12';
  }
};

export const DashboardRenderer: React.FC<{ widgets: DashboardWidgetDto[] }> = ({ widgets }) => {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const loadConfig = () => {
      const savedConfigStr = localStorage.getItem("bizflow_dashboard_config");
      if (savedConfigStr) {
        try {
          setConfig(JSON.parse(savedConfigStr));
        } catch (e) { }
      }
    };
    
    loadConfig();
    window.addEventListener("dashboard-config-updated", loadConfig);
    return () => window.removeEventListener("dashboard-config-updated", loadConfig);
  }, []);

  // Filter widgets
  let visibleWidgets = [...widgets];
  if (config) {
    visibleWidgets = visibleWidgets.filter(w => {
      if (w.widgetId === 'kpi-revenue' && config.showRevenue === false) return false;
      if (w.widgetId === 'kpi-profit' && config.showGrossProfit === false) return false;
      if (w.widgetId === 'kpi-orders' && config.showOrderCount === false) return false;
      if (w.widgetId === 'kpi-cash' && config.showNetCashFlow === false) return false;
      if (w.widgetId === 'kpi-inventory-value' && config.showInventoryValue === false) return false;
      if (w.widgetId === 'kpi-inventory-quantity' && config.showInventoryQuantity === false) return false;
      return true;
    });
  }

  // Sort widgets by order before rendering
  const sortedWidgets = visibleWidgets.sort((a, b) => a.order - b.order);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 w-full">
      {sortedWidgets.map(widget => (
        <div 
          key={widget.widgetId}
          className={getColSpanClass(widget.colSpan)}
        >
          <WidgetFactory widget={widget} />
        </div>
      ))}
    </div>
  );
};
