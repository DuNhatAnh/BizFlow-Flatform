"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MetricCard from "@/components/MetricCard";
import RevenueChart from "@/components/RevenueChart";
import TopProducts from "@/components/TopProducts";
import AIInsight from "@/components/AIInsight";
import ProductManagement from "@/components/ProductManagement";
import InventoryManagement from "@/components/InventoryManagement";
import StaffManagement from "@/components/StaffManagement";
import UserProfile from "@/components/UserProfile";
import {
  DollarSign,
  ShoppingCart,
  Package,
  CreditCard,
  Plus,
  Search,
  Building2,
  Check,
  Trash2,
  Sparkles,
  Mic,
  ChevronRight,
  UserCheck
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");
  const [authorized, setAuthorized] = useState(false);
  const [user, setUser] = useState<{ username: string; fullname: string; role: string; roleName: string } | null>(null);

  // Employee State
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number; unit: string; unitId: number | null }[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isDebt, setIsDebt] = useState(false);
  const [posSearch, setPosSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ cart?: string; customer?: string }>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const [aiDrafts, setAiDrafts] = useState<any[]>([]);
  const [posProducts, setPosProducts] = useState<any[]>([]);

  const fetchProducts = async (userObj: any) => {
    try {
      const res = await fetch("http://localhost:5178/api/products", {
        headers: { 
          "X-Tenant-Id": userObj.tenantId || "11111111-1111-1111-1111-111111111111",
          "Authorization": `Bearer ${userObj.token}` 
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Map backend ProductDto to POS format
        const mapped = data.map((p: any) => {
          const defaultUnit = p.units?.find((u: any) => u.isDefault) || p.units?.[0];
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
      const res = await fetch(`http://localhost:5178/api/customers?tenantId=${userObj.tenantId || "11111111-1111-1111-1111-111111111111"}`, {
        headers: { 
          "X-Tenant-Id": userObj.tenantId || "11111111-1111-1111-1111-111111111111",
          "Authorization": `Bearer ${userObj.token}` 
        }
      });
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
      const res = await fetch(`http://localhost:5178/api/orders/drafts?tenantId=${userObj.tenantId || "11111111-1111-1111-1111-111111111111"}`, {
        headers: { 
          "X-Tenant-Id": userObj.tenantId || "11111111-1111-1111-1111-111111111111",
          "Authorization": `Bearer ${userObj.token}` 
        }
      });
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
            rawText: d.orderSource === "AI_Voice" 
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

  React.useEffect(() => {
    const stored = localStorage.getItem("bizflow_user");
    if (!stored) {
      window.location.href = "/login";
    } else {
      const parsedUser = JSON.parse(stored);
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

      const interval = setInterval(() => {
        fetchDrafts(parsedUser);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, []);

  React.useEffect(() => {
    if (authorized) {
      localStorage.setItem("bizflow_active_tab", activeTab);
    }
  }, [activeTab, authorized]);

  const addToCart = (product: typeof posProducts[0]) => {
    const existing = cart.find(item => item.id === product.id && item.unitId === product.unitId);
    const newQty = existing ? existing.quantity + 1 : 1;

    if (newQty > product.stock) {
      showToast(`Sản phẩm ${product.name} đã hết hàng trong kho! Không thể thêm vào đơn.`, "error");
      return;
    }

    if (existing) {
      setCart(cart.map(item => item.id === product.id && item.unitId === product.unitId ? { ...item, quantity: newQty } : item));
    } else {
      setCart([...cart, { id: product.id, name: product.name, price: product.price, quantity: 1, unit: product.unit, unitId: product.unitId }]);
    }
  };

  const updateCartQty = (productId: string, unitId: number | null, delta: number) => {
    const existing = cart.find(item => item.id === productId && item.unitId === unitId);
    if (!existing) return;

    const newQty = existing.quantity + delta;
    if (newQty <= 0) {
      setCart(cart.filter(item => !(item.id === productId && item.unitId === unitId)));
    } else {
      const product = posProducts.find(p => p.id === productId && p.unitId === unitId);
      if (product && newQty > product.stock) {
        showToast(`Sản phẩm ${product.name} đã hết hàng trong kho! Không thể thêm vào đơn.`, "error");
        return;
      }
      setCart(cart.map(item => item.id === productId && item.unitId === unitId ? { ...item, quantity: newQty } : item));
    }
  };

  React.useEffect(() => {
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
  }, [activeTab, cart, isDebt, selectedCustomer, customers, isCustomerDropdownOpen]);

  React.useEffect(() => {
    if (cart.length > 0) {
      setValidationErrors(prev => ({ ...prev, cart: undefined }));
    }
  }, [cart.length]);

  React.useEffect(() => {
    if (!isDebt || selectedCustomer) {
      setValidationErrors(prev => ({ ...prev, customer: undefined }));
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
      totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      paymentMethod: isDebt ? "Debt" : "Cash",
      status: "Completed",
      orderSource: "Manual",
      orderItems: cart.map(item => ({
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
    showToast(`Thanh toán thành công đơn hàng!\nKhách hàng: ${previousCustomer?.fullname || "Khách vãng lai"}\nTổng tiền: ${total.toLocaleString()} đ\nHình thức: ${previousIsDebt ? "Ghi nợ" : "Tiền mặt"}\nChứng từ kế toán đã được ghi nhận tự động vào Sổ cái.`, "success");

    try {
      const res = await fetch("http://localhost:5178/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": userObj.tenantId || "11111111-1111-1111-1111-111111111111",
          "Authorization": `Bearer ${userObj.token}`
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
        showToast(`Lỗi khi tạo đơn hàng: ${err.message || err.Message || "Yêu cầu không hợp lệ"}`, "error");
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
    const paymentMethod = draft.payment === "Ghi nợ (Nợ phải thu)" ? "Debt" : "Cash";

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
    setAiDrafts(aiDrafts.filter(d => d.id !== draft.id));
    showToast(`Đã duyệt đơn nháp của ${draft.customer}!\nHệ thống tự động:\n1. Tạo hóa đơn POS mới.\n2. Ghi nhận công nợ (hình thức: ${draft.payment}).\n3. Cập nhật sổ kế toán TT88.`, "success");

    try {
      const res = await fetch(`http://localhost:5178/api/orders/${draft.id}/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": userObj.tenantId || "11111111-1111-1111-1111-111111111111",
          "Authorization": `Bearer ${userObj.token}`
        },
        body: JSON.stringify(updatedOrder)
      });

      if (res.ok) {
        // Silently update list values
        fetchDrafts(userObj);
        fetchProducts(userObj);
        fetchCustomers(userObj);
      } else {
        const err = await res.json();
        setAiDrafts(previousDrafts);
        showToast(`Lỗi khi duyệt đơn hàng nháp: ${err.message || err.Message || "Yêu cầu không hợp lệ"}`, "error");
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
    setAiDrafts(aiDrafts.filter(d => d.id !== draftId));
    showToast("Đã hủy đơn hàng nháp thành công!", "success");

    try {
      const res = await fetch(`http://localhost:5178/api/orders/${draftId}/reject?tenantId=${userObj.tenantId || "11111111-1111-1111-1111-111111111111"}`, {
        method: "POST",
        headers: {
          "X-Tenant-Id": userObj.tenantId || "11111111-1111-1111-1111-111111111111",
          "Authorization": `Bearer ${userObj.token}`
        }
      });

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
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Tổng số Doanh nghiệp (Tenants)"
                value="28"
                trend="↑ 4 mới tuần này"
                trendType="up"
                icon={Building2}
                iconBgColor="bg-emerald-50"
                iconColor="text-primary"
              />
              <MetricCard
                title="Số tài khoản sử dụng"
                value="184"
                trend="↑ 12 active hôm nay"
                trendType="up"
                icon={UserCheck}
                iconBgColor="bg-blue-50"
                iconColor="text-secondary"
              />
              <MetricCard
                title="Doanh thu SaaS (Tháng này)"
                value="18.600.000 đ"
                trend="↑ 20% so với tháng trước"
                trendType="up"
                icon={DollarSign}
                iconBgColor="bg-amber-50"
                iconColor="text-amber-500"
              />
              <MetricCard
                title="Chi phí dịch vụ AI (Gemini)"
                value="1.240.000 đ"
                trend="Nằm trong hạn mức"
                trendType="neutral"
                icon={Sparkles}
                iconBgColor="bg-purple-50"
                iconColor="text-purple-600"
              />
            </div>
            <div className="bg-white rounded-xl border border-surface-container-high p-6 shadow-card">
              <h3 className="text-base font-bold text-on-surface mb-4">Các doanh nghiệp mới đăng ký gần đây</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-surface-container-high text-xs font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-low">
                      <th className="p-4">Tên Doanh Nghiệp</th>
                      <th className="p-4">Chủ sở hữu</th>
                      <th className="p-4">Gói dịch vụ</th>
                      <th className="p-4">Trạng thái CSDL</th>
                      <th className="p-4 text-right">Ngày kích hoạt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low">
                    <tr className="hover:bg-surface-container-low/50">
                      <td className="p-4 font-bold text-on-surface">Cửa Hàng Tạp Hóa Bình Minh</td>
                      <td className="p-4">Nguyễn Văn A</td>
                      <td className="p-4"><span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">Gói Chuyên Nghiệp</span></td>
                      <td className="p-4"><span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Isolated Db Connection</span></td>
                      <td className="p-4 text-right text-on-surface-variant">11/06/2026</td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/50">
                      <td className="p-4 font-bold text-on-surface">Vật Liệu Xây Dựng Trường Sơn</td>
                      <td className="p-4">Phan Thanh Tùng</td>
                      <td className="p-4"><span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">Gói Chuyên Nghiệp</span></td>
                      <td className="p-4"><span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Isolated Db Connection</span></td>
                      <td className="p-4 text-right text-on-surface-variant">09/06/2026</td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/50">
                      <td className="p-4 font-bold text-on-surface">Nông Sản Sạch Đà Lạt Mart</td>
                      <td className="p-4">Lê Thị Mai</td>
                      <td className="p-4"><span className="px-2.5 py-1 bg-secondary/10 text-secondary text-xs font-semibold rounded-full">Gói Cơ Bản</span></td>
                      <td className="p-4"><span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Isolated Db Connection</span></td>
                      <td className="p-4 text-right text-on-surface-variant">05/06/2026</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
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
        const filteredProducts = posProducts.filter(p => p.name.toLowerCase().includes(posSearch.toLowerCase()));
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Products Left Section */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              <div className="bg-white p-4 rounded-xl border border-surface-container-high shadow-sm flex items-center gap-3">
                <Search className="w-5 h-5 text-on-surface-variant" />
                <input
                  id="pos-search-input"
                  type="text"
                  placeholder="Tìm nhanh mặt hàng [F2]..."
                  value={posSearch}
                  onChange={(e) => setPosSearch(e.target.value)}
                  className="w-full text-sm bg-transparent outline-none text-on-surface placeholder-on-surface-variant/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProducts.map(p => {
                  const cartItem = cart.find(item => item.id === p.id && item.unitId === p.unitId);
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        if (!cartItem) addToCart(p);
                      }}
                      className={`bg-white p-4 rounded-xl border border-surface-container-high transition-all flex justify-between items-start group ${
                        !cartItem ? "hover:border-primary/50 hover:shadow-md cursor-pointer" : ""
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">{p.name}</h4>
                        <p className="text-xs text-on-surface-variant mt-1">Đơn vị: {p.unit} | Tồn: {p.stock}</p>
                        <p className="text-sm font-bold text-primary mt-2">{p.price.toLocaleString()} đ</p>
                      </div>
                      {cartItem ? (
                        <div 
                          className="flex items-center gap-1.5 bg-primary/5 rounded-lg p-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => updateCartQty(p.id, p.unitId, -1)}
                            className="w-7 h-7 flex items-center justify-center bg-white text-primary rounded border border-primary/20 hover:bg-primary hover:text-white transition-all font-bold"
                          >
                            -
                          </button>
                          <span className="text-sm font-bold text-on-surface px-2 min-w-[24px] text-center">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQty(p.id, p.unitId, 1)}
                            className="w-7 h-7 flex items-center justify-center bg-white text-primary rounded border border-primary/20 hover:bg-primary hover:text-white transition-all font-bold"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(p);
                          }}
                          className="p-1.5 bg-primary/5 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shopping Cart Right Section */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="bg-white p-6 rounded-xl border border-surface-container-high shadow-card space-y-6 sticky top-8">
                <h3 className="font-bold text-on-surface flex items-center gap-2 border-b border-surface-container-high pb-4">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  Đơn hàng thanh toán
                </h3>

                {/* Cart list */}
                <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-on-surface-variant/50 text-xs">
                      Chưa có hàng hóa nào trong giỏ
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.id} className="flex justify-between items-start text-sm border-b border-surface-container-low pb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-on-surface">{item.name}</p>
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            {item.quantity} {item.unit} x {item.price.toLocaleString()} đ
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-on-surface">{(item.price * item.quantity).toLocaleString()} đ</p>
                          <button
                            onClick={() => setCart(cart.filter(c => c.id !== item.id))}
                            className="text-xs text-error hover:underline mt-1 font-medium inline-block"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {validationErrors.cart && (
                  <p className="text-xs font-bold text-error mt-2 text-center bg-error/5 py-1.5 rounded-lg border border-error/10">
                    {validationErrors.cart}
                  </p>
                )}

                <div className="border-t border-surface-container-high pt-4 space-y-4">
                  <div className="relative">
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Khách hàng</label>
                    <div className={selectedCustomer ? "block" : "hidden"}>
                      {selectedCustomer && (
                        <div className="flex items-center justify-between p-2.5 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                          <div className="flex-1">
                            <p className="font-bold text-on-surface">{selectedCustomer.fullname}</p>
                            <p className="text-xs text-on-surface-variant mt-0.5">
                              SĐT: {selectedCustomer.phone || "N/A"} | Nợ: {Number(selectedCustomer.totalDebt).toLocaleString()}đ
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCustomer(null);
                              setCustomerSearch("");
                            }}
                            className="p-1 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className={!selectedCustomer ? "block" : "hidden"}>
                      <div className="relative flex items-center">
                        <input
                          id="pos-customer-input"
                          type="text"
                          placeholder="Tìm khách hàng [F4]..."
                          value={customerSearch}
                          onChange={(e) => {
                            setCustomerSearch(e.target.value);
                            setIsCustomerDropdownOpen(true);
                          }}
                          onFocus={() => setIsCustomerDropdownOpen(true)}
                          className="w-full px-3 py-2 pr-8 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary"
                        />
                        {customerSearch && (
                          <button
                            type="button"
                            onClick={() => setCustomerSearch("")}
                            className="absolute right-2.5 text-on-surface-variant hover:text-on-surface text-xs font-medium"
                          >
                            Xóa
                          </button>
                        )}
                      </div>

                      {isCustomerDropdownOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setIsCustomerDropdownOpen(false)}
                          />
                          <div className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-surface-container-high rounded-lg shadow-lg z-20 divide-y divide-surface-container-low">
                            <div
                              onClick={() => {
                                setSelectedCustomer(null);
                                setIsCustomerDropdownOpen(false);
                                setCustomerSearch("");
                              }}
                              className="px-3 py-2 text-xs font-medium text-on-surface-variant hover:bg-surface-container-low cursor-pointer transition-colors"
                            >
                              Khách vãng lai (Không ghi nợ)
                            </div>
                            {customers
                              .filter(c => {
                                const query = customerSearch.toLowerCase();
                                return (
                                  c.fullname.toLowerCase().includes(query) ||
                                  (c.phone && c.phone.includes(query))
                                );
                              })
                              .map(c => (
                                <div
                                  key={c.id}
                                  onClick={() => {
                                    setSelectedCustomer(c);
                                    setIsCustomerDropdownOpen(false);
                                    setCustomerSearch("");
                                  }}
                                  className="px-3 py-2 hover:bg-surface-container-low cursor-pointer transition-colors text-sm"
                                >
                                  <div className="flex justify-between font-medium text-on-surface">
                                    <span>{c.fullname}</span>
                                    <span className="text-xs text-on-surface-variant">Nợ: {Number(c.totalDebt).toLocaleString()}đ</span>
                                  </div>
                                  <div className="text-xs text-on-surface-variant mt-0.5">
                                    SĐT: {c.phone || "N/A"}
                                  </div>
                                </div>
                              ))}
                            {customers.filter(c => {
                              const query = customerSearch.toLowerCase();
                              return (
                                c.fullname.toLowerCase().includes(query) ||
                                (c.phone && c.phone.includes(query))
                              );
                            }).length === 0 && (
                              <div className="px-3 py-3 text-xs text-on-surface-variant text-center">
                                  Không tìm thấy khách hàng nào
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    {validationErrors.customer && (
                      <p className="text-xs font-bold text-error mt-1.5 bg-error/5 px-2.5 py-1.5 rounded-lg border border-error/10">
                        {validationErrors.customer}
                      </p>
                    )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Bán ghi nợ (Công nợ TT88)</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDebt}
                        onChange={(e) => setIsDebt(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex justify-between items-center text-sm font-bold text-on-surface border-t border-surface-container-low pt-4">
                    <span>Tổng tiền hóa đơn:</span>
                    <span className="text-lg text-primary">
                      {cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()} đ
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 bg-primary hover:bg-primary-container text-white font-bold rounded-lg text-sm shadow-sm transition-all"
                  >
                    Xác nhận và In Hóa đơn [F9]
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (activeTab === "ai-drafts") {
        return (
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex items-start gap-4">
              <div className="p-3 bg-primary text-white rounded-xl">
                <Mic className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-on-surface text-base">Hộp thư nhận đơn nháp bằng Giọng nói & Tin nhắn AI</h3>
                <p className="text-sm text-on-surface-variant mt-1.5 leading-relaxed">
                  Các đơn hàng đặt tự động qua các cuộc gọi ghi âm hoặc tin nhắn Zalo gửi từ Khách hàng được Module AI trích xuất và phân tích thực thể. Nhân viên cần rà soát lại thông tin trước khi duyệt chính thức vào sổ sách.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {aiDrafts.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border border-surface-container-high text-center shadow-card text-on-surface-variant/60">
                  <Sparkles className="w-10 h-10 text-primary mx-auto mb-3 opacity-50" />
                  Hiện không có đơn hàng nháp AI nào cần duyệt.
                </div>
              ) : (
                aiDrafts.map(draft => (
                  <div key={draft.id} className="bg-white p-6 rounded-xl border border-surface-container-high shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-surface-container-high text-on-surface text-xs font-bold rounded-full">{draft.customer}</span>
                        <span className="text-xs text-on-surface-variant">{draft.time}</span>
                        <span className="ml-auto md:ml-0 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-md border border-emerald-200 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> AI Khớp: {draft.confidence}
                        </span>
                      </div>

                      <div className="bg-surface-container-low p-3.5 rounded-lg border border-outline-variant">
                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Ghi âm/Văn bản thô:</p>
                        <p className="text-sm italic text-on-surface font-sans">"{draft.rawText}"</p>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Hàng hóa trích xuất:</p>
                        <div className="space-y-2">
                          {draft.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-sm text-on-surface bg-surface-container-low/30 px-3 py-2 rounded border border-surface-container-low">
                              <span className="font-semibold">{item.name}</span>
                              <span className="text-on-surface-variant">{item.qty} {item.unit} x {item.price.toLocaleString()} đ</span>
                              <span className="font-bold">{(item.qty * item.price).toLocaleString()} đ</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="md:border-l border-surface-container-high md:pl-6 flex flex-col justify-between items-stretch md:w-[220px] gap-4">
                      <div>
                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Hình thức thanh toán</p>
                        <p className="text-sm font-semibold text-primary mt-1 flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-on-surface-variant" />
                          {draft.payment}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => rejectDraft(draft.id)}
                          className="flex-1 py-2 bg-error/5 hover:bg-error/10 text-error text-xs font-bold rounded-lg border border-error/20 flex items-center justify-center gap-1 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hủy
                        </button>
                        <button
                          onClick={() => approveDraft(draft)}
                          className="flex-1 py-2 bg-primary hover:bg-primary-container text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" /> Duyệt
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
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
      return (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Doanh thu hôm nay"
              value="12.860.000 đ"
              trend="↑ 18.5% so với hôm qua"
              trendType="up"
              icon={DollarSign}
              iconBgColor="bg-emerald-50"
              iconColor="text-primary"
            />
            <MetricCard
              title="Đơn hàng hôm nay"
              value="156"
              trend="↑ 12.3% so với hôm qua"
              trendType="up"
              icon={ShoppingCart}
              iconBgColor="bg-blue-50"
              iconColor="text-secondary"
            />
            <MetricCard
              title="Sản phẩm trong kho"
              value="1.248"
              trend="Đang kinh doanh tốt"
              trendType="neutral"
              icon={Package}
              iconBgColor="bg-amber-50"
              iconColor="text-amber-500"
            />
            <MetricCard
              title="Công nợ"
              value="8.540.000 đ"
              trend="3 khoản sắp đến hạn"
              trendType="warning"
              icon={CreditCard}
              iconBgColor="bg-red-50"
              iconColor="text-error"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 xl:col-span-8">
              <RevenueChart />
            </div>
            <div className="lg:col-span-5 xl:col-span-4">
              <TopProducts />
            </div>
          </div>

          {/* Smart AI Insight Box */}
          <AIInsight />
        </div>
      );
    }

    if (activeTab === "products") {
      return <ProductManagement />;
    }

    if (activeTab === "inventory") {
      return <InventoryManagement />;
    }

    if (activeTab === "staff") {
      return <StaffManagement />;
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

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main dashboard body */}
      <div className="pl-[260px] min-h-screen flex flex-col">
        <main className="flex-1 p-8 max-w-[1440px] mx-auto w-full">
          {/* Header section */}
          <Header showGreeting={activeTab === "overview"} />

          {/* Render content based on dynamic calculations */}
          <div className="mt-6">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Custom sliding notification toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-start gap-3.5 px-6 py-4 rounded-xl shadow-2xl border min-w-[340px] max-w-[500px] animate-[slideDown_0.2s_ease-out] ${
          toast.type === "success" 
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
          {toast.type === "info" && (
            <div className="p-1 bg-blue-100 text-blue-600 rounded-full shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
          <div className="flex-1">
            <h4 className="text-sm font-bold tracking-tight mb-0.5 uppercase opacity-90">
              {toast.type === "success" ? "Thành công" : toast.type === "error" ? "Lỗi hệ thống" : "Thông báo"}
            </h4>
            <p className="text-sm leading-relaxed font-sans whitespace-pre-line font-semibold opacity-95">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Slide down animation keyframes */}
      <style>{`
        @keyframes slideDown {
          from {
            transform: translate(-50%, -1.5rem);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

