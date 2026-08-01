"use client";

import React, { useState, useCallback } from "react";
import { AlertTriangle, CheckCircle, Building2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tenant, SubscriptionPlan } from "./types";
import TenantsStats from "./TenantsStats";
import TenantsHeader from "./TenantsHeader";
import TenantsTable from "./TenantsTable";
import CreateTenantModal from "./CreateTenantModal";
import TenantDetailsModal from "./TenantDetailsModal";
import ManageSubscriptionModal from "./ManageSubscriptionModal";

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
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState<"approved" | "pending">("approved");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTenantForView, setSelectedTenantForView] = useState<Tenant | null>(null);
  const [managingSubscriptionTenant, setManagingSubscriptionTenant] = useState<Tenant | null>(null);



  const [toast, setToast] = useState<{ message: string; ok: boolean } | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "approve" | "reject" | "approveUpgrade" | "rejectUpgrade" | "toggleStatus";
    tenantId: string;
    tenantName: string;
    targetPlanName?: string;
    currentStatus?: boolean;
  } | null>(null);

  const showToast = useCallback((message: string, ok = true) => {
    setToast({ message, ok });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // --- Queries ---
  const { data: tenants = [], isLoading: isLoadingTenants } = useQuery<Tenant[]>({
    queryKey: ['tenants'],
    queryFn: async () => {
      const res = await fetch(`${API}/tenants`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Không thể tải danh sách doanh nghiệp");
      return res.json();
    },
    staleTime: 60000,
  });

  const { data: pendingTenants = [], isLoading: isLoadingPending } = useQuery<Tenant[]>({
    queryKey: ['pendingTenants'],
    queryFn: async () => {
      const res = await fetch(`${API}/tenants/pending`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Lỗi tải danh sách chờ duyệt");
      return res.json();
    },
    staleTime: 60000,
  });

  const { data: plans = [] } = useQuery<SubscriptionPlan[]>({
    queryKey: ['subscriptionPlans'],
    queryFn: async () => {
      const res = await fetch(`${API}/subscriptionplans`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Lỗi tải gói dịch vụ");
      return res.json();
    },
    staleTime: 600000,
  });

  // --- Mutations ---
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string, currentStatus: boolean }) => {
      const res = await fetch(`${API}/tenants/${id}/status`, {
        method: "PUT",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Lỗi kết nối");
      return { id, currentStatus };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      showToast(`Đã ${data.currentStatus ? "tạm ngưng" : "kích hoạt"} doanh nghiệp.`);
    },
    onError: () => {
      showToast("Lỗi kết nối.", false);
    }
  });

  const createTenantMutation = useMutation({
    mutationFn: async (form: any) => {
      const payload = {
        name: form.name,
        taxCode: form.taxCode,
        address: form.address,
        phone: form.phone,
        ownerName: form.ownerName,
        ownerEmail: form.ownerEmail,
        ownerPassword: form.ownerPassword,
        subscriptionPlanId: form.subscriptionPlanId ? parseInt(form.subscriptionPlanId) : null,
      };
      const res = await fetch(`${API}/tenants/register`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi khi tạo doanh nghiệp.");
      return data;
    },
    onSuccess: () => {
      showToast("Đã tạo doanh nghiệp mới thành công!");
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
    onError: (err: any) => {
      showToast(err.message, false);
    }
  });

  const changePlanMutation = useMutation({
    mutationFn: async ({ tenantId, planId }: { tenantId: string, planId: number | null }) => {
      const res = await fetch(`${API}/tenants/${tenantId}/change-subscription`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(planId)
      });
      if (!res.ok) throw new Error("Lỗi khi thay đổi gói cước.");
      return true;
    },
    onSuccess: () => {
      showToast("Đã đổi gói cước thành công!");
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
    onError: (err: any) => {
      showToast(err.message, false);
    }
  });

  const updateAdminMutation = useMutation({
    mutationFn: async ({ id, ownerName, phone }: { id: string, ownerName: string, phone: string }) => {
      const res = await fetch(`${API}/tenants/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ ownerName, phone }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Lỗi cập nhật.");
      }
    },
    onSuccess: () => {
      showToast("Cập nhật thông tin thành công!");
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
    onError: (err: any) => {
      showToast(err.message, false);
    }
  });

  const updateSubscriptionEndDateMutation = useMutation({
    mutationFn: async ({ id, newEndDate }: { id: string, newEndDate: string }) => {
      const res = await fetch(`${API}/tenants/${id}/subscription-end-date`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ endDate: newEndDate || null }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Lỗi cập nhật ngày hết hạn.");
      }
    },
    onSuccess: () => {
      showToast("Cập nhật thời hạn gói thành công!");
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
    onError: (err: any) => {
      showToast(err.message, false);
    }
  });

  const confirmActionMutation = useMutation({
    mutationFn: async () => {
      if (!confirmDialog) throw new Error("Missing confirm dialog data");
      let url = "";
      let method = "POST";
      
      if (confirmDialog.type === "approve") url = `${API}/tenants/${confirmDialog.tenantId}/approve`;
      else if (confirmDialog.type === "reject") url = `${API}/tenants/${confirmDialog.tenantId}/reject`;
      else if (confirmDialog.type === "approveUpgrade") url = `${API}/tenants/${confirmDialog.tenantId}/approve-upgrade`;
      else if (confirmDialog.type === "rejectUpgrade") url = `${API}/tenants/${confirmDialog.tenantId}/reject-upgrade`;
      else if (confirmDialog.type === "toggleStatus") {
        url = `${API}/tenants/${confirmDialog.tenantId}/status`;
        method = "PUT";
      }

      const res = await fetch(url, { method, headers: authHeaders() });
      if (!res.ok) throw new Error("Lỗi thao tác.");
    },
    onSuccess: () => {
      if (confirmDialog?.type === "toggleStatus") {
        showToast(`Đã ${confirmDialog.currentStatus ? "khóa" : "kích hoạt"} doanh nghiệp thành công!`);
      } else {
        showToast("Thao tác thành công!");
      }
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['pendingTenants'] });
      setConfirmDialog(null);
    },
    onError: (err: any) => {
      showToast(err.message, false);
      setConfirmDialog(null);
    }
  });

  // --- Handlers ---
  const handleCreate = async (form: any): Promise<boolean> => {
    try {
      await createTenantMutation.mutateAsync(form);
      return true;
    } catch {
      return false;
    }
  };

  // Handle change plan logic that returns a promise
  const handleChangePlan = async (tenantId: string, newPlanId: number | null): Promise<boolean> => {
    try {
      await changePlanMutation.mutateAsync({ tenantId, planId: newPlanId });
      // Update selectedTenantForView if open
      setSelectedTenantForView(prev => {
        if (!prev || prev.id !== tenantId) return prev;
        const newPlan = plans.find(p => p.id === newPlanId);
        return { ...prev, subscriptionPlanId: newPlanId ?? undefined, subscriptionPlan: newPlan };
      });
      return true;
    } catch {
      return false;
    }
  };

  const handleUpdateTenantAdmin = async (id: string, ownerName: string, phone: string): Promise<boolean> => {
    try {
      await updateAdminMutation.mutateAsync({ id, ownerName, phone });

      // Update selectedTenantForView local state immediately for better UX
      setSelectedTenantForView(prev => prev ? { ...prev, ownerName, ownerPhone: phone } : null);

      return true;
    } catch {
      return false;
    }
  };

  const handleUpdateSubscriptionEndDate = async (id: string, newEndDate: string): Promise<boolean> => {
    try {
      await updateSubscriptionEndDateMutation.mutateAsync({ id, newEndDate });

      // Update local state
      setSelectedTenantForView(prev => prev ? { ...prev, subscriptionEndDate: newEndDate || undefined } : null);

      return true;
    } catch {
      return false;
    }
  };

  const toggleStatus = useCallback((id: string, name: string, currentStatus: boolean) => {
    setConfirmDialog({ open: true, type: "toggleStatus", tenantId: id, tenantName: name, currentStatus });
  }, []);

  const requestApprove = useCallback((id: string, name: string) => {
    setConfirmDialog({ open: true, type: "approve", tenantId: id, tenantName: name });
  }, []);

  const requestReject = useCallback((id: string, name: string) => {
    setConfirmDialog({ open: true, type: "reject", tenantId: id, tenantName: name });
  }, []);

  const requestApproveUpgrade = useCallback((id: string, name: string, planName: string) => {
    setConfirmDialog({ open: true, type: "approveUpgrade", tenantId: id, tenantName: name, targetPlanName: planName });
  }, []);

  const requestRejectUpgrade = useCallback((id: string, name: string, planName: string) => {
    setConfirmDialog({ open: true, type: "rejectUpgrade", tenantId: id, tenantName: name, targetPlanName: planName });
  }, []);

  const executeConfirm = () => {
    confirmActionMutation.mutate();
  };

  const displayedTenants = activeView === "approved" ? tenants : pendingTenants;
  const isLoading = activeView === "approved" ? isLoadingTenants : isLoadingPending;

  const totalRevenue = tenants.reduce((acc, t) => acc + (t.totalSpent || 0), 0);
  const expiringSoonCount = tenants.filter(t => {
    if (!t.subscriptionEndDate) return false;
    const days = (new Date(t.subscriptionEndDate).getTime() - Date.now()) / (1000 * 3600 * 24);
    return days > 0 && days <= 30;
  }).length;
  const pendingCount = pendingTenants.length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-xl shadow-md border animate-in slide-in-from-right flex items-center gap-3 ${toast.ok ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-rose-50 border-rose-200 text-rose-900"
          }`}>
          {toast.ok ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <TenantsStats
          activeCount={tenants.length}
          totalRevenue={totalRevenue}
          pendingCount={pendingCount}
          expiringSoonCount={expiringSoonCount}
        />
      </div>

      {/* Header (Tabs, Search, Create Button) */}
      <TenantsHeader
        activeView={activeView}
        setActiveView={setActiveView}
        search={search}
        setSearch={setSearch}
        onOpenCreateModal={() => setShowCreateModal(true)}
      />

      {/* Table */}
      <TenantsTable
        tenants={tenants}
        activeView={activeView}
        loading={isLoadingTenants || isLoadingPending}
        search={search}
        onManageSubscription={(tenant) => setManagingSubscriptionTenant(tenant)}
        onRequestApproveUpgrade={requestApproveUpgrade}
        onRequestRejectUpgrade={requestRejectUpgrade}
        onSelectTenantForView={setSelectedTenantForView}
        onToggleStatus={toggleStatus}
        onRequestApprove={requestApprove}
        onRequestReject={requestReject}
      />

      {/* Modals */}
      {showCreateModal && (
        <CreateTenantModal
          plans={plans}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}

      <TenantDetailsModal
        tenant={selectedTenantForView}
        onClose={() => setSelectedTenantForView(null)}
        onUpdateAdmin={handleUpdateTenantAdmin}
        onUpdateSubscriptionEndDate={handleUpdateSubscriptionEndDate}
      />

      {managingSubscriptionTenant && (
        <ManageSubscriptionModal
          tenant={managingSubscriptionTenant}
          plans={plans}
          onClose={() => setManagingSubscriptionTenant(null)}
          onChangePlan={handleChangePlan}
          onUpdateSubscriptionEndDate={handleUpdateSubscriptionEndDate}
        />
      )}

      {/* Custom Confirmation Dialog */}
      {confirmDialog && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" onClick={() => setConfirmDialog(null)} />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className={`p-5 flex items-center gap-4 ${(confirmDialog.type === "approve" || confirmDialog.type === "approveUpgrade")
                  ? "bg-emerald-50 border-b border-emerald-100"
                  : confirmDialog.type === "toggleStatus"
                    ? "bg-amber-50 border-b border-amber-100"
                    : "bg-rose-50 border-b border-rose-100"
                }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${(confirmDialog.type === "approve" || confirmDialog.type === "approveUpgrade")
                    ? "bg-emerald-100"
                    : confirmDialog.type === "toggleStatus"
                      ? "bg-amber-100"
                      : "bg-rose-100"
                  }`}>
                  {(confirmDialog.type === "approve" || confirmDialog.type === "approveUpgrade")
                    ? <CheckCircle className="w-6 h-6 text-emerald-600" />
                    : <AlertTriangle className={`w-6 h-6 ${confirmDialog.type === "toggleStatus" ? "text-amber-600" : "text-rose-600"}`} />
                  }
                </div>
                <div>
                  <h3 className={`text-base font-bold ${(confirmDialog.type === "approve" || confirmDialog.type === "approveUpgrade") 
                      ? "text-emerald-800" 
                      : confirmDialog.type === "toggleStatus"
                        ? "text-amber-800"
                        : "text-rose-800"
                    }`}>
                    {confirmDialog.type === "approve" && "Xác nhận Phê duyệt"}
                    {confirmDialog.type === "approveUpgrade" && "Xác nhận Nâng cấp"}
                    {confirmDialog.type === "reject" && "Xác nhận Từ chối"}
                    {confirmDialog.type === "rejectUpgrade" && "Từ chối Nâng cấp"}
                    {confirmDialog.type === "toggleStatus" && (confirmDialog.currentStatus ? "Khóa hoạt động tài khoản" : "Mở khóa tài khoản")}
                  </h3>
                  <p className="text-sm text-slate-600 mt-0.5">
                    {confirmDialog.type === "approve" && <>Bạn có chắc chắn muốn <strong className="text-emerald-700">PHÊ DUYỆT</strong> yêu cầu tạo tài khoản cho doanh nghiệp:</>}
                    {confirmDialog.type === "approveUpgrade" && <>Bạn có chắc chắn muốn <strong className="text-emerald-700">PHÊ DUYỆT NÂNG CẤP</strong> lên gói <strong className="text-sky-700">{confirmDialog.targetPlanName}</strong> cho:</>}
                    {confirmDialog.type === "reject" && <>Bạn có chắc chắn muốn <strong className="text-rose-700">TỪ CHỐI</strong> và xóa yêu cầu đăng ký của doanh nghiệp:</>}
                    {confirmDialog.type === "rejectUpgrade" && <>Bạn có chắc chắn muốn <strong className="text-rose-700">TỪ CHỐI YÊU CẦU NÂNG CẤP</strong> gói dịch vụ của:</>}
                    {confirmDialog.type === "toggleStatus" && (confirmDialog.currentStatus 
                      ? <>Bạn có chắc chắn muốn <strong className="text-amber-700">KHÓA HOẠT ĐỘNG</strong> của doanh nghiệp:</>
                      : <>Bạn có chắc chắn muốn <strong className="text-emerald-700">MỞ KHÓA HOẠT ĐỘNG</strong> cho doanh nghiệp:</>
                    )}
                  </p>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-sky-700" />
                  </div>
                  <p className="font-bold text-slate-900 text-base">{confirmDialog.tenantName}</p>
                </div>
                {(confirmDialog.type === "reject" || confirmDialog.type === "rejectUpgrade" || (confirmDialog.type === "toggleStatus" && confirmDialog.currentStatus)) && (
                  <p className={`text-xs mt-3 flex items-center gap-1.5 ${confirmDialog.type === "toggleStatus" ? "text-amber-700/80" : "text-rose-600/80"}`}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {confirmDialog.type === "toggleStatus" 
                      ? "Khách hàng sẽ không thể đăng nhập vào hệ thống trong thời gian bị khóa."
                      : "Hành động này sẽ hủy yêu cầu và không thể hoàn tác."
                    }
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3 p-4 bg-slate-50 border-t border-slate-200">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors bg-white"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={executeConfirm}
                  disabled={confirmActionMutation.isPending}
                  className={`min-w-[120px] flex justify-center items-center px-4 py-2 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50 ${(confirmDialog.type === "approve" || confirmDialog.type === "approveUpgrade" || (confirmDialog.type === "toggleStatus" && !confirmDialog.currentStatus))
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : confirmDialog.type === "toggleStatus" && confirmDialog.currentStatus
                        ? "bg-amber-600 hover:bg-amber-700"
                        : "bg-rose-600 hover:bg-rose-700"
                    }`}
                >
                  {confirmActionMutation.isPending 
                    ? "Đang xử lý..." 
                    : confirmDialog.type === "approve" || confirmDialog.type === "approveUpgrade"
                      ? "Xác nhận Phê duyệt" 
                      : confirmDialog.type === "toggleStatus"
                        ? "Xác nhận"
                        : "Xác nhận Từ chối"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
