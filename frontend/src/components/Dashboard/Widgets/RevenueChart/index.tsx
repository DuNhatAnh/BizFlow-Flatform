"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data = [
  { name: "Thứ 6", value: 6200000 },
  { name: "Thứ 7", value: 12100000 },
  { name: "Chủ nhật", value: 7000000 },
  { name: "Thứ 2", value: 8500000 },
  { name: "Thứ 3", value: 15600000 },
  { name: "Thứ 4", value: 13400000 },
  { name: "Thứ 5", value: 18750000 },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value).replace("₫", "đ");
};

export default function RevenueChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-white p-6 rounded-xl border border-surface-container-high h-[400px] flex items-center justify-center">
        <span className="text-on-surface-variant">Đang tải biểu đồ...</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-surface-container-high shadow-card flex flex-col justify-between h-[400px]">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-primary rounded-full"></span>
            <h3 className="text-base font-semibold text-on-surface">Doanh thu tuần này</h3>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-on-surface">45.620.000 đ</span>
            <span className="text-xs text-primary font-medium">↑ 20.1% so với 7 ngày trước</span>
          </div>
        </div>

        {/* Dropdown options */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-container-high text-xs font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors">
          <span>7 ngày qua</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chart container */}
      <div className="flex-1 w-full mt-6 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00685f" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00685f" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eceef0" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6d7a77", fontSize: 11 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6d7a77", fontSize: 11 }}
              tickFormatter={(value) => `${value / 1000000}M`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-inverse-surface text-inverse-on-surface px-3 py-2 rounded-lg text-xs shadow-md border border-neutral-700">
                      <p className="font-semibold">{payload[0].payload.name}</p>
                      <p className="mt-1 font-mono text-primary-fixed">
                        {formatCurrency(payload[0].value as number)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#00685f"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
              dot={{ r: 4, stroke: "#00685f", strokeWidth: 2, fill: "#ffffff" }}
              activeDot={{ r: 6, stroke: "#00685f", strokeWidth: 2, fill: "#89f5e7" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
