import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { DashboardProvider, useDashboardContext } from '@/components/Dashboard/DashboardContext';
import { DashboardRenderer } from '@/components/Dashboard/DashboardRenderer';
import { DashboardControls } from '@/components/Dashboard/DashboardControls';
import { DashboardWidgetDto } from '@/types/dashboard';

const defaultOwnerWidgets: DashboardWidgetDto[] = [
  { widgetId: 'kpi-revenue', type: 'Kpi', title: 'Doanh thu', order: 1, colSpan: 3, requiredPermissions: [], data: null },
  { widgetId: 'kpi-profit', type: 'Kpi', title: 'Lợi nhuận gộp', order: 2, colSpan: 3, requiredPermissions: [], data: null },
  { widgetId: 'kpi-orders', type: 'Kpi', title: 'Số đơn hàng', order: 3, colSpan: 3, requiredPermissions: [], data: null },
  { widgetId: 'kpi-cash', type: 'Kpi', title: 'Dòng tiền thuần', order: 4, colSpan: 3, requiredPermissions: [], data: null },
  { widgetId: 'kpi-inventory-value', type: 'Kpi', title: 'Giá trị tồn kho', order: 5, colSpan: 3, requiredPermissions: [], data: null },
  { widgetId: 'kpi-inventory-quantity', type: 'Kpi', title: 'Số lượng tồn kho', order: 6, colSpan: 3, requiredPermissions: [], data: null },
  { widgetId: 'kpi-employees', type: 'Kpi', title: 'Tổng số nhân viên', order: 61, colSpan: 3, requiredPermissions: [], data: null },
  { widgetId: 'kpi-customers', type: 'Kpi', title: 'Tổng số khách hàng', order: 62, colSpan: 3, requiredPermissions: [], data: null },
  { widgetId: 'kpi-customer-debt', type: 'Kpi', title: 'Tổng nợ khách hàng', order: 63, colSpan: 3, requiredPermissions: [], data: null },
  { widgetId: 'chart-revenue-profit', type: 'Chart', title: 'Xu hướng Doanh thu & Lợi nhuận', order: 80, colSpan: 12, requiredPermissions: [], data: null },
  { widgetId: 'list-top-products', type: 'List', title: 'Top Sản phẩm bán chạy', order: 100, colSpan: 6, requiredPermissions: [], data: null },
  { widgetId: 'list-top-debt', type: 'List', title: 'Khách hàng nợ nhiều nhất', order: 110, colSpan: 6, requiredPermissions: [], data: null },
];

const DashboardContent: React.FC = () => {
  const { data, isLoading, isError, refetch } = useDashboard();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full">
      <DashboardControls />

      {/* Dashboard Body */}
      {isError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center">
          <h3 className="text-lg font-bold mb-2">Lỗi tải dữ liệu Dashboard</h3>
          <p>Không thể kết nối đến máy chủ hoặc bạn không có quyền truy cập.</p>
          <button 
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <DashboardRenderer widgets={data?.widgets && data.widgets.length > 0 ? data.widgets : defaultOwnerWidgets} />
      )}
    </div>
  );
};

export default function OwnerOverview() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
