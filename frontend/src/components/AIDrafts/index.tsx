import React from "react";
import { Mic, Sparkles } from "lucide-react";
import AIDraftCard from "./AIDraftCard";

interface AIDraftsProps {
  aiDrafts: any[];
  approveDraft: (draft: any) => void;
  rejectDraft: (draftId: string) => void;
}

export default function AIDrafts({ aiDrafts, approveDraft, rejectDraft }: AIDraftsProps) {
  return (
    <div className="space-y-6">
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex items-start gap-4">
        <div className="p-3 bg-primary text-white rounded-xl">
          <Mic className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h3 className="font-bold text-on-surface text-base">
            Hộp thư nhận đơn nháp bằng Giọng nói & Tin nhắn AI
          </h3>
          <p className="text-sm text-on-surface-variant mt-1.5 leading-relaxed">
            Các đơn hàng đặt tự động qua các cuộc gọi ghi âm hoặc tin nhắn Zalo gửi từ Khách hàng được Module AI trích xuất và phân tích thực thể. Nhân viên cần rà soát lại thông tin trước khi duyệt chính thức vào sổ sách.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {aiDrafts.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-surface-container-high text-center shadow-card text-on-surface-variant/60">
            <Sparkles className="w-10 h-10 text-primary mx-auto mb-3 opacity-50" />
            Hiện không có đơn hàng nháp AI nào cần duyệt.
          </div>
        ) : (
          aiDrafts.map((draft) => (
            <AIDraftCard
              key={draft.id}
              draft={draft}
              onApprove={approveDraft}
              onReject={rejectDraft}
            />
          ))
        )}
      </div>
    </div>
  );
}
