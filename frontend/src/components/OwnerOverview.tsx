import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { DashboardProvider, useDashboardContext } from './Dashboard/DashboardContext';
import { DashboardRenderer } from './Dashboard/DashboardRenderer';
import { DashboardControls } from './Dashboard/DashboardControls';
import { DashboardSkeleton } from './Dashboard/DashboardSkeleton';

const DashboardContent: React.FC = () => {
  const { data, isLoading, isError, refetch } = useDashboard();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full">
      <DashboardControls />

      {/* Dashboard Body */}
      {isLoading ? (
        <DashboardSkeleton />
      ) : isError ? (
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
      ) : data?.widgets ? (
        <DashboardRenderer widgets={data.widgets} />
      ) : null}
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
