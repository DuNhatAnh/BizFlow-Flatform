"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Gem, Check, ArrowUpRight, ShieldCheck, Loader2, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";

interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  durationMonths: number;
  description?: string;
}

interface MySubscriptionStatus {
  currentPlan: SubscriptionPlan | null;
  pendingPlan: SubscriptionPlan | null;
  isActive: boolean;
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

export default function OwnerSubscription() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [mySub, setMySub] = useState<MySubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; ok: boolean } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<SubscriptionPlan | null>(null);

  const showToast = (message: string, ok = true) => {
    setToast({ message, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [plansRes, subRes] = await Promise.all([
        fetch(`${API}/subscriptionplans`, { headers: authHeaders() }),
        fetch(`${API}/subscriptionplans/my-subscription`, { headers: authHeaders() })
      ]);

      if (plansRes.ok && subRes.ok) {
        setPlans(await plansRes.json());
        setMySub(await subRes.json());
      } else {
        showToast("Không thể tải thông tin gói dịch vụ.", false);
      }
    } catch {
      showToast("Lỗi kết nối máy chủ.", false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRequestUpgrade = async (plan: SubscriptionPlan) => {
    setConfirmDialog(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/subscriptionplans/request-upgrade`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(plan.id)
      });

      if (res.ok) {
        showToast(`✅ Gửi yêu cầu nâng cấp lên gói "${plan.name}" thành công!`);
        await loadData();
      } else {
        const data = await res.json();
        showToast(data.message || "Không thể gửi yêu cầu nâng cấp.", false);
      }
    } catch {
      showToast("Lỗi kết nối máy chủ.", false);
    } finally {
      setSubmitting(false);
    }
  };

  // Mock benefits list based on Plan Name for rich presentation
  const getPlanBenefits = (name: string) => {
    const defaultBenefits = [
      "Quản lý hóa đơn POS cơ bản",
      "Báo cáo doanh thu & chi phí tự động",
      "Sổ quỹ tiền mặt & ngân hàng cơ bản",
      "Tích hợp AI order nháp (Hạn chế lượt dùng)"
    ];

    if (name.toLowerCase().includes("pro") || name.toLowerCase().includes("chuyên nghiệp")) {
      return [
        "Đầy đủ nghiệp vụ Sổ sách kế toán TT88",
        "Tự động tính thuế GTGT, TNCN hộ kinh doanh",
        "Quản lý kho hàng & Sổ S2 chi tiết",
        "Trợ lý AI trích xuất đơn hàng không giới hạn",
        "Quản lý công nợ khách hàng & nhà cung cấp",
        "Hỗ trợ kỹ thuật 24/7"
      ];
    }

    if (name.toLowerCase().includes("enterprise") || name.toLowerCase().includes("doanh nghiệp") || name.toLowerCase().includes("vip")) {
      return [
        "Tất cả tính năng của gói Chuyên nghiệp",
        "Phân tích dữ liệu kinh doanh nâng cao bằng AI",
        "Multi-location (Tách biệt nhiều chi nhánh/sổ sách)",
        "Đào tạo nhân viên sử dụng POS & kế toán TT88 miễn phí",
        "Tùy chỉnh biểu mẫu chứng từ theo yêu cầu riêng",
        "Cam kết SLA ổn định hệ thống 99.9%"
      ];
    }

    return defaultBenefits;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant gap-3 bg-white rounded-2xl border border-surface-container-high shadow-card">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm font-medium">Đang tải thông tin gói dịch vụ...</span>
      </div>
    );
  }

  const currentPlanId = mySub?.currentPlan?.id ?? null;
  const pendingPlanId = mySub?.pendingPlan?.id ?? null;

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium transition-all ${toast.ok ? "bg-emerald-600 text-white" : "bg-error text-white"}`}>
          {toast.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
          {toast.message}
        </div>
      )}

      {/* Gói hiện tại Info Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 sm:p-8 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Gói đang hoạt động
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold flex items-baseline gap-2">
              {mySub?.currentPlan?.name ?? "Gói dùng thử miễn phí"}
              <span className="text-sm font-normal text-slate-400">
                ({mySub?.currentPlan?.durationMonths ?? 12} tháng)
              </span>
            </h3>
            <p className="text-slate-300 text-sm max-w-xl">
              {mySub?.currentPlan?.description || "Trải nghiệm các tính năng cơ bản của BizFlow giúp đơn giản hóa quản lý bán hàng."}
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
            <span className="text-xs text-slate-400">Chi phí sử dụng</span>
            <span className="text-2xl sm:text-3xl font-black text-primary">
              {mySub?.currentPlan?.price ? `${mySub.currentPlan.price.toLocaleString("vi-VN")}đ` : "Miễn phí"}
              <span className="text-xs font-normal text-slate-400">/tháng</span>
            </span>
          </div>
        </div>

        {/* Trạng thái chờ phê duyệt nâng cấp */}
        {mySub?.pendingPlan && (
          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-400">Yêu cầu nâng cấp đang chờ duyệt</p>
                <p className="text-xs text-slate-300">
                  Bạn đã gửi yêu cầu nâng cấp lên gói <strong className="text-white">{mySub.pendingPlan.name}</strong>. Quản trị viên sẽ sớm kiểm tra và phê duyệt.
                </p>
              </div>
            </div>
            <div className="text-xs px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg font-semibold animate-pulse self-start sm:self-center">
              Đang kiểm tra thông tin
            </div>
          </div>
        )}
      </div>

      {/* Danh sách các gói có sẵn */}
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-bold text-on-surface">Khám phá các gói dịch vụ cao cấp</h4>
          <p className="text-sm text-on-surface-variant mt-1">Nâng cấp gói dịch vụ để mở khóa đầy đủ nghiệp vụ sổ sách kế toán theo Thông tư 88 và trợ lý AI bán hàng.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = currentPlanId === plan.id;
            const isPending = pendingPlanId === plan.id;
            const isCheaper = mySub?.currentPlan && plan.price < mySub.currentPlan.price;
            const benefits = getPlanBenefits(plan.name);

            return (
              <div 
                key={plan.id} 
                className={`bg-white rounded-2xl border transition-all flex flex-col overflow-hidden relative ${
                  isCurrent 
                    ? "border-primary shadow-md ring-1 ring-primary/50" 
                    : isPending
                    ? "border-amber-500/50 shadow-sm"
                    : "border-surface-container-high hover:border-primary/50 hover:shadow-lg"
                }`}
              >
                {/* Highlight badges */}
                {isCurrent && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded-md">
                    Đang sử dụng
                  </span>
                )}
                {isPending && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-md animate-pulse">
                    Đang chờ duyệt
                  </span>
                )}

                <div className="p-6 flex-1 flex flex-col">
                  {/* Icon & Plan Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isCurrent ? "bg-primary/10 text-primary" : "bg-surface-container text-on-surface-variant"
                    }`}>
                      <Gem className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-on-surface text-lg">{plan.name}</h5>
                      <span className="text-xs text-on-surface-variant">{plan.durationMonths} tháng sử dụng</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-on-surface">
                      {plan.price ? `${plan.price.toLocaleString("vi-VN")}đ` : "0đ"}
                    </span>
                    <span className="text-xs text-on-surface-variant">/tháng</span>
                  </div>

                  {/* Features list */}
                  <div className="space-y-3 mb-8 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Quyền lợi gói:</p>
                    <ul className="space-y-2.5">
                      {benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-surface-container-low">
                    {isCurrent ? (
                      <button 
                        disabled 
                        className="w-full py-2.5 bg-surface-container text-on-surface-variant rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                      >
                        Gói hiện tại của bạn
                      </button>
                    ) : isPending ? (
                      <button 
                        disabled 
                        className="w-full py-2.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl text-sm font-bold flex items-center justify-center gap-2 animate-pulse"
                      >
                        Đang chờ Admin duyệt...
                      </button>
                    ) : isCheaper ? (
                      <button 
                        disabled
                        className="w-full py-2.5 bg-surface-container text-on-surface-variant/50 rounded-xl text-sm font-semibold"
                        title="Bạn không thể hạ cấp xuống gói thấp hơn gói hiện tại"
                      >
                        Không khả dụng
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmDialog(plan)}
                        disabled={submitting || mySub?.pendingPlan !== null}
                        className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all hover:shadow-md shadow-primary/10 disabled:opacity-50"
                        title={mySub?.pendingPlan ? "Bạn đang có yêu cầu chờ duyệt, vui lòng chờ xử lý" : ""}
                      >
                        Nâng cấp ngay <ArrowUpRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      {confirmDialog && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setConfirmDialog(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <Gem className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2">Xác nhận Yêu cầu Nâng cấp</h3>
                <p className="text-sm text-on-surface-variant">
                  Bạn có chắc chắn muốn gửi yêu cầu nâng cấp lên gói <strong className="text-on-surface">{confirmDialog.name}</strong>?
                </p>
                <div className="mt-4 p-3 bg-surface-container-low rounded-xl text-left text-sm space-y-1">
                  <p className="flex justify-between">
                    <span className="text-on-surface-variant">Gói nâng cấp:</span>
                    <span className="font-bold text-on-surface">{confirmDialog.name}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-on-surface-variant">Chi phí hàng tháng:</span>
                    <span className="font-bold text-primary">{confirmDialog.price.toLocaleString("vi-VN")}đ/tháng</span>
                  </p>
                </div>
                <p className="text-xs text-on-surface-variant mt-3 text-left flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span>Yêu cầu sẽ được gửi tới Admin hệ thống phê duyệt. Bạn sẽ được thông báo ngay khi gói dịch vụ được kích hoạt.</span>
                </p>
              </div>
              <div className="p-4 bg-surface-container-low border-t border-surface-container-high flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-all border border-surface-container-high bg-white flex-1"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={() => handleRequestUpgrade(confirmDialog)}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-md shadow-primary/20 flex-1 flex items-center justify-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Gửi yêu cầu"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
