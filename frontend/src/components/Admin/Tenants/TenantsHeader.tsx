import React from "react";
import { Plus, Search } from "lucide-react";

interface TenantsHeaderProps {
  activeView: "approved" | "pending";
  setActiveView: (view: "approved" | "pending") => void;
  search: string;
  setSearch: (val: string) => void;
  onOpenCreateModal: () => void;
}

const TenantsHeader: React.FC<TenantsHeaderProps> = React.memo(({
  activeView,
  setActiveView,
  search,
  setSearch,
  onOpenCreateModal
}) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Pilled Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setActiveView("approved")}
            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-md transition-all whitespace-nowrap ${activeView === "approved"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
          >
            Doanh nghiệp hoạt động
          </button>
          <button
            onClick={() => setActiveView("pending")}
            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-md transition-all whitespace-nowrap ${activeView === "pending"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
          >
            Yêu cầu chờ duyệt
          </button>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-700 text-white rounded-lg text-sm font-semibold hover:bg-sky-800 transition-colors duration-200 active:bg-sky-900"
        >
          <Plus className="w-4 h-4" />
          Đăng ký Doanh nghiệp mới
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm doanh nghiệp hoặc chủ sở hữu..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-600/30 transition-all"
        />
      </div>
    </>
  );
});

TenantsHeader.displayName = "TenantsHeader";

export default TenantsHeader;
