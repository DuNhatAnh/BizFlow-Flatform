"use client";

import React, { useState } from "react";
import { Sparkles, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Decorative background blurs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-primary/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-secondary/5 blur-[120px] pointer-events-none"></div>

      {/* Login Card Container */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-card border border-surface-container-high p-8 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-24 h-24 relative mb-4 flex items-center justify-center">
            {!logoError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src="/logo.png" 
                alt="BizFlow Logo" 
                className="object-contain w-full h-full"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center font-bold text-primary">
                <span className="text-lg tracking-wider uppercase font-sans">BizFlow</span>
                <span className="text-[8px] text-gray-400 font-normal">PLATFORM</span>
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Đăng nhập hệ thống</h2>
          <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1 justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary fill-primary/10" />
            Quản trị thông minh tích hợp trợ lý AI
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-3 bg-error-container text-error border border-error-container rounded-lg flex items-start gap-2.5 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              Tên đăng nhập (Email)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-on-surface-variant" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập email (ví dụ: admin@bizflow.com)"
                autoComplete="new-username"
                className="block w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-sans"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Mật khẩu
              </label>
              <a href="#" className="text-xs font-medium text-primary hover:underline">
                Quên mật khẩu?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-on-surface-variant" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="block w-full pl-10 pr-10 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-mono"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary hover:bg-primary-container text-white font-semibold rounded-lg text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
