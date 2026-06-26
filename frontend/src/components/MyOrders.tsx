"use client";

import React, { useState, useEffect } from "react";
import {
  Search, Calendar, CreditCard, Printer, Trash2, Eye, X,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  DollarSign, AlertCircle, ShoppingBag, RefreshCw
} from "lucide-react";

interface OrderItem {
  id: string;
  productId: string;
  productName?: string;
  product?: {
    name: string;
  };
  productUnitId: number;
  productUnit?: {
    unitName: string;
    conversionRate?: number;
  };
  unitName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Customer {
  id: string;
  fullname: string;
  phone: string;
}

interface Order {
  id: string;
  code?: string;
  tenantId: string;
  customerId: string | null;
  customer?: Customer;
  createdBy: string;
  totalAmount: number;
  paymentMethod: "Cash" | "Debt";
  status: "Draft" | "Completed" | "Cancelled";
  orderSource: "Manual" | "AI_Voice" | "AI_Text";
  createdAt: string;
  orderItems: OrderItem[];
}

interface MyOrdersProps {
  onOrderChange?: () => void;
  onCancelOrderOptimistic?: (order: Order) => void;
  onReturnOrderOptimistic?: (order: Order, returnItems: { productId: string; productUnitId: number | null; returnQuantity: number }[], refundAmount: number) => void;
}

export default function MyOrders({ onOrderChange, onCancelOrderOptimistic, onReturnOrderOptimistic }: MyOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("today"); // today, yesterday, 7days, all
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all"); // all, Cash, Debt

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Order for Details Drawer & Reprint
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Custom dialogs & notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null);

  // Return Order State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnOrderData, setReturnOrderData] = useState<Order | null>(null);
  const [returnQuantities, setReturnQuantities] = useState<{ [key: string]: number }>({});

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const stored = localStorage.getItem("bizflow_user");
    if (stored) {
      const userObj = JSON.parse(stored);
      setUser(userObj);
      fetchOrders(userObj);
    }
  }, [dateFilter, customStartDate, customEndDate]);

  const fetchOrders = async (userObj: any) => {
    try {
      setIsLoading(true);

      // Calculate API date queries
      let dateParam = "";
      if (dateFilter === "today") {
        const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local time
        dateParam = `&dateStr=${todayStr}`;
      } else if (dateFilter === "yesterday") {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString('en-CA');
        dateParam = `&dateStr=${yesterdayStr}`;
      }

      // Fetch all orders for the current employee and tenant
      // We will perform date range filtering on the client for "7days" or "custom" to keep the backend simple,
      // or filter directly here.
      const url = `http://localhost:5178/api/orders?tenantId=${userObj.tenantId}&createdBy=${userObj.id}${dateParam}`;

      const res = await fetch(url, {
        headers: {
          "X-Tenant-Id": userObj.tenantId,
          "Authorization": `Bearer ${userObj.token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        showToast("Không thể tải danh sách đơn hàng từ máy chủ", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Lỗi kết nối khi tải danh sách đơn hàng", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Date and query client-side filtering logic
  const filteredOrders = orders.filter(order => {
    // 1. Search Query (Short ID, Customer Name, or Customer Phone)
    const shortId = order.code ? order.code.toLowerCase() : order.id.substring(0, 8).toLowerCase();
    const customerName = order.customer?.fullname.toLowerCase() || "khách lẻ";
    const customerPhone = order.customer?.phone || "";
    const search = searchQuery.toLowerCase();
    const matchSearch = shortId.includes(search) ||
      customerName.includes(search) ||
      customerPhone.includes(search);

    // 2. Payment Method
    const matchPayment = paymentMethodFilter === "all" || order.paymentMethod === paymentMethodFilter;

    // 3. Date Range (for 7days and custom, since today/yesterday are filtered in API)
    let matchDate = true;
    const orderDate = new Date(order.createdAt);

    if (dateFilter === "7days") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      matchDate = orderDate >= sevenDaysAgo;
    } else if (dateFilter === "custom") {
      if (customStartDate) {
        const start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
        matchDate = matchDate && orderDate >= start;
      }
      if (customEndDate) {
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        matchDate = matchDate && orderDate <= end;
      }
    }

    return matchSearch && matchPayment && matchDate;
  });

  // Calculate summaries (Only count Completed orders for actual sales values)
  const completedOrders = filteredOrders.filter(o => o.status === "Completed");
  const totalSalesCount = completedOrders.length;
  const cashSalesAmount = completedOrders
    .filter(o => o.paymentMethod === "Cash")
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const debtSalesAmount = completedOrders
    .filter(o => o.paymentMethod === "Debt")
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const totalRevenue = cashSalesAmount + debtSalesAmount;

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handleCancelOrder = (orderId: string) => {
    if (!user) return;

    setConfirmDialog({
      message: "Bạn có chắc chắn muốn HỦY đơn hàng này không? Hệ thống sẽ tự động hoàn trả số lượng hàng vào kho và giảm trừ công nợ của khách hàng tương ứng.",
      onConfirm: async () => {
        setConfirmDialog(null);

        // Save previous state for rollback
        const previousOrders = [...orders];

        // Trigger optimistic updates for parent state (POS & Customers)
        const orderToCancel = orders.find(o => o.id === orderId);
        if (orderToCancel && onCancelOrderOptimistic) {
          onCancelOrderOptimistic(orderToCancel);
        }

        // Optimistic UI update
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "Cancelled" } : o));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
        }
        showToast("Hủy hóa đơn thành công! Kho và sổ sách đã được cập nhật.", "success");

        try {
          const res = await fetch(`http://localhost:5178/api/orders/${orderId}/cancel?tenantId=${user.tenantId}`, {
            method: "POST",
            headers: {
              "X-Tenant-Id": user.tenantId,
              "Authorization": `Bearer ${user.token}`
            }
          });

          if (!res.ok) {
            let errMsg = "Yêu cầu không hợp lệ";
            try {
              const err = await res.json();
              errMsg = err.message || err.Message || errMsg;
            } catch {
              try {
                const text = await res.text();
                if (text && text.length < 100) errMsg = text;
              } catch {}
            }
            showToast(`Lỗi hủy đơn: ${errMsg}`, "error");
            setOrders(previousOrders);
            if (onOrderChange) onOrderChange();
          } else {
            // Re-fetch in background to ensure database synchronization
            fetchOrders(user);
            if (onOrderChange) onOrderChange();
          }
        } catch (e) {
          console.error(e);
          showToast("Lỗi kết nối khi gửi yêu cầu hủy đơn hàng", "error");
          setOrders(previousOrders);
          if (onOrderChange) onOrderChange();
        }
      }
    });
  };

  const handleOpenReturnModal = (order: Order) => {
    setReturnOrderData(order);
    const initialQtys: { [key: string]: number } = {};
    order.orderItems.forEach(item => {
      const key = `${item.productId}_${item.productUnitId || 0}`;
      initialQtys[key] = 0;
    });
    setReturnQuantities(initialQtys);
    setIsReturnModalOpen(true);
  };

  const getRefundAmount = () => {
    if (!returnOrderData) return 0;
    return returnOrderData.orderItems.reduce((sum, item) => {
      const key = `${item.productId}_${item.productUnitId || 0}`;
      const qty = returnQuantities[key] || 0;
      return sum + qty * item.unitPrice;
    }, 0);
  };

  const handleQuantityChange = (productId: string, productUnitId: number | null, val: string, maxQty: number) => {
    const key = `${productId}_${productUnitId || 0}`;
    const num = parseFloat(val);
    if (isNaN(num) || num < 0) {
      setReturnQuantities(prev => ({ ...prev, [key]: 0 }));
    } else if (num > maxQty) {
      setReturnQuantities(prev => ({ ...prev, [key]: maxQty }));
    } else {
      setReturnQuantities(prev => ({ ...prev, [key]: num }));
    }
  };

  const handleConfirmReturn = async () => {
    if (!user || !returnOrderData) return;

    const itemsPayload = returnOrderData.orderItems
      .map(item => {
        const key = `${item.productId}_${item.productUnitId || 0}`;
        const qty = returnQuantities[key] || 0;
        return {
          productId: item.productId,
          productUnitId: item.productUnitId || null,
          returnQuantity: qty
        };
      })
      .filter(item => item.returnQuantity > 0);

    if (itemsPayload.length === 0) {
      showToast("Vui lòng chọn số lượng hàng hóa muốn đổi trả", "error");
      return;
    }

    // Save previous state for rollback
    const previousOrders = [...orders];
    const targetOrderId = returnOrderData.id;
    const refundAmt = getRefundAmount();

    // Optimistically update local orders state
    setOrders(prev => prev.map(o => {
      if (o.id === targetOrderId) {
        const updatedItems = o.orderItems.map(item => {
          const payloadItem = itemsPayload.find(p => p.productId === item.productId && p.productUnitId === item.productUnitId);
          if (payloadItem) {
            const newQty = Math.max(0, item.quantity - payloadItem.returnQuantity);
            return {
              ...item,
              quantity: newQty,
              totalPrice: item.unitPrice * newQty
            };
          }
          return item;
        });

        const allReturned = updatedItems.every(item => item.quantity === 0);
        return {
          ...o,
          totalAmount: Math.max(0, o.totalAmount - refundAmt),
          orderItems: updatedItems,
          status: allReturned ? "Cancelled" as const : o.status
        };
      }
      return o;
    }));

    // Trigger optimistic updates for parent state (POS & Customers)
    if (onReturnOrderOptimistic) {
      onReturnOrderOptimistic(returnOrderData, itemsPayload, refundAmt);
    }

    // Close modal & drawer instantly
    setIsReturnModalOpen(false);
    setReturnOrderData(null);
    setSelectedOrder(null);
    showToast("Đổi trả đơn hàng thành công! Kho và công nợ đã được cập nhật.", "success");

    try {
      const res = await fetch(`http://localhost:5178/api/orders/${targetOrderId}/return?tenantId=${user.tenantId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": user.tenantId,
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({
          items: itemsPayload,
          performedBy: user.id
        })
      });

      if (!res.ok) {
        let errMsg = "Yêu cầu không hợp lệ";
        try {
          const err = await res.json();
          errMsg = err.message || err.Message || errMsg;
        } catch {
          try {
            const text = await res.text();
            if (text && text.length < 100) errMsg = text;
          } catch {}
        }
        showToast(`Lỗi đổi trả: ${errMsg}`, "error");
        setOrders(previousOrders);
        if (onOrderChange) onOrderChange();
      } else {
        // Re-fetch in background to ensure database synchronization
        fetchOrders(user);
        if (onOrderChange) onOrderChange();
      }
    } catch (e) {
      console.error(e);
      showToast("Lỗi kết nối khi gửi yêu cầu đổi trả hàng", "error");
      setOrders(previousOrders);
      if (onOrderChange) onOrderChange();
    }
  };

  // Re-print printer dispatch
  const handlePrint = (order: Order) => {
    // Construct hidden printable area
    const printSection = document.getElementById("print-area");
    if (!printSection) return;

    // Format Date helper
    const formattedDate = new Date(order.createdAt).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });

    // Populate printable elements
    const customerText = order.customer ? `${order.customer.fullname} - ${order.customer.phone || ""}` : "Khách vãng lai";
    const paymentText = order.paymentMethod === "Debt" ? "Ghi nợ (Nợ phải thu)" : "Tiền mặt";
    const cashierName = user?.fullname || "Nhân viên";

    let itemsHtml = "";
    order.orderItems.forEach((item, index) => {
      const pName = item.product?.name || item.productName || "Sản phẩm";
      const uName = item.productUnit?.unitName || item.unitName || "ĐVT";
      const subtotal = item.quantity * item.unitPrice;
      itemsHtml += `
        <tr style="border-bottom: 1px dashed #ddd;">
          <td style="padding: 6px 0; vertical-align: top;">${index + 1}. ${pName}</td>
          <td style="padding: 6px 0; text-align: center; vertical-align: top;">${item.quantity} ${uName}</td>
          <td style="padding: 6px 0; text-align: right; vertical-align: top;">${item.unitPrice.toLocaleString()} đ</td>
          <td style="padding: 6px 0; text-align: right; font-weight: bold; vertical-align: top;">${subtotal.toLocaleString()} đ</td>
        </tr>
      `;
    });

    printSection.innerHTML = `
      <div style="font-family: 'Courier New', Courier, monospace; color: #000; width: 100%; max-width: 80mm; margin: 0 auto; padding: 10px;">
        <div style="text-align: center; margin-bottom: 10px;">
          <h2 style="margin: 0; font-size: 18px; font-weight: bold;">BIZFLOW PLATFORM</h2>
          <p style="margin: 4px 0 0 0; font-size: 11px;">Hệ thống bán hàng thông minh tự động</p>
          <p style="margin: 2px 0 0 0; font-size: 10px; font-style: italic;">Hóa Đơn Bán Lẻ (Bản In Lại)</p>
        </div>
        
        <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 8px 0; margin-bottom: 10px; font-size: 11px; line-height: 1.4;">
          <div><b>Mã hóa đơn:</b> ${order.code || ('#' + order.id.substring(0, 8))}</div>
          <div><b>Ngày bán:</b> ${formattedDate}</div>
          <div><b>Nhân viên:</b> ${cashierName}</div>
          <div><b>Khách hàng:</b> ${customerText}</div>
          <div><b>Thanh toán:</b> ${paymentText}</div>
        </div>

        <table style="width: 100%; font-size: 11px; border-collapse: collapse; margin-bottom: 15px;">
          <thead>
            <tr style="border-bottom: 1px dashed #000; font-weight: bold;">
              <th style="text-align: left; padding-bottom: 5px; width: 45%;">Tên hàng</th>
              <th style="text-align: center; padding-bottom: 5px; width: 15%;">SL</th>
              <th style="text-align: right; padding-bottom: 5px; width: 20%;">Đ.Giá</th>
              <th style="text-align: right; padding-bottom: 5px; width: 20%;">T.Tiền</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="border-top: 1px dashed #000; padding-top: 8px; font-size: 12px; line-height: 1.5;">
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>Tổng cộng thanh toán:</span>
            <span>${order.totalAmount.toLocaleString()} đ</span>
          </div>
        </div>

        <div style="text-align: center; margin-top: 25px; font-size: 10px;">
          <p style="margin: 0;">Cảm ơn quý khách. Hẹn gặp lại!</p>
          <p style="margin: 4px 0 0 0; font-style: italic; font-size: 8px;">Powered by BizFlow Platform</p>
        </div>
      </div>
    `;

    // Trigger printing
    window.print();
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Print receipt section container - hidden by default, visible during printing */}
        <div id="print-area" className="hidden print:block absolute top-0 left-0 w-full bg-white z-[9999]"></div>

        {/* Statistics Shift Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-surface-container-high shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-primary rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Doanh thu Tiền mặt</p>
              <h3 className="text-lg font-bold text-on-surface mt-1">{cashSalesAmount.toLocaleString()} đ</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-surface-container-high shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Doanh thu Ghi nợ</p>
              <h3 className="text-lg font-bold text-on-surface mt-1">{debtSalesAmount.toLocaleString()} đ</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-surface-container-high shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tổng số đơn hàng</p>
              <h3 className="text-lg font-bold text-on-surface mt-1">{totalSalesCount} hóa đơn</h3>
            </div>
          </div>
        </div>

        {/* Filter and Search Panel */}
        <div className="bg-white p-5 rounded-xl border border-surface-container-high shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search bar */}
            <div className="md:col-span-5 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-on-surface-variant" />
              </div>
              <input
                type="text"
                placeholder="Tìm theo Mã hóa đơn (8 số đầu) hoặc tên khách..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-9 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary transition-colors text-on-surface"
              />
            </div>

            {/* Quick Date Filters */}
            <div className="md:col-span-4 flex rounded-lg bg-surface-container-low p-1 text-sm border border-outline-variant">
              <button
                onClick={() => { setDateFilter("today"); setCurrentPage(1); }}
                className={`flex-1 py-1.5 text-center font-semibold rounded transition-colors ${dateFilter === "today" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                  }`}
              >
                Hôm nay
              </button>
              <button
                onClick={() => { setDateFilter("yesterday"); setCurrentPage(1); }}
                className={`flex-1 py-1.5 text-center font-semibold rounded transition-colors ${dateFilter === "yesterday" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                  }`}
              >
                Hôm qua
              </button>
              <button
                onClick={() => { setDateFilter("7days"); setCurrentPage(1); }}
                className={`flex-1 py-1.5 text-center font-semibold rounded transition-colors ${dateFilter === "7days" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                  }`}
              >
                7 ngày qua
              </button>
              <button
                onClick={() => { setDateFilter("custom"); setCurrentPage(1); }}
                className={`flex-1 py-1.5 text-center font-semibold rounded transition-colors ${dateFilter === "custom" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                  }`}
              >
                Tùy chọn
              </button>
            </div>

            {/* Payment Method Filter */}
            <div className="md:col-span-3">
              <select
                value={paymentMethodFilter}
                onChange={(e) => { setPaymentMethodFilter(e.target.value); setCurrentPage(1); }}
                className="block w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary appearance-none cursor-pointer text-on-surface font-semibold"
              >
                <option value="all">Tất cả hình thức thanh toán</option>
                <option value="Cash">Thanh toán Tiền mặt</option>
                <option value="Debt">Ghi nợ (Nợ phải thu)</option>
              </select>
            </div>
          </div>

          {/* Custom date range fields (only shown when custom is selected) */}
          {dateFilter === "custom" && (
            <div className="flex flex-col sm:flex-row gap-4 items-center p-3.5 bg-surface-container-low/55 rounded-lg border border-outline-variant animate-in slide-in-from-top-2 duration-200">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Khoảng thời gian:</span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary"
                />
                <span className="text-on-surface-variant text-xs font-semibold">đến</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>
              {(customStartDate || customEndDate) && (
                <button
                  onClick={() => {
                    setCustomStartDate("");
                    setCustomEndDate("");
                  }}
                  className="text-xs font-bold text-error hover:underline shrink-0"
                >
                  Xóa khoảng lọc
                </button>
              )}
            </div>
          )}
        </div>

        {/* Main Order Table */}
        <div className="bg-white rounded-xl border border-surface-container-high shadow-card flex flex-col overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant uppercase tracking-wider text-xs font-bold border-b border-surface-container-high">
                  <th className="p-4 w-12 text-center">STT</th>
                  <th className="p-4">Mã hóa đơn</th>
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4">Thời gian tạo</th>
                  <th className="p-4 text-right">Tổng tiền</th>
                  <th className="p-4 text-center">Phương thức</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low text-on-surface">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-on-surface-variant">
                      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
                      Đang tải danh sách giao dịch...
                    </td>
                  </tr>
                ) : paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-on-surface-variant">
                      <AlertCircle className="w-12 h-12 mx-auto text-on-surface-variant/30 mb-3" />
                      Không tìm thấy dữ liệu hóa đơn nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order, index) => {
                    const shortId = order.code || order.id.substring(0, 8);
                    const dateObj = new Date(order.createdAt);
                    const pad = (n: number) => String(n).padStart(2, '0');
                    const formattedDate = `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())} ${pad(dateObj.getDate())}-${pad(dateObj.getMonth() + 1)}-${dateObj.getFullYear()}`;

                    return (
                      <tr
                        key={order.id}
                        className={`even:bg-slate-50 odd:bg-white hover:bg-surface-container-low/40 transition-colors group ${order.status === "Cancelled" ? "bg-red-50/10 text-on-surface-variant" : ""
                          }`}
                      >
                        <td className="p-4 text-center font-medium text-on-surface-variant">
                          {startIndex + index + 1}
                        </td>
                        <td className="p-4 font-mono font-bold text-on-surface group-hover:text-primary transition-colors">
                          #{shortId}
                        </td>
                        <td className="p-4 font-semibold">
                          {order.customer ? order.customer.fullname : "Khách lẻ"}
                        </td>
                        <td className="p-4 text-on-surface-variant">
                          {formattedDate}
                        </td>
                        <td className="p-4 text-right font-bold text-secondary">
                          {order.totalAmount.toLocaleString()} đ
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${order.paymentMethod === "Debt"
                              ? "bg-blue-50 text-blue-600 border border-blue-100"
                              : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            }`}>
                            {order.paymentMethod === "Debt" ? "Ghi nợ" : "Tiền mặt"}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${order.status === "Completed"
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : order.status === "Cancelled"
                                ? "bg-error/10 text-error border border-error/20"
                                : "bg-surface-container-high text-on-surface-variant border border-outline-variant"
                            }`}>
                            {order.status === "Completed" ? "Thành công" : order.status === "Cancelled" ? "Đã hủy" : "Nháp"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handlePrint(order)}
                              disabled={order.status === "Cancelled"}
                              className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-inherit transition-all"
                              title="In hóa đơn"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            {order.status === "Completed" && (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-lg transition-all"
                                title="Hủy đơn hàng"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {filteredOrders.length > 0 && (
            <div className="p-4 border-t border-surface-container-high flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container-low/20">
              <div className="text-sm text-on-surface-variant">
                Hiển thị <span className="font-bold text-on-surface">{startIndex + 1}</span> - <span className="font-bold text-on-surface">{Math.min(startIndex + itemsPerPage, filteredOrders.length)}</span> trong tổng số <span className="font-bold text-on-surface">{filteredOrders.length}</span> hóa đơn
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-outline-variant hover:bg-surface-container-high hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit transition-colors"
                  title="Đến trang đầu"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-outline-variant hover:bg-surface-container-high hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit transition-colors"
                  title="Trang trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="px-4 py-1.5 text-sm font-bold text-on-surface bg-white border border-outline-variant rounded-lg mx-1 shadow-sm">
                  Trang {currentPage} / {totalPages || 1}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-1.5 rounded-lg border border-outline-variant hover:bg-surface-container-high hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit transition-colors"
                  title="Trang tiếp theo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-1.5 rounded-lg border border-outline-variant hover:bg-surface-container-high hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit transition-colors"
                  title="Đến trang cuối"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Side Drawer */}
      {selectedOrder && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-surface-container-high flex justify-between items-center bg-surface-container-low/50">
              <div>
                <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  Chi tiết hóa đơn {selectedOrder.code || ('#' + selectedOrder.id.substring(0, 8))}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Được bán vào {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Client and payment details */}
              <div className="grid grid-cols-2 gap-4 bg-surface-container-low/40 p-4 rounded-xl border border-surface-container-high">
                <div>
                  <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Khách hàng</span>
                  <span className="text-sm font-bold text-on-surface mt-1 block">
                    {selectedOrder.customer ? selectedOrder.customer.fullname : "Khách vãng lai"}
                  </span>
                  {selectedOrder.customer?.phone && (
                    <span className="text-xs text-on-surface-variant block mt-0.5">SĐT: {selectedOrder.customer.phone}</span>
                  )}
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Thanh toán</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${selectedOrder.paymentMethod === "Debt" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                    }`}>
                    {selectedOrder.paymentMethod === "Debt" ? "Ghi nợ" : "Tiền mặt"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Trạng thái</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold mt-1 ${selectedOrder.status === "Completed"
                      ? "bg-primary/10 text-primary"
                      : selectedOrder.status === "Cancelled"
                        ? "bg-error/10 text-error"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}>
                    {selectedOrder.status === "Completed" ? "Thành công" : selectedOrder.status === "Cancelled" ? "Đã hủy" : "Nháp"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Nguồn đơn</span>
                  <span className="text-xs font-semibold text-on-surface mt-1 block">
                    {selectedOrder.orderSource === "AI_Voice" ? "🎤 Giọng nói AI" : selectedOrder.orderSource === "AI_Text" ? "💬 Tin nhắn AI" : "💻 Tại quầy POS"}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-surface-container-high pb-2">
                  Danh sách hàng hóa đã bán
                </h4>
                <div className="divide-y divide-surface-container-low max-h-[300px] overflow-y-auto pr-1">
                  {selectedOrder.orderItems.map((item, idx) => (
                    <div key={item.id || idx} className="py-3 flex justify-between items-start text-sm">
                      <div className="flex-1">
                        <p className="font-bold text-on-surface">{item.product?.name || item.productName || "Sản phẩm"}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {item.quantity} {item.productUnit?.unitName || item.unitName || "ĐVT"} x {item.unitPrice.toLocaleString()} đ
                        </p>
                      </div>
                      <span className="font-bold text-on-surface">
                        {(item.quantity * item.unitPrice).toLocaleString()} đ
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Amount Box */}
              <div className="border-t border-surface-container-high pt-4">
                <div className="flex justify-between items-center bg-primary/5 p-4 rounded-xl border border-primary/20">
                  <span className="text-sm font-bold text-on-surface">Tổng cộng thanh toán:</span>
                  <span className="text-xl font-bold text-primary">
                    {selectedOrder.totalAmount.toLocaleString()} đ
                  </span>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="px-6 py-4 border-t border-surface-container-high bg-surface-container-low/50 flex gap-3">
              {selectedOrder.status === "Completed" && (
                <>
                  <button
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    className="flex-1 py-2.5 bg-error/5 hover:bg-error/10 text-error font-bold rounded-lg text-sm border border-error/20 flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" /> Hủy hóa đơn
                  </button>
                  <button
                    onClick={() => handleOpenReturnModal(selectedOrder)}
                    className="flex-1 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg text-sm border border-amber-200 flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <RefreshCw className="w-4 h-4" /> Đổi trả hàng
                  </button>
                </>
              )}
              <button
                onClick={() => handlePrint(selectedOrder)}
                disabled={selectedOrder.status === "Cancelled"}
                className="flex-1 py-2.5 bg-primary hover:bg-primary-container text-white font-bold rounded-lg text-sm flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:hover:bg-primary transition-all shadow-sm"
              >
                <Printer className="w-4 h-4" /> In hóa đơn
              </button>
            </div>
          </div>
        </>
      )}

      {/* Return Order Modal */}
      {isReturnModalOpen && returnOrderData && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 animate-in zoom-in-95 duration-200 border border-surface-container-high flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-surface-container-low pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-amber-500 animate-spin-slow" /> Yêu cầu Đổi trả hàng nhanh
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Đơn hàng: {returnOrderData.code || ('#' + returnOrderData.id.substring(0, 8))} - Khách hàng: {returnOrderData.customer ? returnOrderData.customer.fullname : "Khách lẻ"}
                </p>
              </div>
              <button
                onClick={() => { setIsReturnModalOpen(false); setReturnOrderData(null); }}
                className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-low/55 p-3 rounded-lg border border-outline-variant">
                Nhập số lượng thực tế khách hàng muốn trả lại. Hệ thống sẽ tự động tăng tồn kho và điều chỉnh sổ sách công nợ hoặc tiền mặt theo đúng hóa đơn ban đầu.
              </div>

              {/* Items List Table */}
              <div className="border border-surface-container-high rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant uppercase tracking-wider text-[11px] font-bold border-b border-surface-container-high">
                      <th className="p-3">Tên sản phẩm</th>
                      <th className="p-3 text-center">ĐVT</th>
                      <th className="p-3 text-right">Mua</th>
                      <th className="p-3 text-right">Đơn giá</th>
                      <th className="p-3 text-center w-32">SL trả lại</th>
                      <th className="p-3 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low text-on-surface">
                    {returnOrderData.orderItems.map((item, idx) => {
                      const key = `${item.productId}_${item.productUnitId || 0}`;
                      const returnQty = returnQuantities[key] || 0;
                      const itemRefund = returnQty * item.unitPrice;
                      return (
                        <tr key={item.id || idx} className="hover:bg-surface-container-low/20 transition-colors">
                          <td className="p-3">
                            <p className="font-semibold text-on-surface text-xs leading-normal">
                              {item.product?.name || item.productName || "Sản phẩm"}
                            </p>
                          </td>
                          <td className="p-3 text-center text-xs text-on-surface-variant">
                            {item.productUnit?.unitName || item.unitName || "ĐVT"}
                          </td>
                          <td className="p-3 text-right font-semibold text-xs">
                            {item.quantity}
                          </td>
                          <td className="p-3 text-right text-xs text-on-surface-variant">
                            {item.unitPrice.toLocaleString()}đ
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const newVal = Math.max(0, returnQty - 1);
                                  setReturnQuantities(prev => ({ ...prev, [key]: newVal }));
                                }}
                                className="w-7 h-7 flex items-center justify-center rounded bg-surface-container-high hover:bg-outline-variant font-bold text-sm text-on-surface transition-colors"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={0}
                                max={item.quantity}
                                value={returnQty === 0 ? "" : returnQty}
                                placeholder="0"
                                onChange={(e) => handleQuantityChange(item.productId, item.productUnitId, e.target.value, item.quantity)}
                                className="w-12 py-1 bg-surface-container-low border border-outline-variant rounded text-center text-xs font-bold focus:outline-none focus:border-primary text-on-surface"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newVal = Math.min(item.quantity, returnQty + 1);
                                  setReturnQuantities(prev => ({ ...prev, [key]: newVal }));
                                }}
                                className="w-7 h-7 flex items-center justify-center rounded bg-surface-container-high hover:bg-outline-variant font-bold text-sm text-on-surface transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="p-3 text-right font-bold text-xs text-secondary">
                            {itemRefund.toLocaleString()}đ
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary and business logic checks */}
              <div className="space-y-3 bg-surface-container-low/40 p-4 rounded-xl border border-surface-container-high">
                <div className="flex justify-between items-center text-sm font-bold text-on-surface">
                  <span>Tổng tiền hoàn trả:</span>
                  <span className="text-lg font-bold text-primary">{getRefundAmount().toLocaleString()} đ</span>
                </div>

                {getRefundAmount() > 0 && (
                  <div className="flex gap-2.5 items-start bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs leading-normal animate-in fade-in duration-200">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      {returnOrderData.paymentMethod === "Debt" ? (
                        <p>
                          <b>LƯU Ý NGHIỆP VỤ (HÓA ĐƠN GHI NỢ):</b> Đơn hàng gốc là đơn hàng <b>Ghi nợ</b>. Hệ thống sẽ tự động tạo giao dịch giảm nợ và giảm trừ <b>{getRefundAmount().toLocaleString()} đ</b> trực tiếp vào số dư nợ của khách hàng <b>{returnOrderData.customer?.fullname || "Chưa xác định"}</b>.
                        </p>
                      ) : (
                        <p>
                          <b>LƯU Ý NGHIỆP VỤ (HÓA ĐƠN TIỀN MẶT):</b> Đơn hàng gốc là đơn hàng <b>Tiền mặt</b>. Vui lòng <b>hoàn trả lại {getRefundAmount().toLocaleString()} đ tiền mặt</b> cho khách hàng tại quầy.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 border-t border-surface-container-low pt-4 mt-4">
              <button
                type="button"
                onClick={() => { setIsReturnModalOpen(false); setReturnOrderData(null); }}
                className="px-4 py-2 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                disabled={getRefundAmount() === 0}
                className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary-container disabled:opacity-30 disabled:hover:bg-primary shadow-md transition-all flex items-center gap-1.5"
              >
                Xác nhận đổi trả
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Action Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200 border border-surface-container-high">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-50 text-error flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-on-surface">Xác nhận thao tác</h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
              {confirmDialog.message}
            </p>
            <div className="flex justify-end gap-3 border-t border-surface-container-low pt-4">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-error hover:bg-error/90 shadow-md transition-colors"
              >
                Đồng ý hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Popup */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-start gap-3.5 px-6 py-4 rounded-xl shadow-2xl border min-w-[320px] max-w-[450px] animate-[slideDown_0.2s_ease-out] ${toast.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}>
          {toast.type === "success" && (
            <div className="p-1 bg-emerald-100 text-emerald-600 rounded-full shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {toast.type === "error" && (
            <div className="p-1 bg-red-100 text-red-600 rounded-full shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
          <div className="flex-1">
            <h4 className="text-sm font-bold tracking-tight mb-0.5 uppercase opacity-90">
              {toast.type === "success" ? "Thành công" : toast.type === "error" ? "Lỗi hệ thống" : "Thông báo"}
            </h4>
            <p className="text-sm leading-relaxed opacity-95">{toast.message}</p>
          </div>
        </div>
      )}
    </>
  );
}
