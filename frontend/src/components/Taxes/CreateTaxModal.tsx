import React, { useState } from 'react';
import { X, Save, Info } from 'lucide-react';

interface CreateTaxModalProps {
  onClose: () => void;
  onSuccess: (data: any) => Promise<boolean>;
}

export const CreateTaxModal: React.FC<CreateTaxModalProps> = ({ onClose, onSuccess }) => {
  const [taxType, setTaxType] = useState(0); // 0 = VAT, 1 = PIT, 2 = BusinessLicenseTax, 3 = Other
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [amountDue, setAmountDue] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await onSuccess({
      taxType,
      year,
      month,
      amountDue: parseFloat(amountDue),
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
          <h3 className="font-bold text-lg">Ghi nhận Thuế Phải Nộp</h3>
          <button onClick={onClose} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Loại thuế</label>
            <select 
              value={taxType}
              onChange={(e) => setTaxType(parseInt(e.target.value))}
              className="w-full p-3 border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value={0}>Thuế Giá Trị Gia Tăng (VAT)</option>
              <option value={1}>Thuế Thu Nhập Cá Nhân (PIT)</option>
              <option value={2}>Thuế Môn Bài</option>
              <option value={3}>Thuế Khác</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Tháng</label>
              <input 
                type="number" 
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full p-3 border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                min="0"
                max="12"
                title="Nhập 0 nếu là thuế thu theo năm (Môn bài)"
              />
              <p className="text-xs text-on-surface-variant mt-1">Nhập 0 nếu là thuế năm</p>
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

          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="block text-sm font-medium text-on-surface">Số thuế phải nộp</label>
              <div className="group relative">
                <Info className="w-4 h-4 text-on-surface-variant cursor-pointer hover:text-primary transition-colors" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-72 p-3 bg-surface-container-highest text-on-surface text-xs rounded-xl shadow-lg border border-outline-variant z-50">
                  <p className="font-semibold mb-2">Tỷ lệ thuế theo Thông tư 40/2021/TT-BTC:</p>
                  <ul className="space-y-1 list-disc pl-4 text-on-surface-variant">
                    <li><span className="font-medium">Phân phối, bán hàng hóa:</span> VAT 1%, TNCN 0.5%</li>
                    <li><span className="font-medium">Dịch vụ, xây dựng không bao thầu NVL:</span> VAT 5%, TNCN 2%</li>
                    <li><span className="font-medium">Sản xuất, vận tải, dịch vụ có HH:</span> VAT 3%, TNCN 1.5%</li>
                    <li><span className="font-medium">Hoạt động khác:</span> VAT 2%, TNCN 1%</li>
                  </ul>
                </div>
              </div>
            </div>
            <input 
              type="number" 
              value={amountDue}
              onChange={(e) => setAmountDue(e.target.value)}
              className="w-full p-3 border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              required 
              min="0"
            />
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
              {isLoading ? 'Đang xử lý...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
