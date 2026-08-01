import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Building2, Clock, Loader2 } from "lucide-react";
import { Tenant, User } from "./types";

interface TenantDetailsModalProps {
  tenant: Tenant | null;
  onClose: () => void;
  onUpdateAdmin: (id: string, ownerName: string, phone: string) => Promise<boolean>;
  onUpdateSubscriptionEndDate?: (id: string, newEndDate: string) => Promise<boolean>;
}

const TenantDetailsModal: React.FC<TenantDetailsModalProps> = ({
  tenant,
  onClose,
  onUpdateAdmin,
  onUpdateSubscriptionEndDate
}) => {
  const [isEditingTenant, setIsEditingTenant] = useState(false);
  const [editTenantForm, setEditTenantForm] = useState({ ownerName: "", phone: "" });
  
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isEmployeesModalOpen, setIsEmployeesModalOpen] = useState(false);
  const [endDateValue, setEndDateValue] = useState("");
  const [extendOption, setExtendOption] = useState<"1"|"6"|"12"|"custom">("custom");

  const [submitting, setSubmitting] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!tenant) return null;

  const handleEditClick = () => {
    setEditTenantForm({ ownerName: tenant.ownerName, phone: tenant.ownerPhone || "" });
    setIsEditingTenant(true);
  };

  const handleSave = async () => {
    setSubmitting(true);
    const success = await onUpdateAdmin(tenant.id, editTenantForm.ownerName, editTenantForm.phone);
    if (success) {
      setIsEditingTenant(false);
    }
    setSubmitting(false);
  };

  const handleClose = () => {
    setIsEditingTenant(false);
    setIsExtendModalOpen(false);
    onClose();
  };

  const handleOpenExtendModal = () => {
    setEndDateValue(tenant.subscriptionEndDate ? tenant.subscriptionEndDate.split('T')[0] : "");
    setExtendOption("custom");
    setIsExtendModalOpen(true);
  };

  const calculateNewDate = (months: number) => {
    const baseDate = tenant.subscriptionEndDate ? new Date(tenant.subscriptionEndDate) : new Date();
    // If expired, maybe base from today? Let's just base from current end date or today if null.
    if (baseDate < new Date()) {
      baseDate.setTime(new Date().getTime());
    }
    baseDate.setMonth(baseDate.getMonth() + months);
    setEndDateValue(baseDate.toISOString().split('T')[0]);
    setExtendOption(months.toString() as any);
  };

  const handleSaveEndDate = async () => {
    if (!onUpdateSubscriptionEndDate) return;
    setSubmitting(true);
    const success = await onUpdateSubscriptionEndDate(tenant.id, endDateValue);
    if (success) {
      setIsExtendModalOpen(false);
    }
    setSubmitting(false);
  };

  if (!mounted) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999]" onClick={handleClose} />
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-slate-900 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Chi tiết Doanh nghiệp</h3>
                  <p className="text-xs text-white/85">
                    Trạng thái: {tenant.isApproved ? "Đã duyệt & hoạt động" : "Đang chờ phê duyệt"}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="text-white/80 hover:text-white text-xl font-bold p-1 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="p-6 space-y-6">
            
            {/* Doanh nghiệp */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5">
                Thông tin doanh nghiệp
              </h4>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div className="col-span-2">
                  <span className="text-[11px] text-slate-500 block font-medium">Tên doanh nghiệp / Cửa hàng</span>
                  <span className="font-semibold text-slate-900 text-base">{tenant.name}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Mã số thuế</span>
                  <span className="font-semibold text-slate-900">{tenant.taxCode || "Chưa cung cấp"}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Số điện thoại liên hệ</span>
                  <span className="font-semibold text-slate-900">{tenant.phone || "Chưa cung cấp"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[11px] text-slate-500 block font-medium">Địa chỉ kinh doanh</span>
                  <span className="font-semibold text-slate-900">{tenant.address || "Chưa cung cấp"}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Ngày đăng ký</span>
                  <span className="font-semibold text-slate-900">
                    {new Date(tenant.createdAt).toLocaleDateString("vi-VN")} {new Date(tenant.createdAt).toLocaleTimeString("vi-VN")}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Gói dịch vụ</span>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="font-semibold text-sky-700">
                      {tenant.subscriptionPlan?.name || "Chưa có gói"}
                    </span>
                    {tenant.pendingSubscriptionPlan && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1 animate-pulse">
                        <Clock className="w-3 h-3 text-amber-500" />
                        Đang chờ nâng cấp lên: {tenant.pendingSubscriptionPlan.name}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Ngày kích hoạt gói</span>
                  <span className="font-semibold text-slate-900">
                    {tenant.subscriptionStartDate ? new Date(tenant.subscriptionStartDate).toLocaleDateString("vi-VN") : "Chưa kích hoạt"}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 block font-medium">Ngày hết hạn gói</span>
                    {onUpdateSubscriptionEndDate && (
                      <button onClick={handleOpenExtendModal} className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded font-medium hover:bg-sky-200 transition-colors">
                        Gia hạn / Đổi ngày
                      </button>
                    )}
                  </div>
                  
                  <span className={`font-semibold ${tenant.subscriptionEndDate && new Date(tenant.subscriptionEndDate) < new Date() ? 'text-rose-600' : 'text-slate-900'} block mt-0.5`}>
                    {tenant.subscriptionEndDate ? new Date(tenant.subscriptionEndDate).toLocaleDateString("vi-VN") : "Chưa có"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[11px] text-slate-500 block font-medium">Tổng tiền đã chi cho gói dịch vụ</span>
                  <span className="font-semibold text-emerald-600 text-base">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tenant.totalSpent || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tài khoản chủ sở hữu */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5">
                Thông tin tài khoản chủ sở hữu
              </h4>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Họ và tên chủ hộ KD (Có thể sửa)</span>
                  {isEditingTenant ? (
                    <input
                      type="text"
                      value={editTenantForm.ownerName}
                      onChange={(e) => setEditTenantForm({ ...editTenantForm, ownerName: e.target.value })}
                      className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600/30 transition-all"
                    />
                  ) : (
                    <span className="font-semibold text-slate-900">{tenant.ownerName}</span>
                  )}
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Số điện thoại chủ hộ (Có thể sửa)</span>
                  {isEditingTenant ? (
                    <input
                      type="text"
                      value={editTenantForm.phone}
                      onChange={(e) => setEditTenantForm({ ...editTenantForm, phone: e.target.value })}
                      className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600/30 transition-all"
                    />
                  ) : (
                    <span className="font-semibold text-slate-900">{tenant.ownerPhone || "Chưa cung cấp"}</span>
                  )}
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Email / Tên đăng nhập</span>
                  <span className="font-semibold text-slate-900 select-all">
                    {(() => {
                      const users = tenant.users;
                      if (!users || users.length === 0) return "Không có dữ liệu";
                      const owner = users.find((u: User) => u.role === "Owner") || users[0];
                      return owner.username;
                    })()}
                  </span>
                </div>
              </div>
            </div>

            {/* Sổ nhân viên (Summary) */}
            <div className="space-y-3 mt-6 mb-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Sổ nhân viên</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Cửa hàng có <span className="font-semibold text-slate-700">{tenant.users?.length || 0}</span> tài khoản</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEmployeesModalOpen(true)}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 hover:text-sky-700 transition-colors"
                >
                  Xem danh sách
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="text-[11px] text-slate-500">
                Lưu ý: Bạn không thể đổi email của chủ cửa hàng.
              </div>
              <div className="flex gap-2">
                {isEditingTenant ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditingTenant(false)}
                      disabled={submitting}
                      className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={submitting}
                      className="px-4 py-2 rounded-xl bg-sky-700 text-white text-sm font-semibold hover:bg-sky-800 transition-colors flex items-center justify-center min-w-[80px] disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lưu"}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleEditClick}
                    className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-sm font-semibold transition-colors"
                  >
                    Chỉnh sửa thông tin
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isExtendModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" onClick={() => setIsExtendModalOpen(false)} />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-sky-50 border-b border-sky-100 p-5">
                <h3 className="text-lg font-bold text-sky-900">Gia hạn / Đổi ngày hết hạn</h3>
                <p className="text-sm text-sky-700 mt-1">Cập nhật thời hạn sử dụng gói dịch vụ cho doanh nghiệp <strong>{tenant.name}</strong></p>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-500 font-medium">Gói hiện tại</span>
                    <span className="text-xs font-bold text-sky-700">{tenant.subscriptionPlan?.name || "Chưa có"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-medium">Hết hạn cũ</span>
                    <span className="text-xs font-bold text-rose-600">
                      {tenant.subscriptionEndDate ? new Date(tenant.subscriptionEndDate).toLocaleDateString("vi-VN") : "Chưa có"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-900 block mb-2">Tùy chọn gia hạn nhanh</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      type="button"
                      onClick={() => calculateNewDate(1)}
                      className={`py-2 rounded-lg text-sm font-medium border transition-colors ${extendOption === '1' ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      +1 Tháng
                    </button>
                    <button 
                      type="button"
                      onClick={() => calculateNewDate(6)}
                      className={`py-2 rounded-lg text-sm font-medium border transition-colors ${extendOption === '6' ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      +6 Tháng
                    </button>
                    <button 
                      type="button"
                      onClick={() => calculateNewDate(12)}
                      className={`py-2 rounded-lg text-sm font-medium border transition-colors ${extendOption === '12' ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      +1 Năm
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-900 block mb-2">Hoặc chọn ngày tùy chỉnh</label>
                  <input 
                    type="date"
                    value={endDateValue}
                    onChange={(e) => {
                      setEndDateValue(e.target.value);
                      setExtendOption("custom");
                    }}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600/30 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-4 bg-slate-50 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsExtendModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors bg-white disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSaveEndDate}
                  disabled={submitting || !endDateValue}
                  className="min-w-[120px] flex justify-center items-center px-4 py-2 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50 bg-sky-600 hover:bg-sky-700"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Danh sách nhân viên */}
      {isEmployeesModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1010]" onClick={() => setIsEmployeesModalOpen(false)} />
          <div className="fixed inset-0 z-[1020] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-slate-900 border-b border-slate-800 p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Danh sách tài khoản</h3>
                  <p className="text-sm text-white/70 mt-1">Doanh nghiệp: <strong>{tenant.name}</strong></p>
                </div>
                <button onClick={() => setIsEmployeesModalOpen(false)} className="text-white/60 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-lg p-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              
              <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
                {tenant.users && tenant.users.length > 0 ? (
                  tenant.users.map((u: User) => (
                    <div key={u.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm hover:border-sky-300 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{u.fullname || "Chưa cập nhật tên"}</span>
                        <span className="text-xs text-slate-500 mt-0.5">{u.username}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === "Owner" ? "bg-amber-100 text-amber-800 border border-amber-200" : u.role === "Manager" ? "bg-indigo-100 text-indigo-800 border border-indigo-200" : "bg-sky-100 text-sky-800 border border-sky-200"}`}>
                          {u.role === "Owner" ? "Chủ" : u.role === "Manager" ? "Quản lý" : "Thu ngân"}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${(u as any).isActive !== false ? "bg-emerald-500" : "bg-rose-500"}`} />
                          <span className="text-[10px] text-slate-500 font-medium">{(u as any).isActive !== false ? "Hoạt động" : "Bị khóa"}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic text-center py-4">Không có dữ liệu nhân viên.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>,
    document.body
  );
};

export default TenantDetailsModal;
