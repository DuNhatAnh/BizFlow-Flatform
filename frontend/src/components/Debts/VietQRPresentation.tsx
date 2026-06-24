"use client";

import React from "react";
import { Info, CheckCircle2 } from "lucide-react";

interface VietQRPresentationProps {
  method: "VietQR" | "Cash";
  amount: number;
  bankBin: string;
  accountNo: string;
  accountName: string;
  customerName: string;
  removeVietnameseTones: (str: string) => string;
}

export default function VietQRPresentation({
  method,
  amount,
  bankBin,
  accountNo,
  accountName,
  customerName,
  removeVietnameseTones
}: VietQRPresentationProps) {
  
  if (method === "VietQR") {
    if (amount > 0) {
      const cleanCustomerName = removeVietnameseTones(customerName).toUpperCase();
      const cleanAccountName = removeVietnameseTones(accountName).toUpperCase();
      const vietQrCodeUrl = `https://img.vietqr.io/image/${bankBin}-${accountNo}-print.png?amount=${Math.round(amount)}&addInfo=${encodeURIComponent(`BIZFLOW THU NO ${cleanCustomerName}`.substring(0, 25))}&accountName=${encodeURIComponent(cleanAccountName)}`;

      return (
        <div className="w-[45%] p-6 flex flex-col items-center justify-center bg-surface-container-low min-h-[300px]">
          <div className="space-y-3.5 text-center flex flex-col items-center">
            <div className="p-2 bg-white rounded-xl border border-surface-container-high shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={vietQrCodeUrl} 
                alt="Mã VietQR động" 
                className="w-48 h-48 object-contain"
              />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wide">Quét mã QR động chuyển khoản</p>
              <p className="text-[10px] text-outline">Số tài khoản: {accountNo} ({bankBin})</p>
              <p className="text-[10px] text-outline truncate max-w-[200px]">Chủ TK: {accountName}</p>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="w-[45%] p-6 flex flex-col items-center justify-center bg-surface-container-low min-h-[300px]">
          <div className="text-center text-xs text-on-surface-variant p-4 space-y-2 flex flex-col items-center">
            <Info className="w-8 h-8 text-outline" />
            <p>Vui lòng nhập số tiền thu nợ để hiển thị mã VietQR động tự động điền sẵn số tiền và nội dung chuyển khoản.</p>
          </div>
        </div>
      );
    }
  }

  // Cash payment instruction display
  return (
    <div className="w-[45%] p-6 flex flex-col items-center justify-center bg-surface-container-low min-h-[300px]">
      <div className="text-center text-xs text-on-surface-variant p-4 space-y-2 flex flex-col items-center">
        <CheckCircle2 className="w-8 h-8 text-status-success" />
        <p className="font-bold text-on-surface">Thu tiền mặt trực tiếp</p>
        <p className="max-w-[200px]">Sau khi đếm tiền mặt từ khách hàng, nhấn nút **Xác nhận thu nợ** để cập nhật số dư công nợ của khách hàng.</p>
      </div>
    </div>
  );
}
