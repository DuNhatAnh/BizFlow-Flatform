import React, { useState } from "react";
import { Search, RefreshCw, Calendar as CalendarIcon, HelpCircle } from "lucide-react";
import ExportDropdown from "@/components/ui/ExportDropdown";
import { PrintHeaderTT88 } from "./PrintHelpersTT88";
import { TT88HelpModal } from './TT88HelpModal';
import { useCashLedger } from "@/hooks/useCashLedger";
import { LedgerTableBase } from "./LedgerTableBase";

export default function S6LedgerTab() {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const [quickFilter, setQuickFilter] = useState("this_month");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, refetch } = useCashLedger('s6', startDate, endDate, undefined, page, pageSize);

  const handleQuickFilter = (option: string) => {
    setQuickFilter(option);
    const d = new Date();
    let start, end;
    switch (option) {
      case 'this_month':
        start = new Date(d.getFullYear(), d.getMonth(), 1);
        end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        break;
      case 'last_month':
        start = new Date(d.getFullYear(), d.getMonth() - 1, 1);
        end = new Date(d.getFullYear(), d.getMonth(), 0);
        break;
      case 'this_quarter':
        const q = Math.floor(d.getMonth() / 3);
        start = new Date(d.getFullYear(), q * 3, 1);
        end = new Date(d.getFullYear(), q * 3 + 3, 0);
        break;
      case 'last_quarter':
        const lq = Math.floor(d.getMonth() / 3) - 1;
        start = new Date(d.getFullYear(), lq * 3, 1);
        end = new Date(d.getFullYear(), lq * 3 + 3, 0);
        break;
      case 'this_year':
        start = new Date(d.getFullYear(), 0, 1);
        end = new Date(d.getFullYear(), 11, 31);
        break;
      case 'custom':
      default:
        return;
    }
    const fmt = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    setStartDate(fmt(start));
    setEndDate(fmt(end));
    setPage(1);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    // TODO: Implement real Excel export
    alert("Tính năng xuất Excel cho S6 đang được phát triển.");
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Title S6 */}
      <div className="px-6 py-4 border-b border-surface-container bg-white shrink-0 print:hidden flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-on-surface">Sổ Quỹ Tiền Mặt</h3>
            <button 
              onClick={() => setShowHelpModal(true)}
              className="text-primary hover:bg-primary/10 p-1.5 rounded-full transition-colors flex items-center justify-center"
              title="Hướng dẫn điền sổ TT88"
            >
              <HelpCircle size={18} />
            </button>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">Mẫu số S6-HKD (Ban hành kèm theo Thông tư số 88/2021/TT-BTC)</p>
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-surface-container print:hidden shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-md border border-surface-container focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <CalendarIcon size={16} className="text-on-surface-variant" />
            <select 
              className="bg-transparent border-none text-sm text-on-surface focus:ring-0 cursor-pointer outline-none font-medium"
              value={quickFilter}
              onChange={(e) => handleQuickFilter(e.target.value)}
            >
              <option value="this_month">Tháng này</option>
              <option value="last_month">Tháng trước</option>
              <option value="this_quarter">Quý này</option>
              <option value="last_quarter">Quý trước</option>
              <option value="this_year">Năm nay</option>
              <option value="custom">Tùy chỉnh</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setQuickFilter('custom');
                setPage(1);
              }}
              className="px-3 py-1.5 border border-outline rounded-md text-sm bg-white text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
            />
            <span className="text-on-surface-variant text-sm font-medium">đến</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setQuickFilter('custom');
                setPage(1);
              }}
              className="px-3 py-1.5 border border-outline rounded-md text-sm bg-white text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => refetch()}
            className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-full transition-colors tooltip"
            title="Tải lại dữ liệu"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>

          <ExportDropdown 
            onPrintTT88={handlePrint} 
            onExportExcel={handleExportExcel} 
          />
        </div>
      </div>

      <div id="print-area" className="flex-1 overflow-auto bg-white relative print:p-0 print:overflow-visible print:h-auto print:block">
        <div className="px-6 py-4 print:p-0">
          <PrintHeaderTT88 formId="S6-HKD" title="SỔ QUỸ TIỀN MẶT" showStoreNameInTitle={false}>
            <div className="text-sm mt-1 italic print:hidden">Kỳ báo cáo: Từ ngày {new Date(startDate).toLocaleDateString('vi-VN')} đến ngày {new Date(endDate).toLocaleDateString('vi-VN')}</div>
            <div className="text-sm mt-1">Loại quỹ: VNĐ</div>
          </PrintHeaderTT88>
        </div>
        
        <LedgerTableBase 
          data={data} 
          isLoading={isLoading} 
          startDate={startDate} 
          endDate={endDate} 
          type="s6" 
        />
      </div>

      {/* Pagination S6 */}
      {!isLoading && data && data.transactions.totalCount > 0 && (
        <div className="p-4 border-t border-surface-container bg-surface-container-lowest flex items-center justify-between shrink-0 print:hidden">
          <span className="text-sm text-on-surface-variant">
            Hiển thị bản ghi {((page - 1) * pageSize) + 1} đến {Math.min(page * pageSize, data.transactions.totalCount)} (Tổng số: {data.transactions.totalCount} bản ghi)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-surface-container text-on-surface rounded disabled:opacity-50 hover:bg-surface-container-high transition-colors"
            >
              Trước
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * pageSize >= data.transactions.totalCount}
              className="px-3 py-1 bg-surface-container text-on-surface rounded disabled:opacity-50 hover:bg-surface-container-high transition-colors"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      <TT88HelpModal 
        isOpen={showHelpModal} 
        onClose={() => setShowHelpModal(false)} 
        formId="s6" 
      />
    </div>
  );
}
