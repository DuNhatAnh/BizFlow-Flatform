"use client";

import React from "react";
import { Settings, X } from "lucide-react";

interface BankConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankBin: string;
  setBankBin: (val: string) => void;
  accountNo: string;
  setAccountNo: (val: string) => void;
  accountName: string;
  setAccountName: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function BankConfigModal({
  isOpen,
  onClose,
  bankBin,
  setBankBin,
  accountNo,
  setAccountNo,
  accountName,
  setAccountName,
  onSubmit
}: BankConfigModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-surface-container-high w-full max-w-md shadow-card overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-surface-container flex justify-between items-center bg-surface-container-lowest">
          <h3 className="font-bold text-on-surface text-base flex items-center gap-1.5">
            <Settings className="w-4.5 h-4.5 text-primary" />
            Cài đặt Tài khoản Ngân hàng
          </h3>
          <button 
            type="button" 
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-on-surface-variant">
            Thiết lập tài khoản ngân hàng của cửa hàng để hệ thống tự động sinh ra mã VietQR động có sẵn số tiền nợ và nội dung chuyển khoản khi thu nợ.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant">Mã BIN ngân hàng (hoặc Tên viết tắt)</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: 970415 (Vietinbank), ICB, TCB..."
              value={bankBin}
              onChange={(e) => setBankBin(e.target.value)}
              className="w-full px-3 py-2 bg-background rounded-lg border border-outline/35 text-sm focus:outline-none focus:border-primary text-on-surface"
            />
            <span className="text-[10px] text-outline block">Sử dụng danh sách mã ngân hàng chuẩn VietQR (ví dụ: Vietinbank = 970415 hoặc ICB).</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant">Số tài khoản nhận tiền</label>
            <input
              type="text"
              required
              placeholder="Nhập số tài khoản ngân hàng..."
              value={accountNo}
              onChange={(e) => setAccountNo(e.target.value)}
              className="w-full px-3 py-2 bg-background rounded-lg border border-outline/35 text-sm focus:outline-none focus:border-primary text-on-surface font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant">Tên chủ tài khoản (Không dấu)</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: NGUYEN VAN A..."
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full px-3 py-2 bg-background rounded-lg border border-outline/35 text-sm focus:outline-none focus:border-primary text-on-surface font-semibold uppercase"
            />
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-surface-container flex gap-3 justify-end bg-surface-container-lowest">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 border border-outline/35 text-on-surface-variant rounded-lg text-xs font-semibold hover:bg-surface-container-high transition-all"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm"
          >
            Lưu lại
          </button>
        </div>
      </form>
    </div>
  );
}
