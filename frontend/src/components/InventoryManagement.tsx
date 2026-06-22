"use client";

import React, { useState, useEffect } from "react";
import { 
  Package, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  FileText, 
  Settings,
  Search,
  Plus,
  Filter,
  Info,
  X,
  Save,
  Trash2,
  AlertCircle,
  Eye,
  Printer
} from "lucide-react";

const TENANT_ID = "11111111-1111-1111-1111-111111111111";
const API_URL = "http://localhost:5178/api";

export default function InventoryManagement() {
  const [activeSubTab, setActiveSubTab] = useState("stock");
  const [cogsMethod, setCogsMethod] = useState("weighted_average");

  const [products, setProducts] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any>(null);
  const [selectedLedgerProduct, setSelectedLedgerProduct] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);

  // Modal State
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReceiptId, setCancelReceiptId] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [viewReceiptDetails, setViewReceiptDetails] = useState<any>(null);
  
  const [receiptForm, setReceiptForm] = useState({
    type: 1, // 1 = Import, 2 = Export
    date: new Date().toISOString().split('T')[0],
    note: "",
    delivererReceiverName: "",
    referenceDocumentNo: "",
    referenceDocumentDate: "",
    referenceDocumentIssuer: "",
    warehouseLocation: "",
    items: [] as { productId: string, documentQuantity: number, quantity: number, unitPrice: number, productName: string }[]
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`, {
        headers: { "X-Tenant-Id": TENANT_ID }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        if (data.length > 0 && !selectedLedgerProduct) {
          setSelectedLedgerProduct(data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReceipts = async () => {
    try {
      const res = await fetch(`${API_URL}/inventory/receipts`, {
        headers: { "X-Tenant-Id": TENANT_ID }
      });
      if (res.ok) {
        const data = await res.json();
        setReceipts(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLedger = async (productId: string, month: number, year: number) => {
    if (!productId) return;
    try {
      setIsLoading(true);
      const startDate = new Date(year, month - 1, 1, 0, 0, 0).toISOString();
      const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
      const res = await fetch(`${API_URL}/inventory/reports/s2?productId=${productId}&startDate=${startDate}&endDate=${endDate}`, {
        headers: { "X-Tenant-Id": TENANT_ID }
      });
      if (res.ok) {
        setLedger(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchReceipts();
  }, []);

  useEffect(() => {
    if (activeSubTab === "ledger" && selectedLedgerProduct) {
      fetchLedger(selectedLedgerProduct, selectedMonth, selectedYear);
    }
  }, [activeSubTab, selectedLedgerProduct, selectedMonth, selectedYear]);

  const handleOpenReceiptModal = (type: number) => {
    setReceiptForm({
      type,
      date: new Date().toISOString().split('T')[0],
      note: "",
      delivererReceiverName: "",
      referenceDocumentNo: "",
      referenceDocumentDate: "",
      referenceDocumentIssuer: "",
      warehouseLocation: "",
      items: [{ productId: products.length > 0 ? products[0].id : "", documentQuantity: 1, quantity: 1, unitPrice: 0, productName: "" }]
    });
    setIsReceiptModalOpen(true);
  };

  const handleAddReceiptItem = () => {
    setReceiptForm({
      ...receiptForm,
      items: [...receiptForm.items, { productId: products.length > 0 ? products[0].id : "", documentQuantity: 1, quantity: 1, unitPrice: 0, productName: "" }]
    });
  };

  const handleRemoveReceiptItem = (index: number) => {
    const newItems = [...receiptForm.items];
    newItems.splice(index, 1);
    setReceiptForm({ ...receiptForm, items: newItems });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...receiptForm.items];
    (newItems[index] as any)[field] = value;
    setReceiptForm({ ...receiptForm, items: newItems });
  };

  const handleSubmitReceipt = async () => {
    if (!receiptForm.delivererReceiverName?.trim()) {
      showToast("Vui lòng nhập Họ tên người giao/nhận hàng", "error");
      return;
    }
    if (!receiptForm.referenceDocumentNo?.trim()) {
      showToast("Vui lòng nhập Số chứng từ gốc", "error");
      return;
    }
    if (receiptForm.items.length === 0) {
      showToast("Vui lòng thêm ít nhất 1 sản phẩm", "error");
      return;
    }

    if (isLoading) return;
    setIsLoading(true);
    try {
      const payload = {
        type: receiptForm.type === 1 ? 0 : 1, // Fix enum mismatch: Frontend 1=Import, Backend 0=Import
        date: receiptForm.date ? new Date(receiptForm.date).toISOString() : null,
        note: receiptForm.note,
        delivererReceiverName: receiptForm.delivererReceiverName || null,
        referenceDocumentNo: receiptForm.referenceDocumentNo || null,
        referenceDocumentDate: receiptForm.referenceDocumentDate ? new Date(receiptForm.referenceDocumentDate).toISOString() : null,
        referenceDocumentIssuer: receiptForm.referenceDocumentIssuer || null,
        warehouseLocation: receiptForm.warehouseLocation || null,
        items: receiptForm.items.map(i => ({
          productId: i.productId,
          documentQuantity: Number(i.documentQuantity),
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice)
        }))
      };

      const res = await fetch(`${API_URL}/inventory/receipts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": TENANT_ID
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast("Tạo phiếu thành công!");
        setIsReceiptModalOpen(false);
        fetchReceipts();
        fetchProducts(); // Refresh stock
        if (activeSubTab === "ledger" && selectedLedgerProduct) fetchLedger(selectedLedgerProduct, selectedMonth, selectedYear);
      } else {
        const error = await res.text();
        showToast(`Lỗi: ${error}`, "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Lỗi kết nối máy chủ", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelReceipt = async () => {
    if (!cancelReason.trim()) {
      showToast("Vui lòng nhập lý do hủy", "error");
      return;
    }
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/inventory/receipts/${cancelReceiptId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": TENANT_ID
        },
        body: JSON.stringify({ cancelReason })
      });
      if (res.ok) {
        showToast("Đã hủy phiếu thành công");
        setCancelModalOpen(false);
        setCancelReason("");
        fetchReceipts();
        fetchProducts(); // Refresh stock
      } else {
        const err = await res.json();
        showToast(err.error || "Lỗi hủy phiếu", "error");
      }
    } catch (e) {
      showToast("Lỗi kết nối", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!ledger || !ledger.records) return;

    let tableHTML = `
      <tr style="height: 35pt;">
        <th style="background-color: #f1f5f9; border: 1px solid #94a3b8; font-weight: bold; text-align: center; width: 120px;">Ngày tháng</th>
        <th style="background-color: #f1f5f9; border: 1px solid #94a3b8; font-weight: bold; text-align: center; width: 120px;">Chứng từ</th>
        <th style="background-color: #f1f5f9; border: 1px solid #94a3b8; font-weight: bold; text-align: center; width: 300px;">Diễn giải</th>
        <th style="background-color: #d1fae5; border: 1px solid #94a3b8; font-weight: bold; text-align: center; color: #047857; width: 100px;">Nhập (SL)</th>
        <th style="background-color: #d1fae5; border: 1px solid #94a3b8; font-weight: bold; text-align: center; color: #047857; width: 150px;">Nhập (TT)</th>
        <th style="background-color: #fef3c7; border: 1px solid #94a3b8; font-weight: bold; text-align: center; color: #b45309; width: 100px;">Xuất (SL)</th>
        <th style="background-color: #fef3c7; border: 1px solid #94a3b8; font-weight: bold; text-align: center; color: #b45309; width: 150px;">Xuất (TT)</th>
        <th style="background-color: #dbeafe; border: 1px solid #94a3b8; font-weight: bold; text-align: center; color: #1d4ed8; width: 100px;">Tồn (SL)</th>
        <th style="background-color: #dbeafe; border: 1px solid #94a3b8; font-weight: bold; text-align: center; color: #1d4ed8; width: 150px;">Tồn (TT)</th>
      </tr>
      <tr style="height: 25pt;">
        <td colspan="3" style="background-color: #f8fafc; border: 1px solid #94a3b8; font-weight: bold; text-align: left;">SỐ DƯ ĐẦU KỲ</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; text-align: center;">-</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; text-align: center;">-</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; text-align: center;">-</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; text-align: center;">-</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; font-weight: bold; color: #000000; text-align: right;">${ledger.openingQuantity}</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; font-weight: bold; color: #000000; text-align: right;">${ledger.openingValue}</td>
      </tr>
    `;

    ledger.records.forEach((l: any) => {
      const isCancel = (l.type === 0 && l.quantityOut > 0) || (l.type === 1 && l.quantityIn > 0);
      const dienGiai = l.type === 0 ? (isCancel ? "Hủy phiếu nhập" : "Nhập kho") : (isCancel ? "Hủy phiếu xuất" : "Xuất kho");
      const bg = isCancel ? "background-color: #fef2f2;" : "";
      const textCancel = isCancel ? "color: #dc2626; font-style: italic; font-weight: bold;" : "";
      
      tableHTML += `
        <tr style="height: 25pt; ${bg}">
          <td style="border: 1px solid #94a3b8; text-align: center; mso-number-format:'\\@';">${new Date(l.date).toLocaleDateString('vi-VN')}</td>
          <td style="border: 1px solid #94a3b8; text-align: center; mso-number-format:'\\@';">${l.documentRef || ""}</td>
          <td style="border: 1px solid #94a3b8; text-align: left; ${textCancel}">${dienGiai}</td>
          <td style="border: 1px solid #94a3b8; text-align: right; color: #000000;">${l.quantityIn > 0 ? l.quantityIn : "-"}</td>
          <td style="border: 1px solid #94a3b8; text-align: right; color: #000000;">${l.valueIn > 0 ? l.valueIn : "-"}</td>
          <td style="border: 1px solid #94a3b8; text-align: right; color: #000000;">${l.quantityOut > 0 ? l.quantityOut : "-"}</td>
          <td style="border: 1px solid #94a3b8; text-align: right; color: #000000;">${l.valueOut > 0 ? l.valueOut : "-"}</td>
          <td style="border: 1px solid #94a3b8; text-align: right; font-weight: bold; color: #000000;">${l.quantityBalance}</td>
          <td style="border: 1px solid #94a3b8; text-align: right; font-weight: bold; color: #000000;">${l.valueBalance}</td>
        </tr>
      `;
    });

    tableHTML += `
      <tr style="height: 25pt;">
        <td colspan="3" style="background-color: #f8fafc; border: 1px solid #94a3b8; font-weight: bold; text-align: left;">CỘNG PHÁT SINH TRONG KỲ</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; font-weight: bold; color: #000000; text-align: right;">${ledger.totalQuantityIn}</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; font-weight: bold; color: #000000; text-align: right;">${ledger.totalValueIn}</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; font-weight: bold; color: #000000; text-align: right;">${ledger.totalQuantityOut}</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; font-weight: bold; color: #000000; text-align: right;">${ledger.totalValueOut}</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; text-align: center;">x</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; text-align: center;">x</td>
      </tr>
      <tr style="height: 25pt;">
        <td colspan="3" style="background-color: #f8fafc; border: 1px solid #94a3b8; font-weight: bold; text-align: left;">SỐ DƯ CUỐI KỲ</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; text-align: center;">-</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; text-align: center;">-</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; text-align: center;">-</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; text-align: center;">-</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; font-weight: bold; color: #000000; text-align: right;">${ledger.closingQuantity}</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; font-weight: bold; color: #000000; text-align: right;">${ledger.closingValue}</td>
      </tr>
    `;

    const template = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>So_S2</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
      </head>
      <body style="font-family: 'Times New Roman', serif;">
        <h2 style="text-align: center; font-size: 18pt; margin-bottom: 20px;">SỔ CHI TIẾT VẬT LIỆU, DỤNG CỤ, SẢN PHẨM, HÀNG HÓA</h2>
        <table style="font-family: 'Times New Roman', serif; font-size: 13pt; border-collapse: collapse;">${tableHTML}</table>
      </body>
    </html>`;

    const blob = new Blob([template], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `So_S2_Thang${selectedMonth}_Nam${selectedYear}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveSettings = () => {
    showToast("Đã lưu phương pháp tính giá vốn thành công!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[70] px-6 py-3 rounded-full shadow-lg border animate-in slide-in-from-top-4 flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header and Sub Tabs */}
      <div className="bg-white p-4 rounded-xl border border-surface-container-high shadow-sm flex flex-wrap gap-2">
        <button 
          onClick={() => setActiveSubTab("stock")}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeSubTab === "stock" ? "bg-primary text-white" : "bg-transparent text-on-surface hover:bg-surface-container-low"}`}
        >
          <Package className="w-4 h-4" /> Tồn kho hiện tại
        </button>
        <button 
          onClick={() => setActiveSubTab("receipts_in")}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeSubTab === "receipts_in" ? "bg-primary text-white" : "bg-transparent text-on-surface hover:bg-surface-container-low"}`}
        >
          <ArrowDownToLine className="w-4 h-4" /> Phiếu Nhập Kho
        </button>
        <button 
          onClick={() => setActiveSubTab("receipts_out")}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeSubTab === "receipts_out" ? "bg-primary text-white" : "bg-transparent text-on-surface hover:bg-surface-container-low"}`}
        >
          <ArrowUpFromLine className="w-4 h-4" /> Phiếu Xuất Kho
        </button>
        <button 
          onClick={() => setActiveSubTab("ledger")}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeSubTab === "ledger" ? "bg-primary text-white" : "bg-transparent text-on-surface hover:bg-surface-container-low"}`}
        >
          <FileText className="w-4 h-4" /> Sổ S2-HKD (TT88)
        </button>
        <button 
          onClick={() => setActiveSubTab("settings")}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeSubTab === "settings" ? "bg-primary text-white" : "bg-transparent text-on-surface hover:bg-surface-container-low"}`}
        >
          <Settings className="w-4 h-4" /> Cài đặt & Giá vốn
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl border border-surface-container-high shadow-card p-6">
        
        {/* TỒN KHO */}
        {activeSubTab === "stock" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-on-surface">Danh sách Hàng hóa & Tồn kho</h3>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input type="text" placeholder="Tìm kiếm..." className="pl-9 pr-4 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-surface-container-high text-xs font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-low">
                    <th className="p-4 rounded-tl-lg">Mã SP</th>
                    <th className="p-4">Tên Sản Phẩm</th>
                    <th className="p-4 text-center">ĐVT</th>
                    <th className="p-4 text-right">Tồn Kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {products.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-on-surface-variant">Chưa có dữ liệu hàng hóa</td></tr>
                  ) : products.map((s, i) => (
                    <tr key={s.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="p-4 font-semibold text-primary">{s.code || "N/A"}</td>
                      <td className="p-4 font-bold text-on-surface">{s.name}</td>
                      <td className="p-4 text-center text-on-surface-variant">{s.baseUnit}</td>
                      <td className="p-4 text-right font-bold">
                        <span className={`px-2 py-1 rounded-md ${s.stockQuantity <= 0 ? 'bg-error/10 text-error' : 'bg-emerald-50 text-emerald-700'}`}>
                          {s.stockQuantity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PHIẾU NHẬP / XUẤT */}
        {(activeSubTab === "receipts_in" || activeSubTab === "receipts_out") && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-on-surface">
                {activeSubTab === "receipts_in" ? "Lịch sử Nhập kho" : "Lịch sử Xuất kho"}
              </h3>
              <div className="flex gap-3">
                {activeSubTab === "receipts_out" && (
                  <button 
                    onClick={() => handleOpenReceiptModal(2)}
                    className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-amber-100"
                  >
                    <ArrowUpFromLine className="w-4 h-4" /> Lập Phiếu Xuất Kho
                  </button>
                )}
                {activeSubTab === "receipts_in" && (
                  <button 
                    onClick={() => handleOpenReceiptModal(1)}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary-container"
                  >
                    <ArrowDownToLine className="w-4 h-4" /> Lập Phiếu Nhập Kho
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-surface-container-high text-xs font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-low">
                    <th className="p-4">Ngày Lập</th>
                    <th className="p-4">Loại</th>
                    <th className="p-4">Mã tham chiếu</th>
                    <th className="p-4">Ghi Chú</th>
                    <th className="p-4 text-right">Tổng Tiền</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {receipts.filter(r => activeSubTab === "receipts_in" ? r.type === 0 : r.type === 1).length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-on-surface-variant">Chưa có dữ liệu phiếu</td></tr>
                  ) : receipts.filter(r => activeSubTab === "receipts_in" ? r.type === 0 : r.type === 1).map((r, i) => (
                    <tr key={r.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="p-4 text-on-surface-variant">{new Date(r.createdAt || r.date).toLocaleString('vi-VN')}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${r.type === 1 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {r.type === 1 ? 'Xuất kho' : 'Nhập kho'}
                        </span>
                      </td>
                      <td className="p-4 text-on-surface-variant font-mono">{r.referenceDocumentNo || r.referenceId || "N/A"}</td>
                      <td className="p-4 text-on-surface-variant max-w-[200px] truncate">{r.note}</td>
                      <td className="p-4 text-right font-bold text-primary">{r.totalAmount.toLocaleString()} đ</td>
                      <td className="p-4 text-center">
                        {r.status === 1 ? (
                          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700">Đã hủy</span>
                        ) : (
                          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700">Đã ghi sổ</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setViewReceiptDetails(r)}
                            className="text-primary hover:text-primary/80 p-1.5 hover:bg-primary/10 rounded"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {r.status === 0 && (
                            <button 
                              onClick={() => {
                                setCancelReceiptId(r.id);
                                setCancelModalOpen(true);
                              }}
                              className="text-red-600 hover:text-red-800 p-1.5 bg-red-50 hover:bg-red-100 rounded"
                              title="Hủy phiếu"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SỔ S2-HKD */}
        {activeSubTab === "ledger" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 print:hidden">
              <div>
                <h3 className="text-lg font-bold text-on-surface">Sổ Chi Tiết Vật Liệu, Dụng Cụ, Sản Phẩm, Hàng Hóa</h3>
                <p className="text-sm text-on-surface-variant mt-1">Mẫu số S2-HKD (Ban hành kèm theo Thông tư số 88/2021/TT-BTC)</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <select 
                  value={selectedLedgerProduct}
                  onChange={(e) => setSelectedLedgerProduct(e.target.value)}
                  className="px-4 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low text-on-surface focus:outline-none focus:border-primary max-w-[200px]"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-4 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low text-on-surface focus:outline-none focus:border-primary"
                >
                  {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>Tháng {m}</option>
                  ))}
                </select>
                
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-4 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low text-on-surface focus:outline-none focus:border-primary"
                >
                  {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => (
                    <option key={y} value={y}>Năm {y}</option>
                  ))}
                </select>

                <button onClick={() => window.print()} className="px-4 py-2 bg-white border border-outline-variant text-on-surface rounded-lg text-sm font-bold hover:bg-surface-container-low transition-colors flex items-center gap-2">
                  <Printer className="w-4 h-4" /> In Sổ S2
                </button>
                <button onClick={handleExportExcel} className="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-bold hover:bg-secondary/90 transition-colors">
                  Xuất Excel
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-surface-container-high overflow-hidden print:hidden">
              {!ledger ? (
                <div className="p-8 text-center text-on-surface-variant">Đang tải dữ liệu...</div>
              ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-container-lowest text-xs uppercase tracking-wider text-on-surface-variant">
                    <th className="p-3 border-b border-surface-container-high text-center w-28">Ngày tháng</th>
                    <th className="p-3 border-b border-surface-container-high text-center">Chứng từ</th>
                    <th className="p-3 border-b border-surface-container-high text-left">Diễn giải</th>
                    <th className="p-2 border-b border-surface-container-high text-center border-l bg-emerald-50/50" colSpan={2}>Nhập</th>
                    <th className="p-2 border-b border-surface-container-high text-center border-l bg-amber-50/50" colSpan={2}>Xuất</th>
                    <th className="p-2 border-b border-surface-container-high text-center border-l bg-blue-50/50" colSpan={2}>Tồn</th>
                  </tr>
                  <tr className="bg-surface-container-lowest text-xs uppercase tracking-wider text-on-surface-variant border-b border-surface-container-high">
                    <th className="p-2 border-r border-surface-container-high"></th>
                    <th className="p-2 border-r border-surface-container-high"></th>
                    <th className="p-2 border-r border-surface-container-high"></th>
                    <th className="p-2 border-r border-surface-container-high bg-emerald-50/50 border-l">Số lượng</th>
                    <th className="p-2 border-r border-surface-container-high bg-emerald-50/50">Thành tiền</th>
                    <th className="p-2 border-r border-surface-container-high bg-amber-50/50 border-l">Số lượng</th>
                    <th className="p-2 border-r border-surface-container-high bg-amber-50/50">Thành tiền</th>
                    <th className="p-2 border-r border-surface-container-high bg-blue-50/50 border-l">Số lượng</th>
                    <th className="p-2 bg-blue-50/50">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high">
                  {/* Số dư đầu kỳ */}
                  <tr className="bg-surface-container-low/30 font-semibold text-right">
                    <td colSpan={3} className="p-3 text-left border-r border-surface-container-high text-on-surface-variant">SỐ DƯ ĐẦU KỲ</td>
                    <td className="p-3 border-r border-surface-container-high border-l">-</td>
                    <td className="p-3 border-r border-surface-container-high">-</td>
                    <td className="p-3 border-r border-surface-container-high border-l">-</td>
                    <td className="p-3 border-r border-surface-container-high">-</td>
                    <td className="p-3 border-r border-surface-container-high text-primary border-l">{ledger.openingQuantity}</td>
                    <td className="p-3 text-primary">{ledger.openingValue.toLocaleString()}</td>
                  </tr>

                  {ledger.records.length === 0 ? (
                    <tr><td colSpan={9} className="p-8 text-center text-on-surface-variant">Không có phát sinh trong kỳ</td></tr>
                  ) : ledger.records.map((l: any, i: number) => {
                    const isCancel = (l.type === 0 && l.quantityOut > 0) || (l.type === 1 && l.quantityIn > 0);
                    return (
                    <tr key={i} className={`hover:bg-surface-container-low/30 transition-colors text-right ${isCancel ? 'bg-red-50/50' : ''}`}>
                      <td className="p-3 text-center border-r border-surface-container-high text-on-surface-variant">{new Date(l.date).toLocaleDateString('vi-VN')}</td>
                      <td className="p-3 text-center border-r border-surface-container-high font-semibold">{l.documentRef || "N/A"}</td>
                      <td className="p-3 text-left border-r border-surface-container-high text-on-surface-variant">
                        {l.type === 0 
                          ? (isCancel ? <span className="text-red-600 font-bold italic">Hủy phiếu nhập</span> : "Nhập kho") 
                          : (isCancel ? <span className="text-red-600 font-bold italic">Hủy phiếu xuất</span> : "Xuất kho")}
                      </td>
                      
                      {/* Nhập */}
                      <td className="p-3 border-r border-surface-container-high text-emerald-700 border-l">{l.quantityIn > 0 ? l.quantityIn : "-"}</td>
                      <td className="p-3 border-r border-surface-container-high text-emerald-700">{l.valueIn > 0 ? l.valueIn.toLocaleString() : "-"}</td>
                      
                      {/* Xuất */}
                      <td className="p-3 border-r border-surface-container-high text-amber-700 border-l">{l.quantityOut > 0 ? l.quantityOut : "-"}</td>
                      <td className="p-3 border-r border-surface-container-high text-amber-700">{l.valueOut > 0 ? l.valueOut.toLocaleString() : "-"}</td>
                      
                      {/* Tồn */}
                      <td className="p-3 border-r border-surface-container-high font-bold text-primary border-l">{l.quantityBalance}</td>
                      <td className="p-3 font-bold text-primary">{l.valueBalance?.toLocaleString() || "0"}</td>
                    </tr>
                  );
                  })}
                </tbody>
                <tfoot className="bg-surface-container-lowest font-bold text-right border-t-2 border-surface-container-high">
                  {/* Cộng phát sinh trong kỳ */}
                  <tr className="border-b border-surface-container-high">
                    <td colSpan={3} className="p-3 text-left border-r border-surface-container-high text-on-surface-variant">CỘNG PHÁT SINH TRONG KỲ</td>
                    <td className="p-3 border-r border-surface-container-high text-emerald-700 border-l">{ledger.totalQuantityIn}</td>
                    <td className="p-3 border-r border-surface-container-high text-emerald-700">{ledger.totalValueIn.toLocaleString()}</td>
                    <td className="p-3 border-r border-surface-container-high text-amber-700 border-l">{ledger.totalQuantityOut}</td>
                    <td className="p-3 border-r border-surface-container-high text-amber-700">{ledger.totalValueOut.toLocaleString()}</td>
                    <td className="p-3 border-r border-surface-container-high text-on-surface-variant border-l">x</td>
                    <td className="p-3 text-on-surface-variant">x</td>
                  </tr>
                  
                  {/* Số dư cuối kỳ */}
                  <tr>
                    <td colSpan={3} className="p-3 text-left border-r border-surface-container-high text-on-surface-variant">SỐ DƯ CUỐI KỲ</td>
                    <td className="p-3 border-r border-surface-container-high border-l">-</td>
                    <td className="p-3 border-r border-surface-container-high">-</td>
                    <td className="p-3 border-r border-surface-container-high border-l">-</td>
                    <td className="p-3 border-r border-surface-container-high">-</td>
                    <td className="p-3 border-r border-surface-container-high text-primary border-l">{ledger.closingQuantity}</td>
                    <td className="p-3 text-primary">{ledger.closingValue.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
              )}
            </div>

            {/* PRINT S2 LAYOUT */}
            {ledger && (
              <div id="print-area" className="hidden print:block absolute inset-0 bg-white p-8 text-black text-[13px] leading-relaxed z-[100] min-h-screen">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="font-bold text-sm">HỘ, CÁ NHÂN KINH DOANH: .......................................</div>
                    <div className="font-bold text-sm">Địa chỉ: ....................................................................</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-sm">Mẫu số S2-HKD</div>
                    <div className="text-[11px] italic">(Ban hành kèm theo Thông tư số 88/2021/TT-BTC<br/>ngày 11 tháng 10 năm 2021 của Bộ trưởng Bộ Tài chính)</div>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h1 className="text-xl font-bold uppercase mb-1">SỔ CHI TIẾT VẬT LIỆU, DỤNG CỤ, SẢN PHẨM, HÀNG HÓA</h1>
                  <div className="italic mb-1 text-sm">Năm {selectedYear}</div>
                </div>

                <div className="mb-4 space-y-1.5 text-[13px]">
                  <div>Tên vật liệu, dụng cụ, sản phẩm, hàng hóa: <span className="font-semibold">{products.find(p => p.id === selectedLedgerProduct)?.name}</span></div>
                  <div>Đơn vị tính: <span className="font-semibold">{products.find(p => p.id === selectedLedgerProduct)?.baseUnit}</span></div>
                </div>

                <table className="w-full border-collapse border border-black mb-4 text-center text-[13px]">
                  <thead>
                    <tr>
                      <th className="border border-black p-1.5 align-middle" colSpan={2}>Chứng từ</th>
                      <th className="border border-black p-1.5 align-middle w-1/4" rowSpan={2}>Diễn giải</th>
                      <th className="border border-black p-1.5 align-middle" rowSpan={2}>Đơn giá</th>
                      <th className="border border-black p-1.5 align-middle" colSpan={2}>Nhập</th>
                      <th className="border border-black p-1.5 align-middle" colSpan={2}>Xuất</th>
                      <th className="border border-black p-1.5 align-middle" colSpan={2}>Tồn</th>
                    </tr>
                    <tr>
                      <th className="border border-black p-1.5">Số hiệu</th>
                      <th className="border border-black p-1.5">Ngày, tháng</th>
                      <th className="border border-black p-1.5">Số lượng</th>
                      <th className="border border-black p-1.5">Thành tiền</th>
                      <th className="border border-black p-1.5">Số lượng</th>
                      <th className="border border-black p-1.5">Thành tiền</th>
                      <th className="border border-black p-1.5">Số lượng</th>
                      <th className="border border-black p-1.5">Thành tiền</th>
                    </tr>
                    <tr>
                      <th className="border border-black p-1 font-normal italic">A</th>
                      <th className="border border-black p-1 font-normal italic">B</th>
                      <th className="border border-black p-1 font-normal italic">C</th>
                      <th className="border border-black p-1 font-normal italic">D</th>
                      <th className="border border-black p-1 font-normal italic">1</th>
                      <th className="border border-black p-1 font-normal italic">2</th>
                      <th className="border border-black p-1 font-normal italic">3</th>
                      <th className="border border-black p-1 font-normal italic">4</th>
                      <th className="border border-black p-1 font-normal italic">5</th>
                      <th className="border border-black p-1 font-normal italic">6</th>
                    </tr>
                  </thead>
                  <tbody className="text-right">
                    <tr className="font-semibold">
                      <td className="border border-black p-1.5" colSpan={2}></td>
                      <td className="border border-black p-1.5 text-left">Số dư đầu kỳ</td>
                      <td className="border border-black p-1.5">x</td>
                      <td className="border border-black p-1.5">x</td>
                      <td className="border border-black p-1.5">x</td>
                      <td className="border border-black p-1.5">x</td>
                      <td className="border border-black p-1.5">x</td>
                      <td className="border border-black p-1.5">{ledger.openingQuantity}</td>
                      <td className="border border-black p-1.5">{ledger.openingValue.toLocaleString()}</td>
                    </tr>
                    {ledger.records.map((l: any, i: number) => {
                      const isCancel = (l.type === 0 && l.quantityOut > 0) || (l.type === 1 && l.quantityIn > 0);
                      const dienGiai = l.type === 0 ? (isCancel ? "Hủy phiếu nhập" : "Nhập kho") : (isCancel ? "Hủy phiếu xuất" : "Xuất kho");
                      return (
                        <tr key={i}>
                          <td className="border border-black p-1.5 text-center">{l.documentRef || "N/A"}</td>
                          <td className="border border-black p-1.5 text-center">{new Date(l.date).toLocaleDateString('vi-VN')}</td>
                          <td className="border border-black p-1.5 text-left">{dienGiai}</td>
                          <td className="border border-black p-1.5">-</td>
                          <td className="border border-black p-1.5">{l.quantityIn > 0 ? l.quantityIn : "-"}</td>
                          <td className="border border-black p-1.5">{l.valueIn > 0 ? l.valueIn.toLocaleString() : "-"}</td>
                          <td className="border border-black p-1.5">{l.quantityOut > 0 ? l.quantityOut : "-"}</td>
                          <td className="border border-black p-1.5">{l.valueOut > 0 ? l.valueOut.toLocaleString() : "-"}</td>
                          <td className="border border-black p-1.5">{l.quantityBalance}</td>
                          <td className="border border-black p-1.5">{l.valueBalance?.toLocaleString() || "0"}</td>
                        </tr>
                      );
                    })}
                    <tr className="font-semibold">
                      <td className="border border-black p-1.5" colSpan={2}></td>
                      <td className="border border-black p-1.5 text-left">Cộng phát sinh trong kỳ</td>
                      <td className="border border-black p-1.5">x</td>
                      <td className="border border-black p-1.5">{ledger.totalQuantityIn}</td>
                      <td className="border border-black p-1.5">{ledger.totalValueIn.toLocaleString()}</td>
                      <td className="border border-black p-1.5">{ledger.totalQuantityOut}</td>
                      <td className="border border-black p-1.5">{ledger.totalValueOut.toLocaleString()}</td>
                      <td className="border border-black p-1.5">x</td>
                      <td className="border border-black p-1.5">x</td>
                    </tr>
                    <tr className="font-semibold">
                      <td className="border border-black p-1.5" colSpan={2}></td>
                      <td className="border border-black p-1.5 text-left">Số dư cuối kỳ</td>
                      <td className="border border-black p-1.5">x</td>
                      <td className="border border-black p-1.5">x</td>
                      <td className="border border-black p-1.5">x</td>
                      <td className="border border-black p-1.5">x</td>
                      <td className="border border-black p-1.5">x</td>
                      <td className="border border-black p-1.5">{ledger.closingQuantity}</td>
                      <td className="border border-black p-1.5">{ledger.closingValue.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-4 text-[13px] space-y-1">
                  <div>- Sổ này có ... trang, đánh số từ trang 01 đến trang ...</div>
                  <div>- Ngày mở sổ: ..............................</div>
                </div>

                <div className="flex justify-between text-center mt-6 px-16">
                  <div>
                    <div className="italic text-xs mb-1 invisible">Ngày ..... tháng ..... năm .....</div>
                    <div className="font-bold text-[13px]">NGƯỜI LẬP SỔ</div>
                    <div className="italic text-xs">(Ký, họ tên)</div>
                  </div>
                  <div>
                    <div className="italic text-xs mb-1">Ngày ..... tháng ..... năm .....</div>
                    <div className="font-bold text-[13px]">NGƯỜI ĐẠI DIỆN HỘ KINH DOANH</div>
                    <div className="italic text-xs">(Ký, họ tên)</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CÀI ĐẶT & GIÁ VỐN */}
        {activeSubTab === "settings" && (
          <div className="max-w-2xl">
            <h3 className="text-lg font-bold text-on-surface mb-6">Cài đặt Phương pháp Tính giá Vốn (COGS)</h3>
            
            <div className="space-y-6">
              <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant space-y-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <input 
                      type="radio" 
                      id="wa" 
                      name="cogs" 
                      value="weighted_average"
                      checked={cogsMethod === "weighted_average"}
                      onChange={(e) => setCogsMethod(e.target.value)}
                      className="w-5 h-5 text-primary focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="wa" className="font-bold text-on-surface text-base cursor-pointer">Bình quân gia quyền cả kỳ dự trữ (Mặc định)</label>
                    <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                      Phù hợp với hầu hết các hộ kinh doanh bán lẻ. Giá trị mỗi đơn vị hàng hóa xuất kho được tính bằng trung bình cộng của giá trị hàng tồn đầu kỳ và giá trị hàng nhập trong kỳ.
                    </p>
                    {cogsMethod === "weighted_average" && (
                      <div className="mt-3 bg-blue-50 text-blue-800 p-3 rounded-lg text-xs flex items-start gap-2 border border-blue-100">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <span><strong>Ví dụ:</strong> Nhập 10 cái giá 10k, nhập thêm 10 cái giá 12k. Giá bình quân khi xuất kho sẽ là 11k/cái. Hệ thống sẽ tự động tự tính lại mức giá này mỗi khi có phiếu nhập kho mới.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant space-y-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <input 
                      type="radio" 
                      id="fifo" 
                      name="cogs" 
                      value="fifo"
                      checked={cogsMethod === "fifo"}
                      onChange={(e) => setCogsMethod(e.target.value)}
                      className="w-5 h-5 text-primary focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="fifo" className="font-bold text-on-surface text-base cursor-pointer">Nhập trước, Xuất trước (FIFO)</label>
                    <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                      Phù hợp với các mặt hàng có hạn sử dụng (Thực phẩm, Dược phẩm). Hệ thống sẽ trừ xuất kho vào những lô hàng được nhập vào kho sớm nhất.
                    </p>
                    {cogsMethod === "fifo" && (
                      <div className="mt-3 bg-amber-50 text-amber-800 p-3 rounded-lg text-xs flex items-start gap-2 border border-amber-100">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <span><strong>Lưu ý:</strong> Chuyển sang FIFO đòi hỏi hệ thống phải lưu trữ lịch sử tồn kho theo từng lô (Batch). Có thể sẽ mất thời gian tính toán nếu đổi phương pháp giữa chừng.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-surface-container-high flex justify-end">
                <button onClick={handleSaveSettings} className="px-6 py-2.5 bg-primary text-white rounded-lg font-bold shadow-sm hover:bg-primary-container transition-colors">
                  Lưu Cài Đặt
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modal Lập Phiếu */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-surface-container-high">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                {receiptForm.type === 1 ? <ArrowDownToLine className="text-emerald-600" /> : <ArrowUpFromLine className="text-amber-600" />}
                Lập Phiếu {receiptForm.type === 1 ? "Nhập Kho" : "Xuất Kho Khác"}
              </h3>
              <button onClick={() => setIsReceiptModalOpen(false)} className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-2">Số phiếu</label>
                  <input 
                    type="text" 
                    value="Tự động sinh"
                    disabled
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-highest text-on-surface-variant cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-2">Ngày lập phiếu</label>
                  <input 
                    type="date" 
                    value={receiptForm.date}
                    onChange={(e) => setReceiptForm({...receiptForm, date: e.target.value})}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary focus:outline-none"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-on-surface-variant mb-2">
                    {receiptForm.type === 1 ? "Họ tên người giao hàng" : "Họ tên người nhận hàng"}
                  </label>
                  <input 
                    type="text" 
                    value={receiptForm.delivererReceiverName}
                    onChange={(e) => setReceiptForm({...receiptForm, delivererReceiverName: e.target.value})}
                    placeholder={receiptForm.type === 1 ? "Nguyễn Văn A..." : "Trần Văn B..."}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-2">Theo chứng từ gốc số</label>
                  <input 
                    type="text" 
                    value={receiptForm.referenceDocumentNo}
                    onChange={(e) => setReceiptForm({...receiptForm, referenceDocumentNo: e.target.value})}
                    placeholder="VD: HD00123"
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-2">Ngày chứng từ gốc</label>
                  <input 
                    type="date" 
                    value={receiptForm.referenceDocumentDate}
                    onChange={(e) => setReceiptForm({...receiptForm, referenceDocumentDate: e.target.value})}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-2">Đơn vị ban hành chứng từ</label>
                  <input 
                    type="text" 
                    value={receiptForm.referenceDocumentIssuer}
                    onChange={(e) => setReceiptForm({...receiptForm, referenceDocumentIssuer: e.target.value})}
                    placeholder="VD: Công ty TNHH ABC"
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-2">Địa điểm nhập/xuất kho</label>
                  <input 
                    type="text" 
                    value={receiptForm.warehouseLocation}
                    onChange={(e) => setReceiptForm({...receiptForm, warehouseLocation: e.target.value})}
                    placeholder="VD: Kho chính"
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-on-surface-variant mb-2">Ghi chú / Lý do {receiptForm.type === 1 ? "nhập" : "xuất"} kho</label>
                  <input 
                    type="text" 
                    value={receiptForm.note}
                    onChange={(e) => setReceiptForm({...receiptForm, note: e.target.value})}
                    placeholder="VD: Nhập hàng đợt 1..."
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase">Danh sách hàng hóa</label>
                  <button onClick={handleAddReceiptItem} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                    <Plus className="w-3 h-3" /> Thêm dòng
                  </button>
                </div>
                
                <div className="space-y-3">
                  {receiptForm.items.map((item, index) => (
                    <div key={index} className="flex gap-3 items-end bg-surface-container-low/50 p-3 rounded-lg border border-surface-container-high">
                      <div className="flex-1">
                        <label className="block text-[10px] text-on-surface-variant mb-1 font-semibold">Sản phẩm</label>
                        <select 
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                          className="w-full px-3 py-1.5 border border-outline-variant rounded bg-white text-sm focus:border-primary focus:outline-none"
                        >
                          <option value="">-- Chọn sản phẩm --</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="w-16">
                        <label className="block text-[10px] text-on-surface-variant mb-1 font-semibold text-center">ĐVT</label>
                        <div className="w-full px-2 py-1.5 border border-outline-variant rounded bg-surface-container-highest text-sm text-center text-on-surface-variant">
                          {products.find(p => p.id === item.productId)?.baseUnit || "-"}
                        </div>
                      </div>
                      <div className="w-20">
                        <label className="block text-[10px] text-on-surface-variant mb-1 font-semibold">SL Y/C</label>
                        <input 
                          type="number" min="1"
                          value={item.documentQuantity}
                          onChange={(e) => handleItemChange(index, "documentQuantity", e.target.value)}
                          className="w-full px-3 py-1.5 border border-outline-variant rounded bg-white text-sm focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div className="w-20">
                        <label className="block text-[10px] text-on-surface-variant mb-1 font-semibold">SL Thực</label>
                        <input 
                          type="number" min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          className="w-full px-3 py-1.5 border border-outline-variant rounded bg-white text-sm focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div className="w-28">
                        <label className="block text-[10px] text-on-surface-variant mb-1 font-semibold">Đơn giá</label>
                        <input 
                          type="number" min="0"
                          value={receiptForm.type === 2 ? 0 : item.unitPrice}
                          onChange={(e) => receiptForm.type !== 2 && handleItemChange(index, "unitPrice", e.target.value)}
                          disabled={receiptForm.type === 2}
                          title={receiptForm.type === 2 ? "Hệ thống sẽ tự động tính giá vốn" : ""}
                          className={`w-full px-3 py-1.5 border border-outline-variant rounded text-sm focus:border-primary focus:outline-none ${receiptForm.type === 2 ? 'bg-surface-container-highest cursor-not-allowed text-on-surface-variant' : 'bg-white'}`}
                        />
                      </div>
                      <div className="w-28">
                        <label className="block text-[10px] text-on-surface-variant mb-1 font-semibold text-right">Thành tiền</label>
                        <div className={`w-full px-3 py-1.5 border border-outline-variant rounded text-sm font-semibold text-right ${receiptForm.type === 2 ? 'bg-surface-container-highest text-on-surface-variant italic' : 'bg-surface-container-highest text-primary'}`}>
                          {receiptForm.type === 2 ? "Tự động" : (item.quantity * item.unitPrice).toLocaleString()}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveReceiptItem(index)}
                        className="p-1.5 text-error hover:bg-error/10 rounded mb-0.5 transition-colors"
                        disabled={receiptForm.items.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-surface-container-high bg-surface-container-low/50 flex justify-between items-center gap-3">
              <div className="text-sm font-bold text-on-surface">
                Tổng tiền phiếu: 
                <span className="text-primary text-lg ml-2">
                  {receiptForm.type === 2 ? "Tự động tính giá vốn" : receiptForm.items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0).toLocaleString() + " VNĐ"}
                </span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setIsReceiptModalOpen(false)} className="px-5 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-lg">
                  Hủy
                </button>
                <button 
                  onClick={handleSubmitReceipt} 
                  disabled={isLoading}
                  className={`px-5 py-2 text-sm font-bold text-white rounded-lg flex items-center gap-2 ${isLoading ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary-container'}`}
                >
                  <Save className="w-4 h-4" /> {isLoading ? 'Đang lưu...' : 'Lưu Phiếu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-surface-container-high bg-error-container/20">
              <h2 className="text-lg font-bold text-error flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> Xác nhận Hủy Phiếu
              </h2>
              <button onClick={() => setCancelModalOpen(false)} className="p-1 hover:bg-surface-container-high rounded-full transition-colors">
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-on-surface mb-4">
                Bạn có chắc chắn muốn hủy phiếu này không? Tồn kho sẽ được hoàn trả tương ứng. 
                <strong>Hành động này không thể hoàn tác!</strong>
              </p>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">Lý do hủy phiếu <span className="text-error">*</span></label>
              <textarea 
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ví dụ: Nhập sai số lượng, khách trả lại hàng..."
                className="w-full px-4 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-error focus:outline-none resize-none"
              ></textarea>
            </div>

            <div className="p-4 border-t border-surface-container-high flex justify-end gap-3 bg-surface-container-low/30">
              <button onClick={() => setCancelModalOpen(false)} className="px-5 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-lg">
                Đóng
              </button>
              <button 
                onClick={handleCancelReceipt} 
                disabled={isLoading}
                className={`px-5 py-2 text-sm font-bold text-white rounded-lg ${isLoading ? 'bg-error/50 cursor-not-allowed' : 'bg-error hover:bg-error/90'}`}
              >
                {isLoading ? 'Đang xử lý...' : 'Xác nhận Hủy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW RECEIPT MODAL */}
      {viewReceiptDetails && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
            <div className="flex justify-between items-center p-5 border-b border-surface-container-high bg-surface-container-low/50">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Chi tiết Phiếu {viewReceiptDetails.type === 0 ? "Nhập" : "Xuất"} Kho
              </h3>
              <button onClick={() => setViewReceiptDetails(null)} className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-surface-container-lowest p-5 rounded-xl border border-surface-container-high shadow-sm">
                <div>
                  <span className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Số phiếu</span>
                  <span className="font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">{viewReceiptDetails.receiptCode || "N/A"}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Ngày lập</span>
                  <span className="font-semibold">{new Date(viewReceiptDetails.date || viewReceiptDetails.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Trạng thái</span>
                  {viewReceiptDetails.status === 1 ? (
                    <span className="text-error font-bold flex items-center gap-1"><X className="w-4 h-4"/>Đã hủy</span>
                  ) : (
                    <span className="text-emerald-600 font-bold flex items-center gap-1"><Save className="w-4 h-4"/>Đã ghi sổ</span>
                  )}
                </div>
                <div>
                  <span className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Người giao/nhận</span>
                  <span className="font-semibold">{viewReceiptDetails.delivererReceiverName || "N/A"}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Số CT gốc</span>
                  <span className="font-semibold">{viewReceiptDetails.referenceDocumentNo || "N/A"}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Ngày CT gốc</span>
                  <span className="font-semibold">{viewReceiptDetails.referenceDocumentDate ? new Date(viewReceiptDetails.referenceDocumentDate).toLocaleDateString('vi-VN') : "N/A"}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Đơn vị ban hành CT</span>
                  <span className="font-semibold">{viewReceiptDetails.referenceDocumentIssuer || "N/A"}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Địa điểm</span>
                  <span className="font-semibold">{viewReceiptDetails.warehouseLocation || "N/A"}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Ghi chú</span>
                  <span className="font-semibold text-on-surface-variant">{viewReceiptDetails.note || "N/A"}</span>
                </div>
                {viewReceiptDetails.status === 1 && (
                  <div className="md:col-span-4 bg-red-50 p-3 rounded-lg border border-red-100">
                    <span className="block text-xs font-bold text-red-700 mb-1 uppercase tracking-wider flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5"/>
                      Lý do hủy phiếu {viewReceiptDetails.cancelledAt && `(${new Date(viewReceiptDetails.cancelledAt).toLocaleString('vi-VN')})`}
                    </span>
                    <span className="font-semibold text-red-800">{viewReceiptDetails.cancelReason || "Không có lý do"}</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase text-on-surface-variant mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Danh sách hàng hóa
                </h4>
                <div className="border border-surface-container-high rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-surface-container-low text-xs font-bold text-on-surface-variant uppercase">
                      <tr>
                        <th className="p-3 border-b border-surface-container-high">Sản phẩm</th>
                        <th className="p-3 border-b border-surface-container-high text-center">ĐVT</th>
                        <th className="p-3 border-b border-surface-container-high text-right">SL Y/C</th>
                        <th className="p-3 border-b border-surface-container-high text-right">SL Thực</th>
                        <th className="p-3 border-b border-surface-container-high text-right">Đơn giá</th>
                        <th className="p-3 border-b border-surface-container-high text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-low">
                      {viewReceiptDetails.details?.map((d: any, idx: number) => {
                        const prod = products.find(p => p.id === d.productId);
                        return (
                          <tr key={idx} className="hover:bg-surface-container-low/30">
                            <td className="p-3 font-semibold text-on-surface">{prod?.name || d.productName || "Sản phẩm không xác định"}</td>
                            <td className="p-3 text-center text-on-surface-variant">{prod?.baseUnit || "-"}</td>
                            <td className="p-3 text-right text-on-surface-variant">{d.documentQuantity}</td>
                            <td className="p-3 text-right font-bold text-emerald-700">{d.quantity}</td>
                            <td className="p-3 text-right text-on-surface-variant">{d.unitPrice.toLocaleString()} đ</td>
                            <td className="p-3 text-right font-bold text-primary">{d.totalPrice.toLocaleString()} đ</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-surface-container-low">
                      <tr>
                        <td colSpan={5} className="p-4 text-right font-bold text-on-surface-variant uppercase">Tổng giá trị phiếu:</td>
                        <td className="p-4 text-right font-bold text-primary text-base">{viewReceiptDetails.totalAmount.toLocaleString()} đ</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-surface-container-high bg-surface-container-low flex justify-end gap-3 print:hidden">
              <button onClick={() => window.print()} className="px-6 py-2 bg-white border border-outline-variant text-on-surface font-bold rounded-lg hover:bg-surface-container-low flex items-center gap-2 transition-colors">
                <Printer className="w-4 h-4" /> In Phiếu (TT88)
              </button>
              <button onClick={() => setViewReceiptDetails(null)} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-container">
                Đóng
              </button>
            </div>
          </div>

          {/* PRINT LAYOUT (Hidden on screen) */}
          <div id="print-area" className="hidden print:block absolute inset-0 bg-white p-8 text-black text-[13px] leading-relaxed z-[100] min-h-screen">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="font-bold text-sm">HỘ, CÁ NHÂN KINH DOANH: .......................................</div>
                <div className="font-bold text-sm">Địa chỉ: ....................................................................</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-sm">{viewReceiptDetails.type === 0 ? "Mẫu số 03 - VT" : "Mẫu số 04 - VT"}</div>
                <div className="text-[11px] italic">(Ban hành kèm theo Thông tư số 88/2021/TT-BTC<br/>ngày 11 tháng 10 năm 2021 của Bộ trưởng Bộ Tài chính)</div>
              </div>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-xl font-bold uppercase mb-1">PHIẾU {viewReceiptDetails.type === 0 ? "NHẬP" : "XUẤT"} KHO</h1>
              <div className="italic mb-1 text-sm">
                Ngày {new Date(viewReceiptDetails.date || viewReceiptDetails.createdAt).getDate()} tháng {new Date(viewReceiptDetails.date || viewReceiptDetails.createdAt).getMonth() + 1} năm {new Date(viewReceiptDetails.date || viewReceiptDetails.createdAt).getFullYear()}
              </div>
              <div className="text-sm">Số: {viewReceiptDetails.receiptCode}</div>
            </div>

            <div className="mb-4 space-y-1.5 text-[13px]">
              <div>- Họ và tên {viewReceiptDetails.type === 0 ? "người giao hàng" : "người nhận hàng"}: <span className="font-semibold">{viewReceiptDetails.delivererReceiverName}</span></div>
              <div>- {viewReceiptDetails.type === 0 ? "Theo chứng từ số" : "Lý do xuất kho"}: {viewReceiptDetails.referenceDocumentNo} {viewReceiptDetails.referenceDocumentDate && `ngày ${new Date(viewReceiptDetails.referenceDocumentDate).toLocaleDateString('vi-VN')} của ${viewReceiptDetails.referenceDocumentIssuer}`}</div>
              <div>- Địa điểm {viewReceiptDetails.type === 0 ? "nhập" : "xuất"} kho: {viewReceiptDetails.warehouseLocation}</div>
            </div>

            <table className="w-full border-collapse border border-black mb-4 text-center text-[13px]">
              <thead>
                <tr>
                  <th className="border border-black p-1.5 align-middle" rowSpan={2}>STT</th>
                  <th className="border border-black p-1.5 align-middle w-1/3" rowSpan={2}>Tên, nhãn hiệu, quy cách, phẩm chất vật liệu, dụng cụ, sản phẩm, hàng hoá</th>
                  <th className="border border-black p-1.5 align-middle" rowSpan={2}>Mã số</th>
                  <th className="border border-black p-1.5 align-middle" rowSpan={2}>Đơn vị<br/>tính</th>
                  <th className="border border-black p-1.5 align-middle" colSpan={2}>Số lượng</th>
                  <th className="border border-black p-1.5 align-middle" rowSpan={2}>Đơn giá</th>
                  <th className="border border-black p-1.5 align-middle" rowSpan={2}>Thành tiền</th>
                </tr>
                <tr>
                  <th className="border border-black p-1.5">{viewReceiptDetails.type === 0 ? "Theo chứng từ" : "Yêu cầu"}</th>
                  <th className="border border-black p-1.5">{viewReceiptDetails.type === 0 ? "Thực nhập" : "Thực xuất"}</th>
                </tr>
                <tr>
                  <th className="border border-black p-1 font-normal italic">A</th>
                  <th className="border border-black p-1 font-normal italic">B</th>
                  <th className="border border-black p-1 font-normal italic">C</th>
                  <th className="border border-black p-1 font-normal italic">D</th>
                  <th className="border border-black p-1 font-normal italic">1</th>
                  <th className="border border-black p-1 font-normal italic">2</th>
                  <th className="border border-black p-1 font-normal italic">3</th>
                  <th className="border border-black p-1 font-normal italic">4</th>
                </tr>
              </thead>
              <tbody>
                {viewReceiptDetails.details?.map((d: any, idx: number) => {
                  const prod = products.find(p => p.id === d.productId);
                  return (
                    <tr key={idx}>
                      <td className="border border-black p-1.5">{idx + 1}</td>
                      <td className="border border-black p-1.5 text-left">{prod?.name || d.productName}</td>
                      <td className="border border-black p-1.5">{prod?.code}</td>
                      <td className="border border-black p-1.5">{prod?.baseUnit}</td>
                      <td className="border border-black p-1.5">{d.documentQuantity}</td>
                      <td className="border border-black p-1.5">{d.quantity}</td>
                      <td className="border border-black p-1.5 text-right">{d.unitPrice.toLocaleString()}</td>
                      <td className="border border-black p-1.5 text-right font-semibold">{d.totalPrice.toLocaleString()}</td>
                    </tr>
                  );
                })}
                <tr>
                  <td className="border border-black p-2 font-bold text-center uppercase" colSpan={4}>Cộng</td>
                  <td className="border border-black p-2 font-bold text-center">x</td>
                  <td className="border border-black p-2 font-bold text-center">x</td>
                  <td className="border border-black p-2 font-bold text-center">x</td>
                  <td className="border border-black p-2 font-bold text-right text-sm">{viewReceiptDetails.totalAmount.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div className="mb-12 space-y-2 text-[13px]">
              <div>- Tổng số tiền (viết bằng chữ): .................................................................................................................................................</div>
              <div>- Số chứng từ gốc kèm theo: ....................................................................................................................................................</div>
            </div>

            <div className="flex justify-between text-center mt-8 px-4">
              <div>
                <div className="font-bold text-[13px]">{viewReceiptDetails.type === 0 ? "NGƯỜI GIAO HÀNG" : "NGƯỜI NHẬN HÀNG"}</div>
                <div className="italic text-xs">(Ký, họ tên)</div>
              </div>
              <div>
                <div className="font-bold text-[13px]">THỦ KHO</div>
                <div className="italic text-xs">(Ký, họ tên)</div>
              </div>
              <div>
                <div className="font-bold text-[13px]">NGƯỜI LẬP BIỂU</div>
                <div className="italic text-xs">(Ký, họ tên)</div>
              </div>
              <div>
                <div className="italic text-xs mb-1">Ngày ..... tháng ..... năm .....</div>
                <div className="font-bold text-[13px]">NGƯỜI ĐẠI DIỆN HỘ KINH DOANH</div>
                <div className="italic text-xs">(Ký, họ tên)</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
