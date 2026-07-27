"use client";

import React, { useState, useEffect } from "react";
import { Download, Search, RefreshCw, Calendar as CalendarIcon, FileText, Package } from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import LedgerS2HKDTab from "@/components/Inventory/InventoryTabs/LedgerS2HKDTab";
import S3LedgerTab from "./S3LedgerTab";

const API_URL = "http://localhost:5178/api";

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

interface S1LedgerRow {
  date: string;
  receiptNo: string;
  receiptDate: string;
  description: string;
  col1_Distribution: number;
  col2_Services: number;
  col3_Production: number;
  col4_Other: number;
  notes: string;
}

export default function TaxReportsTT88() {
  const [activeTab, setActiveTab] = useState("s1");

  // --- S1 STATE ---
  const [data, setData] = useState<S1LedgerRow[]>([]);
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
  const [totals, setTotals] = useState({ col1: 0, col2: 0, col3: 0, col4: 0, revenue: 0 });
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

  const fetchLedgerS1 = async () => {
    setLoading(true);
    try {
      const auth = getAuthInfo();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5178/api';
      const res = await fetch(`${apiUrl}/reports/s1-hkd?startDate=${startDate}&endDate=${endDate}&page=${page}&pageSize=${pageSize}`, {
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
          col1: json.totalCol1_Distribution || 0,
          col2: json.totalCol2_Services || 0,
          col3: json.totalCol3_Production || 0,
          col4: json.totalCol4_Other || 0,
          revenue: (json.totalCol1_Distribution || 0) + (json.totalCol2_Services || 0) + (json.totalCol3_Production || 0) + (json.totalCol4_Other || 0)
        });
      }
    } catch (error) {
      console.error("Failed to fetch S1 ledger:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "s1") {
      fetchLedgerS1();
    }
  }, [activeTab, page]);

  const formatCurrency = (val: number) => {
    if (!val || val === 0) return "-";
    return new Intl.NumberFormat("vi-VN").format(val);
  };

  const formatDateDisplay = (dateString: string) => {
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  // --- S2 STATE ---
  const [selectedLedgerProduct, setSelectedLedgerProduct] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [ledgerPage, setLedgerPage] = useState(1);

  const { data: productsData } = useQuery({
    queryKey: ["inventory_products_s2"],
    queryFn: async () => {
      if (activeTab !== "s2") return null;
      const auth = getAuthInfo();
      const queryParams = new URLSearchParams({
        page: "1",
        pageSize: "1000",
      });
      const res = await fetch(`${API_URL}/products?${queryParams.toString()}`, {
        headers: { 
          "X-Tenant-Id": auth.tenantId,
          "Authorization": `Bearer ${auth.token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
    placeholderData: keepPreviousData,
    enabled: activeTab === "s2"
  });

  const products = productsData?.items || [];

  useEffect(() => {
    if (activeTab === "s2" && products.length > 0 && !selectedLedgerProduct) {
      setSelectedLedgerProduct(products[0].id);
    }
  }, [activeTab, products, selectedLedgerProduct]);

  const { data: ledgerData, isLoading: isLedgerLoading } = useQuery({
    queryKey: ["inventory_ledger_s2", selectedLedgerProduct, selectedMonth, selectedYear, ledgerPage],
    queryFn: async () => {
      if (activeTab !== "s2" || !selectedLedgerProduct) return null;
      const auth = getAuthInfo();
      const start = new Date(selectedYear, selectedMonth - 1, 1, 0, 0, 0).toISOString();
      const end = new Date(selectedYear, selectedMonth, 0, 23, 59, 59).toISOString();
      const res = await fetch(`${API_URL}/inventory/reports/s2?productId=${selectedLedgerProduct}&startDate=${start}&endDate=${end}&page=${ledgerPage}&pageSize=10`, {
        headers: { 
          "X-Tenant-Id": auth.tenantId,
          "Authorization": `Bearer ${auth.token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch ledger");
      return res.json();
    },
    placeholderData: keepPreviousData,
    enabled: activeTab === "s2" && !!selectedLedgerProduct
  });

  const ledger = ledgerData || null;

  const handleExportExcelS2 = () => {
    // Implement Excel Export for S2
    alert("Tính năng xuất excel sổ S2 đang phát triển");
  };

  return (
    <div className="bg-white rounded-2xl border border-surface-container-high shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-300">
      {/* Header & Tabs */}
      <div className="border-b border-surface-container bg-surface-container-lowest pt-6 px-6">
        <h2 className="text-2xl font-bold text-on-surface mb-2 font-mono tracking-tight">HỆ THỐNG SỔ SÁCH KẾ TOÁN (TT88)</h2>
        <p className="text-sm text-on-surface-variant mb-6">Quản lý toàn bộ sổ sách kế toán hộ kinh doanh theo chuẩn Thông tư 88/2021/TT-BTC</p>
        
        {/* Scrollable Tabs */}
        <div className="flex gap-6 overflow-x-auto no-scrollbar border-b border-surface-container">
          {[
            { id: "s1", icon: FileText, label: "Sổ S1-HKD (Doanh Thu)" },
            { id: "s2", icon: Package, label: "Sổ S2-HKD (Tồn Kho)" },
            { id: "s3", icon: FileText, label: "Sổ S3-HKD (Chi Phí)" },
            { id: "s4", icon: FileText, label: "Sổ S4-HKD (Lương)" },
            { id: "s5", icon: FileText, label: "Sổ S5-HKD (Ngân Hàng)" },
            { id: "s6", icon: FileText, label: "Sổ S6-HKD (Tiền Mặt)" },
            { id: "s7", icon: FileText, label: "Sổ S7-HKD (Thuế)" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 border-b-2 font-semibold text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? "border-primary text-primary" 
                  : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-surface-container-high"
              }`}
            >
              <tab.icon size={16} className={activeTab === tab.id ? "text-primary" : "opacity-70"} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {activeTab === "s1" && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Controls S1 */}
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
                onClick={fetchLedgerS1}
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
          
          {/* KPI Summary S1 */}
          <div className="px-4 py-4 grid grid-cols-2 md:grid-cols-5 gap-4 shrink-0">
            <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl shadow-sm">
              <p className="text-xs text-on-surface-variant font-medium uppercase mb-1">Tổng Doanh Thu</p>
              <p className="text-xl font-bold text-primary">{new Intl.NumberFormat("vi-VN").format(totals.revenue)} đ</p>
            </div>
            <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl shadow-sm">
              <p className="text-xs text-on-surface-variant font-medium uppercase mb-1" title="Phân phối, cung cấp hàng hóa">PP, Cung cấp (1.5%)</p>
              <p className="text-lg font-bold text-on-surface">{formatCurrency(totals.col1)}</p>
            </div>
            <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl shadow-sm">
              <p className="text-xs text-on-surface-variant font-medium uppercase mb-1" title="Dịch vụ, xây dựng không bao thầu NVL">Dịch vụ (7%)</p>
              <p className="text-lg font-bold text-on-surface">{formatCurrency(totals.col2)}</p>
            </div>
            <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl shadow-sm">
              <p className="text-xs text-on-surface-variant font-medium uppercase mb-1" title="Sản xuất, vận tải, dịch vụ có gắn với hàng hóa">Sản xuất (4.5%)</p>
              <p className="text-lg font-bold text-on-surface">{formatCurrency(totals.col3)}</p>
            </div>
            <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl shadow-sm">
              <p className="text-xs text-on-surface-variant font-medium uppercase mb-1" title="Hoạt động kinh doanh khác">Khác (3%)</p>
              <p className="text-lg font-bold text-on-surface">{formatCurrency(totals.col4)}</p>
            </div>
          </div>

          {/* Table Content S1 */}
          <div className="flex-1 overflow-auto bg-surface-container-lowest">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : data.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
                <Search size={48} className="opacity-20 mb-4" />
                <p>Không có giao dịch nào trong khoảng thời gian này</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-on-surface-variant uppercase bg-surface-container sticky top-0 z-10">
                  <tr>
                    <th rowSpan={2} className="px-4 py-3 border-r border-b border-surface-container-high w-24 text-center">Ngày, tháng ghi sổ</th>
                    <th colSpan={2} className="px-4 py-2 border-r border-b border-surface-container-high text-center">Chứng từ</th>
                    <th rowSpan={2} className="px-4 py-3 border-r border-b border-surface-container-high min-w-[200px] text-center">Diễn giải</th>
                    <th colSpan={4} className="px-4 py-2 border-r border-b border-surface-container-high text-center">Doanh thu bán hàng hóa, dịch vụ</th>
                    <th rowSpan={2} className="px-4 py-3 border-b border-surface-container-high min-w-[120px] text-center">Ghi chú</th>
                  </tr>
                  <tr>
                    <th className="px-4 py-2 border-r border-b border-surface-container-high text-center w-24">Số hiệu</th>
                    <th className="px-4 py-2 border-r border-b border-surface-container-high text-center w-24">Ngày tháng</th>
                    <th className="px-2 py-2 border-r border-b border-surface-container-high text-center w-28 text-[10px]">PP, CC HH (1.5%)</th>
                    <th className="px-2 py-2 border-r border-b border-surface-container-high text-center w-28 text-[10px]">Dịch vụ (7%)</th>
                    <th className="px-2 py-2 border-r border-b border-surface-container-high text-center w-28 text-[10px]">Sản xuất, VT (4.5%)</th>
                    <th className="px-2 py-2 border-r border-b border-surface-container-high text-center w-28 text-[10px]">Khác (3%)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx} className="border-b border-surface-container hover:bg-surface-container-low transition-colors">
                      <td className="px-4 py-3 border-r border-surface-container text-center">{formatDateDisplay(row.date)}</td>
                      <td className="px-4 py-3 border-r border-surface-container text-center font-medium">{row.receiptNo}</td>
                      <td className="px-4 py-3 border-r border-surface-container text-center">{formatDateDisplay(row.receiptDate)}</td>
                      <td className="px-4 py-3 border-r border-surface-container text-center">{row.description}</td>
                      <td className="px-4 py-3 border-r border-surface-container text-center font-medium text-primary">{formatCurrency(row.col1_Distribution)}</td>
                      <td className="px-4 py-3 border-r border-surface-container text-center font-medium text-primary">{formatCurrency(row.col2_Services)}</td>
                      <td className="px-4 py-3 border-r border-surface-container text-center font-medium text-primary">{formatCurrency(row.col3_Production)}</td>
                      <td className="px-4 py-3 border-r border-surface-container text-center font-medium text-primary">{formatCurrency(row.col4_Other)}</td>
                      <td className="px-4 py-3 text-center">{row.notes}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-surface-container sticky bottom-0 border-t border-surface-container-high">
                    <td colSpan={4} className="px-4 py-3 text-center border-r border-surface-container-high">Tổng cộng:</td>
                    <td className="px-4 py-3 border-r border-surface-container-high text-center">{formatCurrency(totals.col1)}</td>
                    <td className="px-4 py-3 border-r border-surface-container-high text-center">{formatCurrency(totals.col2)}</td>
                    <td className="px-4 py-3 border-r border-surface-container-high text-center">{formatCurrency(totals.col3)}</td>
                    <td className="px-4 py-3 border-r border-surface-container-high text-center">{formatCurrency(totals.col4)}</td>
                    <td className="px-4 py-3 text-center"></td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination S1 */}
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
      )}

      {activeTab === "s2" && (
        <div className="flex-1 overflow-auto p-6 bg-surface-container-lowest">
          <LedgerS2HKDTab 
            selectedLedgerProduct={selectedLedgerProduct}
            setSelectedLedgerProduct={setSelectedLedgerProduct}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            products={products}
            handleExportExcel={handleExportExcelS2}
            ledger={ledger}
            isLedgerLoading={isLedgerLoading}
            ledgerPage={ledgerPage}
            setLedgerPage={setLedgerPage}
          />
        </div>
      )}

      {activeTab === "s3" && (
        <div className="flex-1 overflow-auto bg-surface-container-lowest">
          <S3LedgerTab />
        </div>
      )}

      {["s4", "s5", "s6", "s7"].includes(activeTab) && (
        <div className="flex-1 flex flex-col items-center justify-center bg-surface-container-lowest p-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mb-6 shadow-sm border border-surface-container">
            <FileText size={40} className="text-on-surface-variant opacity-60" />
          </div>
          <h3 className="text-xl font-bold text-on-surface font-mono tracking-tight mb-2">Đang phát triển</h3>
          <p className="text-on-surface-variant text-center max-w-md">Tính năng này đang trong quá trình xây dựng và sẽ sớm ra mắt ở bản cập nhật tiếp theo. Vui lòng quay lại sau!</p>
        </div>
      )}
    </div>
  );
}
