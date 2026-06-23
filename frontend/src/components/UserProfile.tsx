"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Shield, Key, CheckCircle2, AlertCircle, Save, Edit3, X } from "lucide-react";

export default function UserProfile() {
  const [user, setUser] = useState<{ username: string; fullname: string; roleName: string; role: string; tenantId: string; token: string } | null>(null);
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // HR State
  const [isEditingHR, setIsEditingHR] = useState(false);
  const [hrData, setHrData] = useState({
    phone: "",
    identityCard: "",
    dateOfBirth: "",
    joinDate: ""
  });

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("bizflow_user");
    if (stored) {
      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);
      fetchProfile(parsedUser.token);
    }
  }, []);

  const fetchProfile = async (token: string) => {
    try {
      const res = await fetch("http://localhost:5178/api/auth/profile", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHrData({
          phone: data.phone || "",
          identityCard: data.identityCard || "",
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : "",
          joinDate: data.joinDate ? data.joinDate.split('T')[0] : ""
        });
      }
    } catch (e) {
      console.error("Failed to fetch profile", e);
    }
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveHR = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5178/api/auth/profile", {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phone: hrData.phone || null,
          identityCard: hrData.identityCard || null,
          dateOfBirth: hrData.dateOfBirth ? new Date(hrData.dateOfBirth).toISOString() : null,
          joinDate: hrData.joinDate ? new Date(hrData.joinDate).toISOString() : null
        })
      });

      if (res.ok) {
        showToast("Cập nhật thông tin nhân sự thành công!");
        setIsEditingHR(false);
        fetchProfile(user.token); // Refresh
      } else {
        showToast("Cập nhật thất bại", "error");
      }
    } catch (e) {
      showToast("Có lỗi xảy ra", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Mật khẩu mới không khớp", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Mật khẩu mới phải có ít nhất 6 ký tự", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5178/api/auth/change-password", {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${user?.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword
        })
      });

      if (res.ok) {
        showToast("Đổi mật khẩu thành công!", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const errorData = await res.json().catch(() => null);
        showToast(errorData?.message || "Đổi mật khẩu thất bại", "error");
      }
    } catch (e) {
      showToast("Có lỗi xảy ra khi đổi mật khẩu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return <div className="p-8 text-center text-on-surface-variant">Đang tải thông tin...</div>;

  const isManagerOrOwner = user.role === "Owner" || user.role === "Manager";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[70] px-6 py-3 rounded-full shadow-lg border animate-in slide-in-from-top-4 flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2">
          <User className="w-7 h-7 text-primary" />
          Hồ sơ cá nhân
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">Quản lý thông tin tài khoản và bảo mật của bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-surface-container-high shadow-sm p-6 text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-primary-container text-primary flex items-center justify-center text-4xl font-bold mb-4 shadow-inner">
              {user.fullname.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-xl font-bold text-on-surface">{user.fullname}</h3>
            <p className="text-sm font-medium text-primary mt-1 bg-primary/10 inline-block px-3 py-1 rounded-full">
              {user.roleName}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-surface-container-high shadow-sm p-6 space-y-4">
            <h4 className="font-bold text-on-surface flex items-center gap-2 border-b border-surface-container-low pb-2">
              <Shield className="w-4 h-4 text-on-surface-variant" /> Thông tin liên hệ
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Email / Tài khoản</p>
                <p className="text-sm font-medium text-on-surface flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-secondary" /> {user.username}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Mã Cửa hàng</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20">
                    {user.tenantId === "11111111-1111-1111-1111-111111111111" ? "BIZ-A8F9K2" : `BIZ-${user.tenantId.substring(0, 6).toUpperCase()}`}
                  </p>
                  <span className="text-[10px] text-on-surface-variant italic">(Mã định danh hệ thống)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings & Security */}
        <div className="md:col-span-2 space-y-6">
          {/* HR & Personal Info */}
          <div className="bg-white rounded-2xl border border-surface-container-high shadow-sm overflow-hidden">
            <div className="p-6 border-b border-surface-container-low bg-surface-container-lowest flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                  <User className="w-5 h-5 text-secondary" /> Thông tin Cá nhân & Nhân sự
                </h3>
                <p className="text-sm text-on-surface-variant mt-1">Thông tin quản lý nhân sự, bảo hiểm và liên lạc nội bộ.</p>
              </div>
              {!isEditingHR ? (
                <button 
                  onClick={() => setIsEditingHR(true)}
                  className="px-4 py-2 bg-surface-container-low hover:bg-surface-container-high text-on-surface text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" /> Chỉnh sửa
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditingHR(false)}
                  className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Hủy"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="p-6">
              {!isEditingHR ? (
                // View Mode
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Số điện thoại</p>
                    <p className="text-sm font-medium text-on-surface">{hrData.phone || "Chưa cập nhật"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Căn cước công dân (CCCD)</p>
                    <p className="text-sm font-medium text-on-surface">{hrData.identityCard || "Chưa cập nhật"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Ngày sinh</p>
                    <p className="text-sm font-medium text-on-surface">
                      {hrData.dateOfBirth ? new Date(hrData.dateOfBirth).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Ngày bắt đầu làm việc</p>
                    <p className="text-sm font-medium text-on-surface">
                      {hrData.joinDate ? new Date(hrData.joinDate).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
                    </p>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Số điện thoại</label>
                      <input 
                        type="text" 
                        value={hrData.phone}
                        onChange={(e) => setHrData({...hrData, phone: e.target.value})}
                        className="w-full p-3 border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Căn cước công dân (CCCD)</label>
                      <input 
                        type="text" 
                        value={hrData.identityCard}
                        onChange={(e) => setHrData({...hrData, identityCard: e.target.value})}
                        disabled={!isManagerOrOwner}
                        className="w-full p-3 border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-surface-container-low disabled:text-on-surface-variant disabled:cursor-not-allowed" 
                        placeholder="Nhập số CCCD"
                      />
                      {!isManagerOrOwner && <p className="text-[10px] text-red-500 mt-1">Chỉ quản lý mới được sửa trường này</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Ngày sinh</label>
                      <input 
                        type="date" 
                        value={hrData.dateOfBirth}
                        onChange={(e) => setHrData({...hrData, dateOfBirth: e.target.value})}
                        className="w-full p-3 border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Ngày bắt đầu làm việc</label>
                      <input 
                        type="date" 
                        value={hrData.joinDate}
                        onChange={(e) => setHrData({...hrData, joinDate: e.target.value})}
                        disabled={!isManagerOrOwner}
                        className="w-full p-3 border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-surface-container-low disabled:text-on-surface-variant disabled:cursor-not-allowed" 
                      />
                      {!isManagerOrOwner && <p className="text-[10px] text-red-500 mt-1">Chỉ quản lý mới được sửa trường này</p>}
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={handleSaveHR}
                      disabled={isLoading}
                      className="px-6 py-2.5 bg-primary hover:bg-primary-container text-white font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isLoading ? "Đang lưu..." : <><Save className="w-4 h-4" /> Lưu thông tin</>}
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-surface-container-low">
                <p className="text-xs text-on-surface-variant italic">
                  * Những thông tin này được dùng cho mục đích chấm công và liên lạc nội bộ cửa hàng. Chỉ quản lý hoặc chủ cửa hàng mới có quyền thay đổi CCCD và Ngày bắt đầu làm việc.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-surface-container-high shadow-sm overflow-hidden">
            <div className="p-6 border-b border-surface-container-low bg-surface-container-lowest">
              <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                <Key className="w-5 h-5 text-secondary" /> Đổi mật khẩu
              </h3>
              <p className="text-sm text-on-surface-variant mt-1">Nên sử dụng mật khẩu mạnh để bảo vệ tài khoản của bạn.</p>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">Mật khẩu hiện tại</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-3 border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface-container-lowest" 
                  placeholder="••••••••"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">Mật khẩu mới</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface-container-lowest" 
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">Nhập lại mật khẩu mới</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface-container-lowest" 
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-6 py-3 bg-primary hover:bg-primary-container text-white font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isLoading ? "Đang xử lý..." : <><Save className="w-4 h-4" /> Lưu thay đổi</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
