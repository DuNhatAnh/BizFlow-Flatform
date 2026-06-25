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
  Contact,
  LogOut
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  draftCount?: number;
}

export default function Sidebar({ activeTab, setActiveTab, draftCount: propDraftCount }: SidebarProps) {
  const [user, setUser] = React.useState<{ username: string; fullname: string; role: string; roleName: string } | null>(null);
  const [imageError, setImageError] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [draftCount, setDraftCount] = React.useState<number>(0);

  React.useEffect(() => {
    const stored = localStorage.getItem("bizflow_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  React.useEffect(() => {
    if (propDraftCount !== undefined) {
      setDraftCount(propDraftCount);
      return;
    }
    if (!user || user.role !== "Employee") return;

    const fetchCount = async () => {
      try {
        const stored = localStorage.getItem("bizflow_user");
        if (!stored) return;
        const userObj = JSON.parse(stored);
        const res = await fetch(`http://localhost:5178/api/orders/drafts?tenantId=${userObj.tenantId || "11111111-1111-1111-1111-111111111111"}`, {
          headers: { 
            "X-Tenant-Id": userObj.tenantId || "11111111-1111-1111-1111-111111111111",
            "Authorization": `Bearer ${userObj.token}` 
          }
        });
        if (res.ok) {
          const data = await res.json();
          setDraftCount(data.length);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 5000);
    return () => clearInterval(interval);
  }, [user, propDraftCount]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setShowProfileMenu(false);
  };

  const confirmLogout = () => {
    localStorage.removeItem("bizflow_user");
    window.location.href = "/login";
  };

  // Dynamically compute menu items based on role
  const getMenuItems = () => {
    if (!user) return [];

    switch (user.role) {
      case "PlatformAdmin":
        return [
          { id: "overview", label: "Hệ thống tổng quan", icon: LayoutDashboard },
          { id: "tenants", label: "Quản lý Tenant", icon: Building2 },
          { id: "subscriptions", label: "Gói thuê bao SaaS", icon: Gem },
          { id: "tt88-config", label: "Cấu hình sổ sách TT88", icon: FileSpreadsheet },
          { id: "settings", label: "Thiết lập hệ thống", icon: Settings },
        ];
      case "Employee":
        return [
          { id: "pos", label: "Bán hàng POS", icon: PlusCircle },
          { id: "orders", label: "Đơn hàng của tôi", icon: ShoppingCart },
          { id: "ai-drafts", label: "Đơn nháp AI [F8]", icon: Mic, badge: draftCount > 0 ? draftCount : undefined },
          { id: "products", label: "Tra cứu sản phẩm", icon: Package },
          { id: "debts", label: "Ghi nợ nhanh", icon: CreditCard },
        ];
      case "Owner":
      case "Manager":
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
      <div className="pt-6 pb-2 flex flex-col items-center shrink-0">
        <div className="relative w-40 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/logo.png" 
            alt="BizFlow Logo" 
            draggable={false}
            className={`object-contain w-full h-auto mix-blend-multiply pointer-events-none select-none ${imageError ? 'hidden' : 'block'}`}
            onError={() => setImageError(true)}
          />
          {/* Logo fallback text */}
          {imageError && (
            <div className="flex flex-col items-center justify-center text-center font-bold text-primary py-4">
              <span className="text-xl tracking-wider uppercase font-sans">BizFlow</span>
              <span className="text-[10px] text-gray-400 font-normal">PLATFORM</span>
            </div>
          )}
        </div>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item: any) => {
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
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && (
                <span className="w-5 h-5 rounded-full bg-error text-white font-bold text-[10px] flex items-center justify-center animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile Card */}
      <div className="p-4 border-t border-surface-container-low relative">
        {showProfileMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-lg border border-surface-container-high z-50 overflow-hidden text-sm">
              <button
                onClick={() => {
                  setActiveTab("profile");
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-4 py-3 flex items-center gap-3 text-on-surface hover:bg-surface-container-low transition-colors"
              >
                <Contact className="w-4 h-4 text-primary" />
                Hồ sơ cá nhân
              </button>
              <button
                onClick={handleLogoutClick}
                className="w-full text-left px-4 py-3 flex items-center gap-3 text-error hover:bg-error/10 transition-colors border-t border-surface-container-low"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-error font-medium">Đăng xuất</span>
              </button>
            </div>
          </>
        )}

        <div 
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          title="Tùy chọn tài khoản"
          className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors group ${showProfileMenu ? 'bg-surface-container-low' : 'hover:bg-surface-container-low'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-bold group-hover:bg-primary group-hover:text-white transition-colors">
              {user ? user.fullname.charAt(0).toUpperCase() : "C"}
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold text-on-surface">
                {user ? user.fullname : "Chủ cửa hàng"}
              </h4>
              <p className="text-xs text-on-surface-variant">
                Vai trò: {user ? user.roleName : "Chủ cửa hàng"}
              </p>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-on-surface-variant transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl border border-surface-container-high w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">Đăng xuất</h3>
              <p className="text-sm text-on-surface-variant">
                Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
              </p>
            </div>
            <div className="p-4 bg-surface-container-lowest border-t border-surface-container-low flex gap-3 justify-end">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container-low rounded-lg transition-colors border border-outline-variant flex-1"
              >
                Hủy
              </button>
              <button 
                onClick={confirmLogout}
                className="px-4 py-2 text-sm font-bold text-white bg-error hover:bg-error/90 rounded-lg shadow-sm transition-colors flex-1"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
