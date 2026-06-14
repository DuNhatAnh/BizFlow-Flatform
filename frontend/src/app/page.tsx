"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MetricCard from "@/components/MetricCard";
import RevenueChart from "@/components/RevenueChart";
import TopProducts from "@/components/TopProducts";
import AIInsight from "@/components/AIInsight";
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

  // Cashier State
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number; unit: string }[]>([]);
  const [posCustomer, setPosCustomer] = useState("");
  const [isDebt, setIsDebt] = useState(false);
  const [posSearch, setPosSearch] = useState("");
  
  // Mock AI drafts loaded dynamically to simulate real-time API syncing (triggered by hot reload)
  const [aiDrafts, setAiDrafts] = useState([
    {
      id: "1",
      customer: "Chú Ba",
      time: "10 phút trước",
      items: [{ name: "Xi măng Hà Tiên", qty: 5, price: 85000, unit: "Bao" }],
      payment: "Ghi nợ (Nợ phải thu)",
      rawText: "Lấy cho chú Ba 5 bao xi măng Hà Tiên, ghi nợ nghen",
      confidence: "98%"
    },
    {
      id: "2",
      customer: "Anh Nam",
      time: "25 phút trước",
      items: [{ name: "Dây cáp điện Cadivi", qty: 2, price: 1200000, unit: "Cuộn" }],
      payment: "Tiền mặt",
      rawText: "Giao gấp qua nhà anh Nam 2 cuộn dây cáp điện Cadivi, ảnh trả tiền mặt luôn",
      confidence: "94%"
    }
  ]);

  const posProducts = [
    { id: "p1", name: "Xi măng Hà Tiên", price: 85000, unit: "Bao", stock: 120 },
    { id: "p2", name: "Dây cáp điện Cadivi", price: 1200000, unit: "Cuộn", stock: 15 },
    { id: "p3", name: "Thép Pomina phi 10", price: 18500, unit: "Kg", stock: 850 },
    { id: "p4", name: "Gạch đỏ ống tuynel", price: 1200, unit: "Viên", stock: 4500 },
    { id: "p5", name: "Cát xây tô sạch", price: 320000, unit: "Khối", stock: 40 },
  ];

  React.useEffect(() => {
    const stored = localStorage.getItem("bizflow_user");
    if (!stored) {
      window.location.href = "/login";
    } else {
      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);
      setAuthorized(true);
      // Auto routing based on role
      if (parsedUser.username === "cashier@bizflow.com") {
        setActiveTab("pos");
      } else if (parsedUser.username === "admin@bizflow.com") {
        setActiveTab("overview");
      } else {
        setActiveTab("overview");
      }
    }
  }, []);

  const addToCart = (product: typeof posProducts[0]) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { id: product.id, name: product.name, price: product.price, quantity: 1, unit: product.unit }]);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    alert(`Thanh toán thành công đơn hàng!\nKhách hàng: ${posCustomer || "Khách vãng lai"}\nTổng tiền: ${total.toLocaleString()} đ\nHình thức: ${isDebt ? "Ghi nợ" : "Tiền mặt"}\nChứng từ kế toán đã được ghi nhận tự động vào Sổ cái.`);
    setCart([]);
    setPosCustomer("");
    setIsDebt(false);
  };

  const approveDraft = (draft: typeof aiDrafts[0]) => {
    alert(`Đã duyệt đơn nháp của ${draft.customer}!\nHệ thống tự động:\n1. Tạo hóa đơn POS mới.\n2. Ghi nhận công nợ (hình thức: ${draft.payment}).\n3. Cập nhật sổ kế toán TT88.`);
    setAiDrafts(aiDrafts.filter(d => d.id !== draft.id));
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

    // 2. CASHIER FLOW
    if (user.username === "cashier@bizflow.com") {
      if (activeTab === "pos") {
        const filteredProducts = posProducts.filter(p => p.name.toLowerCase().includes(posSearch.toLowerCase()));
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Products Left Section */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              <div className="bg-white p-4 rounded-xl border border-surface-container-high shadow-sm flex items-center gap-3">
                <Search className="w-5 h-5 text-on-surface-variant" />
                <input 
                  type="text"
                  placeholder="Tìm nhanh mặt hàng (nhập tên, đơn vị)..."
                  value={posSearch}
                  onChange={(e) => setPosSearch(e.target.value)}
                  className="w-full text-sm bg-transparent outline-none text-on-surface placeholder-on-surface-variant/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProducts.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="bg-white p-4 rounded-xl border border-surface-container-high hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex justify-between items-start group"
                  >
                    <div>
                      <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">{p.name}</h4>
                      <p className="text-xs text-on-surface-variant mt-1">Đơn vị: {p.unit} | Tồn: {p.stock}</p>
                      <p className="text-sm font-bold text-primary mt-2">{p.price.toLocaleString()} đ</p>
                    </div>
                    <button className="p-1.5 bg-primary/5 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
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

                <div className="border-t border-surface-container-high pt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Tên khách hàng</label>
                    <input 
                      type="text"
                      placeholder="Nhập tên để theo dõi công nợ (nếu có)..."
                      value={posCustomer}
                      onChange={(e) => setPosCustomer(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary"
                    />
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
                    Xác nhận và In Hóa đơn
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
                  Các đơn hàng đặt tự động qua các cuộc gọi ghi âm hoặc tin nhắn Zalo gửi từ Khách hàng được Module AI trích xuất và phân tích thực thể. Thu ngân cần rà soát lại thông tin trước khi duyệt chính thức vào sổ sách.
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
                          {draft.items.map((item, idx) => (
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
                          onClick={() => setAiDrafts(aiDrafts.filter(d => d.id !== draft.id))}
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
            Mục thông tin dành cho Thu ngân, bao gồm xem lịch sử hóa đơn bán lẻ và danh mục hàng hóa.
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
          <Header />

          {/* Render content based on dynamic calculations */}
          <div className="mt-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

