import React, { useState, useEffect } from "react";
import { Download, Search, RefreshCw, Calendar as CalendarIcon, FileText } from "lucide-react";

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
  col2_Utilities: number;
  col3_Rent: number;
  col4_Management: number;
  col5_Other: number;
  notes: string;
}

export default function S3LedgerTab() {
  const [data, setData] = useState<S3LedgerRow[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [totals, setTotals] = useState({ col1: 0, col2: 0, col3: 0, col4: 0, col5: 0, expense: 0 });
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
          col2: json.totalCol2_Utilities || 0,
          col3: json.totalCol3_Rent || 0,
          col4: json.totalCol4_Management || 0,
          col5: json.totalCol5_Other || 0,
          expense: (json.totalCol1_Labor || 0) + (json.totalCol2_Utilities || 0) + (json.totalCol3_Rent || 0) + (json.totalCol4_Management || 0) + (json.totalCol5_Other || 0)
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
      {/* Controls */}
      <div className="p-4 border-b border-surface-container bg-surface-container-lowest flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
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
          
          <button className="px-4 py-2 bg-primary text-on-primary hover:bg-primary/90 rounded-lg text-sm font-medium shadow-sm transition-all flex items-center gap-2 ml-auto md:ml-0">
            <Download size={16} />
            Xuất Excel
          </button>
        </div>
      </div>
      
      {/* KPI Summary */}
      <div className="px-4 py-4 grid grid-cols-2 md:grid-cols-6 gap-4 shrink-0">
        <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant font-medium uppercase mb-1">Tổng Chi Phí</p>
          <p className="text-xl font-bold text-destructive">{new Intl.NumberFormat("vi-VN").format(totals.expense)} đ</p>
        </div>
        <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant font-medium uppercase mb-1">Nhân Công</p>
          <p className="text-lg font-bold text-on-surface">{formatCurrency(totals.col1)}</p>
        </div>
        <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant font-medium uppercase mb-1">Điện, Nước, VT</p>
          <p className="text-lg font-bold text-on-surface">{formatCurrency(totals.col2)}</p>
        </div>
        <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant font-medium uppercase mb-1">Thuê Mặt Bằng</p>
          <p className="text-lg font-bold text-on-surface">{formatCurrency(totals.col3)}</p>
        </div>
        <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant font-medium uppercase mb-1">Quản Lý</p>
          <p className="text-lg font-bold text-on-surface">{formatCurrency(totals.col4)}</p>
        </div>
        <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant font-medium uppercase mb-1">Khác</p>
          <p className="text-lg font-bold text-on-surface">{formatCurrency(totals.col5)}</p>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto bg-surface-container-lowest">
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
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-on-surface-variant uppercase bg-surface-container sticky top-0 z-10">
              <tr>
                <th rowSpan={2} className="px-4 py-3 border-r border-b border-surface-container-high w-24 text-center">Ngày, tháng ghi sổ</th>
                <th colSpan={2} className="px-4 py-2 border-r border-b border-surface-container-high text-center">Chứng từ</th>
                <th rowSpan={2} className="px-4 py-3 border-r border-b border-surface-container-high min-w-[200px] text-center">Diễn giải</th>
                <th colSpan={5} className="px-4 py-2 border-r border-b border-surface-container-high text-center">Chi phí sản xuất, kinh doanh</th>
              </tr>
              <tr>
                <th className="px-4 py-2 border-r border-b border-surface-container-high text-center w-24">Số hiệu</th>
                <th className="px-4 py-2 border-r border-b border-surface-container-high text-center w-24">Ngày tháng</th>
                <th className="px-2 py-2 border-r border-b border-surface-container-high text-center w-28 text-[10px]">Nhân công</th>
                <th className="px-2 py-2 border-r border-b border-surface-container-high text-center w-28 text-[10px]">Điện, nước, viễn thông</th>
                <th className="px-2 py-2 border-r border-b border-surface-container-high text-center w-28 text-[10px]">Thuê kho bãi, mặt bằng</th>
                <th className="px-2 py-2 border-r border-b border-surface-container-high text-center w-28 text-[10px]">Quản lý</th>
                <th className="px-2 py-2 border-r border-b border-surface-container-high text-center w-28 text-[10px]">Khác</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="border-b border-surface-container hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3 border-r border-surface-container text-center">{formatDateDisplay(row.date)}</td>
                  <td className="px-4 py-3 border-r border-surface-container text-center font-medium">{row.receiptNo}</td>
                  <td className="px-4 py-3 border-r border-surface-container text-center">{formatDateDisplay(row.receiptDate)}</td>
                  <td className="px-4 py-3 border-r border-surface-container text-center">{row.description}</td>
                  <td className="px-4 py-3 border-r border-surface-container text-center font-medium text-destructive">{formatCurrency(row.col1_Labor)}</td>
                  <td className="px-4 py-3 border-r border-surface-container text-center font-medium text-destructive">{formatCurrency(row.col2_Utilities)}</td>
                  <td className="px-4 py-3 border-r border-surface-container text-center font-medium text-destructive">{formatCurrency(row.col3_Rent)}</td>
                  <td className="px-4 py-3 border-r border-surface-container text-center font-medium text-destructive">{formatCurrency(row.col4_Management)}</td>
                  <td className="px-4 py-3 border-r border-surface-container text-center font-medium text-destructive">{formatCurrency(row.col5_Other)}</td>
                </tr>
              ))}
              <tr className="font-bold bg-surface-container sticky bottom-0 border-t border-surface-container-high">
                <td colSpan={4} className="px-4 py-3 text-center border-r border-surface-container-high">Tổng cộng:</td>
                <td className="px-4 py-3 border-r border-surface-container-high text-center">{formatCurrency(totals.col1)}</td>
                <td className="px-4 py-3 border-r border-surface-container-high text-center">{formatCurrency(totals.col2)}</td>
                <td className="px-4 py-3 border-r border-surface-container-high text-center">{formatCurrency(totals.col3)}</td>
                <td className="px-4 py-3 border-r border-surface-container-high text-center">{formatCurrency(totals.col4)}</td>
                <td className="px-4 py-3 border-r border-surface-container-high text-center">{formatCurrency(totals.col5)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination S3 */}
      {!loading && data.length > 0 && (
        <div className="p-4 border-t border-surface-container bg-surface-container-lowest flex items-center justify-between shrink-0">
          <span className="text-sm text-on-surface-variant">
            Hiển thị {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, totalCount)} trong số {totalCount}
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
    </div>
  );
}
