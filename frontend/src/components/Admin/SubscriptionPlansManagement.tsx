"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Gem, Plus, Pencil, Trash2, CheckCircle, XCircle, Loader2, X,
  Infinity, ShoppingCart, Package, BarChart3, Bot, FileText, Store, CreditCard
} from "lucide-react";

interface Plan {
  id: number;
  name: string;
  price: number;
  durationMonths: number;
  maxOrdersPerMonth: number | null;
  features: string | null;  // JSON array string e.g. '["pos","inventory","ai"]'
  description?: string;
}

const FEATURE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  pos:          { label: "POS bán hàng",     icon: <ShoppingCart className="w-3 h-3" /> },
  inventory:    { label: "Quản lý kho",      icon: <Package className="w-3 h-3" /> },
  reports:      { label: "Báo cáo",          icon: <BarChart3 className="w-3 h-3" /> },
  debt_tracking:{ label: "Công nợ",          icon: <CreditCard className="w-3 h-3" /> },
  ai:           { label: "Trợ lý AI",        icon: <Bot className="w-3 h-3" /> },
  tt88:         { label: "Báo cáo TT88",     icon: <FileText className="w-3 h-3" /> },
  multi_store:  { label: "Nhiều chi nhánh",  icon: <Store className="w-3 h-3" /> },
};

const PLAN_GRADIENTS: Record<number, string> = {
  1: "from-violet-600 to-purple-700",   // Chuyên Nghiệp
  2: "from-teal-500 to-emerald-600",    // Miễn Phí
  3: "from-blue-500 to-indigo-600",     // Cơ Bản
};

const API = "http://localhost:5178/api";

function getToken() {
  if (typeof window === "undefined") return "";
  try { return JSON.parse(localStorage.getItem("bizflow_user") || "{}").token || ""; } catch { return ""; }
}

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const emptyForm = () => ({
  name: "",
  price: 0,
  durationMonths: 1,
  maxOrdersPerMonth: 100,
  features: '["pos","inventory"]',
  description: "",
});

function parseFeatures(raw: string | null): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export default function SubscriptionPlansManagement() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; ok: boolean } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const showToast = (message: string, ok = true) => {
    setToast({ message, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/subscriptionplans`, { headers: authHeaders() });
      if (res.ok) setPlans(await res.json());
    } catch { showToast("Lỗi kết nối.", false); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const openCreate = () => {
    setEditingPlan(null);
    setForm(emptyForm());
    setShowModal(true);
  };

  const openEdit = (p: Plan) => {
    setEditingPlan(p);
    setForm({
      name: p.name,
      price: p.price,
      durationMonths: p.durationMonths,
      maxOrdersPerMonth: p.maxOrdersPerMonth ?? 0,
      features: p.features ?? '["pos","inventory"]',
      description: p.description ?? "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        maxOrdersPerMonth: form.maxOrdersPerMonth === 0 ? null : form.maxOrdersPerMonth,
        id: editingPlan?.id ?? 0,
      };
      const url = editingPlan ? `${API}/subscriptionplans/${editingPlan.id}` : `${API}/subscriptionplans`;
      const method = editingPlan ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) {
        showToast(editingPlan ? "Đã cập nhật gói dịch vụ." : "Đã tạo gói dịch vụ mới.");
        setShowModal(false);
        fetchPlans();
      } else {
        showToast(data.message || "Lỗi khi lưu gói.", false);
      }
    } catch { showToast("Lỗi kết nối.", false); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API}/subscriptionplans/${id}`, { method: "DELETE", headers: authHeaders() });
      if (res.ok) {
        showToast("Đã xóa gói dịch vụ.");
        setDeleteId(null);
        fetchPlans();
      } else {
        const data = await res.json();
        showToast(data.message || "Lỗi khi xóa.", false);
        setDeleteId(null);
      }
    } catch { showToast("Lỗi kết nối.", false); }
  };

  const isFree = (p: Plan) => p.price === 0;
  const gradient = (p: Plan) => PLAN_GRADIENTS[p.id] ?? "from-slate-500 to-slate-700";

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium ${toast.ok ? "bg-emerald-600 text-white" : "bg-error text-white"}`}>
          {toast.ok ? <CheckCircle className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Gem className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-on-surface">Gói Dịch Vụ</h2>
            <p className="text-sm text-on-surface-variant">{plans.length} gói đang có</p>
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
          <Plus className="w-4 h-4" />Thêm gói mới
        </button>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-on-surface-variant">
          <Loader2 className="w-5 h-5 animate-spin text-primary" /><span className="text-sm">Đang tải...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map(p => {
            const features = parseFeatures(p.features);
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-surface-container-high shadow-card overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-200">
                {/* Card header with gradient */}
                <div className={`bg-gradient-to-br ${gradient(p)} p-5 text-white relative overflow-hidden`}>
                  {/* Decorative circle */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
                  <div className="absolute -bottom-6 -right-2 w-16 h-16 rounded-full bg-white/5" />

                  <div className="relative flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Gem className="w-4 h-4 opacity-80" />
                        <h3 className="text-base font-bold">{p.name}</h3>
                      </div>
                      {isFree(p) ? (
                        <p className="text-3xl font-extrabold mt-2">Miễn phí</p>
                      ) : (
                        <>
                          <p className="text-3xl font-extrabold mt-2">
                            {p.price.toLocaleString("vi-VN")}<span className="text-sm font-normal">đ</span>
                          </p>
                          <p className="text-xs text-white/70 mt-0.5">
                            /{p.durationMonths > 0 ? `${p.durationMonths} tháng` : "vĩnh viễn"}
                          </p>
                        </>
                      )}
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 shrink-0">
                      {isFree(p) ? "FREE" : p.durationMonths === 12 ? "YEARLY" : "MONTHLY"}
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5 flex-1 space-y-4">
                  {p.description && (
                    <p className="text-on-surface-variant text-xs leading-relaxed">{p.description}</p>
                  )}

                  {/* Giới hạn đơn hàng */}
                  <div className="flex items-center gap-2 bg-surface-container-low rounded-xl px-3 py-2.5">
                    <ShoppingCart className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm text-on-surface font-medium">
                      {p.maxOrdersPerMonth == null ? (
                        <span className="flex items-center gap-1">Không giới hạn đơn/tháng <Infinity className="w-3.5 h-3.5 text-primary" /></span>
                      ) : (
                        `Tối đa ${p.maxOrdersPerMonth} đơn/tháng`
                      )}
                    </span>
                  </div>

                  {/* Feature chips */}
                  {features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {features.map(f => {
                        const meta = FEATURE_LABELS[f];
                        return (
                          <span key={f} className="flex items-center gap-1 px-2 py-0.5 bg-primary/8 text-primary rounded-full text-[10px] font-semibold">
                            {meta?.icon}
                            {meta?.label ?? f}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-5 pb-5 flex gap-2">
                  <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-surface-container-high text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors">
                    <Pencil className="w-3.5 h-3.5" />Sửa
                  </button>
                  <button onClick={() => setDeleteId(p.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-error/20 text-sm font-medium text-error hover:bg-error/5 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />Xóa
                  </button>
                </div>
              </div>
            );
          })}
          {plans.length === 0 && !loading && (
            <div className="col-span-3 py-20 text-center text-on-surface-variant text-sm">
              Chưa có gói dịch vụ nào. Nhấn "Thêm gói mới" để bắt đầu.
            </div>
          )}
        </div>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDeleteId(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
              <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-error" />
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">Xác nhận xóa gói?</h3>
              <p className="text-sm text-on-surface-variant mb-6">Các doanh nghiệp đang dùng gói này sẽ không bị ảnh hưởng, nhưng gói sẽ không còn áp dụng được cho tenant mới.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-surface-container-high rounded-xl text-sm font-medium hover:bg-surface-container-low">Hủy</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 bg-error text-white rounded-xl text-sm font-semibold hover:bg-error/90">Xóa</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary/80 p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Gem className="w-5 h-5" />
                  <h3 className="font-bold">{editingPlan ? "Chỉnh sửa gói" : "Tạo gói dịch vụ mới"}</h3>
                </div>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Tên gói *</label>
                  <input required type="text" placeholder="VD: Gói Cơ Bản"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Mô tả</label>
                  <input type="text" placeholder="Mô tả ngắn gói dịch vụ"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Giá (đồng) *</label>
                    <input required type="number" min="0"
                      value={form.price}
                      onChange={e => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                      className="w-full border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Số tháng *</label>
                    <input required type="number" min="0"
                      value={form.durationMonths}
                      onChange={e => setForm({ ...form, durationMonths: parseInt(e.target.value) || 0 })}
                      className="w-full border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">
                    Đơn hàng/tháng <span className="text-on-surface-variant/60 font-normal normal-case">(0 = không giới hạn)</span>
                  </label>
                  <input type="number" min="0"
                    value={form.maxOrdersPerMonth}
                    onChange={e => setForm({ ...form, maxOrdersPerMonth: parseInt(e.target.value) || 0 })}
                    className="w-full border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">
                    Tính năng <span className="text-on-surface-variant/60 font-normal normal-case">(JSON array)</span>
                  </label>
                  <input type="text" placeholder='["pos","inventory","reports","ai","tt88","multi_store"]'
                    value={form.features ?? ""}
                    onChange={e => setForm({ ...form, features: e.target.value })}
                    className="w-full border border-surface-container-high rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <p className="text-[10px] text-on-surface-variant mt-1">Các key hợp lệ: pos, inventory, reports, debt_tracking, ai, tt88, multi_store</p>
                </div>
                <div className="flex justify-end gap-3 pt-2 border-t border-surface-container-low">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-surface-container-high text-sm font-medium text-on-surface-variant hover:bg-surface-container-low">Hủy</button>
                  <button type="submit" disabled={submitting} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 shadow-md shadow-primary/20">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {editingPlan ? "Cập nhật" : "Tạo gói"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
