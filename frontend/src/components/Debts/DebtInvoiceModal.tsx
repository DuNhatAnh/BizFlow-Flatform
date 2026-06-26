"use client";

import React from "react";
import { X, Printer } from "lucide-react";

interface DebtInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  loading: boolean;
}

export default function DebtInvoiceModal({
  isOpen,
  onClose,
  order,
  loading
}: DebtInvoiceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-surface-container-high w-full max-w-lg shadow-card overflow-hidden flex flex-col h-[85vh] max-h-[600px] animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center bg-surface-container-lowest">
          <h3 className="font-bold text-on-surface text-base">
            Chi tiết hóa đơn mua chịu
          </h3>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : !order ? (
            <div className="text-center text-xs text-on-surface-variant">
              Không tìm thấy chi tiết hóa đơn.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-background p-3 rounded-lg border border-outline-variant/30">
                <div>
                  <p className="text-on-surface-variant font-medium">Mã đơn hàng:</p>
                  <p className="font-bold text-on-surface">{order.code || ('#' + order.id.substring(0, 8).toUpperCase())}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-medium">Ngày lập:</p>
                  <p className="font-bold text-on-surface">
                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-medium">Hình thức:</p>
                  <p className="font-bold text-error">Mua ghi nợ</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-medium">Tổng hóa đơn:</p>
                  <p className="font-bold text-on-surface">
                    {order.totalAmount.toLocaleString()} đ
                  </p>
                </div>
              </div>

              {/* Items list */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-on-surface-variant">Chi tiết sản phẩm</p>
                <div className="border border-surface-container rounded-xl overflow-hidden divide-y divide-surface-container">
                  <div className="grid grid-cols-4 bg-surface-container-low p-2.5 text-[11px] font-bold text-on-surface-variant">
                    <span className="col-span-2">Sản phẩm</span>
                    <span className="text-center">Số lượng</span>
                    <span className="text-right">Đơn giá</span>
                  </div>
                  
                  {order.orderItems?.map((item: any) => (
                    <div key={item.id} className="grid grid-cols-4 p-2.5 text-xs text-on-surface items-center bg-white">
                      <div className="col-span-2">
                        <p className="font-bold truncate">{item.product?.name || "Sản phẩm"}</p>
                        <p className="text-[10px] text-on-surface-variant font-medium">Đơn vị: {item.productUnit?.unitName || "---"}</p>
                      </div>
                      <span className="text-center font-semibold">{item.quantity}</span>
                      <span className="text-right font-semibold">{(item.unitPrice || 0).toLocaleString()} đ</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-surface-container flex justify-end gap-2 bg-surface-container-lowest">
          <button
            onClick={() => window.print()}
            className="px-4 py-1.5 border border-outline/35 text-on-surface-variant rounded-lg text-xs font-semibold hover:bg-surface-container hover:text-on-surface flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            In hóa đơn
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-container hover:text-on-primary-container transition-all"
          >
            Đóng lại
          </button>
        </div>
      </div>
    </div>
  );
}
