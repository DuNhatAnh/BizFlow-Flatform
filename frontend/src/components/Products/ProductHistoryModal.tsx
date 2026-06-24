"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface HistoryItem {
  actionName: string;
  createdAt: string;
  changeDetails: string;
  actionBy: string;
}

interface ProductHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyData: HistoryItem[];
  isLoading: boolean;
}

export default function ProductHistoryModal({
  isOpen,
  onClose,
  historyData,
  isLoading
}: ProductHistoryModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
    }
  }, [isOpen, historyData]);

  if (!isOpen) return null;

  const totalPages = Math.ceil(historyData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = historyData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col transform transition-all scale-100 max-h-[85vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b bg-surface-container-low rounded-t-2xl">
          <h3 className="text-lg font-bold text-slate-800">Lịch sử thao tác sản phẩm</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-on-surface-variant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="text-center py-8 text-slate-500 flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-3"></div>
              Đang tải lịch sử...
            </div>
          ) : historyData.length === 0 ? (
            <div className="text-center py-8 text-slate-500">Chưa có lịch sử thao tác nào.</div>
          ) : (
            <div className="space-y-4">
              {paginatedHistory.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 border rounded-xl bg-slate-50 hover:border-primary/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">{item.actionBy?.[0] || 'S'}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-800">{item.actionName}</span>
                      <span className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{item.changeDetails}</p>
                    <p className="text-xs text-slate-400 mt-2">Người thực hiện: <span className="font-semibold">{item.actionBy}</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History Pagination Controls */}
        {!isLoading && historyData.length > 0 && (
          <div className="p-4 border-t border-surface-container-high flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container-low/30 rounded-b-2xl">
            <div className="text-sm text-on-surface-variant">
              Hiển thị <span className="font-bold text-on-surface">{startIndex + 1}</span> - <span className="font-bold text-on-surface">{Math.min(startIndex + itemsPerPage, historyData.length)}</span> / <span className="font-bold text-on-surface">{historyData.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(1)} 
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-outline-variant hover:bg-white hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit transition-colors"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-outline-variant hover:bg-white hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-4 py-1.5 text-sm font-bold text-on-surface bg-white border border-outline-variant rounded-lg mx-1 shadow-sm">
                {currentPage} / {totalPages || 1}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-outline-variant hover:bg-white hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentPage(totalPages)} 
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-outline-variant hover:bg-white hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit transition-colors"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
