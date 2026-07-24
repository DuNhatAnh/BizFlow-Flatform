"use client";

import React from "react";
import { ChevronDown, Star, Shirt } from "lucide-react";

const products = [
  { name: "Áo thun nam cổ tròn", sales: 320, maxSales: 350, color: "bg-primary" },
  { name: "Quần jeans nam", sales: 245, maxSales: 350, color: "bg-secondary" },
  { name: "Áo sơ mi nam", sales: 198, maxSales: 350, color: "bg-purple-600" },
  { name: "Giày thể thao nam", sales: 167, maxSales: 350, color: "bg-amber-500" },
  { name: "Áo khoác nam", sales: 124, maxSales: 350, color: "bg-error" },
];

export default function TopProducts() {
  return (
    <div className="bg-white p-6 rounded-xl border border-surface-container-high shadow-card flex flex-col justify-between h-[400px]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-primary fill-primary" />
          <h3 className="text-base font-semibold text-on-surface">Top sản phẩm bán chạy</h3>
        </div>

        {/* Dropdown filter */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-container-high text-xs font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors">
          <span>7 ngày qua</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Product List */}
      <div className="flex-1 mt-6 space-y-4 overflow-y-auto pr-1">
        {products.map((item, index) => {
          const percentage = (item.sales / item.maxSales) * 100;
          return (
            <div key={index} className="flex items-center gap-4">
              {/* Product icon container */}
              <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                <Shirt className="w-4 h-4 text-on-surface-variant" />
              </div>

              {/* Progress and name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-sm font-medium mb-1">
                  <span className="text-on-surface truncate pr-2">{item.name}</span>
                  <span className="text-on-surface-variant text-xs font-mono">{item.sales}</span>
                </div>
                {/* Progress bar container */}
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
