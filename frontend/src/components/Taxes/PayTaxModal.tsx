import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface PayTaxModalProps {
  tax: any;
  onClose: () => void;
  onSuccess: (id: string, paymentData: any) => Promise<boolean>;
}

export const PayTaxModal: React.FC<PayTaxModalProps> = ({ tax, onClose, onSuccess }) => {
  const [amount, setAmount] = useState(tax.remainingAmount.toString());
  const [method, setMethod] = useState(0); // 0 = Cash, 1 = Transfer
  const [note, setNote] = useState(`Nộp thuế ${tax.taxTypeName} kỳ ${tax.month}/${tax.year}`);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await onSuccess(tax.id, {
      amountToPay: parseFloat(amount),
      paymentMethod: method,
      note
    });

    setIsLoading(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <h3 className="font-bold text-lg">Nộp Thuế</h3>
          <button onClick={onClose} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <p className="text-sm text-on-surface-variant">Loại thuế: <span className="font-medium text-on-surface">{tax.taxTypeName}</span></p>
            <p className="text-sm text-on-surface-variant">Kỳ tính thuế: <span className="font-medium text-on-surface">{tax.month}/{tax.year}</span></p>
            <p className="text-sm text-on-surface-variant">Còn nợ: <span className="font-bold text-error">{tax.remainingAmount.toLocaleString()} đ</span></p>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Số tiền nộp</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              required 
              min="1"
              max={tax.remainingAmount}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Phương thức thanh toán</label>
            <select 
              value={method}
              onChange={(e) => setMethod(parseInt(e.target.value))}
              className="w-full p-3 border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value={0}>Tiền mặt</option>
              <option value={1}>Chuyển khoản</option>
            </select>
            <p className="text-xs text-on-surface-variant mt-1">Lưu ý: Hệ thống sẽ tự động lập Phiếu chi tương ứng trong Sổ quỹ tiền mặt (S3).</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Ghi chú</label>
            <input 
              type="text" 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-on-surface border border-outline-variant rounded-full font-medium hover:bg-surface-container-lowest transition-colors">
              Hủy
            </button>
            <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" />
              {isLoading ? 'Đang xử lý...' : 'Xác nhận Nộp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
