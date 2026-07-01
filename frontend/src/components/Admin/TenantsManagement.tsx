"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Building2, Plus, Search, RefreshCw, CheckCircle, XCircle,
  Loader2, ChevronDown, Shield, ToggleLeft, ToggleRight, Gem, UserPlus, Eye, AlertTriangle, Clock
} from "lucide-react";

interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  durationMonths: number;
}

interface User {
  id: string;
  username: string;
  fullname: string;
  role: string;
}

interface Tenant {
  id: string;
  name: string;
  ownerName: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  isActive: boolean;
  isApproved?: boolean;
  createdAt: string;
  subscriptionPlanId?: number;
  subscriptionPlan?: SubscriptionPlan;
  pendingSubscriptionPlanId?: number;
  pendingSubscriptionPlan?: SubscriptionPlan;
  users?: User[];
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

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export default function TenantsManagement() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [pendingTenants, setPendingTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; ok: boolean } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTenantForView, setSelectedTenantForView] = useState<Tenant | null>(null);
  const [changePlanId, setChangePlanId] = useState<string | null>(null);
  const [selectedPlanForChange, setSelectedPlanForChange] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeView, setActiveView] = useState<"approved" | "pending">("approved");
  
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "approve" | "reject" | "approveUpgrade" | "rejectUpgrade";
    tenantId: string;
    tenantName: string;
    targetPlanName?: string;
  } | null>(null);

  const [form, setForm] = useState({
    name: "", ownerName: "", ownerEmail: "", ownerPassword: "owner123",
    phone: "", address: "", taxCode: "", subscriptionPlanId: "",
  });

  const showToast = (message: string, ok = true) => {
    setToast({ message, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/tenants`, { headers: authHeaders() });
      if (res.ok) setTenants(await res.json());
      else showToast("Không thể tải danh sách doanh nghiệp.", false);
    } catch {
      showToast("Lỗi kết nối máy chủ.", false);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingTenants = useCallback(async () => {
    try {
      const res = await fetch(`${API}/tenants/pending`, { headers: authHeaders() });
      if (res.ok) setPendingTenants(await res.json());
    } catch {
      /* ignore */
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch(`${API}/subscriptionplans`, { headers: authHeaders() });
      if (res.ok) setPlans(await res.json());
    } catch { /* ignore */ }
  }, []);

  const reloadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchTenants(), fetchPendingTenants(), fetchPlans()]);
    setLoading(false);
  }, [fetchTenants, fetchPendingTenants, fetchPlans]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        ...form,
        subscriptionPlanId: form.subscriptionPlanId ? parseInt(form.subscriptionPlanId) : null,
      };
      const res = await fetch(`${API}/tenants`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✅ Đã tạo doanh nghiệp "${data.name}" thành công!`);
        setShowModal(false);
        setForm({ name: "", ownerName: "", ownerEmail: "", ownerPassword: "owner123", phone: "", address: "", taxCode: "", subscriptionPlanId: "" });
        reloadData();
      } else {
        showToast(data.message || "Lỗi khi tạo doanh nghiệp.", false);
      }
    } catch {
      showToast("Lỗi kết nối máy chủ.", false);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`${API}/tenants/${id}/status`, {
        method: "PUT",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        setTenants(prev => prev.map(t => t.id === id ? { ...t, isActive: data.isActive } : t));
        showToast(data.isActive ? "Đã kích hoạt doanh nghiệp." : "Đã tạm ngưng doanh nghiệp và khóa tất cả tài khoản người dùng.");
      } else {
        showToast(data.message || "Lỗi khi cập nhật trạng thái.", false);
      }
    } catch {
      showToast("Lỗi kết nối máy chủ.", false);
    }
  };

  const handleChangePlan = async () => {
    if (!changePlanId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/tenants/${changePlanId}/change-subscription`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(selectedPlanForChange),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Đã cập nhật gói dịch vụ thành công.");
        setChangePlanId(null);
        reloadData();
      } else {
        showToast(data.message || "Lỗi khi đổi gói.", false);
      }
    } catch {
      showToast("Lỗi kết nối.", false);
    } finally {
      setSubmitting(false);
    }
  };

  const requestApprove = (id: string, name: string) => {
    setConfirmDialog({ open: true, type: "approve", tenantId: id, tenantName: name });
  };

  const requestReject = (id: string, name: string) => {
    setConfirmDialog({ open: true, type: "reject", tenantId: id, tenantName: name });
  };

  const requestApproveUpgrade = (id: string, name: string, planName: string) => {
    setConfirmDialog({ open: true, type: "approveUpgrade", tenantId: id, tenantName: name, targetPlanName: planName });
  };

  const requestRejectUpgrade = (id: string, name: string, planName: string) => {
    setConfirmDialog({ open: true, type: "rejectUpgrade", tenantId: id, tenantName: name, targetPlanName: planName });
  };

  const executeConfirm = async () => {
    if (!confirmDialog) return;
    const { type, tenantId, tenantName, targetPlanName } = confirmDialog;
    setConfirmDialog(null);

    if (type === "approve") {
      try {
        const res = await fetch(`${API}/tenants/${tenantId}/approve`, {
          method: "POST",
          headers: authHeaders(),
        });
        if (res.ok) {
          showToast(`✅ Đã phê duyệt doanh nghiệp "${tenantName}" thành công!`);
          reloadData();
        } else {
          const data = await res.json();
          showToast(data.message || "Lỗi khi phê duyệt doanh nghiệp.", false);
        }
      } catch {
        showToast("Lỗi kết nối máy chủ.", false);
      }
    } else if (type === "reject") {
      try {
        const res = await fetch(`${API}/tenants/${tenantId}/reject`, {
          method: "POST",
          headers: authHeaders(),
        });
        if (res.ok) {
          showToast(`❌ Đã từ chối yêu cầu của "${tenantName}".`);
          reloadData();
        } else {
          const data = await res.json();
          showToast(data.message || "Lỗi khi từ chối doanh nghiệp.", false);
        }
      } catch {
        showToast("Lỗi kết nối máy chủ.", false);
      }
    } else if (type === "approveUpgrade") {
      try {
        const res = await fetch(`${API}/tenants/${tenantId}/approve-upgrade`, {
          method: "POST",
          headers: authHeaders(),
        });
        if (res.ok) {
          showToast(`✅ Đã phê duyệt nâng cấp lên gói "${targetPlanName}" cho "${tenantName}"!`);
          reloadData();
        } else {
          const data = await res.json();
          showToast(data.message || "Lỗi khi phê duyệt nâng cấp.", false);
        }
      } catch {
        showToast("Lỗi kết nối máy chủ.", false);
      }
    } else if (type === "rejectUpgrade") {
      try {
        const res = await fetch(`${API}/tenants/${tenantId}/reject-upgrade`, {
          method: "POST",
          headers: authHeaders(),
        });
        if (res.ok) {
          showToast(`❌ Đã hủy yêu cầu nâng cấp gói của "${tenantName}".`);
          reloadData();
        } else {
          const data = await res.json();
          showToast(data.message || "Lỗi khi hủy yêu cầu nâng cấp.", false);
        }
      } catch {
        showToast("Lỗi kết nối máy chủ.", false);
      }
    }
  };

  const filtered = tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  const pendingFiltered = pendingTenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium transition-all ${toast.ok ? "bg-emerald-600 text-white" : "bg-error text-white"}`}>
          {toast.ok ? <CheckCircle className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-on-surface">Quản lý Doanh nghiệp (Tenants)</h2>
            <p className="text-sm text-on-surface-variant">
              {activeView === "approved" 
                ? `${tenants.length} doanh nghiệp hoạt động` 
                : `${pendingTenants.length} yêu cầu đang chờ duyệt`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={reloadData} title="Tải lại" className="p-2 rounded-lg border border-surface-container-high hover:bg-surface-container-low text-on-surface-variant bg-white">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Đăng ký Doanh nghiệp mới
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-container-high bg-white rounded-t-xl px-2">
        <button
          onClick={() => setActiveView("approved")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeView === "approved"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Doanh nghiệp hoạt động ({tenants.length})
        </button>
        <button
          onClick={() => setActiveView("pending")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeView === "pending"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Yêu cầu chờ duyệt
          {pendingTenants.length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-error text-white rounded-full font-bold">
              {pendingTenants.length}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          type="text"
          placeholder="Tìm kiếm doanh nghiệp hoặc chủ sở hữu..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-surface-container-high rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-surface-container-high shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-on-surface-variant gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm">Đang tải danh sách...</span>
          </div>
        ) : activeView === "approved" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-surface-container-high text-xs font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-low">
                  <th className="p-4 text-left">Tên Doanh nghiệp</th>
                  <th className="p-4 text-left">Chủ sở hữu</th>
                  <th className="p-4 text-left">Gói dịch vụ</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-right">Ngày đăng ký</th>
                  <th className="p-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-16 text-center text-on-surface-variant text-sm">Không có dữ liệu</td></tr>
                ) : filtered.map(t => (
                  <tr key={t.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4">
                      <div 
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => setSelectedTenantForView(t)}
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-all">
                          <Building2 className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface group-hover:text-primary transition-colors">{t.name}</p>
                          {t.taxCode && <p className="text-xs text-on-surface-variant">MST: {t.taxCode}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-on-surface">{t.ownerName}</p>
                      {t.phone && <p className="text-xs text-on-surface-variant">{t.phone}</p>}
                    </td>
                    <td className="p-4">
                      {changePlanId === t.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedPlanForChange ?? ""}
                            onChange={e => setSelectedPlanForChange(e.target.value ? parseInt(e.target.value) : null)}
                            className="text-xs border border-surface-container-high rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            <option value="">-- Không có gói --</option>
                            {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                          <button onClick={handleChangePlan} disabled={submitting} className="text-xs px-2 py-1 bg-primary text-white rounded-lg hover:bg-primary/90">
                            {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Lưu"}
                          </button>
                          <button onClick={() => setChangePlanId(null)} className="text-xs px-2 py-1 border border-surface-container-high rounded-lg hover:bg-surface-container-low text-on-surface-variant">Hủy</button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <button
                            onClick={() => { setChangePlanId(t.id); setSelectedPlanForChange(t.subscriptionPlanId ?? null); }}
                            className="group flex items-center gap-1.5 hover:text-primary transition-colors"
                          >
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${t.subscriptionPlan ? "bg-primary/10 text-primary" : "bg-surface-container text-on-surface-variant"}`}>
                              <Gem className="w-3.5 h-3.5 inline mr-1" />
                              {t.subscriptionPlan?.name ?? "Chưa có gói"}
                            </span>
                          </button>
                          {t.pendingSubscriptionPlan && (
                            <div className="flex items-center gap-1">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5 animate-pulse" />
                                Lên {t.pendingSubscriptionPlan.name}
                              </span>
                              <div className="flex items-center gap-0.5 shrink-0">
                                <button
                                  onClick={() => requestApproveUpgrade(t.id, t.name, t.pendingSubscriptionPlan!.name)}
                                  title="Duyệt nâng cấp"
                                  className="p-0.5 rounded hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 transition-colors"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => requestRejectUpgrade(t.id, t.name, t.pendingSubscriptionPlan!.name)}
                                  title="Từ chối nâng cấp"
                                  className="p-0.5 rounded hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`flex items-center justify-center gap-1.5 text-xs font-semibold ${t.isActive ? "text-emerald-600" : "text-error"}`}>
                        <span className={`w-2 h-2 rounded-full ${t.isActive ? "bg-emerald-500" : "bg-error"}`} />
                        {t.isActive ? "Đang hoạt động" : "Tạm ngưng"}
                      </span>
                    </td>
                    <td className="p-4 text-right text-xs text-on-surface-variant">
                      {new Date(t.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedTenantForView(t)}
                          title="Xem chi tiết"
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(t.id, t.isActive)}
                          title={t.isActive ? "Tạm ngưng" : "Kích hoạt"}
                          className={`p-1.5 rounded-lg transition-all ${t.isActive ? "hover:bg-error/10 text-on-surface-variant hover:text-error" : "hover:bg-emerald-50 text-on-surface-variant hover:text-emerald-600"}`}
                        >
                          {t.isActive ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-surface-container-high text-xs font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-low">
                  <th className="p-4 text-left">Tên Doanh nghiệp / Cửa hàng</th>
                  <th className="p-4 text-left">Chủ sở hữu</th>
                  <th className="p-4 text-left">Địa chỉ</th>
                  <th className="p-4 text-left">Gói đăng ký</th>
                  <th className="p-4 text-right">Ngày gửi</th>
                  <th className="p-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {pendingFiltered.length === 0 ? (
                  <tr><td colSpan={6} className="py-16 text-center text-on-surface-variant text-sm">Không có yêu cầu đăng ký chờ duyệt</td></tr>
                ) : pendingFiltered.map(t => (
                  <tr key={t.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4">
                      <div 
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => setSelectedTenantForView(t)}
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-all">
                          <Building2 className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface group-hover:text-primary transition-colors">{t.name}</p>
                          {t.taxCode && <p className="text-xs text-on-surface-variant">MST: {t.taxCode}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-on-surface">{t.ownerName}</p>
                      {t.phone && <p className="text-xs text-on-surface-variant">{t.phone}</p>}
                    </td>
                    <td className="p-4 text-on-surface-variant text-xs max-w-[200px] truncate" title={t.address}>
                      {t.address || "—"}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${t.subscriptionPlan ? "bg-primary/10 text-primary" : "bg-surface-container text-on-surface-variant"}`}>
                        <Gem className="w-3.5 h-3.5 inline mr-1" />
                        {t.subscriptionPlan?.name ?? "Chưa có gói"}
                      </span>
                    </td>
                    <td className="p-4 text-right text-xs text-on-surface-variant">
                      {new Date(t.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedTenantForView(t)}
                          title="Xem chi tiết"
                          className="flex items-center gap-1 px-2.5 py-1.5 border border-surface-container-high hover:bg-surface-container-low text-on-surface-variant hover:text-primary rounded-lg text-xs font-semibold transition-all bg-transparent"
                        >
                          <Eye className="w-3.5 h-3.5" /> Chi tiết
                        </button>
                        <button
                          onClick={() => requestApprove(t.id, t.name)}
                          className="flex items-center justify-center gap-1 min-w-[72px] px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-emerald-600/20"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Duyệt
                        </button>
                        <button
                          onClick={() => requestReject(t.id, t.name)}
                          className="flex items-center justify-center gap-1 min-w-[72px] px-2.5 py-1.5 bg-error hover:bg-error/90 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-error/20"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Từ chối
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Tenant Details Modal */}
      {selectedTenantForView && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setSelectedTenantForView(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-gradient-to-r from-primary to-primary/80 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Chi tiết Doanh nghiệp</h3>
                      <p className="text-xs text-white/85">
                        Trạng thái: {selectedTenantForView.isApproved ? "Đã duyệt & hoạt động" : "Đang chờ phê duyệt"}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedTenantForView(null)}
                    className="text-white/80 hover:text-white text-xl font-bold p-1 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                
                {/* Doanh nghiệp */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-surface-container-high pb-1.5">
                    Thông tin doanh nghiệp
                  </h4>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                    <div className="col-span-2">
                      <span className="text-[11px] text-on-surface-variant block font-medium">Tên doanh nghiệp / Cửa hàng</span>
                      <span className="font-semibold text-on-surface text-base">{selectedTenantForView.name}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-on-surface-variant block font-medium">Mã số thuế</span>
                      <span className="font-semibold text-on-surface">{selectedTenantForView.taxCode || "Chưa cung cấp"}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-on-surface-variant block font-medium">Số điện thoại liên hệ</span>
                      <span className="font-semibold text-on-surface">{selectedTenantForView.phone || "Chưa cung cấp"}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[11px] text-on-surface-variant block font-medium">Địa chỉ kinh doanh</span>
                      <span className="font-semibold text-on-surface">{selectedTenantForView.address || "Chưa cung cấp"}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-on-surface-variant block font-medium">Ngày đăng ký</span>
                      <span className="font-semibold text-on-surface">
                        {new Date(selectedTenantForView.createdAt).toLocaleDateString("vi-VN")} {new Date(selectedTenantForView.createdAt).toLocaleTimeString("vi-VN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-on-surface-variant block font-medium">Gói dịch vụ</span>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="font-semibold text-primary">
                          {selectedTenantForView.subscriptionPlan?.name || "Chưa có gói"}
                        </span>
                        {selectedTenantForView.pendingSubscriptionPlan && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-500" />
                            Đang chờ nâng cấp lên: {selectedTenantForView.pendingSubscriptionPlan.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tài khoản chủ sở hữu */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-surface-container-high pb-1.5">
                    Thông tin tài khoản chủ sở hữu
                  </h4>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                    <div>
                      <span className="text-[11px] text-on-surface-variant block font-medium">Họ và tên chủ hộ KD</span>
                      <span className="font-semibold text-on-surface">{selectedTenantForView.ownerName}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-on-surface-variant block font-medium">Email / Tên đăng nhập</span>
                      <span className="font-semibold text-on-surface text-primary select-all">
                        {(() => {
                          const users = selectedTenantForView.users;
                          if (!users || users.length === 0) return "Không có dữ liệu";
                          const owner = users.find((u: User) => u.role === "Owner") || users[0];
                          return owner.username;
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
              <div className="flex justify-end gap-3 p-4 bg-surface-container-low border-t border-surface-container-high">
                <button 
                  type="button" 
                  onClick={() => setSelectedTenantForView(null)} 
                  className="px-4 py-2 rounded-xl border border-surface-container-high text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low transition-all bg-white mr-auto"
                >
                  Đóng
                </button>
                {selectedTenantForView.isApproved && selectedTenantForView.pendingSubscriptionPlan && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        requestRejectUpgrade(selectedTenantForView.id, selectedTenantForView.name, selectedTenantForView.pendingSubscriptionPlan!.name);
                        setSelectedTenantForView(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-error hover:bg-error/90 text-white text-sm font-semibold hover:shadow-md transition-all shadow-md shadow-error/20"
                    >
                      Từ chối Nâng cấp
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        requestApproveUpgrade(selectedTenantForView.id, selectedTenantForView.name, selectedTenantForView.pendingSubscriptionPlan!.name);
                        setSelectedTenantForView(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold hover:shadow-md transition-all shadow-md shadow-emerald-600/20"
                    >
                      Duyệt Nâng cấp
                    </button>
                  </>
                )}
                {!selectedTenantForView.isApproved && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        requestReject(selectedTenantForView.id, selectedTenantForView.name);
                        setSelectedTenantForView(null);
                      }}
                      className="min-w-[100px] text-center px-4 py-2 rounded-xl bg-error hover:bg-error/90 text-white text-sm font-semibold hover:shadow-md transition-all shadow-md shadow-error/20"
                    >
                      Từ chối
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        requestApprove(selectedTenantForView.id, selectedTenantForView.name);
                        setSelectedTenantForView(null);
                      }}
                      className="min-w-[100px] text-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold hover:shadow-md transition-all shadow-md shadow-emerald-600/20"
                    >
                      Phê duyệt
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create Tenant Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Đăng ký Doanh nghiệp Mới</h3>
                    <p className="text-sm text-white/80">Tạo tenant và tài khoản chủ sở hữu tự động</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Tên Doanh nghiệp *</label>
                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Cửa hàng Tạp hóa Bình An" className="w-full border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Tên Chủ sở hữu *</label>
                      <input required value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })}
                        placeholder="Nguyễn Văn A" className="w-full border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Mã số thuế</label>
                      <input value={form.taxCode} onChange={e => setForm({ ...form, taxCode: e.target.value })}
                        placeholder="0123456789" className="w-full border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Email chủ sở hữu (dùng để đăng nhập) *</label>
                    <input required type="email" value={form.ownerEmail} onChange={e => setForm({ ...form, ownerEmail: e.target.value })}
                      placeholder="owner@example.com" className="w-full border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Mật khẩu ban đầu</label>
                    <input value={form.ownerPassword} onChange={e => setForm({ ...form, ownerPassword: e.target.value })}
                      className="w-full border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Số điện thoại</label>
                      <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                        placeholder="0901234567" className="w-full border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Gói dịch vụ</label>
                      <select value={form.subscriptionPlanId} onChange={e => setForm({ ...form, subscriptionPlanId: e.target.value })}
                        className="w-full border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                        <option value="">Chưa có gói</option>
                        {plans.map(p => <option key={p.id} value={p.id}>{p.name} — {p.price.toLocaleString("vi-VN")}đ/tháng</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Địa chỉ</label>
                    <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                      placeholder="123 Đường số 1, Quận 1, TP.HCM" className="w-full border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2 border-t border-surface-container-low">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-surface-container-high text-sm font-medium text-on-surface-variant hover:bg-surface-container-low">Hủy</button>
                  <button type="submit" disabled={submitting} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-60">
                    <Shield className="w-4 h-4" />
                    Tạo Doanh nghiệp
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Custom Confirmation Dialog */}
      {confirmDialog && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" onClick={() => setConfirmDialog(null)} />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className={`p-5 flex items-center gap-4 ${
                (confirmDialog.type === "approve" || confirmDialog.type === "approveUpgrade") 
                  ? "bg-emerald-50 border-b border-emerald-100" 
                  : "bg-red-50 border-b border-red-100"
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  (confirmDialog.type === "approve" || confirmDialog.type === "approveUpgrade") 
                    ? "bg-emerald-100" 
                    : "bg-red-100"
                }`}>
                  {(confirmDialog.type === "approve" || confirmDialog.type === "approveUpgrade") 
                    ? <CheckCircle className="w-6 h-6 text-emerald-600" />
                    : <AlertTriangle className="w-6 h-6 text-error" />
                  }
                </div>
                <div>
                  <h3 className={`text-base font-bold ${
                    (confirmDialog.type === "approve" || confirmDialog.type === "approveUpgrade") ? "text-emerald-800" : "text-red-800"
                  }`}>
                    {confirmDialog.type === "approve" && "Xác nhận Phê duyệt"}
                    {confirmDialog.type === "approveUpgrade" && "Xác nhận Nâng cấp"}
                    {confirmDialog.type === "reject" && "Xác nhận Từ chối"}
                    {confirmDialog.type === "rejectUpgrade" && "Từ chối Nâng cấp"}
                  </h3>
                  <p className="text-sm text-on-surface-variant mt-0.5">
                    {confirmDialog.type === "approve" && <>Bạn có chắc chắn muốn <strong className="text-emerald-700">PHÊ DUYỆT</strong> yêu cầu tạo tài khoản cho doanh nghiệp:</>}
                    {confirmDialog.type === "approveUpgrade" && <>Bạn có chắc chắn muốn <strong className="text-emerald-700">PHÊ DUYỆT NÂNG CẤP</strong> lên gói <strong className="text-primary">{confirmDialog.targetPlanName}</strong> cho:</>}
                    {confirmDialog.type === "reject" && <>Bạn có chắc chắn muốn <strong className="text-red-700">TỪ CHỐI</strong> và xóa yêu cầu đăng ký của doanh nghiệp:</>}
                    {confirmDialog.type === "rejectUpgrade" && <>Bạn có chắc chắn muốn <strong className="text-red-700">TỪ CHỐI YÊU CẦU NÂNG CẤP</strong> gói dịch vụ của:</>}
                  </p>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <p className="font-bold text-on-surface text-base">{confirmDialog.tenantName}</p>
                </div>
                {(confirmDialog.type === "reject" || confirmDialog.type === "rejectUpgrade") && (
                  <p className="text-xs text-error/80 mt-3 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Hành động này sẽ hủy yêu cầu và không thể hoàn tác.
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3 p-4 bg-surface-container-low border-t border-surface-container-high">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 rounded-xl border border-surface-container-high text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low transition-all bg-white"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={executeConfirm}
                  className={`min-w-[120px] text-center px-4 py-2 rounded-xl text-white text-sm font-bold transition-all shadow-md ${
                    (confirmDialog.type === "approve" || confirmDialog.type === "approveUpgrade")
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                      : "bg-error hover:bg-error/90 shadow-error/20"
                  }`}
                >
                  {(confirmDialog.type === "approve" || confirmDialog.type === "approveUpgrade") ? "Xác nhận Phê duyệt" : "Xác nhận Từ chối"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
