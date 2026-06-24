import React, { useState, useEffect } from "react";
import { Mic, Sparkles, Send, Square, Loader2, Info } from "lucide-react";
import AIDraftCard from "./AIDraftCard";
import DraftEditModal from "./DraftEditModal";
import DraftFeedbackModal from "./DraftFeedbackModal";

interface AIDraftsProps {
  aiDrafts: any[];
  approveDraft: (draft: any) => void;
  rejectDraft: (draftId: string) => void;
  rawProducts: any[];
  customers: any[];
  setAiDrafts: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function AIDrafts({
  aiDrafts,
  approveDraft,
  rejectDraft,
  rawProducts,
  customers,
  setAiDrafts,
}: AIDraftsProps) {
  // Modal states
  const [selectedDraftForEdit, setSelectedDraftForEdit] = useState<any | null>(null);
  const [selectedDraftForFeedback, setSelectedDraftForFeedback] = useState<any | null>(null);

  // AI input states
  const [textPrompt, setTextPrompt] = useState<string>("");
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);
  
  // Recording states
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const recordingIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setRecordingSeconds(0);
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/wav" });
        stream.getTracks().forEach((track) => track.stop());
        await handleProcessVoiceOrder(audioBlob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Vui lòng cho phép quyền sử dụng Microphone trên trình duyệt để ghi âm!");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Helper to compile extracted AI JSON into Backend Order Draft schema
  const compileDraftOrderPayload = (aiResponse: any) => {
    const stored = localStorage.getItem("bizflow_user");
    if (!stored) return null;
    const userObj = JSON.parse(stored);

    // 1. Resolve Customer ID
    const matchedCust = customers.find((c) =>
      c.fullname.toLowerCase().includes(aiResponse.customer_name?.toLowerCase() || "")
    );

    // 2. Resolve Items
    const orderItems = aiResponse.items.map((item: any) => {
      // Find product
      const matchedProd = rawProducts.find((p) =>
        p.name.toLowerCase().includes(item.product_name.toLowerCase())
      );
      
      // Find matching unit or default unit
      const matchedUnit = matchedProd?.units?.find((u: any) =>
        u.unitName.toLowerCase().includes(item.unit?.toLowerCase() || "")
      ) || matchedProd?.units?.[0];

      return {
        productId: matchedProd ? matchedProd.id : "00000000-0000-0000-0000-000000000000",
        productUnitId: matchedUnit ? matchedUnit.id : null,
        quantity: item.quantity,
        unitPrice: matchedUnit ? matchedUnit.price : 0,
        totalPrice: (matchedUnit ? matchedUnit.price : 0) * item.quantity,
      };
    });

    const totalAmount = orderItems.reduce((sum: number, oi: any) => sum + oi.totalPrice, 0);

    return {
      tenantId: userObj.tenantId || "11111111-1111-1111-1111-111111111111",
      customerId: matchedCust ? matchedCust.id : null,
      customerName: matchedCust ? matchedCust.fullname : aiResponse.customer_name || "Khách Lẻ",
      createdBy: userObj.id || "aaaabbbb-cccc-dddd-eeee-777788889999",
      totalAmount: totalAmount,
      paymentMethod: aiResponse.payment_method === "Debt" ? "Debt" : "Cash",
      status: "Draft",
      orderSource: aiResponse.raw_transcript.includes("ghi âm") || isRecording ? "AI_Voice" : "AI_Text",
      orderItems: orderItems,
    };
  };

  const handleProcessTextOrder = async () => {
    const text = textPrompt.trim();
    if (!text) return;

    setIsProcessingAI(true);
    const stored = localStorage.getItem("bizflow_user");
    if (!stored) return;
    const userObj = JSON.parse(stored);

    try {
      // 1. Call Python FastAPI AI Service
      const res = await fetch("http://localhost:8000/api/text-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text,
          tenant_id: userObj.tenantId || "11111111-1111-1111-1111-111111111111",
        }),
      });

      if (!res.ok) throw new Error("AI Service error");
      const aiResponse = await res.json();

      // 2. Post draft to .NET API
      const draftPayload = compileDraftOrderPayload(aiResponse);
      if (draftPayload) {
        const createRes = await fetch("http://localhost:5178/api/orders/draft", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Tenant-Id": userObj.tenantId || "11111111-1111-1111-1111-111111111111",
            Authorization: `Bearer ${userObj.token}`,
          },
          body: JSON.stringify(draftPayload),
        });

        if (createRes.ok) {
          // Successfully created draft order. SignalR will update the page.tsx, 
          // but let's refresh directly if needed or clear text.
          setTextPrompt("");
        } else {
          alert("Lỗi khi đẩy đơn nháp lên máy chủ hệ thống.");
        }
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi kết nối tới Trợ lý AI Service.");
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleProcessVoiceOrder = async (audioBlob: Blob) => {
    setIsProcessingAI(true);
    const stored = localStorage.getItem("bizflow_user");
    if (!stored) return;
    const userObj = JSON.parse(stored);

    try {
      // Create form data with audio file
      const formData = new FormData();
      formData.append("file", audioBlob, "voice_command.wav");

      // 1. Call Python FastAPI Voice API
      const res = await fetch(
        `http://localhost:8000/api/voice-order?tenant_id=${
          userObj.tenantId || "11111111-1111-1111-1111-111111111111"
        }`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("AI Voice Service error");
      const aiResponse = await res.json();

      // 2. Post draft to .NET API
      const draftPayload = compileDraftOrderPayload(aiResponse);
      if (draftPayload) {
        const createRes = await fetch("http://localhost:5178/api/orders/draft", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Tenant-Id": userObj.tenantId || "11111111-1111-1111-1111-111111111111",
            Authorization: `Bearer ${userObj.token}`,
          },
          body: JSON.stringify(draftPayload),
        });

        if (!createRes.ok) {
          alert("Lỗi khi đẩy đơn hàng nháp bằng giọng nói lên máy chủ.");
        }
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi khi gửi tệp ghi âm giọng nói lên Trợ lý AI.");
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleSaveDraft = (updatedDraft: any) => {
    // 1. Update in local state
    setAiDrafts(aiDrafts.map((d) => (d.id === updatedDraft.id ? updatedDraft : d)));
    
    // 2. Auto trigger checkout/confirm
    approveDraft(updatedDraft);
  };

  const handleReportAIErrorSubmit = async (feedback: { errorType: string; feedbackMessage: string }) => {
    if (!selectedDraftForFeedback) return;
    const stored = localStorage.getItem("bizflow_user");
    if (!stored) return;
    const userObj = JSON.parse(stored);

    const draft = selectedDraftForFeedback;
    const orderItemsSummary = draft.items.map((i: any) => `${i.name} (${i.qty} ${i.unit})`).join(", ");

    const requestBody = {
      performedBy: userObj.id || "aaaabbbb-cccc-dddd-eeee-777788889999",
      rawTranscript: draft.rawText,
      errorType: feedback.errorType,
      feedbackMessage: feedback.feedbackMessage,
      correctedCartSummary: orderItemsSummary,
    };

    try {
      const res = await fetch(
        `http://localhost:5178/api/orders/${draft.id}/report-ai-error?tenantId=${
          userObj.tenantId || "11111111-1111-1111-1111-111111111111"
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Tenant-Id": userObj.tenantId || "11111111-1111-1111-1111-111111111111",
            Authorization: `Bearer ${userObj.token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (res.ok) {
        // Success alert
        alert(`Báo cáo lỗi thành công!\n- Loại lỗi: ${feedback.errorType}\n- Ý kiến phản hồi đã được lưu trữ vào Audit Log.`);
      } else {
        alert("Lỗi khi gửi báo cáo lỗi dịch AI lên hệ thống.");
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi kết nối mạng khi gửi báo cáo.");
    }
  };

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="space-y-6">
      
      {/* AI Control Center Box */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <h3 className="font-extrabold text-on-surface text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" /> Trợ lý Đơn hàng AI tại Quầy
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-2xl">
              Nhân viên có thể trực tiếp ghi âm giọng nói (Speech-to-Text) hoặc nhập văn bản mô tả để Trợ lý AI tự động sinh đơn hàng nháp siêu tốc. Rà soát, nghe lại ghi âm gốc và bấm Duyệt để xuất kho in hóa đơn.
            </p>
          </div>

          {/* Controls: Record & Text Input */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            
            {/* Record button */}
            <div className="flex items-center gap-3">
              {isRecording ? (
                <button
                  onClick={handleStopRecording}
                  type="button"
                  className="px-5 py-3 rounded-xl bg-error hover:bg-error/90 text-white font-bold text-sm flex items-center gap-2 shadow-md animate-pulse focus:outline-none transition-all"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Dừng Ghi ({formatSeconds(recordingSeconds)})</span>
                </button>
              ) : (
                <button
                  onClick={handleStartRecording}
                  disabled={isProcessingAI}
                  type="button"
                  className={`px-5 py-3 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-sm flex items-center gap-2 shadow-sm focus:outline-none transition-all ${
                    isProcessingAI ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>Ghi âm giọng nói</span>
                </button>
              )}
            </div>

            {/* Divider */}
            <span className="text-xs text-on-surface-variant font-bold hidden sm:inline">HOẶC</span>

            {/* Quick Text Input */}
            <div className="flex items-center gap-2 w-full sm:w-[320px] bg-white border border-outline-variant rounded-xl px-3 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <input
                type="text"
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isProcessingAI) {
                    handleProcessTextOrder();
                  }
                }}
                disabled={isProcessingAI}
                placeholder="Nhập chữ: Bán cho Anh Nam 3 lốc bia..."
                className="w-full text-sm bg-transparent outline-none focus:ring-0"
              />
              <button
                onClick={handleProcessTextOrder}
                disabled={isProcessingAI || !textPrompt.trim()}
                type="button"
                className={`p-1.5 rounded-lg text-primary bg-primary/10 hover:bg-primary/20 transition-all ${
                  isProcessingAI || !textPrompt.trim() ? "opacity-45 cursor-not-allowed" : ""
                }`}
                title="Gửi câu lệnh để trích xuất đơn hàng"
              >
                {isProcessingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>

          </div>
        </div>

        {/* Small hint block */}
        <div className="mt-4 pt-3 border-t border-primary/10 flex items-center gap-2 text-xs text-on-surface-variant">
          <Info className="w-4 h-4 text-primary" />
          <span><b>Hướng dẫn sử dụng:</b> Bạn có thể nói hoặc nhập câu lệnh tiếng Việt tự nhiên bất kỳ để tự động tạo đơn nháp (ví dụ: <i>"Lấy cho chú Ba 5 bao xi măng Hà Tiên ghi nợ nhé"</i> hoặc <i>"Bán cho Anh Nam 3 lốc bia Saigon chuyển khoản"</i>).</span>
        </div>

      </div>

      {/* Main drafts list */}
      <div className="grid grid-cols-1 gap-6">
        {aiDrafts.length === 0 ? (
          <div className="bg-white p-16 rounded-2xl border border-surface-container-high text-center shadow-card text-on-surface-variant/50">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 opacity-40 animate-bounce" />
            <p className="font-semibold">Hộp thư đơn hàng nháp AI hiện tại đang trống.</p>
            <p className="text-xs mt-1">Đơn đặt hàng tự động từ mobile hoặc dictation tại quầy sẽ hiển thị thời gian thực ở đây.</p>
          </div>
        ) : (
          aiDrafts.map((draft) => (
            <AIDraftCard
              key={draft.id}
              draft={draft}
              onApprove={approveDraft}
              onReject={rejectDraft}
              onEdit={(d) => setSelectedDraftForEdit(d)}
              onReportError={(d) => setSelectedDraftForFeedback(d)}
            />
          ))
        )}
      </div>

      {/* Draft Edit Modal */}
      <DraftEditModal
        isOpen={selectedDraftForEdit !== null}
        onClose={() => setSelectedDraftForEdit(null)}
        draft={selectedDraftForEdit}
        onSave={handleSaveDraft}
        rawProducts={rawProducts}
        customers={customers}
      />

      {/* AI Feedback Error Modal */}
      <DraftFeedbackModal
        isOpen={selectedDraftForFeedback !== null}
        onClose={() => setSelectedDraftForFeedback(null)}
        draft={selectedDraftForFeedback}
        onSubmit={handleReportAIErrorSubmit}
      />

    </div>
  );
}
