import React from "react";
import MetricCard from "@/components/MetricCard";
import RevenueChart from "@/components/RevenueChart";
import TopProducts from "@/components/TopProducts";
import AIInsight from "@/components/AIInsight";
import { DollarSign, ShoppingCart, Package, CreditCard } from "lucide-react";

export default function OwnerOverview() {
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
