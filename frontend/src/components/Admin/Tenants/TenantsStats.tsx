import React from "react";

interface TenantsStatsProps {
  activeCount: number;
  totalRevenue: number;
  pendingCount: number;
  expiringSoonCount: number;
}

const TenantsStats: React.FC<TenantsStatsProps> = React.memo(({ 
  activeCount, 
  totalRevenue, 
  pendingCount, 
  expiringSoonCount 
}) => {
  return (
    <>
      {/* Doanh nghiệp hoạt động */}
      <div className="relative overflow-hidden bg-sky-50/40 backdrop-blur-md rounded-2xl border border-sky-100/50 shadow-sm p-6 flex flex-col">
        <p className="text-[11px] font-bold text-sky-700/80 uppercase tracking-widest mb-2">Doanh nghiệp hoạt động</p>
        <h3 className="text-4xl font-extrabold text-sky-950 tracking-tight">{activeCount}</h3>
        {/* Subtle blur effect in the background */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-sky-300/20 rounded-full blur-2xl"></div>
      </div>
      
      {/* Yêu cầu chờ duyệt */}
      <div className="relative overflow-hidden bg-orange-50/40 backdrop-blur-md rounded-2xl border border-orange-100/50 shadow-sm p-6 flex flex-col">
        <p className="text-[11px] font-bold text-orange-700/80 uppercase tracking-widest mb-2">Yêu cầu chờ duyệt</p>
        <h3 className="text-4xl font-extrabold text-orange-950 tracking-tight">{pendingCount}</h3>
        {/* Subtle blur effect in the background */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-orange-300/20 rounded-full blur-2xl"></div>
      </div>

      {/* Sắp hết hạn gói */}
      <div className="relative overflow-hidden bg-rose-50/40 backdrop-blur-md rounded-2xl border border-rose-100/50 shadow-sm p-6 flex flex-col">
        <p className="text-[11px] font-bold text-rose-700/80 uppercase tracking-widest mb-2">Sắp hết hạn gói <span className="lowercase">(30 ngày)</span></p>
        <h3 className="text-4xl font-extrabold text-rose-950 tracking-tight">{expiringSoonCount}</h3>
        {/* Subtle blur effect in the background */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-rose-300/20 rounded-full blur-2xl"></div>
      </div>

      {/* Tổng doanh thu gói */}
      <div className="relative overflow-hidden bg-emerald-50/40 backdrop-blur-md rounded-2xl border border-emerald-100/50 shadow-sm p-6 flex flex-col">
        <p className="text-[11px] font-bold text-emerald-700/80 uppercase tracking-widest mb-2">Tổng doanh thu gói</p>
        <h3 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 tracking-tight truncate" title={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}
        </h3>
        {/* Subtle blur effect in the background */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-300/20 rounded-full blur-2xl"></div>
      </div>
    </>
  );
});

TenantsStats.displayName = "TenantsStats";

export default TenantsStats;
