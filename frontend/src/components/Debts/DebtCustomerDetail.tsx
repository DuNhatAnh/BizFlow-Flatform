"use client";

import React from "react";
import { Edit3, Settings } from "lucide-react";
import DebtFinancialCards from "./DebtFinancialCards";
import DebtLimitWarningBanner from "./DebtLimitWarningBanner";

interface Customer {
  id: string;
  fullname: string;
  phone: string | null;
  totalDebt: number;
  debtLimit: number;
}

interface DebtCustomerDetailProps {
  customer: Customer;
  isReadOnly: boolean;
  onOpenEditModal: (c: Customer) => void;
  onOpenBankConfig: () => void;
  onOpenCollectModal: () => void;
}

export default function DebtCustomerDetail({
  customer,
  isReadOnly,
  onOpenEditModal,
  onOpenBankConfig,
  onOpenCollectModal
}: DebtCustomerDetailProps) {
  return (
    <div className="bg-white rounded-xl border border-surface-container-high p-5 shadow-sm space-y-4">
      {/* Header Profile section */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-on-surface">{customer.fullname}</h2>
            {!isReadOnly && (
              <button 
                onClick={() => onOpenEditModal(customer)}
                className="p-1 text-on-surface-variant hover:text-primary transition-all hover:bg-surface-container rounded-full"
                title="Sửa thông tin và hạn mức nợ"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-on-surface-variant flex items-center gap-2">
            <span className="font-medium">Số điện thoại:</span> {customer.phone || "Chưa có"}
          </p>
        </div>

        {/* Bank Configuration trigger */}
        <button
          onClick={onOpenBankConfig}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-outline/35 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
        >
          <Settings className="w-3.5 h-3.5" />
          Cấu hình Bank VietQR
        </button>
      </div>

      {/* Grid of indicators (Total Debt, Limit, Action button) */}
      <DebtFinancialCards
        totalDebt={customer.totalDebt}
        debtLimit={customer.debtLimit}
        onOpenCollect={onOpenCollectModal}
      />

      {/* Credit Limit warning alert */}
      <DebtLimitWarningBanner
        totalDebt={customer.totalDebt}
        debtLimit={customer.debtLimit}
      />
    </div>
  );
}
