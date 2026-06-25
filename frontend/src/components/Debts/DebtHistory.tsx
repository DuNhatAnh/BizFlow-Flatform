"use client";

import React from "react";
import { Calendar, Info } from "lucide-react";
import DebtHistoryItem from "./DebtHistoryItem";

interface DebtTransaction {
  id: string;
  type: "Increase" | "Decrease";
  amount: number;
  createdAt: string;
  orderId: string | null;
  orderCode: string | null;
}

interface DebtHistoryProps {
  transactions: DebtTransaction[];
  loading: boolean;
  onViewOrder: (orderId: string) => void;
}

export default function DebtHistory({
  transactions,
  loading,
  onViewOrder
}: DebtHistoryProps) {
  return (
    <div className="flex-1 bg-white rounded-xl border border-surface-container-high flex flex-col overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-surface-container-high bg-surface-container-lowest">
        <h3 className="font-bold text-on-surface text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Lịch sử công nợ & Giao dịch
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-sm text-on-surface-variant flex flex-col items-center justify-center space-y-2">
            <Info className="w-8 h-8 text-outline/50" />
            <p>Khách hàng hiện không có lịch sử giao dịch công nợ nào.</p>
          </div>
        ) : (
          <div className="relative border-l border-surface-container-high pl-6 ml-3 space-y-6 py-2">
            {transactions.map((tx) => (
              <DebtHistoryItem
                key={tx.id}
                tx={tx}
                onViewOrder={onViewOrder}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
