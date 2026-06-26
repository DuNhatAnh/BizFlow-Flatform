import React from "react";
import { AlertCircle, Info } from "lucide-react";

interface InventorySettingsTabProps {
  hasAnyReceipts: boolean;
  cogsMethod: string;
  setCogsMethod: (val: string) => void;
  handleSaveSettings: () => void;
}

export default function InventorySettingsTab({
  hasAnyReceipts,
  cogsMethod,
  setCogsMethod,
  handleSaveSettings
}: InventorySettingsTabProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-lg font-bold text-on-surface mb-6">Cài đặt Phương pháp Tính giá Vốn (COGS)</h3>

      {hasAnyReceipts && (
        <div className="mb-6 bg-error-container text-on-error-container p-4 rounded-xl border border-error/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-error" />
          <div>
            <h4 className="font-bold text-error mb-1">Khóa an toàn dữ liệu (Safe Lock)</h4>
            <p className="text-sm">Hệ thống đã ghi nhận các giao dịch xuất/nhập kho. Để đảm bảo tính nhất quán của Sổ S2 theo Chuẩn mực Kế toán, bạn không thể thay đổi phương pháp lúc này. Việc thay đổi chỉ được phép khi kho hàng đã được reset về 0.</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className={`bg-surface-container-low p-5 rounded-xl border border-outline-variant space-y-4 ${hasAnyReceipts ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}>
          <div className="flex items-start gap-4">
            <div className="mt-1">
              <input
                type="radio"
                id="wa"
                name="cogs"
                value="weighted_average"
                checked={cogsMethod === "weighted_average"}
                onChange={(e) => setCogsMethod(e.target.value)}
                disabled={hasAnyReceipts}
                className="w-5 h-5 text-primary focus:ring-primary disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="wa" className={`font-bold text-base ${hasAnyReceipts ? 'text-on-surface-variant cursor-not-allowed' : 'text-on-surface cursor-pointer'}`}>Bình quân gia quyền cả kỳ dự trữ (Mặc định)</label>
              <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                Phù hợp với hầu hết các hộ kinh doanh bán lẻ. Giá trị mỗi đơn vị hàng hóa xuất kho được tính bằng trung bình cộng của giá trị hàng tồn đầu kỳ và giá trị hàng nhập trong kỳ.
              </p>
              {cogsMethod === "weighted_average" && (
                <div className="mt-3 bg-blue-50 text-blue-800 p-3 rounded-lg text-xs flex items-start gap-2 border border-blue-100">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span><strong>Ví dụ:</strong> Nhập 10 cái giá 10k, nhập thêm 10 cái giá 12k. Giá bình quân khi xuất kho sẽ là 11k/cái. Hệ thống sẽ tự động tự tính lại mức giá này mỗi khi có phiếu nhập kho mới.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`bg-surface-container-low p-5 rounded-xl border border-outline-variant space-y-4 ${hasAnyReceipts ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}>
          <div className="flex items-start gap-4">
            <div className="mt-1">
              <input
                type="radio"
                id="fifo"
                name="cogs"
                value="fifo"
                checked={cogsMethod === "fifo"}
                onChange={(e) => setCogsMethod(e.target.value)}
                disabled={hasAnyReceipts}
                className="w-5 h-5 text-primary focus:ring-primary disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="fifo" className={`font-bold text-base ${hasAnyReceipts ? 'text-on-surface-variant cursor-not-allowed' : 'text-on-surface cursor-pointer'}`}>Nhập trước, Xuất trước (FIFO)</label>
              <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                Phù hợp với các mặt hàng có hạn sử dụng (Thực phẩm, Dược phẩm). Hệ thống sẽ trừ xuất kho vào những lô hàng được nhập vào kho sớm nhất.
              </p>
              {cogsMethod === "fifo" && (
                <div className="mt-3 bg-amber-50 text-amber-800 p-3 rounded-lg text-xs flex items-start gap-2 border border-amber-100">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span><strong>Lưu lưu:</strong> Chuyển sang FIFO đòi hỏi hệ thống phải lưu trữ lịch sử tồn kho theo từng lô (Batch). Có thể sẽ mất thời gian tính toán nếu đổi phương pháp giữa chừng.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-surface-container-high flex justify-end">
          <button onClick={handleSaveSettings} className="px-6 py-2.5 bg-primary text-white rounded-lg font-bold shadow-sm hover:bg-primary-container transition-colors">
            Lưu Cài Đặt
          </button>
        </div>
      </div>
    </div>
  );
}
