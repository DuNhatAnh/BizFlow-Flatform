"use client";

import React from "react";
import { Users, X } from "lucide-react";

interface DebtCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  formState: {
    fullname: string;
    phone: string;
    debtLimit: string;
  };
  setFormState: React.Dispatch<React.SetStateAction<{
    fullname: string;
    phone: string;
    debtLimit: string;
  }>>;
  onSubmit: (e: React.FormEvent) => void;
  isReadOnly: boolean;
}

export default function DebtCustomerModal({
  isOpen,
  onClose,
  mode,
  formState,
  setFormState,
  onSubmit,
  isReadOnly
}: DebtCustomerModalProps) {
  if (!isOpen || isReadOnly) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-surface-container-high w-full max-w-md shadow-card overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-surface-container flex justify-between items-center bg-surface-container-lowest">
          <h3 className="font-bold text-on-surface text-base flex items-center gap-1.5">
            <Users className="w-4.5 h-4.5 text-primary" />
            {mode === "add" ? "Thêm khách hàng mới" : "Chỉnh sửa khách hàng"}
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
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant">Tên khách hàng *</label>
            <input
              type="text"
              required
              placeholder="Nhập họ tên khách hàng..."
              value={formState.fullname}
              onChange={(e) => setFormState({ ...formState, fullname: e.target.value })}
              className="w-full px-3 py-2 bg-background rounded-lg border border-outline/35 text-sm focus:outline-none focus:border-primary text-on-surface font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant">Số điện thoại</label>
            <input
              type="text"
              placeholder="Nhập số điện thoại liên hệ..."
              value={formState.phone}
              onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
              className="w-full px-3 py-2 bg-background rounded-lg border border-outline/35 text-sm focus:outline-none focus:border-primary text-on-surface"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant">Hạn mức nợ tối đa (đ)</label>
            <input
              type="number"
              placeholder="Mặc định: 10.000.000 đ"
              value={formState.debtLimit}
              onChange={(e) => setFormState({ ...formState, debtLimit: e.target.value })}
              className="w-full px-3 py-2 bg-background rounded-lg border border-outline/35 text-sm focus:outline-none focus:border-primary text-on-surface font-semibold text-error"
            />
            <span className="text-[10px] text-outline block">Nhân viên POS sẽ nhận cảnh báo nếu tổng nợ vượt hạn mức này khi chọn hình thức mua chịu.</span>
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
