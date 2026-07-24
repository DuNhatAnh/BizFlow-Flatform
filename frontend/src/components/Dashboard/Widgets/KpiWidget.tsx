import React, { useState } from 'react';
import { useWidget } from '../../../hooks/useDashboard';
import { DashboardWidgetDto, DashboardKpiDataDto } from '../../../types/dashboard';
import { WidgetHeader } from './WidgetHeader';
import { TrendingUp, TrendingDown, Minus, Info, X, ChevronRight } from 'lucide-react';

export const KpiWidget: React.FC<{ widget: DashboardWidgetDto }> = ({ widget }) => {
  const { data: queryWidget, refetch, isFetching, dataUpdatedAt } = useWidget(widget);
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const displayWidget = queryWidget || widget;
  const data = displayWidget.data as DashboardKpiDataDto | undefined;



  const formatValue = (val: number, format: string) => {
    if (format === 'currency') return `${val.toLocaleString('vi-VN')} đ`;
    if (format === 'percentage') return `${val}%`;
    return val.toLocaleString('vi-VN');
  };

  const getFormulaExplanation = (widgetId: string) => {
    switch (widgetId) {
      case 'kpi-revenue':
        return 'Tổng tiền của tất cả Đơn hàng có trạng thái "Đã hoàn thành" trong khoảng thời gian đã chọn.';
      case 'kpi-profit':
        return 'Bằng (Doanh thu) trừ đi (Giá vốn hàng bán). Giá vốn được tính theo phương pháp Bình quân gia quyền (MAC) hoặc FIFO tùy theo thiết lập của cửa hàng.';
      case 'kpi-orders':
        return 'Tổng số lượng Đơn hàng đã được tạo và hoàn tất (giao thành công) trong kỳ.';
      case 'kpi-cash':
        return 'Bằng (Tổng tiền Thu) trừ đi (Tổng tiền Chi) được ghi nhận trong Sổ quỹ Tiền mặt & Ngân hàng trong khoảng thời gian đã chọn.';
      case 'kpi-inventory-value':
        return 'Tổng giá trị hàng hóa còn tồn trong kho (Số lượng tồn x Giá vốn) tính đến thời điểm hiện tại của kỳ báo cáo.';
      case 'kpi-inventory-quantity':
        return 'Tổng số lượng thực tế của tất cả các mặt hàng còn tồn trong kho tính đến thời điểm hiện tại.';
      default:
        return 'Chỉ số được tổng hợp từ dữ liệu hệ thống trong khoảng thời gian đã chọn.';
    }
  };

  const navigateToTab = (tabId: string) => {
    localStorage.setItem("bizflow_active_tab", tabId);
    window.location.reload();
  };

  const handleWidgetClick = () => {
    if (widget.widgetId === 'kpi-orders') {
      navigateToTab('orders');
    } else if (widget.widgetId === 'kpi-revenue') {
      navigateToTab('orders'); // Doanh thu cũng đến từ đơn hàng
    } else if (widget.widgetId === 'kpi-cash') {
      navigateToTab('cashbook');
    } else if (widget.widgetId === 'kpi-inventory-value' || widget.widgetId === 'kpi-inventory-quantity') {
      navigateToTab('inventory');
    } else {
      setShowFormulaModal(true);
    }
  };

  const hasNavigation = ['kpi-orders', 'kpi-revenue', 'kpi-cash', 'kpi-inventory-value', 'kpi-inventory-quantity'].includes(widget.widgetId);

  return (
    <>
      <div 
        className="bg-white rounded-[16px] shadow-card hover:shadow-lg p-5 flex flex-col h-full border border-gray-100 min-h-[140px] cursor-pointer transition-all relative group"
        onClick={handleWidgetClick}
      >
        <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
          {hasNavigation && (
             <div className="p-1 text-primary bg-primary-50 rounded-full shadow-sm">
               <ChevronRight className="w-4 h-4" />
             </div>
          )}
        </div>
        <WidgetHeader 
          title={displayWidget.title} 
          isFetching={isFetching}
          updatedAt={dataUpdatedAt}
          iconType={data ? "info" : undefined}
          onAction={() => {
            if (data) setShowFormulaModal(true);
          }}
        />
        {!data ? (
          <div className="flex-1 flex flex-col justify-end mt-1 animate-pulse">
            <div className="w-32 h-8 bg-gray-100 rounded mb-2.5" />
            <div className="w-48 h-4 bg-gray-100 rounded" />
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-end mt-1">
            <div 
              className="text-2xl lg:text-[1.75rem] font-bold text-primary mb-2.5 tracking-tight break-words font-fira-code"
              title={formatValue(data.value, data.format)}
            >
              {formatValue(data.value, data.format)}
            </div>
            <div className="flex items-center text-[11px] xl:text-xs font-medium">
              {data.trendPercentage === 0 ? (
                <span className="text-gray-500 inline-flex items-center bg-gray-50 px-2 py-1 rounded max-w-full">
                  <Minus className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  <span className="truncate">Không đổi so với kỳ trước</span>
                </span>
              ) : data.isPositiveTrend ? (
                <span className="text-emerald-600 inline-flex items-center bg-emerald-50 px-2 py-1 rounded max-w-full">
                  <TrendingUp className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  <span className="truncate">{data.trendPercentage.toFixed(1)}% so với kỳ trước</span>
                </span>
              ) : (
                <span className="text-rose-600 inline-flex items-center bg-rose-50 px-2 py-1 rounded max-w-full">
                  <TrendingDown className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  <span className="truncate">{Math.abs(data.trendPercentage).toFixed(1)}% so với kỳ trước</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {showFormulaModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setShowFormulaModal(false)}>
          <div 
            className="bg-white rounded-2xl border-4 border-gray-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b-2 border-gray-100 bg-gray-50/50 shrink-0">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 font-fira-sans">
                <Info className="w-5 h-5 text-primary" />
                Công thức: {displayWidget.title}
              </h3>
              <button 
                onClick={() => setShowFormulaModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {getFormulaExplanation(widget.widgetId)}
              </p>
              
              {data && data.breakdownValues && Object.keys(data.breakdownValues).length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Chi tiết thông số</h4>
                  <div className="space-y-3">
                    {Object.entries(data.breakdownValues).map(([key, val], idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 font-medium">{key}</span>
                        <span className="font-bold text-gray-900 font-fira-code">{formatValue(val, data.format)}</span>
                      </div>
                    ))}
                      <div className="pt-3 border-t border-gray-200 mt-2 flex justify-between items-center text-sm">
                        <span className="font-bold text-gray-800">Kết quả ({displayWidget.title})</span>
                        <span className="font-black text-primary text-base font-fira-code">{data ? formatValue(data.value, data.format) : ''}</span>
                      </div>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end shrink-0">
                <button 
                  onClick={() => setShowFormulaModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
