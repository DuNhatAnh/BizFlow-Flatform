"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Lock, User, Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5178/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        // Store session and token
        const userSession = {
          id: data.user.id,
          username: data.user.username,
          fullname: data.user.fullname,
          role: data.user.role,
          roleName: data.user.roleName,
          tenantId: data.user.tenantId,
          token: data.accessToken || data.token
        };
        localStorage.setItem("bizflow_user", JSON.stringify(userSession));
        localStorage.removeItem("bizflow_active_tab");
        
        // Redirect to dashboard
        window.location.href = "/";
      } else {
        setError(data.message || data.Message || "Tên đăng nhập hoặc mật khẩu không đúng!");
      }
    } catch (e) {
      setError("Không thể kết nối đến máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFCFF] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-[#2E5CE6]/20 selection:text-[#2E5CE6]">
      
      {/* Background Layer (SVG Water Waves) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-end justify-center">
        <svg className="absolute w-[200%] h-[120%] opacity-80 min-w-[1440px] top-[-10%] left-[-50%]" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path opacity="0.4" d="M0,300 C300,500 600,100 1440,300 L1440,800 L0,800 Z" fill="url(#water_grad1)" />
          <path opacity="0.5" d="M0,450 C400,200 800,600 1440,400 L1440,800 L0,800 Z" fill="url(#water_grad2)" />
          <path opacity="0.6" d="M0,600 C500,800 900,300 1440,500 L1440,800 L0,800 Z" fill="url(#water_grad3)" />
          <defs>
            <linearGradient id="water_grad1" x1="0" y1="300" x2="1440" y2="800" gradientUnits="userSpaceOnUse">
              <stop stopColor="#A8C7FA" stopOpacity="0.8" />
              <stop offset="1" stopColor="#DCE7FF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="water_grad2" x1="0" y1="450" x2="1440" y2="800" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2E5CE6" stopOpacity="0.1" />
              <stop offset="1" stopColor="#E6F0FF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="water_grad3" x1="0" y1="600" x2="1440" y2="800" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2E5CE6" stopOpacity="0.05" />
              <stop offset="1" stopColor="#F0F5FF" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[30px] pointer-events-none"></div>
      </div>

      {/* Container */}
      <div 
        className={`w-full max-w-md relative z-10 transition-all duration-1000 ease-out ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      >
        {/* Login Card Container */}
        <div 
          className="w-full bg-white/90 backdrop-blur-2xl rounded-[24px] border border-[#E5EAF3] shadow-[0_40px_100px_-20px_rgba(46,92,230,0.15)] p-8 md:p-10 relative"
        >
          {/* Brand Header */}
          <div className="text-center mb-10 flex flex-col items-center relative">
            <Link href="/" className="absolute -top-2 -left-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-[#E8F0FE] text-[13px] font-semibold text-[#5B667A] hover:text-[#2E5CE6] transition-all group/link border border-transparent hover:border-[#2E5CE6]/20">
              <ArrowLeft className="w-3.5 h-3.5 group-hover/link:-translate-x-0.5 transition-transform" /> Về trang chủ
            </Link>
            
            <div className="mb-4 mt-8 flex items-center justify-center cursor-default">
              <img 
                src="/icon.svg" 
                alt="BizFlow Logo" 
                className="object-contain w-14 h-14 hover:scale-105 transition-transform duration-500"
              />
            </div>
            <h2 className="text-[28px] font-extrabold text-[#111827] tracking-tight mb-2">Đăng nhập</h2>
            <p className="text-[15px] text-[#5B667A] flex items-center gap-1.5 justify-center font-medium">
              <Sparkles className="w-4 h-4 text-[#2E5CE6]" />
              Chào mừng bạn quay lại hệ thống
            </p>
          </div>

          {/* Error Notification */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-sm animate-in slide-in-from-top-2 fade-in duration-300 shadow-sm">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
              <span className="font-semibold text-red-700 leading-relaxed">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5B667A] mb-2">
                Email đăng nhập
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[#9CA3AF] group-focus-within/input:text-[#2E5CE6] transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@bizflow.com"
                  autoComplete="username"
                  readOnly
                  onFocus={(e) => { e.target.readOnly = false; }}
                  className="block w-full pl-11 pr-4 py-3.5 bg-white border border-[#E5EAF3] rounded-[12px] text-[15px] font-medium text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2E5CE6] focus:ring-4 focus:ring-[#2E5CE6]/10 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5B667A]">
                  Mật khẩu
                </label>
                <a href="#" className="text-xs font-bold text-[#2E5CE6] hover:text-[#234BCC] transition-colors">
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#9CA3AF] group-focus-within/input:text-[#2E5CE6] transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  readOnly
                  onFocus={(e) => { e.target.readOnly = false; }}
                  className="block w-full pl-11 pr-12 py-3.5 bg-white border border-[#E5EAF3] rounded-[12px] text-[15px] font-medium text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2E5CE6] focus:ring-4 focus:ring-[#2E5CE6]/10 transition-all shadow-sm tracking-wide"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#9CA3AF] hover:text-[#5B667A] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full py-3.5 mt-4 bg-[#2E5CE6] hover:bg-[#234BCC] text-white font-bold rounded-[12px] text-[15px] shadow-[0_8px_20px_-6px_rgba(46,92,230,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(46,92,230,0.5)] transition-all flex items-center justify-center gap-3 overflow-hidden transform hover:-translate-y-1 active:translate-y-0 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {/* Shine effect on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"></div>
              
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    Đăng nhập hệ thống
                    <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
            
            <div className="text-center mt-8 pt-6 border-t border-[#E5EAF3]">
              <span className="text-[14px] font-medium text-[#5B667A]">Chưa có tài khoản doanh nghiệp? </span>
              <a href="/register" className="text-[14px] font-bold text-[#2E5CE6] hover:text-[#234BCC] transition-colors">
                Mở gian hàng ngay
              </a>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
