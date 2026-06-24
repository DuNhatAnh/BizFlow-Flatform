import React, { useState, useRef, useEffect } from "react";
import { Sparkles, CreditCard, Trash2, Check, Edit3, AlertTriangle, Play, Pause, Volume2, Mic, MessageSquare } from "lucide-react";
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
    audioUrl?: string;
    rawDraft?: any;
  };
  onApprove: (draft: any) => void;
  onReject: (draftId: string) => void;
  onEdit: (draft: any) => void;
  onReportError: (draft: any) => void;
}

export default function AIDraftCard({
  draft,
  onApprove,
  onReject,
  onEdit,
  onReportError,
}: AIDraftCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Set default audio url if missing and source is voice
  const isVoice = draft.rawDraft?.orderSource === "AI_Voice" || draft.audioUrl || draft.confidence === "98%";
  const audioUrl = draft.audioUrl || (draft.id.includes("2222") ? "/audio/draft_anhnam.wav" : "/audio/draft_chuba.wav");

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Audio playback error:", err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const confidenceValue = parseInt(draft.confidence);
  const isHighConfidence = confidenceValue >= 90;

  return (
    <div className="bg-white p-6 rounded-2xl border border-surface-container-high shadow-card hover:shadow-lg hover:border-primary/10 transition-all flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden">
      
      {/* Visual Accent for High/Med Confidence */}
      <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${isHighConfidence ? "bg-emerald-500" : "bg-amber-500"}`} />

      {/* Main Details Panel */}
      <div className="space-y-4 flex-1 pl-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3.5 py-1 bg-primary/5 text-primary text-xs font-extrabold rounded-full">
            {draft.customer}
          </span>
          <span className="text-xs text-on-surface-variant font-medium">{draft.time}</span>
          
          {/* Source badge */}
          <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded-md flex items-center gap-1">
            {isVoice ? (
              <>
                <Mic className="w-3 h-3 text-primary animate-pulse" />
                Ghi âm từ xa
              </>
            ) : (
              <>
                <MessageSquare className="w-3 h-3 text-secondary" />
                Văn bản/Zalo
              </>
            )}
          </span>

          <span className={`ml-auto md:ml-0 px-2.5 py-0.5 text-xs font-semibold rounded-md border flex items-center gap-1 ${
            isHighConfidence
              ? "bg-emerald-50/50 text-emerald-600 border-emerald-200"
              : "bg-amber-50/50 text-amber-600 border-amber-200"
          }`}>
            <Sparkles className="w-3.5 h-3.5" /> AI Khớp: {draft.confidence}
          </span>
        </div>

        {/* Natural Language Prompt & Audio Player */}
        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Hội thoại gốc của khách:
            </p>
            <p className="text-sm italic text-on-surface font-sans leading-relaxed">"{draft.rawText}"</p>
          </div>

          {/* Render Audio Player if Voice source */}
          {isVoice && (
            <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-outline-variant/40 shadow-sm self-start md:self-auto">
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleAudioEnded}
                preload="metadata"
              />
              <button
                onClick={togglePlay}
                type="button"
                className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all focus:outline-none"
                title={isPlaying ? "Tạm dừng" : "Nghe lại file ghi âm gốc"}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-primary" /> : <Play className="w-4 h-4 fill-primary translate-x-[1px]" />}
              </button>
              <div className="text-right">
                <p className="text-[9px] font-bold text-on-surface-variant flex items-center gap-0.5 uppercase tracking-wide">
                  <Volume2 className="w-2.5 h-2.5 text-primary" /> Ghi âm gốc
                </p>
                <p className="text-xs font-mono font-bold text-on-surface mt-0.5">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Extracted products list */}
        <div>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Hàng hóa trích xuất:
          </p>
          <div className="space-y-2">
            {draft.items.map((item: any, idx: number) => (
              <DraftItemRow key={idx} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Control panel (Right side / Bottom on mobile) */}
      <div className="md:border-l border-surface-container-high md:pl-6 flex flex-col justify-between items-stretch md:w-[220px] gap-4">
        <div>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
            Hình thức thanh toán
          </p>
          <p className="text-sm font-semibold text-primary mt-1 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-on-surface-variant" />
            {draft.payment}
          </p>
        </div>

        <div className="space-y-2">
          {/* Confirmed / Reject Row */}
          <div className="flex gap-2">
            <button
              onClick={() => onReject(draft.id)}
              className="flex-1 py-2 bg-error/5 hover:bg-error/10 text-error text-xs font-bold rounded-lg border border-error/20 flex items-center justify-center gap-1 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Từ chối
            </button>
            <button
              onClick={() => onApprove(draft)}
              className="flex-1 py-2 bg-primary hover:bg-primary-container text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all shadow-sm"
            >
              <Check className="w-3.5 h-3.5" /> Duyệt đơn
            </button>
          </div>

          {/* Edit / Feedback Row */}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(draft)}
              className="flex-1 py-2 bg-secondary/5 hover:bg-secondary/10 text-secondary text-xs font-bold rounded-lg border border-secondary/20 flex items-center justify-center gap-1 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" /> Sửa đổi
            </button>
            <button
              onClick={() => onReportError(draft)}
              className="flex-1 py-2 bg-amber-500/5 hover:bg-amber-500/10 text-amber-600 text-xs font-bold rounded-lg border border-amber-500/20 flex items-center justify-center gap-1 transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Báo lỗi AI
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
