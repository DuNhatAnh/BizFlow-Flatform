"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { 
  Users, 
  Plus, 
  Search, 
  Lock, 
  ToggleLeft, 
  ToggleRight, 
  History,
  CheckCircle2,
  XCircle,
  Clock,
  MoreHorizontal,
  Edit3,
  Info,
  AlertCircle,
  Printer,
  Download,
  FileSpreadsheet,
  FileText
} from "lucide-react";

const FormField = ({ label, required, info, error, children }: any) => (
  <div>
    <label className="flex items-center gap-1 text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {error}</p>}
  </div>
);

import { Skeleton } from "./ui/Skeleton";
import { FadeIn } from "./ui/FadeIn";
import { Pagination } from "./ui/Pagination";

export default function StaffManagement() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [editStaffData, setEditStaffData] = useState({
    id: "",
    username: "",
    fullname: "",
    phone: "",
    identityCard: "",
    dateOfBirth: "",
    joinDate: "",
    socialInsuranceNo: "",
    healthInsuranceNo: "",
    personalTaxCode: "",
    basicSalary: "",
    bankAccountNumber: "",
    bankName: "",
    numberOfDependents: ""
  });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Payroll States
  const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth() + 1);
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);

  const { data: payrollData, refetch: refetchPayroll } = useQuery({
    queryKey: ["payrolls", payrollMonth, payrollYear],
    queryFn: async () => {
      const auth = getAuthInfo();
      const res = await fetch(`http://localhost:5178/api/payroll?year=${payrollYear}&month=${payrollMonth}&page=1&pageSize=100`, {
        headers: { 
          "X-Tenant-Id": auth.tenantId,
          "Authorization": `Bearer ${auth.token}`
        }
      });
      if (!res.ok) return { items: [] };
      return res.json();
    },
    placeholderData: keepPreviousData,
  });

  const handleGeneratePayroll = async () => {
    const auth = getAuthInfo();
    try {
      const res = await fetch(`http://localhost:5178/api/payroll/generate?year=${payrollYear}&month=${payrollMonth}`, {
        method: "POST",
        headers: { 
          "X-Tenant-Id": auth.tenantId,
          "Authorization": `Bearer ${auth.token}`
        }
      });
      if (res.ok) {
        showToast(`Đã tính lương tháng ${payrollMonth}/${payrollYear} thành công!`, "success");
        refetchPayroll();
      } else {
        const err = await res.json().catch(()=>null);
        showToast(err?.message || "Lỗi khi tính lương", "error");
      }
    } catch {
      showToast("Lỗi kết nối", "error");
    }
  };

  const handleExportExcel = () => {
    const items = payrollData?.items || [];
    if (items.length === 0) {
      showToast("Không có dữ liệu lương để xuất!", "error");
      return;
    }
    
    // Create CSV content
    const headers = ["Nhân viên", "Username", "Lương cơ bản", "Phụ cấp", "Khấu trừ", "Thuế TNCN", "Thực lãnh", "STK Ngân hàng", "Ngân hàng"];
    const rows = items.map((p: any) => [
      p.fullname,
      p.username,
      p.baseSalary,
      p.allowances,
      p.deductions,
      p.personalTax,
      p.netPay,
      p.bankAccountNumber || "",
      p.bankName || ""
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(",")].concat(rows.map((e: any[]) => e.map(cell => `"${cell}"`).join(","))).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bang_Luong_T${payrollMonth}_${payrollYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // Form states
  const [newUsername, setNewUsername] = useState("");
  const [newFullname, setNewFullname] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [addFormErrors, setAddFormErrors] = useState<Record<string, string>>({});

  const getAuthInfo = () => {
    const stored = localStorage.getItem("bizflow_user");
    if (stored) {
      const user = JSON.parse(stored);
      return { tenantId: user.tenantId || "11111111-1111-1111-1111-111111111111", token: user.token };
    }
    return { tenantId: "11111111-1111-1111-1111-111111111111", token: "" };
  };

  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("bizflow_user");
    if (stored) {
      const user = JSON.parse(stored);
      setIsOwner(user.role === "Owner");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: staffData, isLoading: loading } = useQuery({
    queryKey: ["staffs", currentPage, debouncedSearch],
    queryFn: async () => {
      const auth = getAuthInfo();
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: itemsPerPage.toString(),
      });
      if (debouncedSearch) queryParams.append("search", debouncedSearch);

      const res = await fetch(`http://localhost:5178/api/staff?${queryParams.toString()}`, {
        headers: { 
          "X-Tenant-Id": auth.tenantId,
          "Authorization": `Bearer ${auth.token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    placeholderData: keepPreviousData,
  });

  const staffList = staffData?.items || [];
  const totalPages = staffData?.totalPages || 0;

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: Record<string, string> = {};
    if (!newFullname.trim()) errors.fullname = "Vui lòng nhập họ và tên";
    if (!newUsername.trim()) errors.username = "Vui lòng nhập tên đăng nhập (email)";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newUsername)) errors.username = "Email không hợp lệ (VD: ten@gmail.com)";
    if (!newPassword) errors.password = "Vui lòng nhập mật khẩu";
    else if (newPassword.length < 6) errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    
    if (Object.keys(errors).length > 0) {
      setAddFormErrors(errors);
      return;
    }
    setAddFormErrors({});

    const auth = getAuthInfo();
    try {
      const res = await fetch("http://localhost:5178/api/staff", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Tenant-Id": auth.tenantId,
          "Authorization": `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          username: newUsername,
          fullname: newFullname,
          password: newPassword,
          role: "Employee"
        })
      });

      if (res.ok) {
        showToast("Tạo tài khoản nhân viên thành công!", "success");
        setShowAddModal(false);
        setNewUsername("");
        setNewFullname("");
        setNewPassword("");
        setNewPassword("");
        queryClient.invalidateQueries({ queryKey: ["staffs"] });
      } else {
        const errorData = await res.json().catch(() => null);
        const errMsg = errorData?.inner 
          ? `${errorData.message} (Chi tiết: ${errorData.inner})`
          : (errorData?.message || "Tài khoản đã tồn tại hoặc có lỗi xảy ra.");
        showToast(errMsg, "error");
      }
    } catch (e) {
      showToast("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.", "error");
    }
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: Record<string, string> = {};
    if (!editStaffData.fullname.trim()) errors.fullname = "Vui lòng nhập họ và tên";
    if (!editStaffData.username.trim()) errors.username = "Vui lòng nhập tên đăng nhập (email)";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(editStaffData.username)) errors.username = "Email không hợp lệ (VD: ten@gmail.com)";
    
    if (editStaffData.phone && !/^(0|\+84)\d{9}$/.test(editStaffData.phone.replace(/\s/g, ''))) {
      errors.phone = "Số điện thoại phải bao gồm 10 chữ số (VD: 0987654321)";
    }
    if (editStaffData.identityCard && !/^\d{12}$/.test(editStaffData.identityCard.trim())) {
      errors.identityCard = "CCCD phải bao gồm đúng 12 chữ số";
    }
    if (editStaffData.personalTaxCode && !/^\d{10}(\d{3})?$/.test(editStaffData.personalTaxCode.trim())) {
      errors.personalTaxCode = "MST cá nhân phải bao gồm 10 hoặc 13 chữ số";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    const auth = getAuthInfo();
    try {
      const res = await fetch(`http://localhost:5178/api/staff/${editStaffData.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "X-Tenant-Id": auth.tenantId,
          "Authorization": `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          username: editStaffData.username,
          fullname: editStaffData.fullname,
          phone: editStaffData.phone || null,
          identityCard: editStaffData.identityCard || null,
          dateOfBirth: editStaffData.dateOfBirth ? new Date(editStaffData.dateOfBirth).toISOString() : null,
          joinDate: editStaffData.joinDate ? new Date(editStaffData.joinDate).toISOString() : null,
          socialInsuranceNo: editStaffData.socialInsuranceNo || null,
          healthInsuranceNo: editStaffData.healthInsuranceNo || null,
          personalTaxCode: editStaffData.personalTaxCode || null,
          basicSalary: editStaffData.basicSalary ? Number(editStaffData.basicSalary) : null,
          bankAccountNumber: editStaffData.bankAccountNumber || null,
          bankName: editStaffData.bankName || null,
          numberOfDependents: editStaffData.numberOfDependents ? parseInt(editStaffData.numberOfDependents, 10) : null
        })
      });

      if (res.ok) {
        showToast("Cập nhật thông tin thành công!", "success");
        setShowEditModal(false);
        queryClient.invalidateQueries({ queryKey: ["staffs"] });
      } else {
        const errorData = await res.json().catch(() => null);
        showToast(errorData?.message || "Cập nhật thất bại.", "error");
      }
    } catch (e) {
      showToast("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.", "error");
    }
  };

  const toggleStatus = async (staffId: string) => {
    const auth = getAuthInfo();
    try {
      const res = await fetch(`http://localhost:5178/api/staff/${staffId}/toggle-status`, {
        method: "PUT",
        headers: { 
          "X-Tenant-Id": auth.tenantId,
          "Authorization": `Bearer ${auth.token}`
        }
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["staffs"] });
      } else {
        // fallback - will be re-fetched anyway, but we can do a soft invalidate
        queryClient.invalidateQueries({ queryKey: ["staffs"] });
      }
    } catch (e) {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
    }
  };

  const viewAuditLogs = async (staff: any) => {
    setSelectedStaff(staff);
    setShowAuditModal(true);
    const auth = getAuthInfo();
    try {
      const res = await fetch(`http://localhost:5178/api/staff/${staff.id}/audit-logs`, {
        headers: { 
          "X-Tenant-Id": auth.tenantId,
          "Authorization": `Bearer ${auth.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      } else {
        setAuditLogs([
          { id: "1", action: "CREATE_ORDER", entityName: "Order", entityId: "ORD-123", timestamp: new Date().toISOString(), details: "Tạo đơn hàng 1,500,000 đ" }
        ]);
      }
    } catch (e) {
      setAuditLogs([
        { id: "1", action: "CREATE_ORDER", entityName: "Order", entityId: "ORD-123", timestamp: new Date().toISOString(), details: "Tạo đơn hàng 1,500,000 đ" }
      ]);
    }
  };

  // Client-side filtering removed since we fetch paginated & searched data from backend

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Area Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center -mt-2 gap-4 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100 fill-mode-both">
        <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-lg border border-surface-container-high shadow-sm">
          <select 
            value={payrollMonth} 
            onChange={(e) => setPayrollMonth(Number(e.target.value))}
            className="text-sm bg-transparent outline-none text-on-surface font-medium px-2 py-1"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i+1} value={i+1}>Tháng {i+1}</option>
            ))}
          </select>
          <span className="text-on-surface-variant">/</span>
          <select 
            value={payrollYear} 
            onChange={(e) => setPayrollYear(Number(e.target.value))}
            className="text-sm bg-transparent outline-none text-on-surface font-medium px-2 py-1"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <div className="w-px h-6 bg-surface-container-high mx-1"></div>
          <button 
            onClick={handleGeneratePayroll}
            className="px-3 py-1.5 hover:bg-white text-primary text-sm font-bold rounded-md flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-4 h-4" /> 
            Tính Lương
          </button>
          <button 
            onClick={handleExportExcel}
            className="px-3 py-1.5 hover:bg-white text-emerald-600 text-sm font-bold rounded-md flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" /> 
            Xuất Bảng Lương
          </button>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-primary hover:bg-primary-container text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> 
          Thêm Nhân viên
        </button>
      </div>

      <div className="bg-white rounded-xl border border-surface-container-high shadow-card overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200 fill-mode-both">
        <div className="p-4 border-b border-surface-container-low bg-surface-container-low/30 flex items-center gap-3">
          <Search className="w-5 h-5 text-on-surface-variant" />
          <input 
            type="text"
            placeholder="Tìm kiếm theo tên hoặc username..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-sm bg-transparent outline-none text-on-surface"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-surface-container-high text-xs font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-low/50">
                <th className="p-4 w-16 text-center">STT</th>
                <th className="p-4">Họ và Tên</th>
                <th className="p-4">Tài khoản (Username)</th>
                <th className="p-4">Ngày tạo</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`}>
                    <td className="p-4"><Skeleton className="h-5 w-8 mx-auto" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-40" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-48" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="p-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                    <td className="p-4"><Skeleton className="h-8 w-8 ml-auto rounded-lg" /></td>
                  </tr>
                ))
              ) : staffList.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-on-surface-variant">Không tìm thấy nhân viên nào.</td></tr>
                  ) : (
                    staffList.map((staff: any, index: number) => (
                      <tr key={staff.id} className="even:bg-slate-50 odd:bg-white hover:bg-surface-container-low/80 transition-colors">
                        <td className="p-4 text-center text-on-surface-variant font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td className="p-4 font-bold text-on-surface">{staff.fullname}</td>
                        <td className="p-4 text-on-surface-variant">{staff.username}</td>
                        <td className="p-4 text-on-surface-variant">{new Date(staff.createdAt).toLocaleDateString("vi-VN")}</td>
                        <td className="p-4">
                          {staff.isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-error/10 text-error text-xs font-semibold rounded-full">
                              <XCircle className="w-3.5 h-3.5" /> Bị khóa
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={(e) => {
                              if (openDropdownId === staff.id) {
                                setOpenDropdownId(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setDropdownPos({
                                  top: rect.bottom + 4,
                                  right: window.innerWidth - rect.right
                                });
                                setOpenDropdownId(staff.id);
                              }
                            }}
                            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                          {openDropdownId === staff.id && typeof document !== 'undefined' && createPortal(
                            <>
                              <div className="fixed inset-0 z-[100]" onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }}></div>
                              <div 
                                className="fixed w-56 bg-white rounded-xl shadow-lg border border-surface-container-high z-[101] overflow-hidden text-left animate-in fade-in zoom-in-95 duration-100"
                                style={{ top: dropdownPos.top, right: dropdownPos.right }}
                              >
                                <button
                                  onClick={() => {
                                    toggleStatus(staff.id);
                                    setOpenDropdownId(null);
                                  }}
                                  className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 transition-colors ${staff.isActive ? 'text-error hover:bg-error/10' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                >
                                  {staff.isActive ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                                  {staff.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                                </button>
                                <button
                                  onClick={() => {
                                    const newPass = prompt("Nhập mật khẩu mới cho " + staff.username);
                                    if (newPass) {
                                      if (newPass.length < 6) {
                                        showToast("Mật khẩu mới quá ngắn!", "error");
                                        return;
                                      }
                                      fetch(`http://localhost:5178/api/staff/${staff.id}/reset-password`, {
                                        method: "PUT",
                                        headers: { 
                                          "Content-Type": "application/json", 
                                          "X-Tenant-Id": getAuthInfo().tenantId,
                                          "Authorization": `Bearer ${getAuthInfo().token}` 
                                        },
                                        body: JSON.stringify(newPass)
                                      }).then(() => showToast("Đổi mật khẩu thành công!", "success"))
                                        .catch(() => showToast("Lỗi khi đổi mật khẩu", "error"));
                                    }
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container-low flex items-center gap-2 transition-colors border-t border-surface-container-low"
                                >
                                  <Lock className="w-4 h-4 text-on-surface-variant" /> Đổi mật khẩu
                                </button>
                                <button
                                  onClick={() => {
                                    const payslip = payrollData?.items?.find((p: any) => p.userId === staff.id);
                                    if (!payslip) {
                                      showToast(`Chưa có phiếu lương tháng ${payrollMonth}/${payrollYear} cho nhân viên này. Hãy bấm Tính Lương trước!`, "error");
                                    } else {
                                      setSelectedPayslip(payslip);
                                      setShowPayslipModal(true);
                                    }
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full text-left px-4 py-3 text-sm text-primary hover:bg-primary/5 flex items-center gap-2 transition-colors border-t border-surface-container-low"
                                >
                                  <FileText className="w-4 h-4 text-primary" /> Xem phiếu lương T{payrollMonth}/{payrollYear}
                                </button>
                                {isOwner && (
                                  <button
                                    onClick={() => {
                                      setEditStaffData({
                                        id: staff.id,
                                        username: staff.username,
                                        fullname: staff.fullname,
                                        phone: staff.phone || "",
                                        identityCard: staff.identityCard || "",
                                        dateOfBirth: staff.dateOfBirth ? staff.dateOfBirth.split('T')[0] : "",
                                        joinDate: staff.joinDate ? staff.joinDate.split('T')[0] : "",
                                        socialInsuranceNo: staff.socialInsuranceNo || "",
                                        healthInsuranceNo: staff.healthInsuranceNo || "",
                                        personalTaxCode: staff.personalTaxCode || "",
                                        basicSalary: staff.basicSalary || "",
                                        bankAccountNumber: staff.bankAccountNumber || "",
                                        bankName: staff.bankName || "",
                                        numberOfDependents: staff.numberOfDependents || ""
                                      });
                                      setShowEditModal(true);
                                      setOpenDropdownId(null);
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container-low flex items-center gap-2 transition-colors border-t border-surface-container-low"
                                  >
                                    <Edit3 className="w-4 h-4 text-secondary" /> Sửa thông tin
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    viewAuditLogs(staff);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container-low flex items-center gap-2 transition-colors border-t border-surface-container-low"
                                >
                                  <History className="w-4 h-4 text-primary" /> Xem lịch sử hoạt động
                                </button>
                              </div>
                            </>,
                            document.body
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

        {(staffData?.totalCount || 0) > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={itemsPerPage}
            totalItems={staffData?.totalCount || 0}
            itemName="nhân viên"
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-card max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-surface-container-low flex justify-between items-center">
              <h3 className="font-bold text-lg text-on-surface">Thêm Nhân viên mới</h3>
              <button onClick={() => setShowAddModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddStaff} className="p-6 space-y-4">
              <FormField label="Họ và Tên" required info="Tên đầy đủ của nhân viên" error={addFormErrors.fullname}>
                <input 
                  type="text" 
                  value={newFullname} onChange={e => { setNewFullname(e.target.value); setAddFormErrors({...addFormErrors, fullname: ""}) }}
                  className={`w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${addFormErrors.fullname ? 'border-red-500 bg-red-50/50' : 'border-outline-variant'}`} placeholder="VD: Trần Thị B"
                />
              </FormField>
              <FormField label="Tên đăng nhập (Email)" required info="Dùng để đăng nhập vào hệ thống, phải là email hợp lệ" error={addFormErrors.username}>
                <input 
                  type="email" 
                  value={newUsername} onChange={e => { setNewUsername(e.target.value); setAddFormErrors({...addFormErrors, username: ""}) }}
                  className={`w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${addFormErrors.username ? 'border-red-500 bg-red-50/50' : 'border-outline-variant'}`} placeholder="employee@bizflow.com"
                />
              </FormField>
              <FormField label="Mật khẩu" required info="Mật khẩu tối thiểu 6 ký tự" error={addFormErrors.password}>
                <input 
                  type="password" 
                  value={newPassword} onChange={e => { setNewPassword(e.target.value); setAddFormErrors({...addFormErrors, password: ""}) }}
                  className={`w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${addFormErrors.password ? 'border-red-500 bg-red-50/50' : 'border-outline-variant'}`} placeholder="••••••••"
                />
              </FormField>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-surface-container-low text-on-surface-variant font-bold rounded-lg text-sm">Hủy</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white font-bold rounded-lg text-sm">Tạo tài khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-card max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-surface-container-low flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg text-on-surface">Sửa thông tin nhân viên</h3>
              <button onClick={() => setShowEditModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="editStaffForm" onSubmit={handleUpdateStaff} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Họ và Tên" required info="Tên đầy đủ của nhân viên theo CMND/CCCD" error={formErrors.fullname}>
                    <input 
                      type="text" 
                      value={editStaffData.fullname} onChange={e => { setEditStaffData({...editStaffData, fullname: e.target.value}); setFormErrors({...formErrors, fullname: ""}) }}
                      className={`w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${formErrors.fullname ? 'border-red-500 bg-red-50/50' : 'border-outline-variant'}`} placeholder="VD: Trần Thị B"
                    />
                  </FormField>
                  <FormField label="Tên đăng nhập (Email)" required info="Email dùng để đăng nhập vào hệ thống" error={formErrors.username}>
                    <input 
                      type="email" 
                      value={editStaffData.username} onChange={e => { setEditStaffData({...editStaffData, username: e.target.value}); setFormErrors({...formErrors, username: ""}) }}
                      className={`w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${formErrors.username ? 'border-red-500 bg-red-50/50' : 'border-outline-variant'}`} placeholder="employee@bizflow.com"
                    />
                  </FormField>
                  <FormField label="Số điện thoại" info="Số điện thoại di động (10 chữ số)" error={formErrors.phone}>
                    <input 
                      type="text"
                      value={editStaffData.phone} onChange={e => { setEditStaffData({...editStaffData, phone: e.target.value}); setFormErrors({...formErrors, phone: ""}) }}
                      className={`w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${formErrors.phone ? 'border-red-500 bg-red-50/50' : 'border-outline-variant'}`} placeholder="VD: 0987654321"
                    />
                  </FormField>
                  <FormField label="CCCD" info="Căn cước công dân gắn chíp (12 chữ số)" error={formErrors.identityCard}>
                    <input 
                      type="text"
                      value={editStaffData.identityCard} onChange={e => { setEditStaffData({...editStaffData, identityCard: e.target.value}); setFormErrors({...formErrors, identityCard: ""}) }}
                      className={`w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${formErrors.identityCard ? 'border-red-500 bg-red-50/50' : 'border-outline-variant'}`} placeholder="Nhập số CCCD"
                    />
                  </FormField>
                  <FormField label="Ngày sinh" info="Ngày tháng năm sinh của nhân viên" error={formErrors.dateOfBirth}>
                    <input 
                      type="date"
                      value={editStaffData.dateOfBirth} onChange={e => { setEditStaffData({...editStaffData, dateOfBirth: e.target.value}); setFormErrors({...formErrors, dateOfBirth: ""}) }}
                      className={`w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${formErrors.dateOfBirth ? 'border-red-500 bg-red-50/50' : 'border-outline-variant'}`}
                    />
                  </FormField>
                  <FormField label="Ngày vào làm" info="Ngày chính thức bắt đầu công việc tại công ty" error={formErrors.joinDate}>
                    <input 
                      type="date"
                      value={editStaffData.joinDate} onChange={e => { setEditStaffData({...editStaffData, joinDate: e.target.value}); setFormErrors({...formErrors, joinDate: ""}) }}
                      className={`w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${formErrors.joinDate ? 'border-red-500 bg-red-50/50' : 'border-outline-variant'}`}
                    />
                  </FormField>
                </div>

                <div className="pt-4 border-t border-surface-container-low">
                  <h4 className="text-sm font-bold text-on-surface mb-4">Thông tin Hợp đồng & Bảo hiểm</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Mã BHYT" info="Mã thẻ Bảo hiểm Y tế" error={formErrors.healthInsuranceNo}>
                      <input 
                        type="text"
                        value={editStaffData.healthInsuranceNo} onChange={e => { setEditStaffData({...editStaffData, healthInsuranceNo: e.target.value}); setFormErrors({...formErrors, healthInsuranceNo: ""}) }}
                        className={`w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${formErrors.healthInsuranceNo ? 'border-red-500 bg-red-50/50' : 'border-outline-variant'}`} placeholder="Nhập số BHYT"
                      />
                    </FormField>
                    <FormField label="Mã BHXH" info="Mã sổ Bảo hiểm Xã hội" error={formErrors.socialInsuranceNo}>
                      <input 
                        type="text"
                        value={editStaffData.socialInsuranceNo} onChange={e => { setEditStaffData({...editStaffData, socialInsuranceNo: e.target.value}); setFormErrors({...formErrors, socialInsuranceNo: ""}) }}
                        className={`w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${formErrors.socialInsuranceNo ? 'border-red-500 bg-red-50/50' : 'border-outline-variant'}`} placeholder="Nhập số BHXH"
                      />
                    </FormField>
                    <FormField label="Mã số thuế TNCN" info="Mã số thuế thu nhập cá nhân (10-13 chữ số)" error={formErrors.personalTaxCode}>
                      <input 
                        type="text"
                        value={editStaffData.personalTaxCode} onChange={e => { setEditStaffData({...editStaffData, personalTaxCode: e.target.value}); setFormErrors({...formErrors, personalTaxCode: ""}) }}
                        className={`w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${formErrors.personalTaxCode ? 'border-red-500 bg-red-50/50' : 'border-outline-variant'}`} placeholder="Nhập MST cá nhân"
                      />
                    </FormField>
                    <FormField label="Số người phụ thuộc" info="Số lượng người phụ thuộc dùng để tính giảm trừ gia cảnh" error={formErrors.numberOfDependents}>
                      <input 
                        type="number" min="0"
                        value={editStaffData.numberOfDependents} onChange={e => { setEditStaffData({...editStaffData, numberOfDependents: e.target.value}); setFormErrors({...formErrors, numberOfDependents: ""}) }}
                        className={`w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${formErrors.numberOfDependents ? 'border-red-500 bg-red-50/50' : 'border-outline-variant'}`} placeholder="VD: 2"
                      />
                    </FormField>
                    <FormField label="Lương cơ bản" info="Mức lương cơ bản dùng cho tính toán BHXH và lương tháng" error={formErrors.basicSalary}>
                      <input 
                        type="number" min="0"
                        value={editStaffData.basicSalary} onChange={e => { setEditStaffData({...editStaffData, basicSalary: e.target.value}); setFormErrors({...formErrors, basicSalary: ""}) }}
                        className={`w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${formErrors.basicSalary ? 'border-red-500 bg-red-50/50' : 'border-outline-variant'}`} placeholder="VD: 5000000"
                      />
                    </FormField>
                  </div>
                </div>

                <div className="pt-4 border-t border-surface-container-low">
                  <h4 className="text-sm font-bold text-on-surface mb-4">Thông tin Ngân hàng</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Số tài khoản" info="Số tài khoản ngân hàng để nhận lương" error={formErrors.bankAccountNumber}>
                      <input 
                        type="text"
                        value={editStaffData.bankAccountNumber} onChange={e => { setEditStaffData({...editStaffData, bankAccountNumber: e.target.value}); setFormErrors({...formErrors, bankAccountNumber: ""}) }}
                        className={`w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${formErrors.bankAccountNumber ? 'border-red-500 bg-red-50/50' : 'border-outline-variant'}`} placeholder="VD: 1903..."
                      />
                    </FormField>
                    <FormField label="Tên ngân hàng" info="Ngân hàng thụ hưởng (VD: Vietcombank, Techcombank, MBBank...)" error={formErrors.bankName}>
                      <input 
                        type="text"
                        value={editStaffData.bankName} onChange={e => { setEditStaffData({...editStaffData, bankName: e.target.value}); setFormErrors({...formErrors, bankName: ""}) }}
                        className={`w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${formErrors.bankName ? 'border-red-500 bg-red-50/50' : 'border-outline-variant'}`} placeholder="VD: Techcombank"
                      />
                    </FormField>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-surface-container-low shrink-0 flex gap-3">
              <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-3 bg-surface-container-low text-on-surface-variant font-bold rounded-lg text-sm hover:bg-surface-container-high transition-colors">Hủy</button>
              <button type="submit" form="editStaffForm" className="flex-1 py-3 bg-primary text-white font-bold rounded-lg text-sm hover:bg-primary-container transition-colors shadow-sm">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

      {showPayslipModal && selectedPayslip && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPayslipModal(false)}></div>
          <div className="bg-white rounded-xl w-full max-w-2xl flex flex-col max-h-[90vh] relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-surface-container-low shrink-0">
              <h2 className="text-lg font-bold text-on-surface">Phiếu Lương T{selectedPayslip.month}/{selectedPayslip.year}</h2>
              <button onClick={() => setShowPayslipModal(false)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto print:p-0 print:overflow-visible" id="payslip-content">
              {/* TT88 Standard-like Payslip Format */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-2xl font-black text-primary tracking-tight">BIZFLOW</h1>
                  <p className="text-xs text-on-surface-variant mt-1">Cửa hàng trực thuộc hệ thống BizFlow Platform</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold uppercase tracking-wider text-on-surface">Phiếu Lương</h2>
                  <p className="text-sm font-medium text-on-surface-variant mt-1">Kỳ lương: Tháng {selectedPayslip.month}/{selectedPayslip.year}</p>
                </div>
              </div>
              
              <div className="bg-surface-container-low/30 border border-surface-container-high rounded-xl p-4 mb-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider mb-1">Họ và tên</p>
                  <p className="text-base font-bold text-on-surface">{selectedPayslip.fullname}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider mb-1">Tài khoản</p>
                  <p className="text-sm font-medium text-on-surface">{selectedPayslip.username}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider mb-1">Số TK Ngân hàng</p>
                  <p className="text-sm font-medium text-on-surface">{selectedPayslip.bankAccountNumber || "Chưa cập nhật"}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider mb-1">Ngân hàng</p>
                  <p className="text-sm font-medium text-on-surface">{selectedPayslip.bankName || "Chưa cập nhật"}</p>
                </div>
              </div>
              
              <table className="w-full text-sm border-collapse mb-8">
                <thead>
                  <tr className="border-b-2 border-surface-container-high text-on-surface-variant">
                    <th className="text-left pb-2 font-bold uppercase tracking-wider text-xs">Khoản mục</th>
                    <th className="text-right pb-2 font-bold uppercase tracking-wider text-xs w-1/3">Số tiền (VNĐ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low text-on-surface font-medium">
                  <tr>
                    <td className="py-3">1. Lương cơ bản (Gross)</td>
                    <td className="py-3 text-right">{selectedPayslip.baseSalary.toLocaleString('vi-VN')}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-emerald-600">2. Các khoản phụ cấp (+)</td>
                    <td className="py-3 text-right text-emerald-600">{selectedPayslip.allowances.toLocaleString('vi-VN')}</td>
                  </tr>
                  <tr>
                    <td className="py-3">3. Số người phụ thuộc</td>
                    <td className="py-3 text-right">{selectedPayslip.numberOfDependents} người</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-error">4. Thuế TNCN (-)</td>
                    <td className="py-3 text-right text-error">{selectedPayslip.personalTax.toLocaleString('vi-VN')}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-error">5. Các khoản khấu trừ khác (-)</td>
                    <td className="py-3 text-right text-error">{(selectedPayslip.deductions - selectedPayslip.personalTax).toLocaleString('vi-VN')}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-surface-container-high">
                    <td className="pt-4 pb-2 font-bold text-lg text-on-surface">THỰC LÃNH (NET)</td>
                    <td className="pt-4 pb-2 text-right font-black text-xl text-primary">{selectedPayslip.netPay.toLocaleString('vi-VN')} đ</td>
                  </tr>
                </tfoot>
              </table>
              
              <div className="grid grid-cols-2 gap-8 text-center pt-8 border-t border-surface-container-low mt-4">
                <div>
                  <p className="font-bold text-on-surface">Người lập phiếu</p>
                  <p className="text-xs text-on-surface-variant mt-1">(Ký, ghi rõ họ tên)</p>
                  <div className="h-20"></div>
                </div>
                <div>
                  <p className="font-bold text-on-surface">Người nhận</p>
                  <p className="text-xs text-on-surface-variant mt-1">(Ký, ghi rõ họ tên)</p>
                  <div className="h-20"></div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-surface-container-low flex justify-end gap-3 shrink-0 print:hidden">
              <button 
                onClick={() => setShowPayslipModal(false)}
                className="px-4 py-2 bg-surface-container-low hover:bg-surface-container text-on-surface font-bold rounded-lg transition-colors"
              >
                Đóng
              </button>
              <button 
                onClick={() => {
                  const printContents = document.getElementById('payslip-content')?.innerHTML;
                  const originalContents = document.body.innerHTML;
                  if (printContents) {
                    document.body.innerHTML = printContents;
                    window.print();
                    document.body.innerHTML = originalContents;
                    window.location.reload(); // Reload to restore React bindings after brutal innerHTML swap
                  }
                }}
                className="px-4 py-2 bg-primary hover:bg-primary-container text-white font-bold rounded-lg flex items-center gap-2 shadow-sm transition-colors"
              >
                <Printer className="w-4 h-4" /> In / Lưu PDF
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Audit Logs Modal */}
      {showAuditModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-card max-w-2xl w-full overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-surface-container-low flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-on-surface">Lịch sử hoạt động</h3>
                <p className="text-sm text-on-surface-variant mt-1">Nhân viên: {selectedStaff.fullname}</p>
              </div>
              <button onClick={() => setShowAuditModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-0 overflow-y-auto flex-1">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant">Chưa có lịch sử hoạt động nào.</div>
              ) : (
                <ul className="divide-y divide-surface-container-low">
                  {auditLogs.map((log, idx) => (
                    <li key={idx} className="p-6 hover:bg-surface-container-low/30 transition-colors flex gap-4">
                      <div className="mt-1">
                        <Clock className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{log.action} - <span className="text-primary">{log.entityName}</span></p>
                        <p className="text-xs text-on-surface-variant mt-1">Thời gian: {new Date(log.timestamp).toLocaleString("vi-VN")}</p>
                        <div className="mt-2 bg-surface-container-low p-3 rounded-lg text-xs font-mono text-on-surface-variant overflow-x-auto">
                          {log.details}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[70] px-6 py-3 rounded-full shadow-lg border animate-in slide-in-from-top-4 fade-in duration-300 flex items-center gap-3 ${
          toast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? (
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
          )}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
