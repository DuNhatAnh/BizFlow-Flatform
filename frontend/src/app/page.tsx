"use client";

import React, { useState, useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ProductManagement from "@/components/ProductManagement";
import InventoryManagement from "@/components/InventoryManagement";
import StaffManagement from "@/components/StaffManagement";
import UserProfile from "@/components/UserProfile";
import MyOrders from "@/components/MyOrders";

// Micro-components
import OwnerOverview from "@/components/OwnerOverview";
import AdminOverview from "@/components/AdminOverview";
import AIDrafts from "@/components/AIDrafts";
import POS from "@/components/POS";
import ToastNotification from "@/components/ToastNotification";
import DebtManagement from "@/components/DebtManagement";

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");
  const [authorized, setAuthorized] = useState(false);
  const [user, setUser] = useState<{
    id?: string;
    username: string;
    fullname: string;
    role: string;
    roleName: string;
    tenantId?: string;
    token?: string;
  } | null>(null);
  const [stockUpdateTrigger, setStockUpdateTrigger] = useState(0);

  // Employee State
  const [cart, setCart] = useState<
    {
      id: string;
      name: string;
      price: number;
      quantity: number;
      unit: string;
      unitId: number | null;
    }[]
  >([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isDebt, setIsDebt] = useState(false);
  const [posSearch, setPosSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    cart?: string;
    customer?: string;
  }>({});
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const [aiDrafts, setAiDrafts] = useState<any[]>([]);
  const [posProducts, setPosProducts] = useState<any[]>([]);
  const [rawProducts, setRawProducts] = useState<any[]>([]);

  const fetchProducts = async (userObj: any) => {
    try {
      // Fetch with a larger pageSize (e.g. 1000) so POS search and list works for all products,
      // and map data.items since it's a PagedResult structure.
      const res = await fetch("http://localhost:5178/api/products?pageSize=1000", {
        headers: {
          "X-Tenant-Id": userObj.tenantId || "11111111-1111-1111-1111-111111111111",
          Authorization: `Bearer ${userObj.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const items = data.items || [];
        setRawProducts(items);
        // Map backend ProductDto to POS format
        const mapped = items.map((p: any) => {
          const defaultUnit =
            p.units?.find((u: any) => u.isDefault) || p.units?.[0];
          return {
            id: p.id,
            name: p.name,
            price: defaultUnit ? defaultUnit.price : 0,
            unit: defaultUnit ? defaultUnit.unitName : p.baseUnit,
            unitId: defaultUnit ? defaultUnit.id : null,
            stock: p.stockQuantity
          };
        });
        setPosProducts(mapped);
      }
    } catch (e) {
      console.error("Failed to fetch products for POS", e);
    }
  };

  const fetchCustomers = async (userObj: any) => {
    try {
      const res = await fetch(
        `http://localhost:5178/api/customers?tenantId=${
          userObj.tenantId || "11111111-1111-1111-1111-111111111111"
        }`,
        {
          headers: {
            "X-Tenant-Id": userObj.tenantId || "11111111-1111-1111-1111-111111111111",
            Authorization: `Bearer ${userObj.token}`
          }
        }
      );
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (e) {
      console.error("Failed to fetch customers", e);
    }
  };

  const fetchDrafts = async (userObj: any) => {
    try {
      const res = await fetch(
        `http://localhost:5178/api/orders/drafts?tenantId=${
          userObj.tenantId || "11111111-1111-1111-1111-111111111111"
        }`,
        {
          headers: {
            "X-Tenant-Id": userObj.tenantId || "11111111-1111-1111-1111-111111111111",
            Authorization: `Bearer ${userObj.token}`
          }
        }
      );
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((d: any) => {
          const diffMs = new Date().getTime() - new Date(d.createdAt).getTime();
          const diffMins = Math.max(0, Math.floor(diffMs / 60000));
          const timeStr = diffMins > 0 ? `${diffMins} phút trước` : "Vừa xong";
          return {
            id: d.id,
            customer: d.customer?.fullname || d.customerName || "Khách Lẻ",
            time: timeStr,
            items: d.orderItems.map((item: any) => ({
              name: item.product?.name || item.productName || "Sản phẩm",
              qty: item.quantity,
              price: item.unitPrice,
              unit: item.productUnit?.unitName || item.unitName || "Đơn vị"
            })),
            payment: d.paymentMethod === "Debt" ? "Ghi nợ (Nợ phải thu)" : "Tiền mặt",
            rawText:
              d.orderSource === "AI_Voice"
                ? "Lấy cho chú Ba 5 bao xi măng Hà Tiên, ghi nợ nghen"
                : "Giao gấp 2 cây sắt thép phi 16 qua, thanh toán tiền mặt luôn",
            confidence: d.orderSource === "AI_Voice" ? "98%" : "95%",
            rawDraft: d
          };
        });
        setAiDrafts(mapped);
      }
    } catch (e) {
      console.error("Failed to fetch drafts", e);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("bizflow_user");
    if (!stored || stored === "undefined") {
      window.location.href = "/login";
    } else {
      try {
        const parsedUser = JSON.parse(stored);
        if (!parsedUser) {
          window.location.href = "/login";
          return;
        }
        setUser(parsedUser);
        setAuthorized(true);

        const savedTab = localStorage.getItem("bizflow_active_tab");
        if (savedTab) {
          setActiveTab(savedTab);
        } else {
          if (parsedUser.username === "employee@bizflow.com") {
            setActiveTab("pos");
          } else if (parsedUser.username === "admin@bizflow.com") {
            setActiveTab("overview");
          } else {
            setActiveTab("overview");
          }
        }

        fetchProducts(parsedUser);
        fetchCustomers(parsedUser);
        fetchDrafts(parsedUser);
      } catch (e) {
        console.error("Error parsing user storage", e);
        localStorage.removeItem("bizflow_user");
        window.location.href = "/login";
      }
    }
  }, []);

  useEffect(() => {
    if (!authorized || !user || !user.token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5178/hubs/notifications")
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        console.log("Connected to SignalR Hub");
        if (user.tenantId) {
          connection.invoke("JoinTenantGroup", user.tenantId)
            .catch(err => console.error("Failed to join tenant group:", err));
        }
      })
      .catch(err => console.error("SignalR Connection failed: ", err));

    connection.on("ReceiveNotification", (message: string) => {
      console.log("SignalR notification: ", message);
      if (message === "NEW_DRAFT_ORDER") {
        fetchDrafts(user);
        showToast("Có đơn hàng nháp AI mới cần duyệt!", "info");
        try {
          const audio = new Audio("/notification.wav");
          audio.volume = 0.6;
          audio.play().catch(e => console.log("Autoplay audio blocked by browser:", e));
        } catch (err) {
          console.error("Audio play error:", err);
        }
      } else if (message === "STOCK_CHANGED") {
        fetchProducts(user);
        setStockUpdateTrigger((prev) => prev + 1);
      }
    });

    return () => {
      connection.stop().then(() => console.log("SignalR connection stopped"));
    };
  }, [authorized, user?.id]);

  useEffect(() => {
    if (authorized) {
      localStorage.setItem("bizflow_active_tab", activeTab);
    }
  }, [activeTab, authorized]);

  const addToCart = (product: typeof posProducts[0]) => {
    const existing = cart.find(
      (item) => item.id === product.id && item.unitId === product.unitId
    );
    const newQty = existing ? existing.quantity + 1 : 1;

    if (newQty > product.stock) {
      showToast(
        `Sản phẩm ${product.name} đã hết hàng trong kho! Không thể thêm vào đơn.`,
        "error"
      );
      return;
    }

    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id && item.unitId === product.unitId
            ? { ...item, quantity: newQty }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          unit: product.unit,
          unitId: product.unitId
        }
      ]);
    }
  };

  const updateCartQty = (
    productId: string,
    unitId: number | null,
    delta: number
  ) => {
    const existing = cart.find(
      (item) => item.id === productId && item.unitId === unitId
    );
    if (!existing) return;

    const newQty = existing.quantity + delta;
    if (newQty <= 0) {
      setCart(
        cart.filter((item) => !(item.id === productId && item.unitId === unitId))
      );
    } else {
      const product = posProducts.find(
        (p) => p.id === productId && p.unitId === unitId
      );
      if (product && newQty > product.stock) {
        showToast(
          `Sản phẩm ${product.name} đã hết hàng trong kho! Không thể thêm vào đơn.`,
          "error"
        );
        return;
      }
      setCart(
        cart.map((item) =>
          item.id === productId && item.unitId === unitId
            ? { ...item, quantity: newQty }
            : item
        )
      );
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log("POS Key pressed:", e.key);
      if (activeTab === "pos") {
        if (e.key === "F2") {
          e.preventDefault();
          const searchInput = document.getElementById("pos-search-input");
          if (searchInput) {
            searchInput.focus();
          }
        } else if (e.key === "F4") {
          e.preventDefault();
          setSelectedCustomer(null);
          setCustomerSearch("");
          const customerInput = document.getElementById("pos-customer-input");
          if (customerInput) {
            (customerInput as HTMLInputElement).focus();
          }
        } else if (e.key === "F8") {
          e.preventDefault();
          setActiveTab("ai-drafts");
        } else if (e.key === "F9" || (e.key === "Enter" && !isCustomerDropdownOpen)) {
          e.preventDefault();
          handleCheckout();
        } else if (e.key === "Escape") {
          e.preventDefault();
          if (cart.length > 0) {
            if (confirm("Bạn có muốn hủy đơn hàng hiện tại?")) {
              setCart([]);
              setSelectedCustomer(null);
              setCustomerSearch("");
              setPosSearch("");
              setIsDebt(false);
            }
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    activeTab,
    cart,
    isDebt,
    selectedCustomer,
    customers,
    isCustomerDropdownOpen
  ]);

  useEffect(() => {
    if (cart.length > 0) {
      setValidationErrors((prev) => ({ ...prev, cart: undefined }));
    }
  }, [cart.length]);

  useEffect(() => {
    if (!isDebt || selectedCustomer) {
      setValidationErrors((prev) => ({ ...prev, customer: undefined }));
    }
  }, [isDebt, selectedCustomer]);

  const handleCheckout = async () => {
    const errors: { cart?: string; customer?: string } = {};

    if (cart.length === 0) {
      errors.cart = "Giỏ hàng đang trống! Vui lòng chọn ít nhất 1 sản phẩm.";
    }

    if (isDebt && !selectedCustomer) {
      errors.customer = "Vui lòng chọn khách hàng đăng ký để thực hiện ghi nợ!";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    const stored = localStorage.getItem("bizflow_user");
    if (!stored) return;
    const userObj = JSON.parse(stored);

    const orderBody = {
      tenantId: userObj.tenantId || "11111111-1111-1111-1111-111111111111",
      customerId: selectedCustomer?.id || null,
      createdBy: userObj.id || "aaaabbbb-cccc-dddd-eeee-777788889999",
      totalAmount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      paymentMethod: isDebt ? "Debt" : "Cash",
      status: "Completed",
      orderSource: "Manual",
      orderItems: cart.map((item) => ({
        productId: item.id,
        productUnitId: item.unitId,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity
      }))
    };

    // Save states for potential rollback
    const previousCart = [...cart];
    const previousCustomer = selectedCustomer;
    const previousIsDebt = isDebt;
    const total = orderBody.totalAmount;

    // OPTIMISTIC UI: Clear state & show success toast immediately!
    setCart([]);
    setSelectedCustomer(null);
    setCustomerSearch("");
    setIsDebt(false);
    showToast(
      `Thanh toán thành công đơn hàng!\nKhách hàng: ${
        previousCustomer?.fullname || "Khách vãng lai"
      }\nTổng tiền: ${total.toLocaleString()} đ\nHình thức: ${
        previousIsDebt ? "Ghi nợ" : "Tiền mặt"
      }\nChứng từ kế toán đã được ghi nhận tự động vào Sổ cái.`,
      "success"
    );

    try {
      const res = await fetch("http://localhost:5178/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": userObj.tenantId || "11111111-1111-1111-1111-111111111111",
          Authorization: `Bearer ${userObj.token}`
        },
        body: JSON.stringify(orderBody)
      });

      if (res.ok) {
        // Success: refresh local lists silently in background
        fetchProducts(userObj);
        fetchCustomers(userObj);
      } else {
        const err = await res.json();
        // Rollback states on failure
        setCart(previousCart);
        setSelectedCustomer(previousCustomer);
        setIsDebt(previousIsDebt);
        showToast(
          `Lỗi khi tạo đơn hàng: ${
            err.message || err.Message || "Yêu cầu không hợp lệ"
          }`,
          "error"
        );
      }
    } catch (e) {
      // Rollback states on error
      setCart(previousCart);
      setSelectedCustomer(previousCustomer);
      setIsDebt(previousIsDebt);
      showToast("Lỗi kết nối khi gửi đơn hàng lên máy chủ", "error");
    }
  };

  const approveDraft = async (draft: any) => {
    const stored = localStorage.getItem("bizflow_user");
    if (!stored) return;
    const userObj = JSON.parse(stored);

    const raw = draft.rawDraft;
    const paymentMethod =
      draft.payment === "Ghi nợ (Nợ phải thu)" ? "Debt" : "Cash";

    if (paymentMethod === "Debt" && !raw.customerId) {
      showToast("Không tìm thấy khách hàng liên kết để ghi nợ!", "error");
      return;
    }

    const updatedOrder = {
      ...raw,
      paymentMethod: paymentMethod,
      status: "Completed",
      createdBy: userObj.id || raw.createdBy
    };

    const previousDrafts = [...aiDrafts];
    // OPTIMISTIC UI: Remove draft and show success toast instantly
    setAiDrafts(aiDrafts.filter((d) => d.id !== draft.id));
    showToast(
      `Đã duyệt đơn nháp của ${draft.customer}!\nHệ thống tự động:\n1. Tạo hóa đơn POS mới.\n2. Ghi nhận công nợ (hình thức: ${draft.payment}).\n3. Cập nhật sổ kế toán TT88.`,
      "success"
    );

    try {
      const res = await fetch(
        `http://localhost:5178/api/orders/${draft.id}/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Tenant-Id": userObj.tenantId || "11111111-1111-1111-1111-111111111111",
            Authorization: `Bearer ${userObj.token}`
          },
          body: JSON.stringify(updatedOrder)
        }
      );

      if (res.ok) {
        // Silently update list values
        fetchDrafts(userObj);
        fetchProducts(userObj);
        fetchCustomers(userObj);
      } else {
        const err = await res.json();
        setAiDrafts(previousDrafts);
        showToast(
          `Lỗi khi duyệt đơn hàng nháp: ${
            err.message || err.Message || "Yêu cầu không hợp lệ"
          }`,
          "error"
        );
      }
    } catch (e) {
      setAiDrafts(previousDrafts);
      showToast("Lỗi kết nối khi duyệt đơn hàng nháp", "error");
    }
  };

  const rejectDraft = async (draftId: string) => {
    const stored = localStorage.getItem("bizflow_user");
    if (!stored) return;
    const userObj = JSON.parse(stored);

    const previousDrafts = [...aiDrafts];
    // OPTIMISTIC UI: Remove draft instantly and notify
    setAiDrafts(aiDrafts.filter((d) => d.id !== draftId));
    showToast("Đã hủy đơn hàng nháp thành công!", "success");

    try {
      const res = await fetch(
        `http://localhost:5178/api/orders/${draftId}/reject?tenantId=${
          userObj.tenantId || "11111111-1111-1111-1111-111111111111"
        }`,
        {
          method: "POST",
          headers: {
            "X-Tenant-Id": userObj.tenantId || "11111111-1111-1111-1111-111111111111",
            Authorization: `Bearer ${userObj.token}`
          }
        }
      );

      if (res.ok) {
        fetchDrafts(userObj);
      } else {
        setAiDrafts(previousDrafts);
        showToast("Lỗi khi hủy đơn hàng nháp", "error");
      }
    } catch (e) {
      setAiDrafts(previousDrafts);
      showToast("Lỗi kết nối khi hủy đơn hàng nháp", "error");
    }
  };

  const handleCancelOrderOptimistic = (order: any) => {
    // 1. Update POS stock levels
    setPosProducts(prev => prev.map(p => {
      const item = order.orderItems.find((oi: any) => oi.productId === p.id);
      if (item) {
        const rate = item.productUnit?.conversionRate || 1;
        return { ...p, stock: p.stock + (item.quantity * rate) };
      }
      return p;
    }));

    // 2. Update customer debt if debt order
    if (order.paymentMethod === "Debt" && order.customerId) {
      setCustomers(prev => prev.map(c => {
        if (c.id === order.customerId) {
          return { ...c, totalDebt: Math.max(0, c.totalDebt - order.totalAmount) };
        }
        return c;
      }));
    }
  };

  const handleReturnOrderOptimistic = (order: any, returnItems: { productId: string; productUnitId: number | null; returnQuantity: number }[], refundAmount: number) => {
    // 1. Update POS stock levels
    setPosProducts(prev => prev.map(p => {
      const returned = returnItems.filter(ri => ri.productId === p.id);
      if (returned.length > 0) {
        const baseReturnedQty = returned.reduce((sum, ri) => {
          const item = order.orderItems.find((oi: any) => oi.productId === ri.productId && oi.productUnitId === ri.productUnitId);
          const rate = item?.productUnit?.conversionRate || 1;
          return sum + (ri.returnQuantity * rate);
        }, 0);
        return { ...p, stock: p.stock + baseReturnedQty };
      }
      return p;
    }));

    // 2. Update customer debt if debt order
    if (order.paymentMethod === "Debt" && order.customerId) {
      setCustomers(prev => prev.map(c => {
        if (c.id === order.customerId) {
          return { ...c, totalDebt: Math.max(0, c.totalDebt - refundAmount) };
        }
        return c;
      }));
    }
  };

  if (!authorized || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- RENDER CONTENT BY ROLE & TAB ---
  const renderContent = () => {
    if (activeTab === "profile") {
      return <UserProfile />;
    }

    // 1. ADMIN FLOW
    if (user.username === "admin@bizflow.com") {
      if (activeTab === "overview") {
        return <AdminOverview />;
      }
      return (
        <div className="bg-white p-12 rounded-xl border border-surface-container-high text-center shadow-card">
          <h2 className="text-xl font-bold text-on-surface">Cấu hình chức năng hệ thống</h2>
          <p className="text-sm text-on-surface-variant mt-2">
            Trang cài đặt các cấu hình phân hệ SaaS Multi-tenant dành cho vai trò Quản trị viên tối cao (Platform Admin).
          </p>
        </div>
      );
    }

    // 2. EMPLOYEE FLOW
    if (user.username === "employee@bizflow.com") {
      if (activeTab === "pos") {
        return (
          <POS
            posProducts={posProducts}
            posSearch={posSearch}
            setPosSearch={setPosSearch}
            cart={cart}
            addToCart={addToCart}
            updateCartQty={updateCartQty}
            setCart={setCart}
            customers={customers}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            customerSearch={customerSearch}
            setCustomerSearch={setCustomerSearch}
            isCustomerDropdownOpen={isCustomerDropdownOpen}
            setIsCustomerDropdownOpen={setIsCustomerDropdownOpen}
            isDebt={isDebt}
            setIsDebt={setIsDebt}
            validationErrors={validationErrors}
            handleCheckout={handleCheckout}
          />
        );
      }

      if (activeTab === "ai-drafts") {
        return (
          <AIDrafts
            aiDrafts={aiDrafts}
            approveDraft={approveDraft}
            rejectDraft={rejectDraft}
            rawProducts={rawProducts}
            customers={customers}
            setAiDrafts={setAiDrafts}
          />
        );
      }

      if (activeTab === "orders") {
        return (
          <MyOrders
            onOrderChange={() => {
              fetchProducts(user);
              fetchCustomers(user);
            }}
            onCancelOrderOptimistic={handleCancelOrderOptimistic}
            onReturnOrderOptimistic={handleReturnOrderOptimistic}
          />
        );
      }

      if (activeTab === "products") {
        return (
          <ProductManagement
            isReadOnly={user?.role === "Employee"}
            user={user}
            onAddToCart={addToCart}
            stockUpdateTrigger={stockUpdateTrigger}
          />
        );
      }

      if (activeTab === "debts") {
        return (
          <DebtManagement
            isReadOnly={true}
            user={user}
            onDebtChange={() => {
              fetchCustomers(user);
            }}
          />
        );
      }

      return (
        <div className="bg-white p-12 rounded-xl border border-surface-container-high text-center shadow-card">
          <h2 className="text-xl font-bold text-on-surface">Tra cứu thông tin POS</h2>
          <p className="text-sm text-on-surface-variant mt-2">
            Mục thông tin dành cho Nhân viên, bao gồm xem lịch sử hóa đơn bán lẻ và danh mục hàng hóa.
          </p>
        </div>
      );
    }

    // 3. OWNER FLOW (DEFAULT)
    if (activeTab === "overview") {
      return <OwnerOverview />;
    }

    if (activeTab === "products") {
      return (
        <ProductManagement
          isReadOnly={user?.role === "Employee"}
          user={user}
          onAddToCart={addToCart}
          stockUpdateTrigger={stockUpdateTrigger}
        />
      );
    }

    if (activeTab === "inventory") {
      return <InventoryManagement />;
    }

    if (activeTab === "staff") {
      return <StaffManagement />;
    }

    if (activeTab === "customers") {
      return (
        <DebtManagement
          isReadOnly={false}
          user={user}
          onDebtChange={() => {
            fetchCustomers(user);
          }}
        />
      );
    }

    return (
      <div className="bg-white p-12 rounded-xl border border-surface-container-high text-center shadow-card">
        <h2 className="text-xl font-bold text-on-surface">Tính năng đang phát triển</h2>
        <p className="text-sm text-on-surface-variant mt-2">
          Phân hệ quản trị sổ sách thuế Thông tư 88/2021/TT-BTC, báo cáo tài chính kho bãi và danh mục hàng hóa chi tiết.
        </p>
      </div>
    );
  };

  // Get active tab title & subtitle for Header when greeting is hidden
  const getTabHeader = () => {
    switch (activeTab) {
      case "pos":
        return {
          title: "Bán hàng POS",
          subtitle: "Lập hóa đơn và thanh toán cho khách hàng"
        };
      case "orders":
        return {
          title: "Lịch sử giao dịch & Bán hàng",
          subtitle: "Tra cứu, kiểm tra chi tiết và in lại hóa đơn do bạn thực hiện"
        };
      case "ai-drafts":
        return {
          title: "Đơn hàng nháp AI",
          subtitle: "Rà soát và duyệt các đơn hàng trích xuất bằng AI từ giọng nói/tin nhắn"
        };
      case "products":
        return {
          title: "Danh mục Sản phẩm & Đơn vị tính",
          subtitle: "Quản lý hàng hóa, tỷ lệ quy đổi và giá bán theo đơn vị"
        };
      case "inventory":
        return {
          title: "Quản lý Kho hàng",
          subtitle: "Theo dõi tồn kho, nhập xuất kho và sổ sách chi tiết S2"
        };
      case "staff":
        return {
          title: "Quản lý Nhân sự",
          subtitle: "Danh sách tài khoản nhân viên thu ngân của cửa hàng"
        };
      case "debts":
        return {
          title: "Ghi nợ nhanh",
          subtitle: "Tra cứu công nợ khách hàng và thu nợ nhanh qua VietQR"
        };
      case "customers":
        return {
          title: "Khách hàng & Công nợ",
          subtitle: "Quản lý danh sách khách hàng, thiết lập hạn mức nợ và lịch sử thanh toán"
        };
      case "profile":
        return {
          title: "Hồ sơ cá nhân",
          subtitle: "Xem và cập nhật thông tin tài khoản cá nhân"
        };
      default:
        return { title: "", subtitle: "" };
    }
  };

  const headerInfo = getTabHeader();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} draftCount={aiDrafts.length} />

      {/* Main dashboard body */}
      <div className="pl-[260px] min-h-screen flex flex-col">
        <main className="flex-1 p-8 max-w-[1440px] mx-auto w-full">
          {/* Header section */}
          <Header
            showGreeting={activeTab === "overview"}
            title={headerInfo.title}
            subtitle={headerInfo.subtitle}
          />

          {/* Render content based on dynamic calculations */}
          <div className={activeTab === "overview" ? "mt-6" : "mt-2"}>
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Custom sliding notification toast */}
      {toast && <ToastNotification message={toast.message} type={toast.type} />}
    </div>
  );
}
