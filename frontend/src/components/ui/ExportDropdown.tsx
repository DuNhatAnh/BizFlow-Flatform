"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, FileText, FileSpreadsheet, ChevronDown } from "lucide-react";

interface ExportDropdownProps {
  onExportExcel: () => void;
  onPrintTT88: () => void;
}

export default function ExportDropdown({ onExportExcel, onPrintTT88 }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-primary text-on-primary hover:bg-primary/90 rounded-lg text-sm font-medium shadow-sm transition-all flex items-center gap-2"
      >
        <Download size={16} />
        <span>Xuất dữ liệu</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-surface-container-high py-2 z-[100] animate-in fade-in zoom-in-95 duration-100">
          <button 
            onClick={() => { setIsOpen(false); onPrintTT88(); }}
            className="w-full text-left px-4 py-3 text-sm hover:bg-surface-container-low flex items-center gap-3 transition-colors text-on-surface"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <div className="font-semibold text-[13px]">In biểu mẫu (chuẩn TT88)</div>
              <div className="text-xs text-on-surface-variant mt-0.5">Dùng để ký tên, nộp cơ quan Thuế</div>
            </div>
          </button>
          
          <div className="h-px bg-surface-container my-1 mx-4"></div>

          <button 
            onClick={() => { setIsOpen(false); onExportExcel(); }}
            className="w-full text-left px-4 py-3 text-sm hover:bg-surface-container-low flex items-center gap-3 transition-colors text-on-surface"
          >
            <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div className="font-semibold text-[13px]">Xuất file Excel (.xlsx)</div>
              <div className="text-xs text-on-surface-variant mt-0.5">Lọc dữ liệu, tính toán lại, nộp HTKK</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
