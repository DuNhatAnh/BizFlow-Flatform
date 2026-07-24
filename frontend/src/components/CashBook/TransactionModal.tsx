import React, { useState } from "react";
import { createPortal } from "react-dom";
import { User, Paperclip, FileDigit, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionType: "Receipt" | "Payment";
  user: any;
  showToast: (msg: string, type: "success" | "error") => void;
  onSuccess: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transactionType,
  user,
  showToast,
  onSuccess
}) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Transfer">("Cash");
  const [reason, setReason] = useState("");
  const [payerReceiverName, setPayerReceiverName] = useState("");
  const [address, setAddress] = useState("");
  const [referenceDocument, setReferenceDocument] = useState("");
  const [attachedDocuments, setAttachedDocuments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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
        setAmount("");
        setReason("");
        setPayerReceiverName("");
        setAddress("");
        setReferenceDocument("");
        setAttachedDocuments("");
        onSuccess();
        onClose();
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

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        <div className="p-8 pb-6 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${transactionType === 'Receipt' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {transactionType === 'Receipt' ? <ArrowUpCircle className="w-8 h-8" /> : <ArrowDownCircle className="w-8 h-8" />}
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-gray-900">
                Lập {transactionType === 'Receipt' ? 'Phiếu Thu' : 'Phiếu Chi'}
              </h2>
              <p className="text-sm font-medium text-gray-500 mt-1">Tuân thủ biểu mẫu kế toán TT88</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2.5 rounded-full transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="px-8 pb-8 overflow-y-auto custom-scrollbar">
          <form id="cash-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <label className="text-sm font-bold text-gray-700">Người nộp/nhận tiền <span className="text-rose-500">*</span></label>
                <div className="relative group">
                  <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-700 transition-colors" />
                  <input 
                    type="text" 
                    required
                    value={payerReceiverName}
                    onChange={(e) => setPayerReceiverName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 focus:bg-white rounded-2xl focus:ring-4 focus:ring-gray-100 focus:border-gray-300 transition-all font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-medium"
                    placeholder="Nguyễn Văn A..."
                  />
                </div>
              </div>
              <div className="space-y-2.5">
                <label className="text-sm font-bold text-gray-700">Địa chỉ</label>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 focus:bg-white rounded-2xl focus:ring-4 focus:ring-gray-100 focus:border-gray-300 transition-all font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-medium"
                  placeholder="123 Lê Lợi, Q1..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <label className="text-sm font-bold text-gray-700">Số tiền (VNĐ) <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold ${transactionType === 'Receipt' ? 'text-emerald-500' : 'text-rose-500'}`}>₫</span>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 focus:bg-white rounded-2xl focus:ring-4 transition-all text-xl font-black ${transactionType === 'Receipt' ? 'focus:ring-emerald-50 focus:border-emerald-200 text-emerald-600' : 'focus:ring-rose-50 focus:border-rose-200 text-rose-600'}`}
                    placeholder="0"
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
              </div>
              <div className="space-y-2.5">
                <label className="text-sm font-bold text-gray-700">Hình thức thanh toán</label>
                <div className="relative group">
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-4 py-3.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 focus:bg-white rounded-2xl focus:ring-4 focus:ring-gray-100 focus:border-gray-300 transition-all font-semibold text-gray-900 appearance-none"
                  >
                    <option value="Cash">Tiền mặt</option>
                    <option value="Transfer">Chuyển khoản</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-sm font-bold text-gray-700">Lý do / Diễn giải <span className="text-rose-500">*</span></label>
              <textarea 
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                className="w-full px-4 py-3.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 focus:bg-white rounded-2xl focus:ring-4 focus:ring-gray-100 focus:border-gray-300 transition-all font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-medium resize-none"
                placeholder={`Nhập lý do ${transactionType === 'Receipt' ? 'thu' : 'chi'} tiền...`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl border border-gray-100 bg-gray-50/30">
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Chứng từ gốc</label>
                <div className="relative group">
                  <Paperclip className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-700 transition-colors" />
                  <input 
                    type="text" 
                    value={attachedDocuments}
                    onChange={(e) => setAttachedDocuments(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 hover:border-gray-300 rounded-xl focus:ring-4 focus:ring-gray-100 focus:border-gray-400 transition-all font-medium text-gray-900"
                    placeholder="VD: 01 hóa đơn..."
                  />
                </div>
              </div>
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mã chứng từ tham chiếu</label>
                <div className="relative group">
                  <FileDigit className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-700 transition-colors" />
                  <input 
                    type="text" 
                    value={referenceDocument}
                    onChange={(e) => setReferenceDocument(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 hover:border-gray-300 rounded-xl focus:ring-4 focus:ring-gray-100 focus:border-gray-400 transition-all font-medium text-gray-900"
                    placeholder="VD: HD001, PN002..."
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 rounded-b-[2rem]">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-gray-700 font-bold bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Hủy bỏ
          </button>
          <button 
            type="submit"
            form="cash-form"
            disabled={isSubmitting}
            className={`px-8 py-3 text-white font-bold rounded-xl transition-all flex items-center justify-center min-w-[140px] ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 shadow-lg'
            } ${transactionType === 'Receipt' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'}`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Đang xử lý
              </span>
            ) : 'Xác nhận Lưu'}
          </button>
        </div>
      </div>
    </div>, document.body
  );
};
