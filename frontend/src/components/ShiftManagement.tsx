"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Calendar, Clock, Users, MapPin, ChevronRight, Check, CheckCircle2, AlertCircle, FileText, GripVertical, ChevronLeft, Save } from "lucide-react";
import AttendanceReport from "@/components/AttendanceReport";

interface WorkShift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  gracePeriodMinutes: number;
  minimumStaffCount?: number;
}

interface ShiftAssignment {
  id: string;
  userId: string;
  userName: string;
  workShiftId: string;
  shiftName: string;
  date: string;
  status?: string;
}

interface Staff {
  id: string;
  username: string;
  fullname: string;
  role: string;
}

// Helpers for weekly calendar
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

export function ShiftManagement() {
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);

  const [activeTab, setActiveTab] = useState<"shifts" | "assignments" | "attendance">("shifts");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Drag & Drop state
  const [draggedShift, setDraggedShift] = useState<WorkShift | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ userId: string, date: string } | null>(null);

  // Weekly Grid state
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getStartOfWeek(new Date()));

  // Form states
  const [newShift, setNewShift] = useState({ name: "", startTime: "08:00", endTime: "17:00", gracePeriodMinutes: 5, minimumStaffCount: 1 });
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchShifts();
    fetchStaff();
  }, []);

  useEffect(() => {
    if (activeTab === "assignments") {
      fetchAssignments();
    }
  }, [activeTab, currentWeekStart]);

  const getAuthHeaders = (): Record<string, string> => {
    const userStr = localStorage.getItem("bizflow_user");
    if (!userStr) return {};
    try {
      const user = JSON.parse(userStr);
      return {
        "Authorization": `Bearer ${user.token}`,
        "X-Tenant-Id": user.tenantId || "",
        "Content-Type": "application/json"
      };
    } catch (e) {
      return {};
    }
  };

  const fetchShifts = async () => {
    try {
      const res = await fetch("http://localhost:5178/api/shifts", { headers: getAuthHeaders() });
      if (res.status === 401) { window.location.href = "/login"; return; }
      if (res.ok) setShifts(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch("http://localhost:5178/api/staff", { headers: getAuthHeaders() });
      if (res.status === 401) { window.location.href = "/login"; return; }
      if (res.ok) {
        const data = await res.json();
        const staffArray = data.items || data;
        setStaffList(staffArray.filter((u: any) => u.role === "Employee"));
      }
    } catch (err) {
      console.error(err);
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
        setAssignments(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingShiftId
        ? `http://localhost:5178/api/shifts/${editingShiftId}`
        : "http://localhost:5178/api/shifts";
      const method = editingShiftId ? "PUT" : "POST";

      const payload = {
        ...newShift,
        startTime: newShift.startTime.length === 5 ? newShift.startTime + ":00" : newShift.startTime,
        endTime: newShift.endTime.length === 5 ? newShift.endTime + ":00" : newShift.endTime
      };

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.status === 401) { window.location.href = "/login"; return; }
      if (res.ok) {
        setNewShift({ name: "", startTime: "08:00", endTime: "17:00", gracePeriodMinutes: 5, minimumStaffCount: 1 });
        showToast(editingShiftId ? "Cập nhật ca làm việc thành công!" : "Tạo ca làm việc thành công!", "success");
        setEditingShiftId(null);
        fetchShifts();
      } else {
        const text = await res.text();
        showToast("Lỗi máy chủ: " + text, "error");
      }
    } catch (err: any) {
      console.error(err);
      showToast("Lỗi kết nối: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (shift: WorkShift) => {
    setEditingShiftId(shift.id);
    setNewShift({
      name: shift.name,
      startTime: shift.startTime.slice(0, 5),
      endTime: shift.endTime.slice(0, 5),
      gracePeriodMinutes: shift.gracePeriodMinutes,
      minimumStaffCount: shift.minimumStaffCount || 1
    });
  };

  const cancelEdit = () => {
    setEditingShiftId(null);
    setNewShift({ name: "", startTime: "08:00", endTime: "17:00", gracePeriodMinutes: 5, minimumStaffCount: 1 });
  };

  const handleDeleteShift = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa ca làm việc này?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`http://localhost:5178/api/shifts/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        showToast("Đã xóa ca làm việc!", "success");
        fetchShifts();
      } else {
        showToast("Không thể xóa ca làm việc", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi xóa", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Xóa phân công này?")) return;
    try {
      const res = await fetch(`http://localhost:5178/api/shifts/assignments/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setAssignments(prev => prev.filter(a => a.id !== id));
        showToast("Đã xóa phân công!", "success");
      } else {
        showToast("Lỗi khi xóa phân công", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Lỗi kết nối", "error");
    }
  };

  const handleDrop = async (userId: string, date: string) => {
    if (!draggedShift) return;

    // Check if shift already assigned to this user on this date
    const alreadyAssigned = assignments.some(a => 
      a.userId === userId && 
      a.date.startsWith(date) && 
      a.workShiftId === draggedShift.id
    );

    if (alreadyAssigned) {
      showToast("Đã phân ca này rồi", "error");
      setDragOverCell(null);
      return;
    }

    // Optimistic UI Update
    const tempId = `temp-${Date.now()}`;
    const newAssignment: ShiftAssignment = {
      id: tempId,
      userId,
      userName: staffList.find(s => s.id === userId)?.fullname || "",
      workShiftId: draggedShift.id,
      shiftName: draggedShift.name,
      date: date,
      status: "Draft"
    };

    setAssignments(prev => [...prev, newAssignment]);
    setDragOverCell(null);

    try {
      const res = await fetch("http://localhost:5178/api/shifts/assignments", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          userId,
          workShiftId: draggedShift.id,
          date,
          status: "Draft"
        })
      });
      if (!res.ok) {
        showToast("Gán ca thất bại", "error");
        setAssignments(prev => prev.filter(a => a.id !== tempId)); // revert
      } else {
        fetchAssignments();
      }
    } catch (err) {
      console.error(err);
      showToast("Lỗi kết nối", "error");
      setAssignments(prev => prev.filter(a => a.id !== tempId)); // revert
    }
  };

  const weekDays = useMemo(() => getDaysInWeek(currentWeekStart), [currentWeekStart]);

  // Hours counter logic
  const calculateEmployeeHours = (userId: string) => {
    const userAssignments = assignments.filter(a => a.userId === userId && weekDays.some(d => a.date.startsWith(formatDateAPI(d))));
    return userAssignments.reduce((total, curr) => {
      const shift = shifts.find(s => s.id === curr.workShiftId);
      if (!shift) return total;
      
      const [startHour, startMin] = shift.startTime.split(':').map(Number);
      const [endHour, endMin] = shift.endTime.split(':').map(Number);
      let hours = endHour - startHour + (endMin - startMin) / 60;
      if (hours < 0) hours += 24; // overnight shift
      
      return total + hours;
    }, 0).toFixed(1);
  };

  const handlePublish = async () => {
    try {
      if (weekDays.length === 0) return;
      const startDate = formatDateAPI(weekDays[0]);
      const endDate = formatDateAPI(weekDays[6]);

      const res = await fetch("http://localhost:5178/api/shifts/assignments/publish", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ startDate, endDate })
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`Đã chốt thành công ${data.publishedCount} ca làm việc và gửi thông báo!`, "success");
        fetchAssignments();
      } else {
        showToast("Lỗi khi chốt lịch", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Lỗi kết nối", "error");
    }
  };

  const handleUnpublish = async () => {
    try {
      if (weekDays.length === 0) return;
      const startDate = formatDateAPI(weekDays[0]);
      const endDate = formatDateAPI(weekDays[6]);

      const res = await fetch("http://localhost:5178/api/shifts/assignments/unpublish", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ startDate, endDate })
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`Đã thu hồi thành công ${data.unpublishedCount} ca làm việc!`, "success");
        fetchAssignments();
      } else {
        showToast("Lỗi khi thu hồi lịch", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Lỗi kết nối", "error");
    }
  };

  return (
    <div className="p-4 sm:px-6 sm:pb-32 sm:pt-0 min-h-full bg-slate-50/50">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[70] px-6 py-3 rounded-full shadow-xl border animate-in slide-in-from-top-4 flex items-center gap-3 backdrop-blur-md ${toast.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : 'bg-red-500/90 border-red-400 text-white'
          }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-semibold text-sm drop-shadow-sm">{toast.message}</span>
        </div>
      )}

      {/* Header Row with Tabs and Draggable Shifts */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 -mt-6">
        {/* Modern Segmented Control */}
        <div className="flex justify-start shrink-0">
          <div className="inline-flex gap-1 bg-surface-container/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/50 shadow-sm relative overflow-hidden">
            <div className="absolute inset-y-1.5 bg-white rounded-xl shadow-sm transition-all duration-300 ease-out z-0"
              style={{
                left: activeTab === 'shifts' ? '6px' : activeTab === 'assignments' ? 'calc(33.33% + 2px)' : 'calc(66.66% - 2px)',
                width: 'calc(33.33% - 4px)'
              }}></div>

            <button
              onClick={() => setActiveTab("shifts")}
              className={`relative z-10 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-colors duration-300 w-44 ${activeTab === "shifts" ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              <Clock className="w-4 h-4" />
              Quản lý Ca
            </button>
            <button
              onClick={() => setActiveTab("assignments")}
              className={`relative z-10 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-colors duration-300 w-44 ${activeTab === "assignments" ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              <Calendar className="w-4 h-4" />
              Lịch Làm Việc
            </button>
            <button
              onClick={() => setActiveTab("attendance")}
              className={`relative z-10 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-colors duration-300 w-44 ${activeTab === "attendance" ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              <FileText className="w-4 h-4" />
              Báo cáo
            </button>
          </div>
        </div>

        {/* Source Draggable Shifts Panel (Horizontal) */}
        {activeTab === "assignments" && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2 xl:pb-0 w-full xl:w-auto scrollbar-hide">
            <span className="font-extrabold text-sm text-on-surface whitespace-nowrap flex items-center gap-1.5 shrink-0 bg-white/50 px-3 py-1.5 rounded-xl border border-white shadow-sm">
              <GripVertical className="w-4 h-4 text-primary" />
              Kéo thả Ca:
            </span>
            <div className="flex gap-2">
              {shifts.map(shift => (
                <div
                  key={shift.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggedShift(shift);
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  onDragEnd={() => {
                    setDraggedShift(null);
                    setDragOverCell(null);
                  }}
                  className="bg-white/80 border border-surface-container-high px-3 py-1.5 rounded-xl cursor-grab active:cursor-grabbing hover:border-primary/50 hover:shadow-md transition-all flex items-center gap-2 shrink-0"
                >
                  <span className="font-bold text-on-surface text-sm">{shift.name}</span>
                  <span className="text-xs font-semibold text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded-md">
                    {shift.startTime.slice(0, 5)} - {shift.endTime.slice(0, 5)}
                  </span>
                </div>
              ))}
              {shifts.length === 0 && (
                <span className="text-xs text-on-surface-variant italic py-1.5">Hãy tạo ca làm việc trước.</span>
              )}
            </div>
          </div>
        )}
      </div>

      {activeTab === "shifts" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Create/Edit Form */}
          <div className="lg:col-span-4 bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg shadow-primary/5 border border-white/60 h-fit relative">
            <h3 className="font-extrabold text-lg text-on-surface mb-5 flex items-center gap-2">
              <div className="w-2 h-6 bg-primary rounded-full"></div>
              {editingShiftId ? "Cập Nhật Ca Làm Việc" : "Tạo Ca Mới"}
            </h3>
            {editingShiftId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="absolute top-6 right-6 text-sm text-on-surface-variant hover:text-error hover:bg-error/10 px-3 py-1 rounded-full transition-colors font-medium"
              >
                Hủy
              </button>
            )}
            <form onSubmit={handleCreateOrUpdateShift} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-1.5 ml-1">Tên ca</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Ca Sáng"
                  value={newShift.name}
                  onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-surface-container-lowest/50 border border-surface-container-high rounded-2xl text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-1.5 ml-1">Giờ bắt đầu</label>
                  <input
                    type="time"
                    required
                    value={newShift.startTime}
                    onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-surface-container-lowest/50 border border-surface-container-high rounded-2xl text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-1.5 ml-1">Giờ kết thúc</label>
                  <input
                    type="time"
                    required
                    value={newShift.endTime}
                    onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-surface-container-lowest/50 border border-surface-container-high rounded-2xl text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-1.5 ml-1">Châm chước (Phút)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newShift.gracePeriodMinutes}
                    onChange={(e) => setNewShift({ ...newShift, gracePeriodMinutes: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 text-sm bg-surface-container-lowest/50 border border-surface-container-high rounded-2xl text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-1.5 ml-1">Số lượng tối thiểu</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newShift.minimumStaffCount}
                    onChange={(e) => setNewShift({ ...newShift, minimumStaffCount: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 text-sm bg-surface-container-lowest/50 border border-surface-container-high rounded-2xl text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 mt-4 rounded-2xl text-sm bg-gradient-to-br from-primary to-primary/80 text-white font-extrabold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    {editingShiftId ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {editingShiftId ? "Lưu Cập Nhật" : "Tạo Ca Mới"}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Shift List */}
          <div className="lg:col-span-8">
            <div className="flex flex-col gap-4">
              {shifts.map(shift => (
                <div key={shift.id} className="group bg-white/60 backdrop-blur-md p-5 rounded-3xl shadow-sm border border-white hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary transition-transform duration-300 shadow-inner">
                      <Clock className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-on-surface text-lg group-hover:text-primary transition-colors">{shift.name}</h4>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1.5 text-sm font-bold bg-white px-3 py-1 rounded-lg text-on-surface shadow-sm border border-surface-container-low">
                          {shift.startTime.slice(0, 5)} - {shift.endTime.slice(0, 5)}
                        </span>
                        <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1 bg-surface-container-low/50 px-2.5 py-1 rounded-lg">
                          <Users className="w-3.5 h-3.5" /> Tối thiểu: {shift.minimumStaffCount || 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => handleEditClick(shift)}
                      className="p-2.5 text-primary hover:bg-primary/10 rounded-xl transition-colors bg-white shadow-sm border border-white hover:border-primary/20"
                      title="Sửa ca"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    </button>
                    <button
                      onClick={() => handleDeleteShift(shift.id)}
                      disabled={deletingId === shift.id}
                      className="p-2.5 text-error hover:bg-error/10 rounded-xl transition-colors bg-white shadow-sm border border-white hover:border-error/20"
                      title="Xóa ca"
                    >
                      {deletingId === shift.id ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}

              {shifts.length === 0 && (
                <div className="bg-white/50 backdrop-blur-sm p-12 rounded-3xl border-2 border-dashed border-primary/20 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-on-surface text-lg">Chưa có ca làm việc</h4>
                    <p className="text-sm text-on-surface-variant mt-2 max-w-sm">Tạo ca làm việc đầu tiên của bạn ở biểu mẫu bên trái để bắt đầu phân công nhân sự chuyên nghiệp.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "assignments" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Weekly Grid View */}
          <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-xl shadow-primary/5 border border-white/60 overflow-hidden flex flex-col w-full">
            {/* Grid Header Toolbar */}
            <div className="p-4 border-b border-surface-container-high/50 flex items-center justify-between bg-surface-container-lowest/50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const prev = new Date(currentWeekStart);
                    prev.setDate(prev.getDate() - 7);
                    setCurrentWeekStart(prev);
                  }}
                  className="p-2 hover:bg-surface-container rounded-xl transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-on-surface-variant" />
                </button>
                <div className="font-extrabold text-primary flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Tuần {formatDateDisplay(weekDays[0])} - {formatDateDisplay(weekDays[6])}
                </div>
                <button
                  onClick={() => {
                    const next = new Date(currentWeekStart);
                    next.setDate(next.getDate() + 7);
                    setCurrentWeekStart(next);
                  }}
                  className="p-2 hover:bg-surface-container rounded-xl transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleUnpublish}
                  className="text-xs font-bold bg-white text-error border border-error px-4 py-2.5 rounded-xl hover:bg-error/5 hover:shadow-md transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Bỏ chốt
                </button>
                <button 
                  onClick={handlePublish}
                  className="text-xs font-bold bg-primary text-white px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Chốt Lịch (Publish)
                </button>
              </div>
            </div>

            {/* Grid Content */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] border-collapse">
                <thead>
                  <tr>
                    <th className="w-48 p-4 text-left border-b border-r border-surface-container-high/30 bg-slate-50/50 sticky left-0 z-20">
                      <span className="text-xs font-extrabold text-on-surface-variant uppercase tracking-wider">Nhân viên</span>
                    </th>
                    {weekDays.map(date => (
                      <th key={date.toISOString()} className={`min-w-[180px] p-4 text-center border-b border-r border-surface-container-high/30 ${date.toDateString() === new Date().toDateString() ? 'bg-primary/5' : ''}`}>
                        <div className="flex flex-col items-center">
                          <span className={`text-xs font-extrabold uppercase mb-1 ${date.toDateString() === new Date().toDateString() ? 'text-primary' : 'text-on-surface-variant'}`}>
                            {getDayName(date)}
                          </span>
                          <span className={`text-lg font-black ${date.toDateString() === new Date().toDateString() ? 'bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md' : 'text-on-surface'}`}>
                            {date.getDate()}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="relative">
                  {loading && (
                    <tr className="absolute inset-0 bg-white/50 backdrop-blur-sm z-30 flex items-center justify-center">
                      <td>
                        <div className="flex flex-col items-center gap-2 p-10">
                          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        </div>
                      </td>
                    </tr>
                  )}
                  {staffList.map(staff => (
                    <tr key={staff.id} className="group hover:bg-surface-container-lowest/30 transition-colors">
                      <td className="p-4 border-b border-r border-surface-container-high/30 bg-white sticky left-0 z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
                        <div className="font-bold text-sm text-on-surface truncate">{staff.fullname}</div>
                        <div className="text-xs font-semibold text-primary mt-1 bg-primary/10 w-fit px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {calculateEmployeeHours(staff.id)}h
                        </div>
                      </td>
                      {weekDays.map(date => {
                        const dateStr = formatDateAPI(date);
                        const isDragOver = dragOverCell?.userId === staff.id && dragOverCell?.date === dateStr;
                        const cellAssignments = assignments.filter(a => a.userId === staff.id && a.date.startsWith(dateStr));

                        return (
                          <td
                            key={dateStr}
                            className={`p-3 border-b border-r border-surface-container-high/30 relative align-top transition-colors min-h-[100px]
                              ${isDragOver ? 'bg-primary/10 border-primary border-dashed border-2' : ''}
                              ${date.toDateString() === new Date().toDateString() ? 'bg-primary/[0.02]' : ''}
                            `}
                            onDragOver={(e) => {
                              e.preventDefault();
                              if (!isDragOver) setDragOverCell({ userId: staff.id, date: dateStr });
                            }}
                            onDragLeave={() => setDragOverCell(null)}
                            onDrop={(e) => {
                              e.preventDefault();
                              handleDrop(staff.id, dateStr);
                            }}
                          >
                            <div className="flex flex-col gap-1.5 min-h-[60px]">
                              {cellAssignments.map(a => (
                                <div key={a.id} className="group/item relative bg-white border border-surface-container-high shadow-sm rounded-xl p-2.5 hover:border-primary/50 hover:shadow-md transition-all">
                                  <div className="text-xs font-extrabold text-on-surface truncate pr-5 mb-1.5">{a.shiftName}</div>
                                  
                                  {a.status === 'Draft' ? (
                                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 text-[10px] font-bold">
                                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Nháp
                                    </div>
                                  ) : (
                                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Đã phân
                                    </div>
                                  )}

                                  <button
                                    onClick={() => handleDeleteAssignment(a.id)}
                                    className="absolute top-1.5 right-1.5 opacity-0 group-hover/item:opacity-100 text-on-surface-variant hover:text-error transition-opacity bg-white rounded-full p-0.5"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                              {cellAssignments.length === 0 && !isDragOver && (
                                <div className="h-full w-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Plus className="w-4 h-4 text-on-surface-variant/50" />
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {activeTab === "attendance" && (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          <AttendanceReport />
        </div>
      )}
    </div>
  );
}
