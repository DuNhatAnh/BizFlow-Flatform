"use client";

import React, { useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, User, CheckCircle2 } from "lucide-react";

interface ShiftAssignment {
  id: string;
  userId: string;
  userName: string;
  workShiftId: string;
  shiftName: string;
  date: string;
  status?: string;
  startTime?: string;
  endTime?: string;
}

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const getDaysInWeek = (startDate: Date) => {
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d;
  });
};

const formatDateAPI = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const d = new Date(date.getTime() - (offset * 60 * 1000));
  return d.toISOString().split("T")[0];
};

const formatDateDisplay = (date: Date) => date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
const getDayName = (date: Date) => {
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return days[date.getDay()];
};

export default function EmployeeSchedule() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getStartOfWeek(new Date()));
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ id?: string; fullname: string } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("bizflow_user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchAssignments();
    }
  }, [currentWeekStart, user]);

  const getAuthHeaders = (): Record<string, string> => {
    const userStr = localStorage.getItem("bizflow_user");
    if (!userStr) return {};
    try {
      const u = JSON.parse(userStr);
      return {
        "Authorization": `Bearer ${u.token}`,
        "X-Tenant-Id": u.tenantId || "",
        "Content-Type": "application/json"
      };
    } catch (e) {
      return {};
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const startDate = formatDateAPI(currentWeekStart);
      const endDateDate = new Date(currentWeekStart);
      endDateDate.setDate(endDateDate.getDate() + 6);
      const endDate = formatDateAPI(endDateDate);

      const res = await fetch(`http://localhost:5178/api/shifts/assignments?startDate=${startDate}&endDate=${endDate}`, {
        headers: getAuthHeaders()
      });
      if (res.status === 401) { window.location.href = "/login"; return; }
      if (res.ok) {
        const data = await res.json();
        // Option 1: Filter only assignments for current user
        // Option 2: Keep all to show co-workers. Let's filter to current user for "My Schedule" focus, 
        // but maybe later add a toggle.
        const myAssignments = data.filter((a: any) => a.userId === user?.id);
        setAssignments(myAssignments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const prevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const today = new Date();
  const todayStr = formatDateAPI(today);
  const days = getDaysInWeek(currentWeekStart);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-surface-container-high overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-surface-container-low bg-surface-container-lowest">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-on-surface">
              Tuần {formatDateDisplay(days[0])} - {formatDateDisplay(days[6])}
            </h3>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-low rounded-lg p-1">
            <button
              onClick={prevWeek}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-on-surface-variant"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentWeekStart(getStartOfWeek(new Date()))}
              className="px-3 py-1 text-sm font-medium hover:bg-white hover:shadow-sm rounded-md transition-all text-on-surface"
            >
              Hiện tại
            </button>
            <button
              onClick={nextWeek}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-on-surface-variant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-on-surface-variant">Đang tải lịch làm việc...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-surface-container-low">
            {days.map((date) => {
              const dateStr = formatDateAPI(date);
              const isToday = dateStr === todayStr;
              const dayAssignments = assignments.filter((a) => a.date.startsWith(dateStr));

              return (
                <div key={dateStr} className={`flex flex-col min-h-[250px] ${isToday ? 'bg-primary/5' : ''}`}>
                  <div className={`p-3 text-center border-b border-surface-container-low ${isToday ? 'bg-primary/10 border-primary/20' : 'bg-surface-container-lowest'}`}>
                    <div className={`text-xs font-semibold mb-1 ${isToday ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {getDayName(date)}
                    </div>
                    <div className={`text-lg font-bold ${isToday ? 'text-primary' : 'text-on-surface'}`}>
                      {date.getDate()}
                    </div>
                  </div>
                  
                  <div className="flex-1 p-2 space-y-2">
                    {dayAssignments.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-on-surface-variant/50 italic">
                        Nghỉ
                      </div>
                    ) : (
                      dayAssignments.map((assignment) => (
                        <div 
                          key={assignment.id} 
                          className="bg-white border border-outline-variant rounded-lg p-2.5 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-on-surface">
                              {assignment.shiftName}
                            </span>
                            {assignment.status === "Published" && (
                              <span title="Đã chốt">
                                <CheckCircle2 className="w-3 h-3 text-success" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant mb-1">
                            <Clock className="w-3 h-3" />
                            <span>Theo quy định ca</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
                            <MapPin className="w-3 h-3" />
                            <span>Tại cửa hàng</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-primary mb-1">Lưu ý khi làm việc</h4>
          <ul className="text-xs text-on-surface-variant space-y-1 list-disc pl-4">
            <li>Vui lòng có mặt trước giờ làm việc 5-10 phút để chuẩn bị.</li>
            <li>Thực hiện check-in / check-out tại máy POS của cửa hàng.</li>
            <li>Nếu có việc đột xuất không thể đi làm, vui lòng báo trước cho quản lý ít nhất 1 ngày.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
