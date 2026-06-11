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
  ChevronDown
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
    { id: "revenue", label: "Doanh thu", icon: BarChart3 },
    { id: "orders", label: "Đơn hàng", icon: ShoppingCart },
    { id: "products", label: "Sản phẩm", icon: Package },
    { id: "customers", label: "Khách hàng", icon: Users },
    { id: "reports", label: "Báo cáo", icon: FileText },
    { id: "inventory", label: "Kho hàng", icon: Warehouse },
    { id: "debts", label: "Công nợ", icon: CreditCard },
    { id: "settings", label: "Cài đặt", icon: Settings },
  ];

  return (
    <aside className="w-[260px] fixed top-0 left-0 bottom-0 bg-white border-r border-surface-container-high flex flex-col z-30">
      {/* Brand Logo */}
      <div className="p-6 flex flex-col items-center border-b border-surface-container-low">
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/logo.png" 
            alt="BizFlow Logo" 
            className="object-contain w-full h-full"
            onError={(e) => {
              // Fallback placeholder if logo.png doesn't exist yet
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          {/* Logo fallback text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-bold text-primary">
            <span className="text-xl tracking-wider uppercase font-sans">BizFlow</span>
            <span className="text-[10px] text-gray-400 font-normal">PLATFORM</span>
          </div>
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
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-surface-container-low cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-bold">
              C
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold text-on-surface">Chủ cửa hàng</h4>
              <p className="text-xs text-on-surface-variant">Vai trò: Chủ cửa hàng</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-on-surface-variant" />
        </div>
      </div>
    </aside>
  );
}
