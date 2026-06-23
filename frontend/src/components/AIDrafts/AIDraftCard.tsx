import React from "react";
import { Sparkles, CreditCard, Trash2, Check } from "lucide-react";
import DraftItemRow from "./DraftItemRow";

interface AIDraftCardProps {
  draft: {
    id: string;
    customer: string;
    time: string;
    confidence: string;
    rawText: string;
    items: any[];
    payment: string;
  };
  onApprove: (draft: any) => void;
  onReject: (draftId: string) => void;
}

export default function AIDraftCard({ draft, onApprove, onReject }: AIDraftCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-surface-container-high shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between gap-6">
      <div className="space-y-4 flex-1">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-surface-container-high text-on-surface text-xs font-bold rounded-full">
            {draft.customer}
          </span>
          <span className="text-xs text-on-surface-variant">{draft.time}</span>
          <span className="ml-auto md:ml-0 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-md border border-emerald-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI Khớp: {draft.confidence}
          </span>
        </div>

        <div className="bg-surface-container-low p-3.5 rounded-lg border border-outline-variant">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Ghi âm/Văn bản thô:
          </p>
          <p className="text-sm italic text-on-surface font-sans">"{draft.rawText}"</p>
        </div>

        <div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Hàng hóa trích xuất:
          </p>
          <div className="space-y-2">
            {draft.items.map((item: any, idx: number) => (
              <DraftItemRow key={idx} item={item} />
            ))}
          </div>
        </div>
      </div>

      <div className="md:border-l border-surface-container-high md:pl-6 flex flex-col justify-between items-stretch md:w-[220px] gap-4">
        <div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Hình thức thanh toán
          </p>
          <p className="text-sm font-semibold text-primary mt-1 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-on-surface-variant" />
            {draft.payment}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onReject(draft.id)}
            className="flex-1 py-2 bg-error/5 hover:bg-error/10 text-error text-xs font-bold rounded-lg border border-error/20 flex items-center justify-center gap-1 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> Hủy
          </button>
          <button
            onClick={() => onApprove(draft)}
            className="flex-1 py-2 bg-primary hover:bg-primary-container text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all shadow-sm"
          >
            <Check className="w-3.5 h-3.5" /> Duyệt
          </button>
        </div>
      </div>
    </div>
  );
}
