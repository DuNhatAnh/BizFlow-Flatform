import React, { useState, useEffect, useCallback } from "react";
import { PlusCircle, Search, FileText, ArrowUpCircle, ArrowDownCircle, Banknote, Calendar, User, FileDigit, FileOutput, Paperclip, ChevronLeft, ChevronRight } from "lucide-react";
import { Pagination } from "./ui/Pagination";

interface CashTransaction {
  id: string;
  type: "Receipt" | "Payment";
  paymentMethod: "Cash" | "Transfer";
  amount: number;
  transactionDate: string;
  transactionCode: string;
  reason?: string;
  referenceDocument?: string;
  payerReceiverName?: string;
  address?: string;
  attachedDocuments?: string;
  createdAt: string;
  creatorName?: string;
}

export default function CashBook({ user, showToast }: { user: any; showToast: any }) {
  const numberToWords = (n: number) => {
    if (n === 0) return "Không đồng";
    const words = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    const readGroup = (group: number, isFirstGroup: boolean) => {
      const h = Math.floor(group / 100);
      const t = Math.floor((group % 100) / 10);
      const u = group % 10;
      let res = "";
      if (h > 0) res += words[h] + " trăm ";
      else if (!isFirstGroup) res += "không trăm ";
      if (t > 1) res += words[t] + " mươi ";
      else if (t === 1) res += "mười ";
      else if (t === 0 && u > 0 && (h > 0 || !isFirstGroup)) res += "lẻ ";
      if (u === 1 && t > 1) res += "mốt ";
      else if (u === 5 && t > 0) res += "lăm ";
      else if (u > 0) res += words[u] + " ";
      return res;
    };
    const units = ["", "nghìn ", "triệu ", "tỷ ", "nghìn tỷ "];
    let res = "";
    let i = 0;
    let temp = n;
    while (temp > 0) {
      const group = temp % 1000;
      temp = Math.floor(temp / 1000);
      if (group > 0 || (i === 0 && n === 0)) res = readGroup(group, temp === 0) + units[i] + res;
      i++;
    }
    res = res.replace(/không trăm lẻ $/g, "").trim();
    return res.charAt(0).toUpperCase() + res.slice(1) + " đồng";
  };
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
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
  
  // Form states
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Transfer">("Cash");
  const [reason, setReason] = useState("");
  const [payerReceiverName, setPayerReceiverName] = useState("");
  const [address, setAddress] = useState("");
  const [referenceDocument, setReferenceDocument] = useState("");
  const [attachedDocuments, setAttachedDocuments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const fetchBalance = async () => {
    try {
      const res = await fetch("http://localhost:5178/api/cash/balance", {
        headers: { "Authorization": `Bearer ${user.token}`, "X-Tenant-Id": user.tenantId }
      });
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
      }
    } catch (e) {
      console.error("Failed to fetch balance", e);
    }
  };

  useEffect(() => {
    if (!user) return;
    // We are now using the fetchTransactions defined with useCallback outside of useEffect
    
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

    const fetchBalance = async () => {
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
    fetchStoreInfo();
    fetchBalance();
  }, [user, showToast, fetchTransactions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      showToast("Vui lòng nhập số tiền hợp lệ", "error");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:5178/api/cash", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: transactionType,
          paymentMethod,
          amount: Number(amount),
          reason,
          payerReceiverName,
          address,
          referenceDocument,
          attachedDocuments
        })
      });

      if (res.ok) {
        showToast(`Tạo phiếu ${transactionType === 'Receipt' ? 'thu' : 'chi'} thành công!`, "success");
        setIsModalOpen(false);
        setAmount("");
        setReason("");
        setPayerReceiverName("");
        setAddress("");
        setReferenceDocument("");
        setAttachedDocuments("");
        fetchTransactions();
        fetchBalance();
      } else {
        const err = await res.json();
        showToast(err.message || "Lỗi khi tạo phiếu", "error");
      }
    } catch (e) {
      showToast("Lỗi kết nối", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Đang tải dữ liệu...</div>;
  }

  const handleExportExcel = () => {
    // Generate simple CSV for TT88 S03a-HKD
    const headers = ["Ngày tháng", "Số hiệu Phiếu thu", "Số hiệu Phiếu chi", "Diễn giải", "Tài khoản đối ứng", "Thu", "Chi", "Tồn quỹ"];
    let csvContent = headers.join(",") + "\n";
    let currentBalance = 0; 
    
    // Sort ascending for chronological calculation
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

  const handlePrintReceipt = (t: CashTransaction) => {
    const isReceipt = t.type === 'Receipt';
    const title = isReceipt ? 'PHIẾU THU' : 'PHIẾU CHI';
    const formNo = isReceipt ? '01 - TT' : '02 - TT';
    const payerLabel = isReceipt ? 'Họ và tên người nộp tiền' : 'Họ và tên người nhận tiền';
    const reasonLabel = isReceipt ? 'Lý do nộp' : 'Lý do chi';
    const signatureLabel = isReceipt ? 'NGƯỜI NỘP TIỀN' : 'NGƯỜI NHẬN TIỀN';
    const dateObj = new Date(t.transactionDate);
    const dateStr = `Ngày ${dateObj.getDate().toString().padStart(2, '0')} tháng ${(dateObj.getMonth() + 1).toString().padStart(2, '0')} năm ${dateObj.getFullYear()}`;
    
    const printWindow = document.createElement('iframe');
    printWindow.style.display = 'none';
    document.body.appendChild(printWindow);
    
    const html = `
      <html>
      <head>
        <title>In ${title}</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; font-size: 14pt; line-height: 1.5; padding: 20px; color: #000; }
          .flex { display: flex; justify-content: space-between; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .italic { font-style: italic; }
          .mt-4 { margin-top: 1rem; }
          .mb-4 { margin-bottom: 1rem; }
          .row { display: flex; margin-bottom: 0.5rem; }
          .label { width: 220px; }
          .value { flex: 1; border-bottom: 1px dotted #000; }
          .signatures { display: flex; justify-content: space-between; margin-top: 2rem; text-align: center; }
          .sig-col { width: 25%; }
        </style>
      </head>
      <body>
        <div class="flex">
          <div class="font-bold">
            <div>HỘ, CÁ NHÂN KINH DOANH: ${(storeData?.name || '').toUpperCase()}</div>
            <div>Địa chỉ: ${storeData?.address || '..............................................................'}</div>
          </div>
          <div class="text-center">
            <div class="font-bold">Mẫu số ${formNo}</div>
            <div class="italic">(Ban hành kèm theo Thông tư số 88/2021/TT-BTC</div>
            <div class="italic">ngày 11 tháng 10 năm 2021 của Bộ trưởng Bộ Tài chính)</div>
          </div>
        </div>
        
        <div class="text-center mt-4 mb-4">
          <h2 style="margin:0;">${title}</h2>
          <div class="italic">${dateStr}</div>
          <div>Quyển số: ............ - Số: <b>${t.transactionCode}</b></div>
        </div>
        
        <div class="row"><div class="label">${payerLabel}:</div><div class="value">${t.payerReceiverName || ''}</div></div>
        <div class="row"><div class="label">Địa chỉ:</div><div class="value">${t.address || ''}</div></div>
        <div class="row"><div class="label">${reasonLabel}:</div><div class="value">${t.reason || ''}</div></div>
        <div class="row"><div class="label">Số tiền:</div><div class="value font-bold">${new Intl.NumberFormat('vi-VN').format(t.amount)} đ</div></div>
        <div class="row"><div class="label">(Viết bằng chữ):</div><div class="value italic">${numberToWords(t.amount)}</div></div>
        <div class="row"><div class="label">Kèm theo:</div><div class="value">${t.referenceDocument || t.attachedDocuments || ''} chứng từ gốc</div></div>
        
        <div class="signatures">
          <div class="sig-col">
            <div class="font-bold">NGƯỜI ĐẠI DIỆN</div>
            <div class="font-bold">HỘ KINH DOANH</div>
            <div class="italic">(Ký, họ tên, đóng dấu)</div>
          </div>
          <div class="sig-col">
            <div class="font-bold">NGƯỜI LẬP BIỂU</div>
            <div class="italic">(Ký, họ tên)</div>
          </div>
          <div class="sig-col">
            <div class="font-bold">${signatureLabel}</div>
            <div class="italic">(Ký, họ tên)</div>
          </div>
          <div class="sig-col">
            <div class="font-bold">THỦ QUỸ</div>
            <div class="italic">(Ký, họ tên)</div>
          </div>
        </div>
        
        <div style="margin-top: 100px;">
          Đã nhận đủ số tiền (viết bằng chữ): .....................................................................................................................................
        </div>
      </body>
      </html>
    `;
    printWindow.contentWindow?.document.open();
    printWindow.contentWindow?.document.write(html);
    printWindow.contentWindow?.document.close();
    
    setTimeout(() => {
      printWindow.contentWindow?.focus();
      printWindow.contentWindow?.print();
      setTimeout(() => document.body.removeChild(printWindow), 1000);
    }, 200);
  };

  const totalReceipts = transactions.filter(t => t.type === 'Receipt').reduce((acc, t) => acc + t.amount, 0);
  const totalPayments = transactions.filter(t => t.type === 'Payment').reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-4">
        <div className="flex gap-3">
          <button 
            onClick={() => { setTransactionType("Receipt"); setIsModalOpen(true); }}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl shadow-sm font-medium transition-colors flex items-center gap-2"
          >
            <ArrowUpCircle className="w-5 h-5" />
            Lập Phiếu Thu
          </button>
          <button 
            onClick={() => { setTransactionType("Payment"); setIsModalOpen(true); }}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl shadow-sm font-medium transition-colors flex items-center gap-2"
          >
            <ArrowDownCircle className="w-5 h-5" />
            Lập Phiếu Chi
          </button>
          <button 
            onClick={handleExportExcel}
            className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl shadow-sm font-medium transition-colors flex items-center gap-2"
          >
            <FileOutput className="w-5 h-5" />
            Xuất Sổ Quỹ (TT88)
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tồn Quỹ Hiện Tại</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(balance)}
            </h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <ArrowUpCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tổng Thu</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalReceipts)}
            </h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <ArrowDownCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tổng Chi</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPayments)}
            </h3>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Lịch Sử Giao Dịch</h3>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm theo mã phiếu, lý do..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Mã Phiếu</th>
                <th className="px-6 py-4 whitespace-nowrap">Thời Gian</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Loại</th>
                <th className="px-6 py-4">Lý Do / Nội Dung</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Số Tiền</th>
                <th className="px-6 py-4 whitespace-nowrap">Người Nộp/Nhận</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Phương Thức</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Chưa có giao dịch nào.</td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} onClick={() => { setSelectedTransaction(t); setIsDetailModalOpen(true); }} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 font-medium text-gray-900">{t.transactionCode}</td>
                    <td className="px-6 py-4">{new Date(t.transactionDate).toLocaleString('vi-VN')}</td>
                    <td className="px-6 py-4 text-center">
                      {t.type === 'Receipt' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          Phiếu Thu
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          Phiếu Chi
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={t.reason}>{t.reason || '-'}</td>
                    <td className={`px-6 py-4 text-right font-bold ${t.type === 'Receipt' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'Receipt' ? '+' : '-'}
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.amount)}
                    </td>
                    <td className="px-6 py-4 truncate">{t.payerReceiverName || t.creatorName || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-500 text-xs px-2 py-1 bg-gray-100 rounded-md">
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

      {/* Modal Lập Phiếu */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${transactionType === 'Receipt' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {transactionType === 'Receipt' ? <ArrowUpCircle /> : <ArrowDownCircle />}
                Lập {transactionType === 'Receipt' ? 'Phiếu Thu' : 'Phiếu Chi'} (TT88)
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="cash-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Người nộp/nhận tiền</label>
                    <div className="relative">
                      <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        required
                        value={payerReceiverName}
                        onChange={(e) => setPayerReceiverName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        placeholder="Nguyễn Văn A..."
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Địa chỉ</label>
                    <input 
                      type="text" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      placeholder="123 Lê Lợi, Q1..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Số tiền (VNĐ) *</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-lg font-semibold"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Hình thức</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    >
                      <option value="Cash">Tiền mặt</option>
                      <option value="Transfer">Chuyển khoản</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Lý do *</label>
                  <textarea 
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder={`Nhập lý do ${transactionType === 'Receipt' ? 'thu' : 'chi'} tiền...`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 text-gray-500">Kèm theo (Chứng từ gốc)</label>
                    <div className="relative">
                      <Paperclip className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        value={attachedDocuments}
                        onChange={(e) => setAttachedDocuments(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        placeholder="01 hóa đơn, hợp đồng..."
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 text-gray-500">Mã chứng từ tham chiếu</label>
                    <div className="relative">
                      <FileDigit className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        value={referenceDocument}
                        onChange={(e) => setReferenceDocument(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        placeholder="HD001, PN002..."
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-gray-700 font-medium bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit"
                form="cash-form"
                disabled={isSubmitting}
                className={`px-6 py-2.5 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                } ${transactionType === 'Receipt' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Lưu Phiếu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xem Chi Tiết Phiếu */}
      {isDetailModalOpen && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className={`text-xl font-bold ${selectedTransaction.type === 'Receipt' ? 'text-emerald-700' : 'text-rose-700'}`}>
                Chi tiết {selectedTransaction.type === 'Receipt' ? 'Phiếu Thu' : 'Phiếu Chi'}
              </h2>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Mã phiếu</span>
                <span className="text-lg font-bold text-gray-900">{selectedTransaction.transactionCode}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Số tiền</span>
                <span className={`text-xl font-bold ${selectedTransaction.type === 'Receipt' ? 'text-green-600' : 'text-red-600'}`}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedTransaction.amount)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ngày lập phiếu</p>
                  <p className="font-medium text-gray-900">{new Date(selectedTransaction.transactionDate).toLocaleString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phương thức</p>
                  <p className="font-medium text-gray-900">{selectedTransaction.paymentMethod === 'Cash' ? 'Tiền mặt' : 'Chuyển khoản'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Người {selectedTransaction.type === 'Receipt' ? 'nộp' : 'nhận'}</p>
                  <p className="font-medium text-gray-900">{selectedTransaction.payerReceiverName || selectedTransaction.creatorName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Chứng từ gốc</p>
                  <p className="font-medium text-gray-900">{selectedTransaction.referenceDocument || selectedTransaction.attachedDocuments || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Địa chỉ</p>
                  <p className="font-medium text-gray-900">{selectedTransaction.address || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Lý do / Nội dung</p>
                  <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">{selectedTransaction.reason || '-'}</p>
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => handlePrintReceipt(selectedTransaction)}
                className="px-6 py-2 text-white font-medium bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <FileOutput className="w-4 h-4" />
                In Phiếu (TT88)
              </button>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="px-6 py-2 text-gray-700 font-medium bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
