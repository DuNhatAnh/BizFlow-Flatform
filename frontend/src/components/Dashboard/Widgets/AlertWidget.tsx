import React, { useEffect, useRef } from 'react';
import { useWidget } from '../../../hooks/useDashboard';
import { DashboardWidgetDto, DashboardAlertDataDto, AlertSeverity } from '../../../types/dashboard';
import { WidgetHeader } from './WidgetHeader';
import { AlertTriangle, Info, ShieldAlert, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const AlertWidget: React.FC<{ widget: DashboardWidgetDto }> = ({ widget }) => {
  const { data: updatedWidget, refetch, isFetching, dataUpdatedAt } = useWidget(widget);
  const data = updatedWidget?.data as DashboardAlertDataDto | undefined;
  const dispatchedRef = useRef(false);

  useEffect(() => {
    if (data && widget.widgetId === 'alert-low-stock' && !dispatchedRef.current) {
      dispatchedRef.current = true;
      const notif = {
        id: 'inventory-alert-' + Date.now(),
        title: updatedWidget?.title || widget.title,
        message: data.message,
        type: 'inventory',
        createdAt: new Date().toISOString()
      };
      // Give the header time to mount
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('new_notification', { detail: notif }));
      }, 500);
    }
  }, [data, widget.widgetId, updatedWidget?.title]);

  // Don't render anything if no alert data, or if it's the low stock alert (now moved to Bell)
  if (!data || widget.widgetId === 'alert-low-stock') return null;

  const getAlertStyles = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.Critical:
      case AlertSeverity.High:
        return {
          bg: 'bg-red-50',
          border: 'border-red-100',
          text: 'text-red-800',
          iconColor: 'text-red-500',
          Icon: ShieldAlert,
          btn: 'bg-red-100 text-red-700 hover:bg-red-200'
        };
      case AlertSeverity.Medium:
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-100',
          text: 'text-amber-800',
          iconColor: 'text-amber-500',
          Icon: AlertTriangle,
          btn: 'bg-amber-100 text-amber-700 hover:bg-amber-200'
        };
      case AlertSeverity.Low:
      case AlertSeverity.Info:
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-100',
          text: 'text-blue-800',
          iconColor: 'text-blue-500',
          Icon: Info,
          btn: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        };
    }
  };

  const style = getAlertStyles(data.severity);
  const { Icon } = style;

  return (
    <div className={`rounded-xl shadow-sm p-5 border flex items-center justify-between gap-4 ${style.bg} ${style.border}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full bg-white/60 ${style.iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className={`font-semibold mb-1 ${style.text}`}>{updatedWidget?.title || widget.title}</h3>
          <p className={`text-sm opacity-90 ${style.text}`}>{data.message}</p>
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className={`p-1.5 rounded-full transition-colors ${style.btn} disabled:opacity-50`}
          title="Làm mới"
        >
          <AlertCircle className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
        {data.actionUrl && (
          <button
            onClick={() => {
              if (data.actionUrl.startsWith("/")) {
                 const tabId = data.actionUrl.substring(1);
                 localStorage.setItem("bizflow_active_tab", tabId);
                 window.location.reload();
              } else {
                 window.location.href = data.actionUrl;
              }
            }}
            className={`text-sm font-medium hover:underline ${style.text}`}
          >
            Xem chi tiết →
          </button>
        )}
      </div>
    </div>
  );
};
