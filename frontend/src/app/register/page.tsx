"use client";

import React, { useState } from "react";
import { Sparkles, Lock, User, Eye, EyeOff, AlertCircle, Building2, Phone, MapPin, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const API = "http://localhost:5178/api";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
    phone: "",
    address: "",
    taxCode: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.ownerName.trim() || !form.ownerEmail.trim() || !form.ownerPassword.trim()) {
      setError("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    setIsLoading(true);

    try {
      const body = {
        ...form,
        subscriptionPlanId: null, // Gói dịch vụ sẽ được cập nhật sau bởi admin
      };

      const res = await fetch(`${API}/tenants/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message || data.Message || "Đã xảy ra lỗi trong quá trình đăng ký.");
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-primary/5 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-secondary/5 blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-lg bg-white rounded-xl shadow-card border border-surface-container-high p-8 relative z-10 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Đăng ký thành công!</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Yêu cầu tạo tài khoản cho doanh nghiệp <strong className="text-on-surface">{form.name}</strong> của bạn đã được gửi thành công đến Quản trị viên hệ thống.
            </p>
          </div>

          <div className="bg-surface-container-low p-4 rounded-xl border border-surface-container-high text-xs text-on-surface-variant text-left space-y-2">
            <p className="font-semibold text-on-surface flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Thông tin đăng ký của bạn:
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Doanh nghiệp: {form.name}</li>
              <li>Chủ sở hữu: {form.ownerName}</li>
              <li>Email đăng nhập: {form.ownerEmail}</li>
              <li>Số điện thoại: {form.phone || "Chưa cung cấp"}</li>
              <li>Mã số thuế: {form.taxCode || "Chưa cung cấp"}</li>
            </ul>
            <p className="text-[10px] text-amber-600 font-medium mt-2 pt-2 border-t border-surface-container-high">
              * Lưu ý: Bạn sẽ nhận được quyền truy cập ngay khi Quản trị viên phê duyệt yêu cầu này.
            </p>
          </div>

          <div className="pt-2">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-container text-white font-semibold rounded-lg text-sm transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại trang Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Decorative background blurs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-primary/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-secondary/5 blur-[120px] pointer-events-none"></div>

      {/* Register Card Container */}
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-card border border-surface-container-high p-8 relative z-10 my-8">
        
        {/* Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 text-primary font-bold text-xl tracking-wider uppercase mb-1">
            <Building2 className="w-6 h-6" />
            <span>BizFlow Platform</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Đăng ký tài khoản doanh nghiệp</h2>
          <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1 justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary fill-primary/10" />
            Tạo cửa hàng và hạch toán thuế theo Thông tư 88/2021/TT-BTC
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-5 p-3 bg-error-container text-error border border-error-container rounded-lg flex items-start gap-2.5 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Business Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-surface-container-high pb-1.5">
                Thông tin doanh nghiệp
              </h3>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Tên doanh nghiệp / Cửa hàng *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Building2 className="h-4 w-4 text-on-surface-variant" />
                  </div>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ví dụ: Tạp Hóa Bình Minh"
                    className="block w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Mã số thuế
                </label>
                <input
                  type="text"
                  value={form.taxCode}
                  onChange={(e) => setForm({ ...form, taxCode: e.target.value })}
                  placeholder="Mã số thuế hộ kinh doanh (nếu có)"
                  className="block w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Số điện thoại
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-on-surface-variant" />
                  </div>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Ví dụ: 0901234567"
                    className="block w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Địa chỉ kinh doanh
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-on-surface-variant" />
                  </div>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Số nhà, tên đường, Phường/Xã..."
                    className="block w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

            </div>

            {/* Owner Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-surface-container-high pb-1.5">
                Thông tin chủ doanh nghiệp (Owner)
              </h3>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Tên chủ doanh nghiệp *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-on-surface-variant" />
                  </div>
                  <input
                    required
                    type="text"
                    value={form.ownerName}
                    onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="block w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Email / Tên đăng nhập *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-on-surface-variant" />
                  </div>
                  <input
                    required
                    type="email"
                    value={form.ownerEmail}
                    onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                    placeholder="Ví dụ: owner@example.com"
                    className="block w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Mật khẩu đăng nhập *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-on-surface-variant" />
                  </div>
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={form.ownerPassword}
                    onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Submit & Back links */}
          <div className="pt-4 space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary hover:bg-primary-container text-white font-semibold rounded-lg text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                "Gửi Yêu Cầu Đăng Ký"
              )}
            </button>
            
            <div className="text-center">
              <Link href="/login" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Đã có tài khoản? Quay lại Đăng nhập
              </Link>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
