import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 w-full">
      {/* Skeleton for an Alert (col-span-12) */}
      <div className="col-span-1 md:col-span-2 lg:col-span-12 bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex items-center gap-4 animate-pulse h-[88px]">
        <div className="w-12 h-12 rounded-full bg-gray-100" />
        <div className="flex flex-col gap-2">
          <div className="w-32 h-5 bg-gray-100 rounded" />
          <div className="w-64 h-4 bg-gray-100 rounded" />
        </div>
      </div>
      
      {/* Skeletons for 4 KPIs (col-span-3 each) */}
      {[1, 2, 3, 4].map(i => (
        <div key={`kpi-${i}`} className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex flex-col h-[140px] animate-pulse">
          <div className="flex justify-between items-center mb-4">
            <div className="w-24 h-5 bg-gray-100 rounded" />
            <div className="w-6 h-6 rounded-full bg-gray-100" />
          </div>
          <div className="flex-1 flex flex-col justify-end gap-3">
            <div className="w-32 h-8 bg-gray-100 rounded" />
            <div className="w-48 h-4 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
      
      {/* Skeletons for 2 Charts/Lists (col-span-6 each) */}
      {[1, 2].map(i => (
        <div key={`chart-${i}`} className="col-span-1 md:col-span-2 lg:col-span-6 bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex flex-col h-[350px] animate-pulse">
          <div className="flex justify-between items-center mb-6">
            <div className="w-32 h-5 bg-gray-100 rounded" />
            <div className="w-6 h-6 rounded-full bg-gray-100" />
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg w-full" />
        </div>
      ))}
    </div>
  );
};
