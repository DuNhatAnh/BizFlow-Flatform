"use client";

import React from "react";
import { CreditCard, X, DollarSign } from "lucide-react";
import VietQRPresentation from "./VietQRPresentation";

interface Customer {
  id: string;
  fullname: string;
  phone: string | null;
  totalDebt: number;
  debtLimit: number;
}

interface CollectDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  bankBin: string;
  accountNo: string;
  accountName: string;
  onSubmit: (e: React.FormEvent) => void;
  collectAmount: string;
  setCollectAmount: (val: string) => void;
  collectMethod: "VietQR" | "Cash";
  setCollectMethod: (method: "VietQR" | "Cash") => void;
  isSubmitting: boolean;
  removeVietnameseTones: (str: string) => string;
}

export default function CollectDebtModal({
  isOpen,
  onClose,
  customer,
  bankBin,
  accountNo,
  accountName,
  onSubmit,
  collectAmount,
  setCollectAmount,
  collectMethod,
  setCollectMethod,
  isSubmitting,
  removeVietnameseTones
}: CollectDebtModalProps) {
  if (!isOpen) return null;

  const rawAmount = parseFloat(collectAmount) || 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-surface-container-high w-full max-w-2xl shadow-card overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center bg-surface-container-lowest">
          <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Lập phiếu thu nợ: {customer.fullname}
          </h3>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex md:flex-row flex-col">
          
          {/* Payment details form (Left panel) */}
          <form onSubmit={onSubmit} className="flex-1 p-6 space-y-4 border-r border-surface-container-high">
            
            {/* Outstanding balance status */}
            <div className="bg-background rounded-xl p-3 border border-outline-variant/30 flex justify-between items-center text-xs">
              <span className="font-semibold text-on-surface-variant">Tổng nợ hiện tại:</span>
              <span className="font-extrabold text-sm text-status-warning">{customer.totalDebt.toLocaleString()} đ</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant">Số tiền thu nợ (đ)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-on-surface-variant absolute left-3 top-3.5" />
                <input
                  type="number"
                  required
                  placeholder="Nhập số tiền trả nợ..."
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-background rounded-lg border border-outline/35 text-sm focus:outline-none focus:border-primary text-on-surface font-semibold"
                />
              </div>
            </div>

            {/* Quick choose amounts buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCollectAmount(customer.totalDebt.toString())}
                className="py-1 px-2 border border-primary/20 text-primary text-[10px] font-bold rounded-lg bg-primary/5 hover:bg-primary/10 transition-all text-center truncate"
              >
                Trả toàn bộ
              </button>
              <button
                type="button"
                onClick={() => setCollectAmount(Math.min(customer.totalDebt, 1000000).toString())}
                className="py-1 px-2 border border-outline-variant text-on-surface-variant text-[10px] font-bold rounded-lg hover:bg-surface-container transition-all text-center"
              >
                1 triệu
              </button>
              <button
                type="button"
                onClick={() => setCollectAmount(Math.min(customer.totalDebt, 2000000).toString())}
                className="py-1 px-2 border border-outline-variant text-on-surface-variant text-[10px] font-bold rounded-lg hover:bg-surface-container transition-all text-center"
              >
                2 triệu
              </button>
            </div>

            {/* Payment methods */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant">Phương thức thu tiền</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCollectMethod("VietQR")}
                  className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all text-center ${
                    collectMethod === "VietQR"
                      ? "bg-primary-container text-on-primary-container border-primary"
                      : "border-outline-variant/35 text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  VietQR chuyển khoản
                </button>
                <button
                  type="button"
                  onClick={() => setCollectMethod("Cash")}
                  className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all text-center ${
                    collectMethod === "Cash"
                      ? "bg-primary-container text-on-primary-container border-primary"
                      : "border-outline-variant/35 text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  Tiền mặt tại quầy
                </button>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 border border-outline/35 text-on-surface-variant rounded-lg text-xs font-bold hover:bg-surface-container-high transition-all"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-container hover:text-on-primary-container disabled:bg-surface-container-high disabled:text-outline transition-all"
              >
                {isSubmitting ? "Đang xử lý..." : "Xác nhận thu nợ"}
              </button>
            </div>
          </form>

          {/* Dynamic QR Presentation / Cash instructions panel (Right panel) */}
          <VietQRPresentation
            method={collectMethod}
            amount={rawAmount}
            bankBin={bankBin}
            accountNo={accountNo}
            accountName={accountName}
            customerName={customer.fullname}
            removeVietnameseTones={removeVietnameseTones}
          />
        </div>
      </div>
    </div>
  );
}
