"use client";

import React from "react";

interface StockBadgeProps {
  stockQuantity: number;
  baseUnit: string;
  minStockLimit?: number;
}

export default function StockBadge({ stockQuantity, baseUnit, minStockLimit = 10 }: StockBadgeProps) {
  if (stockQuantity <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100 flex-shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
        Hết hàng
      </span>
    );
  }

  if (stockQuantity <= minStockLimit) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-100 flex-shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
        Sắp hết: {stockQuantity.toLocaleString()} {baseUnit}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-100 flex-shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
      Tồn: {stockQuantity.toLocaleString()} {baseUnit}
    </span>
  );
}
