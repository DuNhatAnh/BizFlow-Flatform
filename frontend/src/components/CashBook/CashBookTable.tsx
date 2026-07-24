import React from "react";
import { FileText, Search, ArrowUpCircle, ArrowDownCircle, FileDigit, User } from "lucide-react";
import { CashTransaction } from "./types";
import { Pagination } from "../ui/Pagination";

interface CashBookTableProps {
  transactions: CashTransaction[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  activeTab: "All" | "Receipt" | "Payment";
  setActiveTab: (val: "All" | "Receipt" | "Payment") => void;
  setSelectedTransaction: (t: CashTransaction) => void;
  setIsDetailModalOpen: (val: boolean) => void;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  isLoading?: boolean;
}

export const CashBookTable: React.FC<CashBookTableProps> = ({
  transactions,
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  setSelectedTransaction,
  setIsDetailModalOpen,
  totalItems,
  currentPage,
  totalPages,
  setCurrentPage,
  itemsPerPage,
  isLoading
}) => {
  const filteredTransactions = transactions.filter(t => {
    const matchTab = activeTab === 'All' || t.type === activeTab;
    const matchSearch = (t.transactionCode || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (t.reason || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (t.payerReceiverName || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-8 flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
      <div className="p-6 border-b border-gray-100 bg-white flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Lịch Sử Giao Dịch
          </h3>
          <div className="relative w-full md:w-auto">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm theo mã phiếu, lý do, người nhận..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-primary/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 w-full md:w-80 transition-all font-medium"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 border-b border-gray-100 pb-px">
          <button
            onClick={() => setActiveTab('All')}
            className={`px-4 py-2 font-bold text-sm transition-all border-b-2 ${activeTab === 'All' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'}`}
          >
            Tất Cả
          </button>
          <button
            onClick={() => setActiveTab('Receipt')}
            className={`px-4 py-2 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'Receipt' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'}`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            Phiếu Thu
          </button>
          <button
            onClick={() => setActiveTab('Payment')}
            className={`px-4 py-2 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'Payment' ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'}`}
          >
            <ArrowDownCircle className="w-4 h-4" />
            Phiếu Chi
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-gray-500 font-bold border-b border-gray-100 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-5 whitespace-nowrap">Mã Phiếu</th>
                <th className="px-6 py-5 whitespace-nowrap">Thời Gian</th>
                <th className="px-6 py-5 whitespace-nowrap">Loại</th>
                <th className="px-6 py-5 min-w-[200px]">Lý Do / Nội Dung</th>
                <th className="px-6 py-5 text-right whitespace-nowrap">Số Tiền</th>
                <th className="px-6 py-5 whitespace-nowrap">Người nộp/nhận</th>
                <th className="px-6 py-5 whitespace-nowrap text-center">Phương Thức</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`row-skeleton-${idx}`}>
                    <td className="px-6 py-4"><div className="h-5 w-24 bg-gray-200 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-32 bg-gray-200 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-200 animate-pulse rounded-full" /></td>
                    <td className="px-6 py-4">
                      <div className="h-5 w-48 bg-gray-200 animate-pulse rounded mb-1" />
                      <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                    </td>
                    <td className="px-6 py-4"><div className="h-5 w-24 bg-gray-200 animate-pulse rounded ml-auto" /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-gray-200 animate-pulse rounded-full" />
                        <div className="h-5 w-24 bg-gray-200 animate-pulse rounded" />
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-5 w-20 bg-gray-200 animate-pulse rounded mx-auto" /></td>
                  </tr>
                ))
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-base font-medium">Không tìm thấy giao dịch nào</p>
                      <p className="text-sm mt-1 opacity-75">Vui lòng thử tìm kiếm với từ khóa khác</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((t, index) => (
                <tr 
                  key={t.id} 
                  onClick={() => { setSelectedTransaction(t); setIsDetailModalOpen(true); }} 
                  className={`hover:bg-primary/5 transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                <td className="px-6 py-5 font-bold text-gray-900 group-hover:text-primary transition-colors whitespace-nowrap">{t.transactionCode}</td>
                <td className="px-6 py-5 font-medium whitespace-nowrap">{new Date(t.transactionDate).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                <td className="px-6 py-5 text-center whitespace-nowrap">
                  {t.type === 'Receipt' ? (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800">
                      <ArrowUpCircle className="w-3.5 h-3.5 mr-1" />
                      Phiếu Thu
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-100 text-rose-800">
                      <ArrowDownCircle className="w-3.5 h-3.5 mr-1" />
                      Phiếu Chi
                    </span>
                  )}
                </td>
                <td className="px-6 py-5 font-medium text-gray-800 min-w-[200px]" title={t.reason}>{t.reason || '-'}</td>
                <td className={`px-6 py-5 text-right font-black whitespace-nowrap ${t.type === 'Receipt' ? 'text-emerald-600' : 'text-rose-600'}`} style={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                  {t.type === 'Receipt' ? '+' : '-'}
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.amount)}
                </td>
                <td className="px-6 py-5 font-semibold text-gray-700 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="truncate max-w-[150px]">{t.payerReceiverName || t.creatorName || '-'}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className="text-gray-600 font-semibold text-xs px-3 py-1.5 bg-gray-100 rounded-xl">
                    {t.paymentMethod === 'Cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                  </span>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={itemsPerPage}
          totalItems={totalItems}
          itemName="giao dịch"
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};
