"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart3, Activity, Users, Building2, TrendingUp, Cpu, DollarSign,
  Loader2, RefreshCw, Clock, Zap
} from "lucide-react";

interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  totalUsers: number;
  totalAiRequests: number;
  totalAiCost: number;
  aiRequestsByType: { requestType: string; count: number; totalCost: number }[];
  tenantsByPlan: { planName: string; count: number }[];
  recentAiRequests: {
    id: string; tenantId?: string; requestType: string; modelName: string;
    totalTokens: number; cost: number; durationMs: number; timestamp: string;
  }[];
}

const API = "http://localhost:5178/api";

function getToken() {
  if (typeof window === "undefined") return "";
  try { return JSON.parse(localStorage.getItem("bizflow_user") || "{}").token || ""; } catch { return ""; }
}

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

function StatCard({ icon, label, value, sub, accent }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; accent?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-surface-container-high shadow-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-on-surface-variant">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent || "bg-primary/10"}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-extrabold text-on-surface">{value}</p>
      {sub && <p className="text-xs text-on-surface-variant mt-1">{sub}</p>}
    </div>
  );
}

export default function PlatformAnalytics() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/platform/stats`, { headers: authHeaders() });
      if (res.ok) setStats(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-28 gap-3 text-on-surface-variant">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span className="text-sm">Đang tải thống kê nền tảng...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-4">
        <BarChart3 className="w-16 h-16 text-on-surface-variant/30" />
        <p className="text-on-surface-variant text-sm">Không thể tải dữ liệu thống kê.</p>
        <button onClick={fetchStats} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90">
          <RefreshCw className="w-4 h-4" />Thử lại
        </button>
      </div>
    );
  }

  const maxAiCount = Math.max(...(stats.aiRequestsByType || []).map(r => r.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-on-surface">Phân tích Nền tảng</h2>
            <p className="text-sm text-on-surface-variant">Tổng quan toàn hệ thống BizFlow</p>
          </div>
        </div>
        <button onClick={fetchStats} className="p-2 rounded-lg border border-surface-container-high hover:bg-surface-container-low text-on-surface-variant">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Building2 className="w-4 h-4 text-primary" />} label="Tổng Doanh nghiệp" value={stats.totalTenants} sub={`${stats.activeTenants} đang hoạt động`} accent="bg-primary/10" />
        <StatCard icon={<Users className="w-4 h-4 text-indigo-500" />} label="Tổng Người dùng" value={stats.totalUsers} accent="bg-indigo-50" />
        <StatCard icon={<Cpu className="w-4 h-4 text-violet-500" />} label="Tổng AI Requests" value={stats.totalAiRequests.toLocaleString("vi-VN")} accent="bg-violet-50" />
        <StatCard
          icon={<DollarSign className="w-4 h-4 text-amber-500" />}
          label="Chi phí AI (USD)"
          value={`$${stats.totalAiCost.toFixed(4)}`}
          sub="Toàn bộ lịch sử"
          accent="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* AI Usage By Type */}
        <div className="bg-white rounded-2xl border border-surface-container-high shadow-card p-5">
          <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-500" />AI Usage theo loại request
          </h3>
          {(stats.aiRequestsByType || []).length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-8">Chưa có dữ liệu AI request.</p>
          ) : (
            <div className="space-y-3">
              {stats.aiRequestsByType.map(r => (
                <div key={r.requestType}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-on-surface capitalize">{r.requestType}</span>
                    <span className="text-on-surface-variant text-xs">{r.count} lần · ${r.totalCost.toFixed(4)}</span>
                  </div>
                  <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-primary transition-all"
                      style={{ width: `${(r.count / maxAiCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tenants By Plan */}
        <div className="bg-white rounded-2xl border border-surface-container-high shadow-card p-5">
          <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />Phân bổ Gói Dịch vụ
          </h3>
          {(stats.tenantsByPlan || []).length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-8">Chưa có dữ liệu.</p>
          ) : (
            <div className="space-y-3">
              {stats.tenantsByPlan.map((p, i) => {
                const colors = ["bg-primary", "bg-indigo-500", "bg-violet-500", "bg-amber-500", "bg-emerald-500"];
                const maxCount = Math.max(...stats.tenantsByPlan.map(t => t.count), 1);
                return (
                  <div key={p.planName}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-on-surface">{p.planName || "Chưa có gói"}</span>
                      <span className="text-on-surface-variant text-xs font-semibold">{p.count} tenant</span>
                    </div>
                    <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                      <div className={`h-2 rounded-full ${colors[i % colors.length]} transition-all`}
                        style={{ width: `${(p.count / maxCount) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent AI Requests */}
      <div className="bg-white rounded-2xl border border-surface-container-high shadow-card overflow-hidden">
        <div className="p-5 border-b border-surface-container-low flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-on-surface">AI Requests Gần Nhất</h3>
        </div>
        {(stats.recentAiRequests || []).length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-10">Chưa có dữ liệu.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-low border-b border-surface-container-high">
                  <th className="p-3 text-left">Loại</th>
                  <th className="p-3 text-left">Model</th>
                  <th className="p-3 text-right">Tokens</th>
                  <th className="p-3 text-right">Chi phí</th>
                  <th className="p-3 text-right">Thời gian</th>
                  <th className="p-3 text-right">Thời điểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {stats.recentAiRequests.map(r => (
                  <tr key={r.id} className="hover:bg-surface-container-low/50">
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-violet-50 text-violet-600 rounded-full text-xs font-semibold capitalize">{r.requestType}</span>
                    </td>
                    <td className="p-3 text-on-surface-variant text-xs">{r.modelName}</td>
                    <td className="p-3 text-right font-mono text-xs text-on-surface">{r.totalTokens.toLocaleString()}</td>
                    <td className="p-3 text-right text-xs font-semibold text-amber-600">${r.cost.toFixed(6)}</td>
                    <td className="p-3 text-right text-xs text-on-surface-variant">
                      <span className="flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />{r.durationMs}ms
                      </span>
                    </td>
                    <td className="p-3 text-right text-xs text-on-surface-variant">
                      {new Date(r.timestamp).toLocaleString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
