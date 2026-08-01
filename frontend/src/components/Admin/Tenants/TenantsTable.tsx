import React, { useState, useEffect } from "react";
import { 
  Building2, Eye, ToggleLeft, ToggleRight, Loader2, Gem, Clock, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from "lucide-react";
import { Tenant, SubscriptionPlan } from "./types";

interface TenantsTableProps {
  tenants: Tenant[];
  activeView: "approved" | "pending";
  loading: boolean;
  search: string;
  onManageSubscription: (tenant: Tenant) => void;
  onRequestApproveUpgrade: (id: string, name: string, planName: string) => void;
  onRequestRejectUpgrade: (id: string, name: string, planName: string) => void;
  onSelectTenantForView: (tenant: Tenant) => void;
  onToggleStatus: (id: string, name: string, isActive: boolean) => void;
  onRequestApprove: (id: string, name: string) => void;
  onRequestReject: (id: string, name: string) => void;
}

const ITEMS_PER_PAGE = 20;

const TenantsTable: React.FC<TenantsTableProps> = React.memo(({
  tenants,
  activeView,
  loading,
  search,
  onManageSubscription,
  onRequestApproveUpgrade,
  onRequestRejectUpgrade,
  onSelectTenantForView,
  onToggleStatus,
  onRequestApprove,
  onRequestReject
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Lọc dữ liệu theo search và activeView
  const filtered = React.useMemo(() => {
    return tenants.filter(t => {
      const match = t.name.toLowerCase().includes(search.toLowerCase()) ||
                    t.ownerName.toLowerCase().includes(search.toLowerCase()) ||
                    (t.phone && t.phone.includes(search));
      if (activeView === "approved") {
        return t.isApproved !== false && match;
      } else {
        return t.isApproved === false && match;
      }
    });
  }, [tenants, search, activeView]);

  // Reset về trang 1 khi search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeView]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  // Bảo vệ currentPage không vượt quá totalPages
  const validCurrentPage = Math.min(currentPage, totalPages);
  
  const currentItems = React.useMemo(() => {
    const start = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, validCurrentPage]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-surface-container-high shadow-card overflow-hidden">
        <div className="flex items-center justify-center py-20 text-on-surface-variant gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm">Đang tải danh sách...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">
              <th className="p-4 text-left">Tên Doanh nghiệp{activeView === "pending" && " / Cửa hàng"}</th>
              <th className="p-4 text-center">Chủ sở hữu</th>
              {activeView === "approved" ? (
                <>
                  <th className="p-4 text-center">Gói dịch vụ</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-center">Ngày đăng ký</th>
                  <th className="p-4 text-center">Ngày hết hạn</th>
                </>
              ) : (
                <>
                  <th className="p-4 text-center">Địa chỉ</th>
                  <th className="p-4 text-center">Gói đăng ký</th>
                  <th className="p-4 text-center">Ngày gửi</th>
                  <th className="p-4 text-center">Hành động</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-500 text-sm">
                  {activeView === "approved" ? "Không có dữ liệu" : "Không có yêu cầu đăng ký chờ duyệt"}
                </td>
              </tr>
            ) : currentItems.map(t => (
              <tr key={t.id} className="hover:bg-slate-50/80 transition-colors duration-150">
                <td className="p-4 text-left">
                  <div 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => onSelectTenantForView(t)}
                  >
                    <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center shrink-0 group-hover:bg-sky-100 transition-colors">
                      <Building2 className="w-4 h-4 text-sky-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-sky-700 transition-colors">{t.name}</p>
                      {t.taxCode && <p className="text-xs text-slate-500">MST: {t.taxCode}</p>}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <p className="font-medium text-slate-900">{t.ownerName}</p>
                  {activeView === "approved" && t.phone && <p className="text-xs text-slate-500">{t.phone}</p>}
                  {activeView === "pending" && t.ownerPhone && <p className="text-xs text-slate-500">{t.ownerPhone}</p>}
                </td>

                {activeView === "approved" ? (
                  <>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); onManageSubscription(t); }}
                          className="group flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                        >
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${t.subscriptionPlan ? "bg-sky-50 text-sky-700" : "bg-slate-100 text-slate-500"}`}>
                            <Gem className="w-3.5 h-3.5 inline mr-1" />
                            {t.subscriptionPlan?.name ?? "Chưa có gói"}
                          </span>
                        </button>
                        {t.pendingSubscriptionPlan && (
                          <div className="flex items-center justify-center gap-1 mt-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              Lên {t.pendingSubscriptionPlan.name}
                            </span>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); onRequestApproveUpgrade(t.id, t.name, t.pendingSubscriptionPlan!.name); }}
                                title="Duyệt nâng cấp"
                                className="p-0.5 rounded text-emerald-600 hover:bg-emerald-50 transition-colors"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); onRequestRejectUpgrade(t.id, t.name, t.pendingSubscriptionPlan!.name); }}
                                title="Từ chối nâng cấp"
                                className="p-0.5 rounded text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStatus(t.id, t.name, t.isActive);
                        }}
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold hover:opacity-80 transition-opacity ${t.isActive ? "bg-emerald-50 text-emerald-700 hover:bg-rose-50 hover:text-rose-600" : "bg-rose-50 text-rose-600 hover:bg-emerald-50 hover:text-emerald-700"}`}
                        title={t.isActive ? "Nhấn để khóa hoạt động" : "Nhấn để mở khóa"}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${t.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {t.isActive ? "Hoạt động" : "Khóa"}
                      </button>
                    </td>
                    <td className="p-4 text-center text-xs text-slate-500">
                      {new Date(t.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-4 text-center text-xs font-semibold text-slate-700">
                      {t.subscriptionEndDate ? new Date(t.subscriptionEndDate).toLocaleDateString("vi-VN") : "---"}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4 text-center">
                      <p className="text-slate-900 text-xs max-w-[200px] truncate mx-auto" title={t.address}>{t.address || "Chưa cung cấp"}</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 inline-flex items-center justify-center">
                        <Gem className="w-3.5 h-3.5 mr-1" />
                        {t.subscriptionPlan?.name ?? "Gói cơ bản"}
                      </span>
                    </td>
                    <td className="p-4 text-center text-xs text-slate-500">
                      {new Date(t.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onRequestApprove(t.id, t.name)}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => onRequestReject(t.id, t.name)}
                          className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold hover:bg-rose-100 transition-colors"
                        >
                          Từ chối
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between sm:px-6">
          <div className="hidden sm:block">
            <p className="text-sm text-slate-500">
              Hiển thị <span className="font-semibold text-slate-900">{(validCurrentPage - 1) * ITEMS_PER_PAGE + 1}</span> đến <span className="font-semibold text-slate-900">{Math.min(validCurrentPage * ITEMS_PER_PAGE, filtered.length)}</span> trong tổng số <span className="font-semibold text-slate-900">{filtered.length}</span> kết quả
            </p>
          </div>
          <div className="flex flex-1 justify-between sm:justify-end gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={validCurrentPage === 1}
              title="Trang đầu"
              className="relative inline-flex items-center justify-center rounded-md bg-white p-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={validCurrentPage === 1}
              title="Trang trước"
              className="relative inline-flex items-center justify-center rounded-md bg-white p-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center px-4 text-sm font-semibold text-slate-700 sm:hidden">
              {validCurrentPage} / {totalPages}
            </div>
            
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`relative inline-flex items-center justify-center min-w-[36px] rounded-md px-3 py-1.5 text-sm font-bold ring-1 ring-inset transition-colors ${
                    validCurrentPage === page 
                      ? 'bg-white text-sky-700 ring-sky-600 z-10 shadow-sm' 
                      : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={validCurrentPage === totalPages}
              title="Trang sau"
              className="relative inline-flex items-center justify-center rounded-md bg-white p-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={validCurrentPage === totalPages}
              title="Trang cuối"
              className="relative inline-flex items-center justify-center rounded-md bg-white p-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
    </div>
  );
});

TenantsTable.displayName = "TenantsTable";

export default TenantsTable;
