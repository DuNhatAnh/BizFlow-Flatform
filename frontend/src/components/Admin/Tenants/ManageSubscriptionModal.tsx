import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Loader2, Gem, Calendar, ArrowRight } from "lucide-react";
import { Tenant, SubscriptionPlan } from "./types";

interface ManageSubscriptionModalProps {
  tenant: Tenant;
  plans: SubscriptionPlan[];
  onClose: () => void;
  onChangePlan: (tenantId: string, newPlanId: number | null) => Promise<boolean>;
  onUpdateSubscriptionEndDate: (tenantId: string, newEndDate: string) => Promise<boolean>;
}

const ManageSubscriptionModal: React.FC<ManageSubscriptionModalProps> = ({
  tenant,
  plans,
  onClose,
  onChangePlan,
  onUpdateSubscriptionEndDate
}) => {
  const [activeTab, setActiveTab] = useState<"change" | "extend">("change");
  
  // States for change plan
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(tenant.subscriptionPlanId ?? null);
  
  // States for extend date
  const [endDateValue, setEndDateValue] = useState<string>(tenant.subscriptionEndDate ? tenant.subscriptionEndDate.split('T')[0] : "");
  const [extendOption, setExtendOption] = useState<"1"|"6"|"12"|"custom">("custom");
  
  const [submitting, setSubmitting] = useState(false);

  const calculateNewDate = (months: number) => {
    const baseDate = tenant.subscriptionEndDate ? new Date(tenant.subscriptionEndDate) : new Date();
    if (baseDate < new Date()) {
      baseDate.setTime(new Date().getTime());
    }
    baseDate.setMonth(baseDate.getMonth() + months);
    setEndDateValue(baseDate.toISOString().split('T')[0]);
    setExtendOption(months.toString() as any);
  };

  const handleSave = async () => {
    setSubmitting(true);
    let success = true;
    
    if (activeTab === "change") {
      if (selectedPlanId !== tenant.subscriptionPlanId) {
        success = await onChangePlan(tenant.id, selectedPlanId);
      }
    } else {
      success = await onUpdateSubscriptionEndDate(tenant.id, endDateValue);
    }
    
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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999]" onClick={onClose} />
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-sky-50 border-b border-sky-100 p-5">
            <h3 className="text-lg font-bold text-sky-900">Quản lý Gói dịch vụ</h3>
            <p className="text-sm text-sky-700 mt-1">Doanh nghiệp: <strong>{tenant.name}</strong></p>
          </div>
          
          <div className="flex border-b border-slate-200">
            <button 
              onClick={() => setActiveTab("change")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === "change" ? "text-sky-700 border-b-2 border-sky-600" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
            >
              Đổi gói cước
            </button>
            <button 
              onClick={() => setActiveTab("extend")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === "extend" ? "text-sky-700 border-b-2 border-sky-600" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
            >
              Gia hạn / Đổi ngày
            </button>
          </div>

          <div className="p-5 min-h-[250px]">
            {activeTab === "change" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-sm text-slate-500 font-medium">Gói hiện tại:</span>
                  <span className="font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded flex items-center gap-1">
                    <Gem className="w-3.5 h-3.5" />
                    {tenant.subscriptionPlan?.name || "Chưa có"}
                  </span>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-slate-900 block mb-2">Chọn gói mới</label>
                  <div className="space-y-2">
                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedPlanId === null ? "border-sky-500 bg-sky-50" : "border-slate-200 hover:bg-slate-50"}`}>
                      <input 
                        type="radio" 
                        name="plan" 
                        checked={selectedPlanId === null} 
                        onChange={() => setSelectedPlanId(null)}
                        className="w-4 h-4 text-sky-600"
                      />
                      <span className="text-sm font-medium text-slate-700">-- Không có gói --</span>
                    </label>
                    {plans.map(p => (
                      <label key={p.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedPlanId === p.id ? "border-sky-500 bg-sky-50" : "border-slate-200 hover:bg-slate-50"}`}>
                        <div className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            name="plan" 
                            checked={selectedPlanId === p.id} 
                            onChange={() => setSelectedPlanId(p.id)}
                            className="w-4 h-4 text-sky-600 focus:ring-sky-500"
                          />
                          <span className="text-sm font-bold text-slate-900">{p.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-emerald-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}/tháng</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "extend" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-sm text-slate-500 font-medium">Hết hạn cũ:</span>
                  <span className={`font-bold ${tenant.subscriptionEndDate && new Date(tenant.subscriptionEndDate) < new Date() ? 'text-rose-600' : 'text-slate-900'}`}>
                    {tenant.subscriptionEndDate ? new Date(tenant.subscriptionEndDate).toLocaleDateString("vi-VN") : "Chưa có"}
                  </span>
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
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="date"
                      value={endDateValue}
                      onChange={(e) => {
                        setEndDateValue(e.target.value);
                        setExtendOption("custom");
                      }}
                      className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600/30 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 p-4 bg-slate-50 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors bg-white disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={submitting || (activeTab === "extend" && !endDateValue)}
              className="min-w-[120px] flex justify-center items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50 bg-sky-600 hover:bg-sky-700"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>Lưu thay đổi <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default ManageSubscriptionModal;
