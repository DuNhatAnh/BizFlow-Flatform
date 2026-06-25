"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface DebtLimitWarningBannerProps {
  totalDebt: number;
  debtLimit: number;
}

export default function DebtLimitWarningBanner({
  totalDebt,
  debtLimit
}: DebtLimitWarningBannerProps) {
  if (totalDebt <= debtLimit) return null;

  return (
    <div className="p-3 bg-error-container/40 border border-error/25 rounded-lg flex items-center gap-2.5 text-error animate-in fade-in duration-200">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <span className="text-xs font-bold uppercase tracking-wider">
        Cảnh báo: Khách hàng đã vượt quá hạn mức nợ cho phép ({debtLimit.toLocaleString()}đ)!
      </span>
    </div>
  );
}
