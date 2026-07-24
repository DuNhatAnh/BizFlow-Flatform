import React from "react";
import { Skeleton } from "../ui/Skeleton";
import { FileText, Search, Banknote, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

export const CashBookSkeleton: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header Actions Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-11 w-36 rounded-xl" />
          <Skeleton className="h-11 w-36 rounded-xl" />
          <Skeleton className="h-11 w-48 rounded-xl" />
        </div>
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((idx) => (
          <div key={`summary-skeleton-${idx}`} className="bg-white/80 rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Skeleton className="w-6 h-6 rounded-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-10 w-48" />
            </div>
          </div>
        ))}
      </div>

      {/* Transactions Table Skeleton */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-8 flex flex-col h-full">
        <div className="p-6 border-b border-gray-100 bg-white flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-gray-300" />
              <Skeleton className="h-7 w-40" />
            </h3>
            <div className="relative w-full md:w-auto">
              <Skeleton className="h-11 w-full md:w-80 rounded-2xl" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 border-b border-gray-100 pb-px">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-gray-500 font-bold border-b border-gray-100 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-5 whitespace-nowrap">Mã Phiếu</th>
                <th className="px-6 py-5 whitespace-nowrap">Thời Gian</th>
                <th className="px-6 py-5 whitespace-nowrap text-center">Loại</th>
                <th className="px-6 py-5">Lý Do / Nội Dung</th>
                <th className="px-6 py-5 whitespace-nowrap text-right">Số Tiền</th>
                <th className="px-6 py-5 whitespace-nowrap">Người Nộp/Nhận</th>
                <th className="px-6 py-5 whitespace-nowrap text-center">Phương Thức</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80">
              {[...Array(5)].map((_, idx) => (
                <tr key={`table-skeleton-${idx}`}>
                  <td className="px-6 py-5"><Skeleton className="h-5 w-24" /></td>
                  <td className="px-6 py-5"><Skeleton className="h-5 w-32" /></td>
                  <td className="px-6 py-5 text-center"><Skeleton className="h-6 w-24 rounded-xl mx-auto" /></td>
                  <td className="px-6 py-5"><Skeleton className="h-5 w-48" /></td>
                  <td className="px-6 py-5"><Skeleton className="h-6 w-28 ml-auto" /></td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center"><Skeleton className="h-6 w-20 rounded-xl mx-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
