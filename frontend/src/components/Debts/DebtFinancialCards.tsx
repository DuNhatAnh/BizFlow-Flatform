"use client";

import React from "react";
import { DollarSign, AlertCircle } from "lucide-react";

interface DebtFinancialCardsProps {
  totalDebt: number;
  debtLimit: number;
  onOpenCollect: () => void;
}

export default function DebtFinancialCards({
  totalDebt,
  debtLimit,
  onOpenCollect
}: DebtFinancialCardsProps) {
  const isOverLimit = totalDebt > debtLimit;

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Total debt card */}
      <div className={`p-4 rounded-xl border flex flex-col justify-between ${
        isOverLimit
          ? "bg-error-container/20 border-error/30"
          : totalDebt > 0
            ? "bg-orange-50 border-orange-200"
            : "bg-surface-container-lowest border-surface-container-high"
      }`}>
        <p className="text-xs font-semibold text-on-surface-variant">Tổng nợ hiện tại</p>
        <div className="flex justify-between items-end mt-2">
          <span className={`text-xl font-black ${
            isOverLimit
              ? "text-error"
              : totalDebt > 0
                ? "text-status-warning font-sans"
                : "text-on-surface"
          }`}>
            {totalDebt.toLocaleString()} đ
          </span>
          <span className="p-1 rounded bg-white text-on-surface shadow-sm border border-surface-container-high">
            <DollarSign className="w-4 h-4 text-on-surface-variant" />
          </span>
        </div>
      </div>

      {/* Debt limit card */}
      <div className="p-4 rounded-xl border border-surface-container-high bg-surface-container-lowest flex flex-col justify-between">
        <p className="text-xs font-semibold text-on-surface-variant">Hạn mức nợ</p>
        <div className="flex justify-between items-end mt-2">
          <span className="text-xl font-bold text-on-surface">
            {debtLimit.toLocaleString()} đ
          </span>
          <span className="p-1 rounded bg-white text-on-surface shadow-sm border border-surface-container-high">
            <AlertCircle className="w-4 h-4 text-on-surface-variant" />
          </span>
        </div>
      </div>

      {/* Quick collect debt action */}
      <div className="p-4 rounded-xl border border-surface-container-high bg-surface-container-lowest flex flex-col justify-between">
        <p className="text-xs font-semibold text-on-surface-variant">Thao tác thu hồi nợ</p>
        <div className="mt-2.5">
          <button
            onClick={onOpenCollect}
            disabled={totalDebt <= 0}
            className="w-full py-1.5 px-4 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-container hover:text-on-primary-container disabled:bg-surface-container-high disabled:text-outline disabled:cursor-not-allowed shadow-sm transition-all"
          >
            Thu tiền nợ
          </button>
        </div>
      </div>
    </div>
  );
}
