import React, { useState, useEffect, useCallback } from "react";
import { ArrowUpCircle, ArrowDownCircle, FileOutput } from "lucide-react";
import { CashTransaction } from "./types";
import { CashBookSkeleton } from "./CashBookSkeleton";
import { CashBookSummary } from "./CashBookSummary";
import { CashBookTable } from "./CashBookTable";
import { TransactionModal } from "./TransactionModal";
import { TransactionDetailModal } from "./TransactionDetailModal";

interface CashBookProps {
  user: any;
  showToast: (msg: string, type: "success" | "error") => void;
}

export default function CashBook({ user, showToast }: CashBookProps) {
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [balance, setBalance] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const [selectedTransaction, setSelectedTransaction] = useState<CashTransaction | null>(null);
  const [transactionType, setTransactionType] = useState<"Receipt" | "Payment">("Receipt");
  const [activeTab, setActiveTab] = useState<"All" | "Receipt" | "Payment">("All");
  const [storeData, setStoreData] = useState<{name: string, address: string} | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:5178/api/cash?page=${currentPage}&pageSize=${itemsPerPage}`, {
        headers: { "Authorization": `Bearer ${user.token}`, "X-Tenant-Id": user.tenantId }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.items || []);
        setTotalPages(data.totalPages || Math.ceil((data.totalCount || 0) / itemsPerPage) || 1);
        setTotalItems(data.totalCount || 0);
      } else {
        const text = await res.text();
        console.error("API Error Response:", text);
      }
    } catch (e) {
      console.error("Failed to fetch cash transactions", e);
    }
  }, [user, currentPage]);

  const fetchBalance = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('http://localhost:5178/api/cash/balance', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'X-Tenant-Id': user.tenantId
        }
      });
      if (res.ok) {
        const data = await res.json();
        setBalance(data);
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    const fetchStoreInfo = async () => {
      try {
        const res = await fetch(`http://localhost:5178/api/stores`, {
          headers: { "Authorization": `Bearer ${user.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setStoreData({ name: data[0].name, address: data[0].address });
          }
        }
      } catch (e) {
        console.error("Failed to fetch store info", e);
      }
    };

    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchTransactions(), fetchStoreInfo(), fetchBalance()]);
      // Adding a small delay for smoother skeleton transition
      setTimeout(() => setIsLoading(false), 500); 
    };

    loadData();
  }, [user, fetchTransactions, fetchBalance]);

  const handleExportExcel = () => {
    const headers = ["Ngày tháng", "Số hiệu Phiếu thu", "Số hiệu Phiếu chi", "Diễn giải", "Tài khoản đối ứng", "Thu", "Chi", "Tồn quỹ"];
    let csvContent = headers.join(",") + "\n";
    let currentBalance = 0; 
    
    const sorted = [...transactions].sort((a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime());
    
    sorted.forEach(t => {
      const isReceipt = t.type === 'Receipt';
      if (isReceipt) currentBalance += t.amount;
      else currentBalance -= t.amount;
      
      const date = new Date(t.transactionDate).toLocaleDateString('vi-VN');
      const pThu = isReceipt ? t.transactionCode : "";
      const pChi = !isReceipt ? t.transactionCode : "";
      const desc = `"${(t.reason || '').replace(/"/g, '""')}"`;
      const thu = isReceipt ? t.amount : 0;
      const chi = !isReceipt ? t.amount : 0;
      
      csvContent += `${date},${pThu},${pChi},${desc},"",${thu},${chi},${currentBalance}\n`;
    });
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `So_Quy_TT88_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalReceipts = transactions.filter(t => t.type === 'Receipt').reduce((acc, t) => acc + t.amount, 0);
  const totalPayments = transactions.filter(t => t.type === 'Payment').reduce((acc, t) => acc + t.amount, 0);

  const reloadData = () => {
    fetchTransactions();
    fetchBalance();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 font-sans">
      
      {/* Header Actions */}
      <div className="flex flex-wrap justify-end gap-3 mb-8">
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => { setTransactionType("Receipt"); setIsModalOpen(true); }}
            className="px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold transition-all flex items-center gap-2 border border-emerald-200"
          >
            <ArrowUpCircle className="w-5 h-5" />
            Lập Phiếu Thu
          </button>
          <button 
            onClick={() => { setTransactionType("Payment"); setIsModalOpen(true); }}
            className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold transition-all flex items-center gap-2 border border-rose-200"
          >
            <ArrowDownCircle className="w-5 h-5" />
            Lập Phiếu Chi
          </button>
          <button 
            onClick={handleExportExcel}
            className="px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl shadow-sm hover:shadow-md font-bold transition-all hover:-translate-y-0.5 flex items-center gap-2"
          >
            <FileOutput className="w-5 h-5" />
            Xuất Excel (S03a-HKD)
          </button>
        </div>
      </div>

      <CashBookSummary 
        balance={balance} 
        totalReceipts={totalReceipts} 
        totalPayments={totalPayments} 
        isLoading={isLoading}
      />

      <CashBookTable 
        transactions={transactions}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSelectedTransaction={setSelectedTransaction}
        setIsDetailModalOpen={setIsDetailModalOpen}
        totalItems={totalItems}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        isLoading={isLoading}
      />

      <TransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transactionType={transactionType}
        user={user}
        showToast={showToast}
        onSuccess={reloadData}
      />

      <TransactionDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        transaction={selectedTransaction}
        storeData={storeData}
      />
    </div>
  );
}
