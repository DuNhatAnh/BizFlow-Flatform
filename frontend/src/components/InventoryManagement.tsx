"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  Printer,
  MoreHorizontal,
  Edit3
} from "lucide-react";
import { Skeleton } from "./ui/Skeleton";
import { FadeIn } from "./ui/FadeIn";
import { Pagination } from "./ui/Pagination";
import { useQuery, keepPreviousData, useQueryClient } from "@tanstack/react-query";
import StockTab from "./Inventory/InventoryTabs/StockTab";
import ReceiptHistoryTab from "./Inventory/InventoryTabs/ReceiptHistoryTab";
import LedgerS2HKDTab from "./Inventory/InventoryTabs/LedgerS2HKDTab";
import InventorySettingsTab from "./Inventory/InventoryTabs/InventorySettingsTab";
import CreateReceiptModal from "./Inventory/CreateReceiptModal";

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

export default function InventoryManagement() {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("bizflow_inventory_tab") || "stock";
    }
    return "stock";
  });

  const [exportFilterTab, setExportFilterTab] = useState("all"); // "all", "export_slip", "sales_slip"


  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bizflow_inventory_tab", activeSubTab);
    }
  }, [activeSubTab]);

  const [cogsMethod, setCogsMethod] = useState("weighted_average");

  const [productPage, setProductPage] = useState(1);
  const [productSearch, setProductSearch] = useState("");
  const [debouncedProductSearch, setDebouncedProductSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedProductSearch(productSearch);
      setProductPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [productSearch]);

  const { data: productsData, isLoading: isProductsLoading, isError: isProductsError, error: productsError } = useQuery({
    queryKey: ["inventory_products", productPage, debouncedProductSearch],
    queryFn: async () => {
      const auth = getAuthInfo();
      const queryParams = new URLSearchParams({
        page: productPage.toString(),
        pageSize: "10",
      });
      if (debouncedProductSearch) queryParams.append("search", debouncedProductSearch);

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
  });

  const products = productsData?.items || [];
  const productTotalPages = productsData?.totalPages || 0;

  const [receiptPage, setReceiptPage] = useState(1);

  const [ledgerPage, setLedgerPage] = useState(1);

  const [selectedLedgerProduct, setSelectedLedgerProduct] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const [hasAnyReceipts, setHasAnyReceipts] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);

  // Modal State
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReceiptId, setCancelReceiptId] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [viewReceiptDetails, setViewReceiptDetails] = useState<any>(null);
  const [hasAcknowledgedCogs, setHasAcknowledgedCogs] = useState(false);
  const [isInitialReceiptsLoaded, setIsInitialReceiptsLoaded] = useState(false);

  const [receiptForm, setReceiptForm] = useState({
    type: 1, // 1 = Import, 2 = Export
    exportPriceType: "cogs", // "cogs" or "selling"
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

  useEffect(() => {
    if (products.length > 0 && !selectedLedgerProduct) {
      setSelectedLedgerProduct(products[0].id);
    }
  }, [products, selectedLedgerProduct]);
  const { data: receiptsData, isLoading: isReceiptsLoading, isError: isReceiptsError, error: receiptsError } = useQuery({
    queryKey: ["inventory_receipts", activeSubTab, receiptPage],
    queryFn: async () => {
      if (activeSubTab !== "receipts_in" && activeSubTab !== "receipts_out") return null;
      const auth = getAuthInfo();
      const type = activeSubTab === "receipts_in" ? 0 : 1;
      const res = await fetch(`${API_URL}/inventory/receipts?type=${type}&page=${receiptPage}&pageSize=10`, {
        headers: { 
          "X-Tenant-Id": auth.tenantId,
          "Authorization": `Bearer ${auth.token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch receipts");
      return res.json();
    },
    placeholderData: keepPreviousData,
    enabled: activeSubTab === "receipts_in" || activeSubTab === "receipts_out"
  });

  const receipts = receiptsData?.items || [];
  const receiptTotalPages = receiptsData?.totalPages || 0;

  const { data: ordersData, isLoading: isOrdersLoading, isError: isOrdersError, error: ordersError } = useQuery({
    queryKey: ["inventory_orders"],
    queryFn: async () => {
      if (activeSubTab !== "receipts_out") return null;
      if (exportFilterTab === "export_slip") return { items: [] };
      const auth = getAuthInfo();
      const res = await fetch(`${API_URL}/orders?tenantId=${auth.tenantId}`, {
        headers: { 
          "Authorization": `Bearer ${auth.token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      return { items: data || [] };
    },
    placeholderData: keepPreviousData,
    enabled: activeSubTab === "receipts_out" && (exportFilterTab === "all" || exportFilterTab === "sales_slip")
  });

  const orders = ordersData?.items || [];

  const isSalesTab = activeSubTab === "receipts_out" && exportFilterTab === "sales_slip";
  const isExportTab = activeSubTab === "receipts_out" && exportFilterTab === "export_slip";
  const displayData = activeSubTab === "receipts_in" ? receipts : 
    (isSalesTab ? orders : 
      (isExportTab ? receipts : [...receipts, ...orders].sort((a:any, b:any) => new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime())));


  // Track if we have any receipts
  useEffect(() => {
    if (receiptsData?.totalCount > 0 && !hasAnyReceipts) {
      setHasAnyReceipts(true);
    }
  }, [receiptsData?.totalCount, hasAnyReceipts]);

  const { data: ledgerData, isLoading: isLedgerLoading } = useQuery({
    queryKey: ["inventory_ledger", selectedLedgerProduct, selectedMonth, selectedYear, ledgerPage],
    queryFn: async () => {
      if (!selectedLedgerProduct) return null;
      const auth = getAuthInfo();
      const startDate = new Date(selectedYear, selectedMonth - 1, 1, 0, 0, 0).toISOString();
      const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59).toISOString();
      const res = await fetch(`${API_URL}/inventory/reports/s2?productId=${selectedLedgerProduct}&startDate=${startDate}&endDate=${endDate}&page=${ledgerPage}&pageSize=10`, {
        headers: { 
          "X-Tenant-Id": auth.tenantId,
          "Authorization": `Bearer ${auth.token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch ledger");
      return res.json();
    },
    placeholderData: keepPreviousData,
    enabled: activeSubTab === "ledger" && !!selectedLedgerProduct
  });

  const ledger = ledgerData || null;

  const checkHasAnyReceipts = async () => {
    const auth = getAuthInfo();
    try {
      const res = await fetch(`${API_URL}/inventory/receipts?pageSize=1`, {
        headers: { "X-Tenant-Id": auth.tenantId, "Authorization": `Bearer ${auth.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHasAnyReceipts(data.totalCount > 0);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (activeSubTab === "settings") {
      checkHasAnyReceipts();
    }
  }, [activeSubTab]);

  useEffect(() => {
    if (activeSubTab === "receipts_in" || activeSubTab === "receipts_out") {
      setReceiptPage(1); // Reset page when switching tab
    }
  }, [activeSubTab]);

  const handleOpenReceiptModal = (type: number) => {
    setReceiptForm({
      type,
      exportPriceType: "cogs",
      date: new Date().toISOString().split('T')[0],
      note: "",
      delivererReceiverName: "",
      referenceDocumentNo: "",
      referenceDocumentDate: "",
      referenceDocumentIssuer: "",
      warehouseLocation: "",
      items: [{ productId: "", documentQuantity: 1, quantity: 1, unitPrice: 0, productName: "" }]
    });
    setIsReceiptModalOpen(true);
  };

  const handleAddReceiptItem = () => {
    setReceiptForm({
      ...receiptForm,
      items: [...receiptForm.items, { productId: "", documentQuantity: 1, quantity: 1, unitPrice: 0, productName: "" }]
    });
  };

  const handleRemoveReceiptItem = (index: number) => {
    const newItems = [...receiptForm.items];
    newItems.splice(index, 1);
    setReceiptForm({ ...receiptForm, items: newItems });
  };

  const handleItemChange = async (index: number, field: string, value: any) => {
    const newItems = [...receiptForm.items];
    (newItems[index] as any)[field] = value;
    
    if (field === "productId" && receiptForm.type === 2) {
      if (receiptForm.exportPriceType === "cogs") {
        try {
          const auth = getAuthInfo();
          const res = await fetch(`${API_URL}/inventory/cost-price/${value}`, {
            headers: { "X-Tenant-Id": auth.tenantId, "Authorization": `Bearer ${auth.token}` }
          });
          if (res.ok) {
            const data = await res.json();
            newItems[index].unitPrice = data.costPrice || 0;
          }
        } catch (e) {}
      } else {
        const product = products.find((p: any) => p.id === value);
        const defaultUnit = product?.units?.find((u: any) => u.isDefault) || product?.units?.[0];
        newItems[index].unitPrice = defaultUnit?.price || 0;
      }
    }
    
    setReceiptForm({ ...receiptForm, items: newItems });
  };

  const handleExportPriceTypeChange = async (newType: string) => {
    const newItems = [...receiptForm.items];
    for (let i = 0; i < newItems.length; i++) {
        const item = newItems[i];
        if (item.productId) {
            if (newType === "cogs") {
                try {
                  const auth = getAuthInfo();
                  const res = await fetch(`${API_URL}/inventory/cost-price/${item.productId}`, {
                    headers: { "X-Tenant-Id": auth.tenantId, "Authorization": `Bearer ${auth.token}` }
                  });
                  if (res.ok) {
                    const data = await res.json();
                    item.unitPrice = data.costPrice || 0;
                  }
                } catch (e) {}
            } else {
                const product = products.find((p: any) => p.id === item.productId);
                const defaultUnit = product?.units?.find((u: any) => u.isDefault) || product?.units?.[0];
                item.unitPrice = defaultUnit?.price || 0;
            }
        }
    }
    setReceiptForm({ ...receiptForm, exportPriceType: newType, items: newItems });
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
    if (receiptForm.items.some(i => !i.productId)) {
      showToast("Vui lòng chọn sản phẩm cho tất cả các dòng", "error");
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
        useSellingPrice: receiptForm.type === 2 && receiptForm.exportPriceType === "selling",
        items: receiptForm.items.map((i: any) => ({
          productId: i.productId,
          documentQuantity: Number(i.documentQuantity),
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice)
        }))
      };

      const auth = getAuthInfo();
      const res = await fetch(`${API_URL}/inventory/receipts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": auth.tenantId,
          "Authorization": `Bearer ${auth.token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast("Tạo phiếu thành công!");
        setIsReceiptModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ["inventory_receipts"] });
        queryClient.invalidateQueries({ queryKey: ["inventory_products"] });
        queryClient.invalidateQueries({ queryKey: ["inventory_ledger"] });
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
    const auth = getAuthInfo();
    try {
      const res = await fetch(`${API_URL}/inventory/receipts/${cancelReceiptId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": auth.tenantId,
          "Authorization": `Bearer ${auth.token}`
        },
        body: JSON.stringify({ cancelReason })
      });
      if (res.ok) {
        showToast("Đã hủy phiếu thành công");
        setCancelModalOpen(false);
        setCancelReason("");
        queryClient.invalidateQueries({ queryKey: ["inventory_receipts"] });
        queryClient.invalidateQueries({ queryKey: ["inventory_products"] });
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
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; font-weight: bold; color: #000000; text-align: center;">${ledger.openingQuantity}</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; font-weight: bold; color: #000000; text-align: center;">${ledger.openingValue}</td>
      </tr>
    `;

    ledger.records.items.forEach((l: any) => {
      const isCancel = (l.type === 0 && l.quantityOut > 0) || (l.type === 1 && l.quantityIn > 0);
      const dienGiai = l.type === 0 ? (isCancel ? "Hủy phiếu nhập" : "Nhập kho") : (isCancel ? "Hủy phiếu xuất" : "Xuất kho");
      const bg = isCancel ? "background-color: #fef2f2;" : "";
      const textCancel = isCancel ? "color: #dc2626; font-style: italic; font-weight: bold;" : "";

      tableHTML += `
        <tr style="height: 25pt; ${bg}">
          <td style="border: 1px solid #94a3b8; text-align: center; mso-number-format:'\\@';">${new Date(l.date).toLocaleDateString('vi-VN')}</td>
          <td style="border: 1px solid #94a3b8; text-align: center; mso-number-format:'\\@';">${l.documentRef || ""}</td>
          <td style="border: 1px solid #94a3b8; text-align: left; ${textCancel}">${dienGiai}</td>
          <td style="border: 1px solid #94a3b8; text-align: center; color: #000000;">${l.quantityIn > 0 ? l.quantityIn : "-"}</td>
          <td style="border: 1px solid #94a3b8; text-align: center; color: #000000;">${l.valueIn > 0 ? l.valueIn : "-"}</td>
          <td style="border: 1px solid #94a3b8; text-align: center; color: #000000;">${l.quantityOut > 0 ? l.quantityOut : "-"}</td>
          <td style="border: 1px solid #94a3b8; text-align: center; color: #000000;">${l.valueOut > 0 ? l.valueOut : "-"}</td>
          <td style="border: 1px solid #94a3b8; text-align: center; font-weight: bold; color: #000000;">${l.quantityBalance}</td>
          <td style="border: 1px solid #94a3b8; text-align: center; font-weight: bold; color: #000000;">${l.valueBalance}</td>
        </tr>
      `;
    });

    tableHTML += `
      <tr style="height: 25pt;">
        <td colspan="3" style="background-color: #f8fafc; border: 1px solid #94a3b8; font-weight: bold; text-align: left;">CỘNG PHÁT SINH TRONG KỲ</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; font-weight: bold; color: #000000; text-align: center;">${ledger.totalQuantityIn}</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; font-weight: bold; color: #000000; text-align: center;">${ledger.totalValueIn}</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; font-weight: bold; color: #000000; text-align: center;">${ledger.totalQuantityOut}</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; font-weight: bold; color: #000000; text-align: center;">${ledger.totalValueOut}</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; text-align: center;">x</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; text-align: center;">x</td>
      </tr>
      <tr style="height: 25pt;">
        <td colspan="3" style="background-color: #f8fafc; border: 1px solid #94a3b8; font-weight: bold; text-align: left;">SỐ DƯ CUỐI KỲ</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; text-align: center;">-</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; text-align: center;">-</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; text-align: center;">-</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; text-align: center;">-</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; font-weight: bold; color: #000000; text-align: center;">${ledger.closingQuantity}</td>
        <td style="background-color: #f8fafc; border: 1px solid #94a3b8; font-weight: bold; color: #000000; text-align: center;">${ledger.closingValue}</td>
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
    <>
      <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[70] px-6 py-3 rounded-full shadow-lg border animate-in slide-in-from-top-4 flex items-center gap-3 ${toast.type === 'success' ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header and Sub Tabs */}
      <div className="bg-white p-4 rounded-xl border border-surface-container-high shadow-sm flex flex-wrap gap-2 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100 fill-mode-both">
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
      </div>

      {/* Content Area */}
      <div key={activeSubTab} className="bg-white rounded-xl border border-surface-container-high shadow-card p-6 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200 fill-mode-both">

        {/* TỒN KHO */}
        {activeSubTab === "stock" && (
          <StockTab 
            productSearch={productSearch}
            setProductSearch={setProductSearch}
            setProductPage={setProductPage}
            isProductsLoading={isProductsLoading}
            isProductsError={isProductsError}
            productsError={productsError}
            products={products}
            productsData={productsData}
            productPage={productPage}
            productTotalPages={productTotalPages}
          />
        )}

        {/* PHIẾU NHẬP / XUẤT */}
        {(activeSubTab === "receipts_in" || activeSubTab === "receipts_out") && (
          <ReceiptHistoryTab 
            activeSubTab={activeSubTab}
            exportFilterTab={exportFilterTab}
            setExportFilterTab={setExportFilterTab}
            handleOpenReceiptModal={handleOpenReceiptModal}
            isReceiptsLoading={isReceiptsLoading}
            isOrdersLoading={isOrdersLoading}
            isReceiptsError={isReceiptsError}
            isOrdersError={isOrdersError}
            receiptsError={receiptsError}
            ordersError={ordersError}
            displayData={displayData}
            receiptPage={receiptPage}
            setReceiptPage={setReceiptPage}
            setViewReceiptDetails={setViewReceiptDetails}
            setCancelReceiptId={setCancelReceiptId}
            setCancelModalOpen={setCancelModalOpen}
            receiptsData={receiptsData}
            receiptTotalPages={receiptTotalPages}
          />
        )}

        {/* SỔ S2-HKD */}
        {activeSubTab === "ledger" && (
          <LedgerS2HKDTab 
            selectedLedgerProduct={selectedLedgerProduct}
            setSelectedLedgerProduct={setSelectedLedgerProduct}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            products={products}
            handleExportExcel={handleExportExcel}
            ledger={ledger}
            isLedgerLoading={isLedgerLoading}
            ledgerPage={ledgerPage}
            setLedgerPage={setLedgerPage}
          />
        )}
      </div>
      </div>

      {/* Modal Lập Phiếu */}
      <CreateReceiptModal
        isReceiptModalOpen={isReceiptModalOpen}
        setIsReceiptModalOpen={setIsReceiptModalOpen}
        receiptForm={receiptForm}
        setReceiptForm={setReceiptForm}
        products={products}
        isLoading={isLoading}
        handleAddReceiptItem={handleAddReceiptItem}
        handleItemChange={handleItemChange}
        handleRemoveReceiptItem={handleRemoveReceiptItem}
        handleExportPriceTypeChange={handleExportPriceTypeChange}
        handleSubmitReceipt={handleSubmitReceipt}
      />

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
        <>
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 print:hidden">
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
                    <span className="text-error font-bold flex items-center gap-1"><X className="w-4 h-4" />Đã hủy</span>
                  ) : (
                    <span className="text-emerald-600 font-bold flex items-center gap-1"><Save className="w-4 h-4" />Đã ghi sổ</span>
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
                      <AlertCircle className="w-3.5 h-3.5" />
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
                        return (
                          <tr key={idx} className="hover:bg-surface-container-low/30">
                            <td className="p-3">
                              <span className="font-bold text-on-surface">{products.find((p: any) => p.id === d.productId)?.name || d.productName}</span>
                            </td>
                            <td className="p-3 text-center text-on-surface-variant">{products.find((p: any) => p.id === d.productId)?.baseUnit || "-"}</td>
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
            <div className="p-5 border-t border-surface-container-high bg-surface-container-low flex justify-end gap-3">
              <button onClick={() => window.print()} className="px-6 py-2 bg-white border border-outline-variant text-on-surface font-bold rounded-lg hover:bg-surface-container-low flex items-center gap-2 transition-colors">
                <Printer className="w-4 h-4" /> In Phiếu (TT88)
              </button>
              <button onClick={() => setViewReceiptDetails(null)} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-container">
                Đóng
              </button>
            </div>
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
                <div className="text-[11px] italic">(Ban hành kèm theo Thông tư số 88/2021/TT-BTC<br />ngày 11 tháng 10 năm 2021 của Bộ trưởng Bộ Tài chính)</div>
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
                  <th className="border border-black p-1.5 align-middle" rowSpan={2}>Đơn vị<br />tính</th>
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
                  const prod = products.find((p: any) => p.id === d.productId);
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
        </>
      )}

      {/* COGS Setup Required Modal */}
      {isInitialReceiptsLoaded && receipts.length === 0 && !hasAcknowledgedCogs && activeSubTab !== "settings" && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-surface rounded-3xl w-full max-w-md p-8 shadow-2xl relative text-center border border-outline-variant/30">
            <div className="mx-auto w-20 h-20 bg-primary-container text-primary rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Settings className="w-10 h-10 animate-[spin_4s_linear_infinite]" />
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-3">Kho hàng đang trống!</h2>
            <p className="text-on-surface-variant mb-8 leading-relaxed">
              Đây là thời điểm <strong className="text-error">bắt buộc</strong> phải thiết lập <span className="font-semibold text-primary">Phương pháp tính Giá vốn (COGS)</span> trước khi phát sinh giao dịch đầu tiên. Hệ thống sẽ tự động khóa tính năng này sau khi có dữ liệu nhằm bảo đảm an toàn Sổ sách.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setHasAcknowledgedCogs(true);
                  setActiveSubTab("settings");
                }}
                className="flex-1 bg-primary text-on-primary py-3.5 px-6 rounded-xl font-bold hover:bg-primary/90 transition-transform active:scale-95 shadow-lg shadow-primary/30 text-base"
              >
                Cài đặt Phương pháp Giá vốn
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
