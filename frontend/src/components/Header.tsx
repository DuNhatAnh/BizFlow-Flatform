"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface HeaderProps {
  showGreeting?: boolean;
  title?: string;
  subtitle?: string;
}

export default function Header({ showGreeting = true, title, subtitle }: HeaderProps) {
  const [time, setTime] = useState<Date | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("bizflow_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      }
    } catch {}

    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDateTime = (date: Date | null) => {
    if (!date) return "Đang tải...";
    const optionsDate: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' };
    const optionsTime: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' };
    
    let datePart = date.toLocaleDateString('vi-VN', optionsDate);
    datePart = datePart.charAt(0).toUpperCase() + datePart.slice(1);
    const timePart = date.toLocaleTimeString('vi-VN', optionsTime);
    
    return `${datePart} - ${timePart}`;
  };

  return (
    <header className={`flex items-center justify-between ${showGreeting ? "mb-8" : "mb-6"}`}>
      <div>
        {showGreeting ? (
          <>
            <h1 className="text-3xl font-bold text-on-surface tracking-tight flex items-center gap-2">
              {userRole === "PlatformAdmin" ? "Xin chào, Quản trị viên!" :
               userRole === "Employee" ? "Xin chào, Nhân viên!" :
               "Xin chào, Chủ cửa hàng!"}
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              {userRole === "PlatformAdmin" ? "Chào mừng quay trở lại trang quản trị hệ thống BizFlow." :
               userRole === "Employee" ? "Hãy cùng tạo ra một ngày bán hàng tuyệt vời nhé!" :
               "Đây là tổng quan hoạt động kinh doanh của cửa hàng hôm nay."}
            </p>
          </>
        ) : (
          title && (
            <>
              <h2 className="text-2xl font-bold text-on-surface tracking-tight">{title}</h2>
              {subtitle && (
                <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>
              )}
            </>
          )
        )}
      </div>

      {/* Real-time Clock */}
      <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg border border-surface-container-high shadow-sm text-sm font-medium text-on-surface shrink-0">
        <Clock className="w-4 h-4 text-primary" />
        <span className="min-w-[240px] text-center">{formatDateTime(time)}</span>
      </div>
    </header>
  );
}

