"use client";

import React, { useState, useEffect } from "react";
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
  MoreHorizontal
} from "lucide-react";

export default function StaffManagement() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Form states
  const [newUsername, setNewUsername] = useState("");
  const [newFullname, setNewFullname] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const getAuthInfo = () => {
    const stored = localStorage.getItem("bizflow_user");
    if (stored) {
      const user = JSON.parse(stored);
      return { tenantId: user.tenantId || "11111111-1111-1111-1111-111111111111", token: user.token };
    }
    return { tenantId: "11111111-1111-1111-1111-111111111111", token: "" };
  };

  const fetchStaff = async () => {
    setLoading(true);
    const auth = getAuthInfo();
    try {
      // In a real scenario, this would be a real API call.
      // We will mock it first, then try fetching.
      const res = await fetch("http://localhost:5178/api/staff", {
        headers: { 
          "X-Tenant-Id": auth.tenantId,
          "Authorization": `Bearer ${auth.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStaffList(data);
      } else {
        // Fallback mock data if backend API is not yet available
        setStaffList([
          { id: "1", fullname: "Trần Thị B", username: "employee@bizflow.com", role: "Nhân viên", isActive: true, createdAt: "2026-06-11T00:00:00Z" }
        ]);
      }
    } catch (e) {
      console.error(e);
      setStaffList([
        { id: "1", fullname: "Trần Thị B", username: "employee@bizflow.com", role: "Nhân viên", isActive: true, createdAt: "2026-06-11T00:00:00Z" }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newFullname || !newPassword) {
      showToast("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Mật khẩu quá ngắn, vui lòng nhập ít nhất 6 ký tự.", "error");
      return;
    }

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
        fetchStaff();
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
        fetchStaff();
      } else {
        // fallback
        setStaffList(staffList.map(s => s.id === staffId ? { ...s, isActive: !s.isActive } : s));
      }
    } catch (e) {
      setStaffList(staffList.map(s => s.id === staffId ? { ...s, isActive: !s.isActive } : s));
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

  const filteredStaff = staffList.filter(s => 
    s.fullname.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Area Buttons */}
      <div className="flex justify-end -mt-2">
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-primary hover:bg-primary-container text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> 
          Thêm Nhân viên
        </button>
      </div>

      <div className="bg-white rounded-xl border border-surface-container-high shadow-card overflow-hidden">
        <div className="p-4 border-b border-surface-container-low bg-surface-container-low/30 flex items-center gap-3">
          <Search className="w-5 h-5 text-on-surface-variant" />
          <input 
            type="text"
            placeholder="Tìm kiếm theo tên hoặc username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm bg-transparent outline-none text-on-surface"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-surface-container-high text-xs font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-low/50">
                <th className="p-4">Họ và Tên</th>
                <th className="p-4">Tài khoản (Username)</th>
                <th className="p-4">Ngày tạo</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">Đang tải...</td></tr>
              ) : filteredStaff.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">Không tìm thấy nhân viên nào.</td></tr>
              ) : (
                filteredStaff.map(staff => (
                  <tr key={staff.id} className="hover:bg-surface-container-low/30 transition-colors">
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
                      {openDropdownId === staff.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)}></div>
                          <div 
                            className="fixed w-56 bg-white rounded-xl shadow-lg border border-surface-container-high z-50 overflow-hidden text-left"
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
                                viewAuditLogs(staff);
                                setOpenDropdownId(null);
                              }}
                              className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container-low flex items-center gap-2 transition-colors border-t border-surface-container-low"
                            >
                              <History className="w-4 h-4 text-primary" /> Xem lịch sử hoạt động
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Họ và Tên</label>
                <input 
                  type="text" required
                  value={newFullname} onChange={e => setNewFullname(e.target.value)}
                  className="w-full p-3 border border-outline-variant rounded-lg text-sm" placeholder="VD: Trần Thị B"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Tên đăng nhập (Email)</label>
                <input 
                  type="email" required
                  value={newUsername} onChange={e => setNewUsername(e.target.value)}
                  className="w-full p-3 border border-outline-variant rounded-lg text-sm" placeholder="employee@bizflow.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Mật khẩu</label>
                <input 
                  type="password" required
                  value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full p-3 border border-outline-variant rounded-lg text-sm" placeholder="••••••••"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-surface-container-low text-on-surface-variant font-bold rounded-lg text-sm">Hủy</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white font-bold rounded-lg text-sm">Tạo tài khoản</button>
              </div>
            </form>
          </div>
        </div>
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
