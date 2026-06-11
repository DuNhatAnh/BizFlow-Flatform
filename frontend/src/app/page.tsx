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
  CreditCard 
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main dashboard body */}
      <div className="pl-[260px] min-h-screen flex flex-col">
        <main className="flex-1 p-8 max-w-[1440px] mx-auto w-full">
          {/* Header section */}
          <Header />

          {/* Tab switching content */}
          {activeTab === "overview" ? (
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
          ) : (
            <div className="bg-white p-12 rounded-xl border border-surface-container-high text-center shadow-card">
              <h2 className="text-xl font-bold text-on-surface">Tính năng đang phát triển</h2>
              <p className="text-sm text-on-surface-variant mt-2">
                Trang mục này thuộc phân hệ quản lý của BizFlow Platform đang được hoàn thiện.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
