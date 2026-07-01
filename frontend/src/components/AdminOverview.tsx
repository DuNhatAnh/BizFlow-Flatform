"use client";

import React, { useState, useEffect } from "react";
import MetricCard from "@/components/MetricCard";
import { Building2, UserCheck, DollarSign, Sparkles, Loader2, Clock, CheckCircle, XCircle } from "lucide-react";

interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  totalUsers: number;
  totalAiRequests: number;
  totalAiCost: number;
  tenantsByPlan: { planName: string; count: number }[];
  recentAiRequests: any[];
}

interface RecentTenant {
  id: string;
  name: string;
  ownerName: string;
  planName: string;
  isActive: boolean;
  createdAt: string;
}

const API = "http://localhost:5178/api";

function getToken() {
  if (typeof window === "undefined") return "";
  try {
    return JSON.parse(localStorage.getItem("bizflow_user") || "{}").token || "";
  } catch {
    return "";
  }
}

export default function AdminOverview() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [recentTenants, setRecentTenants] = useState<RecentTenant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };
      
      const res = await fetch(`${API}/platform/stats`, { headers });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
      
      // Also fetch recent tenants list from Tenants endpoint
      const resTenants = await fetch(`${API}/tenants`, { headers });
      if (resTenants.ok) {
        const tenantsData = await resTenants.json();
        // Take 5 most recent
        setRecentTenants(tenantsData.slice(0, 5));
      }
    } catch (e) {
      console.error("Failed to fetch dashboard stats", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-on-surface-variant">
        <Loader2 className="w-5.5 h-5.5 animate-spin text-primary" />
        <span className="text-sm">Đang tải thông số quản trị...</span>
      </div>
    );
  }

  // Calculate estimated SaaS Monthly Revenue
  // (In production, this would be computed by backend or Stripe, but we can compute from stats)
  const activeTenantsCount = stats?.activeTenants || 0;
  
  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Tổng số Doanh nghiệp (Tenants)"
          value={stats?.totalTenants.toString() || "0"}
          trend={`${stats?.activeTenants || 0} đang hoạt động`}
          trendType="up"
          icon={Building2}
          iconBgColor="bg-emerald-50"
          iconColor="text-primary"
        />
        <MetricCard
          title="Số tài khoản sử dụng"
          value={stats?.totalUsers.toString() || "0"}
          trend="Toàn bộ hệ thống"
          trendType="neutral"
          icon={UserCheck}
          iconBgColor="bg-blue-50"
          iconColor="text-secondary"
        />
        <MetricCard
          title="Tổng số AI Requests"
          value={stats?.totalAiRequests.toLocaleString("vi-VN") || "0"}
          trend="Gemini + Whisper logs"
          trendType="up"
          icon={Sparkles}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
        <MetricCard
          title="Chi phí dịch vụ AI"
          value={`$${stats?.totalAiCost.toFixed(4) || "0.00"}`}
          trend="Hạn mức an toàn"
          trendType="neutral"
          icon={DollarSign}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-500"
        />
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Registered Tenants */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-surface-container-high shadow-card p-5">
          <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />Doanh nghiệp mới đăng ký gần đây
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-surface-container-high text-xs font-bold text-on-surface-variant uppercase bg-surface-container-low text-left">
                  <th className="p-3">Doanh nghiệp</th>
                  <th className="p-3">Chủ sở hữu</th>
                  <th className="p-3 text-center">Trạng thái</th>
                  <th className="p-3 text-right">Ngày đăng ký</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {recentTenants.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-on-surface-variant">Không có dữ liệu mới.</td>
                  </tr>
                ) : (
                  recentTenants.map(t => (
                    <tr key={t.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="p-3 font-semibold text-on-surface">{t.name}</td>
                      <td className="p-3 text-on-surface-variant">{t.ownerName}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${t.isActive ? "bg-emerald-50 text-emerald-600" : "bg-error/10 text-error"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${t.isActive ? "bg-emerald-500" : "bg-error"}`} />
                          {t.isActive ? "Hoạt động" : "Tạm khóa"}
                        </span>
                      </td>
                      <td className="p-3 text-right text-xs text-on-surface-variant">
                        {new Date(t.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subscription Plan Distribution summary */}
        <div className="bg-white rounded-2xl border border-surface-container-high shadow-card p-5">
          <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-500" />Tỷ lệ gói thuê bao
          </h3>
          <div className="space-y-4">
            {stats?.tenantsByPlan && stats.tenantsByPlan.length > 0 ? (
              stats.tenantsByPlan.map((p, i) => {
                const colors = ["bg-primary", "bg-indigo-500", "bg-purple-500", "bg-amber-500"];
                const maxCount = Math.max(...stats.tenantsByPlan.map(t => t.count), 1);
                return (
                  <div key={p.planName}>
                    <div className="flex items-center justify-between text-xs font-medium mb-1">
                      <span className="text-on-surface">{p.planName}</span>
                      <span className="text-on-surface-variant">{p.count} cửa hàng</span>
                    </div>
                    <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                      <div className={`h-2 rounded-full ${colors[i % colors.length]}`} style={{ width: `${(p.count / maxCount) * 100}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-on-surface-variant text-center py-10">Chưa có phân bố thuê bao.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
