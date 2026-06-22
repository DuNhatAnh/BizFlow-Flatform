"use client";

import React from "react";
import { 
  LayoutDashboard, 
  BarChart3, 
  ShoppingCart, 
  Package, 
  Users, 
  FileText, 
  Warehouse, 
  CreditCard, 
  Settings,
  ChevronDown,
  Building2,
  Gem,
  FileSpreadsheet,
  Mic,
  PlusCircle,
  Contact
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [user, setUser] = React.useState<{ username: string; fullname: string; role: string; roleName: string } | null>(null);
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem("bizflow_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const handleLogout = () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
      localStorage.removeItem("bizflow_user");
      window.location.href = "/login";
    }
  };

  // Dynamically compute menu items based on role
  const getMenuItems = () => {
    if (!user) return [];

    switch (user.username) {
      case "admin@bizflow.com":
        return [
          { id: "overview", label: "Hệ thống tổng quan", icon: LayoutDashboard },
          { id: "tenants", label: "Quản lý Tenant", icon: Building2 },
          { id: "subscriptions", label: "Gói thuê bao SaaS", icon: Gem },
          { id: "tt88-config", label: "Cấu hình sổ sách TT88", icon: FileSpreadsheet },
          { id: "settings", label: "Thiết lập hệ thống", icon: Settings },
        ];
      case "cashier@bizflow.com":
        return [
          { id: "pos", label: "Bán hàng POS", icon: PlusCircle },
          { id: "orders", label: "Đơn hàng của tôi", icon: ShoppingCart },
          { id: "ai-drafts", label: "Đơn nháp AI", icon: Mic },
          { id: "products", label: "Tra cứu sản phẩm", icon: Package },
          { id: "debts", label: "Ghi nợ nhanh", icon: CreditCard },
        ];
      case "owner@bizflow.com":
      default:
        return [
          { id: "overview", label: "Tổng quan Doanh thu", icon: LayoutDashboard },
          { id: "products", label: "Hàng hóa & Đơn vị", icon: Package },
          { id: "inventory", label: "Quản lý Kho hàng", icon: Warehouse },
          { id: "customers", label: "Khách hàng & Công nợ", icon: Users },
          { id: "staff", label: "Quản lý Nhân sự", icon: Contact },
          { id: "reports", label: "Sổ sách Thuế (TT88)", icon: FileText },
          { id: "settings", label: "Cài đặt Cửa hàng", icon: Settings },
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-[260px] fixed top-0 left-0 bottom-0 bg-white border-r border-surface-container-high flex flex-col z-30">
      {/* Brand Logo */}
      <div className="p-6 flex flex-col items-center border-b border-surface-container-low">
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/logo.png" 
            alt="BizFlow Logo" 
            className={`object-contain w-full h-full ${imageError ? 'hidden' : 'block'}`}
            onError={() => setImageError(true)}
          />
          {/* Logo fallback text */}
          {imageError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-bold text-primary">
              <span className="text-xl tracking-wider uppercase font-sans">BizFlow</span>
              <span className="text-[10px] text-gray-400 font-normal">PLATFORM</span>
            </div>
          )}
        </div>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-on-surface-variant"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile Card */}
      <div className="p-4 border-t border-surface-container-low">
        <div 
          onClick={handleLogout}
          title="Bấm để đăng xuất"
          className="flex items-center justify-between p-2 rounded-md hover:bg-error-container hover:text-error cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-bold group-hover:bg-error group-hover:text-white">
              {user ? user.fullname.charAt(0).toUpperCase() : "C"}
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold text-on-surface group-hover:text-error">
                {user ? user.fullname : "Chủ cửa hàng"}
              </h4>
              <p className="text-xs text-on-surface-variant group-hover:text-error/80">
                Vai trò: {user ? user.roleName : "Chủ cửa hàng"}
              </p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-on-surface-variant group-hover:text-error" />
        </div>
      </div>
    </aside>
  );
}
