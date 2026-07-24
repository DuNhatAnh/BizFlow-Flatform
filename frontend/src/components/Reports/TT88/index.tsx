"use client";

import React, { useState, useEffect } from "react";
import { Download, Search, RefreshCw, Calendar as CalendarIcon } from "lucide-react";

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

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("bizflow_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5178/api';
      const res = await fetch(`${apiUrl}/reports/s1-hkd?startDate=${startDate}&endDate=${endDate}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Failed to fetch S1 ledger:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const formatCurrency = (val: number) => {
    if (!val || val === 0) return "-";
    return new Intl.NumberFormat("vi-VN").format(val);
  };

  const totalCol1 = data.reduce((sum, row) => sum + row.col1_Distribution, 0);
  const totalCol2 = data.reduce((sum, row) => sum + row.col2_Services, 0);
  const totalCol3 = data.reduce((sum, row) => sum + row.col3_Production, 0);
  const totalCol4 = data.reduce((sum, row) => sum + row.col4_Other, 0);
  const totalRevenue = totalCol1 + totalCol2 + totalCol3 + totalCol4;

  const formatDateDisplay = (dateString: string) => {
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-surface-container-high shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="p-6 border-b border-surface-container bg-surface-container-lowest">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Sổ S1-HKD: Chi tiết doanh thu</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Sổ chi tiết doanh thu bán hàng hóa, dịch vụ theo Thông tư 88/2021/TT-BTC
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-surface-container-low rounded-lg border border-surface-container overflow-hidden">
              <div className="pl-3 py-2 text-on-surface-variant">
                <CalendarIcon size={16} />
              </div>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none text-sm p-2 outline-none"
              />
              <span className="text-on-surface-variant px-1">-</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none text-sm p-2 outline-none"
              />
            </div>
            
            <button 
              onClick={fetchLedger}
              className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Lọc
            </button>
            
            <button className="px-4 py-2 bg-primary text-on-primary hover:bg-primary/90 rounded-lg text-sm font-medium shadow-sm transition-all flex items-center gap-2">
              <Download size={16} />
              Xuất Excel
            </button>
          </div>
        </div>
        
        {/* KPI Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl shadow-sm">
            <p className="text-xs text-on-surface-variant font-medium uppercase mb-1">Tổng Doanh Thu</p>
            <p className="text-xl font-bold text-primary">{new Intl.NumberFormat("vi-VN").format(totalRevenue)} đ</p>
          </div>
          <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl shadow-sm">
            <p className="text-xs text-on-surface-variant font-medium uppercase mb-1" title="Phân phối, cung cấp hàng hóa">PP, Cung cấp (1.5%)</p>
            <p className="text-lg font-bold text-on-surface">{formatCurrency(totalCol1)}</p>
          </div>
          <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl shadow-sm">
            <p className="text-xs text-on-surface-variant font-medium uppercase mb-1" title="Dịch vụ, xây dựng không bao thầu NVL">Dịch vụ (7%)</p>
            <p className="text-lg font-bold text-on-surface">{formatCurrency(totalCol2)}</p>
          </div>
          <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl shadow-sm">
            <p className="text-xs text-on-surface-variant font-medium uppercase mb-1" title="Sản xuất, vận tải, dịch vụ có gắn với hàng hóa">Sản xuất (4.5%)</p>
            <p className="text-lg font-bold text-on-surface">{formatCurrency(totalCol3)}</p>
          </div>
          <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl shadow-sm">
            <p className="text-xs text-on-surface-variant font-medium uppercase mb-1" title="Hoạt động kinh doanh khác">Khác (3%)</p>
            <p className="text-lg font-bold text-on-surface">{formatCurrency(totalCol4)}</p>
          </div>
        </div>
      </div>

      {/* Table Content */}
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
                <th rowSpan={2} className="px-4 py-3 border-r border-b border-surface-container-high w-24">Ngày, tháng ghi sổ</th>
                <th colSpan={2} className="px-4 py-2 border-r border-b border-surface-container-high text-center">Chứng từ</th>
                <th rowSpan={2} className="px-4 py-3 border-r border-b border-surface-container-high min-w-[200px]">Diễn giải</th>
                <th colSpan={4} className="px-4 py-2 border-r border-b border-surface-container-high text-center">Doanh thu bán hàng hóa, dịch vụ</th>
                <th rowSpan={2} className="px-4 py-3 border-b border-surface-container-high min-w-[120px]">Ghi chú</th>
              </tr>
              <tr>
                <th className="px-4 py-2 border-r border-b border-surface-container-high text-center w-24">Số hiệu</th>
                <th className="px-4 py-2 border-r border-b border-surface-container-high text-center w-24">Ngày tháng</th>
                <th className="px-2 py-2 border-r border-b border-surface-container-high text-right w-28 text-[10px]" title="Phân phối, cung cấp hàng hóa">Phân phối, cung cấp hàng hóa (1.5%)</th>
                <th className="px-2 py-2 border-r border-b border-surface-container-high text-right w-28 text-[10px]" title="Dịch vụ, xây dựng không bao thầu NVL">Dịch vụ, xây dựng ko bao thầu (7%)</th>
                <th className="px-2 py-2 border-r border-b border-surface-container-high text-right w-28 text-[10px]" title="Sản xuất, vận tải, dịch vụ có gắn với hàng hóa, xây dựng có bao thầu NVL">Sản xuất, vận tải, dịch vụ (4.5%)</th>
                <th className="px-2 py-2 border-r border-b border-surface-container-high text-right w-28 text-[10px]" title="Hoạt động kinh doanh khác">HĐ kinh doanh khác (3%)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="border-b border-surface-container hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3 border-r border-surface-container">{formatDateDisplay(row.date)}</td>
                  <td className="px-4 py-3 border-r border-surface-container text-center font-medium">{row.receiptNo}</td>
                  <td className="px-4 py-3 border-r border-surface-container text-center">{formatDateDisplay(row.receiptDate)}</td>
                  <td className="px-4 py-3 border-r border-surface-container">{row.description}</td>
                  <td className="px-4 py-3 border-r border-surface-container text-right font-medium text-primary">{formatCurrency(row.col1_Distribution)}</td>
                  <td className="px-4 py-3 border-r border-surface-container text-right font-medium text-primary">{formatCurrency(row.col2_Services)}</td>
                  <td className="px-4 py-3 border-r border-surface-container text-right font-medium text-primary">{formatCurrency(row.col3_Production)}</td>
                  <td className="px-4 py-3 border-r border-surface-container text-right font-medium text-primary">{formatCurrency(row.col4_Other)}</td>
                  <td className="px-4 py-3">{row.notes}</td>
                </tr>
              ))}
              <tr className="font-bold bg-surface-container sticky bottom-0 border-t border-surface-container-high">
                <td colSpan={4} className="px-4 py-3 text-right border-r border-surface-container-high">Cộng phát sinh:</td>
                <td className="px-4 py-3 border-r border-surface-container-high text-right">{formatCurrency(totalCol1)}</td>
                <td className="px-4 py-3 border-r border-surface-container-high text-right">{formatCurrency(totalCol2)}</td>
                <td className="px-4 py-3 border-r border-surface-container-high text-right">{formatCurrency(totalCol3)}</td>
                <td className="px-4 py-3 border-r border-surface-container-high text-right">{formatCurrency(totalCol4)}</td>
                <td className="px-4 py-3"></td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
