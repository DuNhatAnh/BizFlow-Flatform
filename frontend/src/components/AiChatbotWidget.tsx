"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, MessageCircle, X, Send, Bot, RefreshCw, HelpCircle, CheckCircle, AlertCircle } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

const API_CHATBOT = "http://localhost:8000/api/ai/chatbot";

const SUGGESTIONS = [
  "Cách tính giá vốn bình quân gia quyền?",
  "7 loại sổ kế toán theo Thông tư 88?",
  "Đơn hàng từ AI xử lý như thế nào?",
  "Làm sao đổi gói dịch vụ cho cửa hàng?"
];

export default function AiChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Xin chào! Tôi là Trợ lý AI của **BizFlow Platform**. Tôi có thể giải đáp các thắc mắc về kế toán Thông tư 88, cách tính giá vốn (COGS), và cách vận hành các tính năng bán hàng. Bạn cần tôi hỗ trợ gì hôm nay?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    // 1. Add User Message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmed,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // 2. Query RAG Chatbot API
    try {
      const res = await fetch(API_CHATBOT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: trimmed })
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: data.answer || "Tôi không nhận được câu trả lời thích hợp.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        const errData = await res.json();
        const botMsg: Message = {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: `⚠️ **Lỗi:** ${errData.detail || "Không thể kết nối với dịch vụ AI."}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (e) {
      const botMsg: Message = {
        id: `bot-err-${Date.now()}`,
        sender: "bot",
        text: "⚠️ **Lỗi kết nối:** Máy chủ AI đang ngoại tuyến. Vui lòng kiểm tra Docker containers.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const formatText = (text: string) => {
    // Basic Markdown formatting helper
    return text.split("\n").map((para, i) => {
      // Bold text mapping: **text**
      let formatted = para.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      // Bullet points
      if (formatted.startsWith("- ") || formatted.startsWith("* ")) {
        return (
          <li key={i} className="ml-4 list-disc text-sm text-on-surface-variant leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatted.substring(2) }} />
        );
      }
      return (
        <p key={i} className="text-sm text-on-surface-variant leading-relaxed mb-1.5"
           dangerouslySetInnerHTML={{ __html: formatted }} />
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Chat Window */}
      {isOpen && (
        <div className="w-[380px] h-[520px] mb-4 bg-white/95 rounded-2xl shadow-2xl border border-surface-container-high flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 backdrop-blur-md">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-primary to-primary/80 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  Trợ lý AI BizFlow
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
                </h3>
                <p className="text-[10px] text-white/70">Online · RAG Knowledge Base</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body / Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 custom-scrollbar">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {msg.sender === "bot" && (
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  msg.sender === "user" 
                    ? "bg-primary text-white rounded-tr-none" 
                    : "bg-white text-on-surface border border-surface-container-high rounded-tl-none"
                }`}>
                  {msg.sender === "user" ? (
                    <p className="leading-relaxed">{msg.text}</p>
                  ) : (
                    <div className="space-y-1">{formatText(msg.text)}</div>
                  )}
                  <span className={`text-[9px] mt-1 block text-right ${msg.sender === "user" ? "text-white/60" : "text-on-surface-variant/50"}`}>
                    {msg.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-2.5 items-center">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-white border border-surface-container-high rounded-2xl rounded-tl-none px-4 py-3 text-sm shadow-sm flex items-center gap-2 text-on-surface-variant">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span>AI đang phân tích tài liệu...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length === 1 && !loading && (
            <div className="px-4 py-2 bg-slate-50 shrink-0 border-t border-surface-container-low">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-primary" /> Câu hỏi gợi ý:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-[11px] text-left px-2.5 py-1.5 bg-white border border-surface-container-high hover:border-primary hover:text-primary rounded-lg text-on-surface-variant transition-colors leading-tight"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 border-t border-surface-container-high bg-white shrink-0 flex items-center gap-2">
            <input
              type="text"
              placeholder="Nhập câu hỏi của bạn..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
              className="flex-1 bg-surface-container-low border border-surface-container-high rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={loading || !input.trim()}
              className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-primary/20 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-tr from-primary to-primary/80 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 group relative border border-white/20"
      >
        {isOpen ? (
          <X className="w-6 h-6 transition-transform group-hover:rotate-90 duration-300" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            </span>
          </>
        )}
      </button>
    </div>
  );
}
