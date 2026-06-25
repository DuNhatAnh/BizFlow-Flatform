"use client";

import React from "react";
import { Calendar, ArrowUpRight, ArrowDownLeft, ChevronRight } from "lucide-react";

interface DebtTransaction {
  id: string;
  type: "Increase" | "Decrease";
  amount: number;
  createdAt: string;
  orderId: string | null;
  orderCode: string | null;
}

interface DebtHistoryItemProps {
  tx: DebtTransaction;
  onViewOrder: (orderId: string) => void;
}

export default function DebtHistoryItem({
  tx,
  onViewOrder
}: DebtHistoryItemProps) {
  const isIncrease = tx.type === "Increase";

  return (
    <div className="relative group">
      {/* Timeline node */}
      <span className={`absolute -left-9.5 top-0.5 w-7 h-7 rounded-full border-4 border-white flex items-center justify-center shadow-sm z-10 ${
        isIncrease 
          ? "bg-error text-white" 
          : "bg-status-success text-white"
      }`}>
        {isIncrease ? (
          <ArrowUpRight className="w-3.5 h-3.5" />
        ) : (
          <ArrowDownLeft className="w-3.5 h-3.5" />
        )}
      </span>

      <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-3.5 flex justify-between items-center group-hover:border-outline/35 transition-all shadow-none">
        <div className="space-y-1">
          <p className="font-bold text-sm text-on-surface">
            {isIncrease ? "Mua hàng ghi nợ" : "Thanh toán trả nợ"}
          </p>
          <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(tx.createdAt).toLocaleString("vi-VN")}
          </p>
          {tx.orderCode && (
            <button
              onClick={() => onViewOrder(tx.orderId!)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline hover:text-primary-container"
            >
              Mã hóa đơn: #{tx.orderCode}
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="text-right">
          <p className={`text-base font-extrabold ${
            isIncrease ? "text-error" : "text-status-success"
          }`}>
            {isIncrease ? "+" : "-"}{tx.amount.toLocaleString()} đ
          </p>
          <span className="text-[10px] text-on-surface-variant font-medium block">
            {isIncrease ? "Phát sinh nợ mới" : "Đã giảm trừ nợ"}
          </span>
        </div>
      </div>
    </div>
  );
}
