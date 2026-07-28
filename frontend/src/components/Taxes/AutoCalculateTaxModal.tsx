import React, { useState } from 'react';
import { X, Save, Info, Calculator } from 'lucide-react';

interface AutoCalculateTaxModalProps {
  onClose: () => void;
  onSuccess: (year: number, month: number) => Promise<boolean>;
}

export const AutoCalculateTaxModal: React.FC<AutoCalculateTaxModalProps> = ({ onClose, onSuccess }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await onSuccess(year, month);

    setIsLoading(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="flex items-center gap-2 text-primary">
            <Calculator className="w-5 h-5" />
            <h3 className="font-bold text-lg">Tự Động Tính Thuế Tháng</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-primary-container/20 p-4 rounded-xl border border-primary/10">
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Hệ thống sẽ <strong className="text-primary">tự động bóc tách và tổng hợp Thuế GTGT (VAT)</strong> từ tất cả các hóa đơn bán hàng trong tháng. Bạn có chắc chắn muốn tiếp tục?
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Tháng</label>
              <input 
                type="number" 
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full p-3 border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                min="1"
                max="12"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Năm</label>
              <input 
                type="number" 
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full p-3 border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                required 
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-surface-container-highest hover:bg-surface-container-highest/80 text-on-surface font-medium rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 bg-primary hover:bg-primary/90 text-on-primary font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
              ) : (
                <>
                  <Calculator className="w-5 h-5" />
                  Bắt đầu tính
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
