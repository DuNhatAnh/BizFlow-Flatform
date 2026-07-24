import React from "react";
import { Banknote, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

interface CashBookSummaryProps {
  balance: number;
  totalReceipts: number;
  totalPayments: number;
  isLoading?: boolean;
}

export const CashBookSummary: React.FC<CashBookSummaryProps> = ({ balance, totalReceipts, totalPayments, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((idx) => (
          <div key={`summary-skeleton-${idx}`} className="bg-white/80 rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
            </div>
            <div>
              <div className="h-4 w-32 mb-2 bg-gray-200 animate-pulse rounded" />
              <div className="h-10 w-48 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-gray-100/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity duration-500 group-hover:scale-110">
          <Banknote className="w-32 h-32 text-blue-600" />
        </div>
        <div className="relative z-10 flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Tồn Quỹ Hiện Tại</p>
            <h3 className="text-4xl font-black text-gray-900 tracking-tight" style={{ fontFamily: 'monospace' }}>
              {new Intl.NumberFormat('vi-VN').format(balance)}<span className="text-xl text-gray-400 ml-1">đ</span>
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-gray-100/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity duration-500 group-hover:scale-110">
          <ArrowUpCircle className="w-32 h-32 text-emerald-600" />
        </div>
        <div className="relative z-10 flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
            <ArrowUpCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Tổng Thu (Kỳ Này)</p>
            <h3 className="text-4xl font-black text-gray-900 tracking-tight" style={{ fontFamily: 'monospace' }}>
              {new Intl.NumberFormat('vi-VN').format(totalReceipts)}<span className="text-xl text-gray-400 ml-1">đ</span>
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-gray-100/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity duration-500 group-hover:scale-110">
          <ArrowDownCircle className="w-32 h-32 text-rose-600" />
        </div>
        <div className="relative z-10 flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-inner">
            <ArrowDownCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Tổng Chi (Kỳ Này)</p>
            <h3 className="text-4xl font-black text-gray-900 tracking-tight" style={{ fontFamily: 'monospace' }}>
              {new Intl.NumberFormat('vi-VN').format(totalPayments)}<span className="text-xl text-gray-400 ml-1">đ</span>
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};
