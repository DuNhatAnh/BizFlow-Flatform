"use client";

import React from "react";
import { Calendar, ChevronDown } from "lucide-react";

interface HeaderProps {
  showGreeting?: boolean;
}

export default function Header({ showGreeting = true }: HeaderProps) {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  let formattedDate = date.toLocaleDateString('vi-VN', options);
  // Capitalize the first letter (e.g. "Thứ năm, 11 tháng 6, 2026")
  formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        {showGreeting && (
          <>
            <h1 className="text-3xl font-bold text-on-surface tracking-tight flex items-center gap-2">
              Xin chào, Chủ cửa hàng! <span className="animate-bounce">👋</span>
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Đây là tổng quan hoạt động kinh doanh của cửa hàng hôm nay.
            </p>
          </>
        )}
      </div>

      {/* Date Filter Dropdown */}
      <button className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg border border-surface-container-high shadow-sm hover:bg-surface-container-low transition-colors text-sm font-medium text-on-surface">
        <Calendar className="w-4 h-4 text-on-surface-variant" />
        <span>{formattedDate}</span>
        <ChevronDown className="w-4 h-4 text-on-surface-variant ml-1" />
      </button>
    </header>
  );
}
