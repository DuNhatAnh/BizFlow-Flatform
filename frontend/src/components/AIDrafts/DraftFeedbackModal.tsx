import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

interface DraftFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: any;
  onSubmit: (feedbackData: {
    errorType: string;
    feedbackMessage: string;
  }) => void;
}

export default function DraftFeedbackModal({
  isOpen,
  onClose,
  draft,
  onSubmit,
}: DraftFeedbackModalProps) {
  const [errorType, setErrorType] = useState<string>("Sai sản phẩm");
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");

  if (!isOpen || !draft) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      errorType,
      feedbackMessage,
    });
    setFeedbackMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-surface-container-high w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-surface-container-low flex justify-between items-center bg-error/[0.03]">
          <div className="flex items-center gap-2 text-error">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-md font-bold text-on-surface">Báo lỗi AI dịch sai</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-surface-container-low rounded-lg text-on-surface-variant transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <span className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Câu lệnh gốc của khách
            </span>
            <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant text-xs italic text-on-surface font-sans">
              "{draft.rawText}"
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Loại lỗi phát hiện
            </label>
            <select
              value={errorType}
              onChange={(e) => setErrorType(e.target.value)}
              className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            >
              <option value="Sai sản phẩm">Sai tên mặt hàng / sản phẩm</option>
              <option value="Sai số lượng">Sai số lượng trích xuất</option>
              <option value="Sai khách hàng">Nhận diện nhầm tên khách hàng</option>
              <option value="Sai thanh toán">Nhầm phương thức thanh toán</option>
              <option value="Nhận diện thiếu">Bỏ sót mặt hàng trong hội thoại</option>
              <option value="Khác">Lỗi khác</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Ghi chú chi tiết (Tùy chọn)
            </label>
            <textarea
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              placeholder="Mô tả cụ thể lỗi để hỗ trợ cải tiến AI (ví dụ: khách nói 'chú ba' nhưng AI nhận nhầm thành khách vãng lai)..."
              rows={3}
              className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-on-surface-variant/40"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-on-surface hover:bg-surface-container-low border border-outline-variant rounded-lg transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-error hover:bg-error/90 rounded-lg shadow-sm transition-all"
            >
              Gửi báo cáo lỗi
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
