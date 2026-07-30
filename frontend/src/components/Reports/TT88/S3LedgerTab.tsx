import React, { useState, useEffect } from "react";
import { Search, RefreshCw, Calendar as CalendarIcon, FileText, HelpCircle } from "lucide-react";
import ExportDropdown from "@/components/ui/ExportDropdown";
import { PrintHeaderTT88, PrintFooterTT88 } from "./PrintHelpersTT88";
import { TT88HelpModal } from './TT88HelpModal';

const getAuthInfo = () => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("bizflow_user");
    if (stored) {
      const user = JSON.parse(stored);
      return { tenantId: user.tenantId || "11111111-1111-1111-1111-111111111111", token: user.token };
    }
  }
  return { tenantId: "11111111-1111-1111-1111-111111111111", token: "" };
};

interface S3LedgerRow {
  date: string;
  receiptNo: string;
  receiptDate: string;
  description: string;
  col1_Labor: number;
  col2_Electricity: number;
  col3_Water: number;
  col4_Telecom: number;
  col5_Rent: number;
  col6_Management: number;
  col7_Other: number;
  notes: string;
}

export default function S3LedgerTab() {
  const [data, setData] = useState<S3LedgerRow[]>([]);
  const [loading, setLoading] = useState(true);
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

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totals, setTotals] = useState({ col1: 0, col2: 0, col3: 0, col4: 0, col5: 0, col6: 0, col7: 0, expense: 0 });
  const pageSize = 20;

  const [quickFilter, setQuickFilter] = useState("this_month");

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

  const fetchLedgerS3 = async () => {
    setLoading(true);
    try {
      const auth = getAuthInfo();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5178/api';
      const res = await fetch(`${apiUrl}/reports/s3-hkd?startDate=${startDate}&endDate=${endDate}&page=${page}&pageSize=${pageSize}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "X-Tenant-Id": auth.tenantId
        },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json.records?.items || []);
        setTotalCount(json.records?.totalCount || 0);
        setTotals({
          col1: json.totalCol1_Labor || 0,
          col2: json.totalCol2_Electricity || 0,
          col3: json.totalCol3_Water || 0,
          col4: json.totalCol4_Telecom || 0,
          col5: json.totalCol5_Rent || 0,
          col6: json.totalCol6_Management || 0,
          col7: json.totalCol7_Other || 0,
          expense: (json.totalCol1_Labor || 0) + (json.totalCol2_Electricity || 0) + (json.totalCol3_Water || 0) + (json.totalCol4_Telecom || 0) + (json.totalCol5_Rent || 0) + (json.totalCol6_Management || 0) + (json.totalCol7_Other || 0)
        });
      }
    } catch (error) {
      console.error("Failed to fetch S3 ledger:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerS3();
  }, [page]);

  const formatCurrency = (val: number) => {
    if (!val || val === 0) return "-";
    return new Intl.NumberFormat("vi-VN").format(val);
  };

  const formatDateDisplay = (dateString: string) => {
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden h-full">
      {/* Title S3 */}
      <div className="px-6 py-4 border-b border-surface-container bg-surface-container-lowest shrink-0 print:hidden flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-on-surface">Sổ Chi Phí Sản Xuất, Kinh Doanh</h3>
            <button 
              onClick={() => setShowHelpModal(true)}
              className="text-primary hover:bg-primary/10 p-1.5 rounded-full transition-colors flex items-center justify-center"
              title="Hướng dẫn điền sổ TT88"
            >
              <HelpCircle size={18} />
            </button>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">Mẫu số S3-HKD (Ban hành kèm theo Thông tư số 88/2021/TT-BTC)</p>
        </div>
      </div>

      {/* Controls S3 */}
      <div className="px-6 py-4 border-b border-surface-container bg-surface-container-lowest flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 print:hidden">
        {/* Left: Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="bg-surface-container-low rounded-lg border border-surface-container overflow-hidden">
            <select 
              value={quickFilter} 
              onChange={(e) => handleQuickFilter(e.target.value)}
              className="bg-transparent border-none text-sm p-2 outline-none font-medium text-on-surface"
            >
              <option value="this_month">Tháng này</option>
              <option value="last_month">Tháng trước</option>
              <option value="this_quarter">Quý này</option>
              <option value="last_quarter">Quý trước</option>
              <option value="this_year">Năm nay</option>
              <option value="custom">Tùy chỉnh...</option>
            </select>
          </div>

          <div className="flex items-center bg-surface-container-low rounded-lg border border-surface-container overflow-hidden">
            <div className="pl-3 py-2 text-on-surface-variant">
              <CalendarIcon size={16} />
            </div>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setQuickFilter("custom");
                setPage(1);
              }}
              className="bg-transparent border-none text-sm p-2 outline-none"
            />
            <span className="text-on-surface-variant px-1">-</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setQuickFilter("custom");
                setPage(1);
              }}
              className="bg-transparent border-none text-sm p-2 outline-none"
            />
          </div>
          
          <button 
            onClick={fetchLedgerS3}
            className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Lọc
          </button>
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <ExportDropdown 
            onExportExcel={() => alert("Tính năng xuất excel sổ S3 đang phát triển")}
            onPrintTT88={() => window.print()}
          />
        </div>
      </div>
      
      {/* KPI Summary S3 */}
      <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 shrink-0 print:hidden">
        <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant font-medium uppercase mb-1">Tổng Chi Phí</p>
          <p className="text-[15px] font-bold text-destructive truncate">{new Intl.NumberFormat("vi-VN").format(totals.expense)}</p>
        </div>
        <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant font-medium uppercase mb-1">Nhân Công</p>
          <p className="text-[15px] font-bold text-on-surface truncate">{formatCurrency(totals.col1)}</p>
        </div>
        <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant font-medium uppercase mb-1">Điện</p>
          <p className="text-[15px] font-bold text-on-surface truncate">{formatCurrency(totals.col2)}</p>
        </div>
        <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant font-medium uppercase mb-1">Nước</p>
          <p className="text-[15px] font-bold text-on-surface truncate">{formatCurrency(totals.col3)}</p>
        </div>
        <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant font-medium uppercase mb-1">Viễn Thông</p>
          <p className="text-[15px] font-bold text-on-surface truncate">{formatCurrency(totals.col4)}</p>
        </div>
        <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant font-medium uppercase mb-1">Thuê Mặt Bằng</p>
          <p className="text-[15px] font-bold text-on-surface truncate">{formatCurrency(totals.col5)}</p>
        </div>
        <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant font-medium uppercase mb-1">Quản Lý</p>
          <p className="text-[15px] font-bold text-on-surface truncate">{formatCurrency(totals.col6)}</p>
        </div>
        <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant font-medium uppercase mb-1">Khác</p>
          <p className="text-[15px] font-bold text-on-surface truncate">{formatCurrency(totals.col7)}</p>
        </div>
      </div>

      {/* Table Content */}
      <div id="print-area" className="flex-1 overflow-auto bg-surface-container-lowest">
        <PrintHeaderTT88 formId="S3-HKD" title="SỔ CHI PHÍ SẢN XUẤT, KINH DOANH" showTaxCode={false} showStoreNameInTitle={true}>
          <div className="font-bold mt-1">Năm: {new Date(startDate).getFullYear()}</div>
        </PrintHeaderTT88>
        {loading ? (
          <div className="flex justify-center items-center h-full min-h-[200px]">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-on-surface-variant">
        <Search size={48} className="opacity-20 mb-4" />
            <p>Không có chi phí nào trong khoảng thời gian này</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse border border-outline text-sm">
            <thead className="text-xs text-on-surface-variant uppercase bg-surface-container sticky top-0 z-10">
                  <tr className="print:text-[8px] print:leading-tight">
                    <th rowSpan={2} className="px-2 py-2 border-r border-b border-outline text-center font-bold">Ngày, tháng ghi sổ</th>
                    <th colSpan={2} className="px-2 py-2 border-r border-b border-outline text-center font-bold">Chứng từ</th>
                    <th rowSpan={2} className="px-2 py-2 border-r border-b border-outline text-center font-bold">Diễn giải</th>
                    <th rowSpan={2} className="px-2 py-2 border-r border-b border-outline text-center font-bold">Tổng số tiền</th>
                    <th colSpan={7} className="px-2 py-2 border-r border-b border-outline text-center font-bold">Tập hợp chi phí theo các yếu tố sản xuất, kinh doanh</th>
                  </tr>
                  <tr className="print:text-[10px] print:leading-tight">
                    <th className="px-2 py-2 border-r border-b border-outline text-center font-bold">Số hiệu</th>
                    <th className="px-2 py-2 border-r border-b border-outline text-center font-bold">Ngày, tháng</th>
                    <th className="px-2 py-2 border-r border-b border-outline text-center print:w-auto w-24 text-[10px] whitespace-normal">
                      <span className="print:hidden">Chi phí nhân công</span>
                      <span className="hidden print:inline">Chi phí nhân công</span>
                    </th>
                    <th className="px-2 py-2 border-r border-b border-outline text-center print:w-auto w-24 text-[10px] whitespace-normal">
                      <span className="print:hidden">Chi phí điện</span>
                      <span className="hidden print:inline">Chi phí điện</span>
                    </th>
                    <th className="px-2 py-2 border-r border-b border-outline text-center print:w-auto w-24 text-[10px] whitespace-normal">
                      <span className="print:hidden">Chi phí nước</span>
                      <span className="hidden print:inline">Chi phí nước</span>
                    </th>
                    <th className="px-2 py-2 border-r border-b border-outline text-center print:w-auto w-24 text-[10px] whitespace-normal">
                      <span className="print:hidden">Chi phí viễn thông</span>
                      <span className="hidden print:inline">Chi phí viễn thông</span>
                    </th>
                    <th className="px-2 py-2 border-r border-b border-outline text-center print:w-auto w-24 text-[10px] whitespace-normal">
                      <span className="print:hidden">Chi phí thuê kho bãi, mặt bằng KD</span>
                      <span className="hidden print:inline">Chi phí thuê kho bãi, mặt bằng KD</span>
                    </th>
                    <th className="px-2 py-2 border-r border-b border-outline text-center print:w-auto w-28 text-[10px] whitespace-normal">
                      <span className="print:hidden">Chi phí quản lý (chi phí văn phòng phẩm, công cụ...)</span>
                      <span className="hidden print:inline">Chi phí quản lý (chi phí văn phòng phẩm, công cụ...)</span>
                    </th>
                    <th className="px-2 py-2 border-r border-b border-outline text-center print:w-auto w-28 text-[10px] whitespace-normal">
                      <span className="print:hidden">Chi phí khác (hội nghị, công tác phí, thanh lý, TSCD...)</span>
                      <span className="hidden print:inline">Chi phí khác (hội nghị, công tác phí, thanh lý, TSCD...)</span>
                    </th>
                  </tr>
                  <tr className="hidden">
                    <th className="px-2 py-1 border-r border-b border-outline text-center">A</th>
                    <th className="px-2 py-1 border-r border-b border-outline text-center">B</th>
                    <th className="px-2 py-1 border-r border-b border-outline text-center">C</th>
                    <th className="px-2 py-1 border-r border-b border-outline text-center">D</th>
                    <th className="px-2 py-1 border-r border-b border-outline text-center">1</th>
                    <th className="px-2 py-1 border-r border-b border-outline text-center">2</th>
                    <th className="px-2 py-1 border-r border-b border-outline text-center">3</th>
                    <th className="px-2 py-1 border-r border-b border-outline text-center">4</th>
                    <th className="px-2 py-1 border-r border-b border-outline text-center">5</th>
                    <th className="px-2 py-1 border-r border-b border-outline text-center">6</th>
                    <th className="px-2 py-1 border-r border-b border-outline text-center">7</th>
                    <th className="px-2 py-1 border-r border-b border-outline text-center">8</th>
                  </tr>
            </thead>
            <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx} className="border-b border-outline even:bg-slate-50 odd:bg-white hover:bg-surface-container-low transition-colors">
                      <td className="px-4 py-3 border-r border-b border-outline text-center">{formatDateDisplay(row.date)}</td>
                      <td className="px-4 py-3 border-r border-b border-outline text-center font-medium">{row.receiptNo}</td>
                      <td className="px-4 py-3 border-r border-b border-outline text-center">{formatDateDisplay(row.receiptDate)}</td>
                      <td className="px-4 py-3 border-r border-b border-outline text-left pl-4">{row.description}</td>
                      <td className="px-4 py-3 border-r border-b border-outline text-center tabular-nums font-medium text-primary">{formatCurrency(row.col1_Labor + row.col2_Electricity + row.col3_Water + row.col4_Telecom + row.col5_Rent + row.col6_Management + row.col7_Other)}</td>
                      <td className="px-4 py-3 border-r border-b border-outline text-center tabular-nums font-medium text-primary">{formatCurrency(row.col1_Labor)}</td>
                      <td className="px-4 py-3 border-r border-b border-outline text-center tabular-nums font-medium text-primary">{formatCurrency(row.col2_Electricity)}</td>
                      <td className="px-4 py-3 border-r border-b border-outline text-center tabular-nums font-medium text-primary">{formatCurrency(row.col3_Water)}</td>
                      <td className="px-4 py-3 border-r border-b border-outline text-center tabular-nums font-medium text-primary">{formatCurrency(row.col4_Telecom)}</td>
                      <td className="px-4 py-3 border-r border-b border-outline text-center tabular-nums font-medium text-primary">{formatCurrency(row.col5_Rent)}</td>
                      <td className="px-4 py-3 border-r border-b border-outline text-center tabular-nums font-medium text-primary">{formatCurrency(row.col6_Management)}</td>
                      <td className="px-4 py-3 border-r border-b border-outline text-center tabular-nums font-medium text-primary">{formatCurrency(row.col7_Other)}</td>
                    </tr>
                  ))}
                  </tbody>
                  <tbody className="break-inside-avoid print:break-inside-avoid">
                    <tr className="font-bold bg-surface-container sticky bottom-0 border-t border-outline total-row">
                      <td colSpan={4} className="px-4 py-3 text-center pr-6 border-r border-b border-outline">Tổng cộng:</td>
                      <td className="px-4 py-3 border-r border-b border-outline text-center tabular-nums">{formatCurrency(totals.expense)}</td>
                      <td className="px-4 py-3 border-r border-b border-outline text-center tabular-nums">{formatCurrency(totals.col1)}</td>
                      <td className="px-4 py-3 border-r border-b border-outline text-center tabular-nums">{formatCurrency(totals.col2)}</td>
                      <td className="px-4 py-3 border-r border-b border-outline text-center tabular-nums">{formatCurrency(totals.col3)}</td>
                      <td className="px-4 py-3 border-r border-b border-outline text-center tabular-nums">{formatCurrency(totals.col4)}</td>
                      <td className="px-4 py-3 border-r border-b border-outline text-center tabular-nums">{formatCurrency(totals.col5)}</td>
                      <td className="px-4 py-3 border-r border-b border-outline text-center tabular-nums">{formatCurrency(totals.col6)}</td>
                      <td className="px-4 py-3 border-r border-b border-outline text-center tabular-nums">{formatCurrency(totals.col7)}</td>
                    </tr>
                  </tbody>
          </table>
        )}
        <PrintFooterTT88 hideNotes={true} />
      </div>

      {/* Pagination S3 */}
      {!loading && data.length > 0 && (
        <div className="p-4 border-t border-surface-container bg-surface-container-lowest flex items-center justify-between shrink-0">
          <span className="text-sm text-on-surface-variant">
            Hiển thị bản ghi {((page - 1) * pageSize) + 1} đến {Math.min(page * pageSize, totalCount)} (Tổng số: {totalCount} bản ghi)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-surface-container text-on-surface rounded disabled:opacity-50"
            >
              Trước
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * pageSize >= totalCount}
              className="px-3 py-1 bg-surface-container text-on-surface rounded disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      <TT88HelpModal 
        isOpen={showHelpModal} 
        onClose={() => setShowHelpModal(false)} 
        formId="s3" 
      />
    </div>
  );
}
