import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { UserPlus, Building2, Shield, Loader2 } from "lucide-react";
import { SubscriptionPlan } from "./types";

interface CreateTenantModalProps {
  plans: SubscriptionPlan[];
  onClose: () => void;
  onCreate: (form: any) => Promise<boolean>;
}

const CreateTenantModal: React.FC<CreateTenantModalProps> = ({
  plans,
  onClose,
  onCreate
}) => {
  const [form, setForm] = useState({
    name: "", ownerName: "", ownerEmail: "", ownerPassword: "owner123",
    phone: "", address: "", taxCode: "", subscriptionPlanId: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await onCreate(form);
    if (success) {
      onClose();
    }
    setSubmitting(false);
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]" onClick={onClose} />
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-slate-900 p-6 text-white">
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
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Cụm 1: THÔNG TIN DOANH NGHIỆP */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> THÔNG TIN DOANH NGHIỆP
                </h4>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Tên Doanh nghiệp / Cửa hàng *</label>
                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Cửa hàng Tạp hóa Bình An" className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600/30 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Gói dịch vụ ban đầu</label>
                    <select value={form.subscriptionPlanId} onChange={e => setForm({ ...form, subscriptionPlanId: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600/30 bg-white transition-all">
                      <option value="">Chưa có gói (Dùng thử)</option>
                      {plans.map(p => <option key={p.id} value={p.id}>{p.name} — {p.price.toLocaleString("vi-VN")}đ/tháng</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Cụm 2: TÀI KHOẢN CHỦ SỞ HỮU */}
              <div>
                <h4 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> TÀI KHOẢN CHỦ SỞ HỮU
                </h4>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Họ tên Chủ sở hữu *</label>
                      <input required value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })}
                        placeholder="Nguyễn Văn A" className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600/30 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Số điện thoại</label>
                      <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                        placeholder="0901234567" className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600/30 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Email đăng nhập *</label>
                    <input required type="email" value={form.ownerEmail} onChange={e => setForm({ ...form, ownerEmail: e.target.value })}
                      placeholder="owner@example.com" className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600/30 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Mật khẩu ban đầu *</label>
                    <input required type="text" value={form.ownerPassword} onChange={e => setForm({ ...form, ownerPassword: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600/30 transition-all" />
                    <p className="text-[11px] text-slate-500 mt-1 italic">Bạn có thể dùng mật khẩu mặc định này để gửi cho khách hàng.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-4">
              <button type="button" onClick={onClose} disabled={submitting} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors">Hủy</button>
              <button type="submit" disabled={submitting} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-700 text-white text-sm font-semibold hover:bg-sky-800 transition-colors disabled:opacity-60">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                Tạo Doanh nghiệp
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  );
};

export default CreateTenantModal;
