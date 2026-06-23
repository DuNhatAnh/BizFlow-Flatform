import React from "react";
import MetricCard from "@/components/MetricCard";
import TenantTable from "@/components/Admin/TenantTable";
import { Building2, UserCheck, DollarSign, Sparkles } from "lucide-react";

export default function AdminOverview() {
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
      <TenantTable />
    </div>
  );
}
