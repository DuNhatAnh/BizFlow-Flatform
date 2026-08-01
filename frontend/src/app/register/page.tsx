"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Lock, User, Eye, EyeOff, AlertCircle, Building2, Phone, MapPin, Mail, ArrowLeft, CheckCircle2, ClipboardPaste, Timer } from "lucide-react";
import Link from "next/link";

const API = "http://localhost:5178/api";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
    phone: "",
    address: "",
  });

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = [
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)
  ];

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    setMounted(true);
    const savedEmail = sessionStorage.getItem("registerEmail");
    if (savedEmail) {
      setForm(prev => ({ ...prev, ownerEmail: savedEmail }));
      setStep(2);
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2) {
      if (!sessionStorage.getItem("otpSentAt")) {
        sessionStorage.setItem("otpSentAt", Date.now().toString());
      }
      
      const updateTimer = () => {
        const sentAtStr = sessionStorage.getItem("otpSentAt");
        if (sentAtStr) {
          const sentAt = parseInt(sentAtStr, 10);
          const now = Date.now();
          const diff = Math.max(0, 300 - Math.floor((now - sentAt) / 1000));
          setTimeLeft(diff);
        }
      };
      updateTimer();
      timer = setInterval(updateTimer, 1000);
    }
    return () => clearInterval(timer);
  }, [step]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.ownerName.trim() || !form.ownerEmail.trim() || !form.ownerPassword.trim()) {
      setError("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API}/tenants/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        sessionStorage.setItem("registerEmail", form.ownerEmail);
        sessionStorage.setItem("otpSentAt", Date.now().toString());
        setTimeLeft(300);
        setStep(2);
      } else {
        setError(data.message || data.Message || "Đã xảy ra lỗi trong quá trình đăng ký.");
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split("");
      const newOtp = [...otp];
      for (let i = 0; i < pasted.length; i++) {
        if (index + i < 6) newOtp[index + i] = pasted[i].toUpperCase();
      }
      setOtp(newOtp);
      const nextIndex = Math.min(index + pasted.length, 5);
      inputRefs[nextIndex].current?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value.toUpperCase();
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Vui lòng nhập đủ 6 ký tự mã xác thực.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API}/tenants/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.ownerEmail, otpCode })
      });
      const data = await res.json();
      if (res.ok) {
        sessionStorage.removeItem("registerEmail");
        sessionStorage.removeItem("otpSentAt");
        setStep(3);
      } else {
        setError(data.message || data.Message || "Mã xác thực không hợp lệ.");
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!form.name || !form.ownerPassword) {
      sessionStorage.removeItem("registerEmail");
      setStep(1);
      setError("Dữ liệu phiên làm việc đã mất. Vui lòng điền lại thông tin.");
      return;
    }
    
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/tenants/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        sessionStorage.setItem("otpSentAt", Date.now().toString());
        setTimeLeft(300);
        setOtp(["", "", "", "", "", ""]);
      } else {
        setError(data.message || data.Message || "Đã xảy ra lỗi khi gửi lại mã.");
      }
    } catch (err) {
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
          <path opacity="0.4" d="M0,300 C300,500 600,100 1440,300 L1440,800 L0,800 Z" fill={step === 3 ? "url(#water_grad1_success)" : "url(#water_grad1)"} />
          <path opacity="0.5" d="M0,450 C400,200 800,600 1440,400 L1440,800 L0,800 Z" fill={step === 3 ? "url(#water_grad2_success)" : "url(#water_grad2)"} />
          <path opacity="0.6" d="M0,600 C500,800 900,300 1440,500 L1440,800 L0,800 Z" fill={step === 3 ? "url(#water_grad3_success)" : "url(#water_grad3)"} />
          <defs>
            <linearGradient id="water_grad1" x1="0" y1="300" x2="1440" y2="800" gradientUnits="userSpaceOnUse"><stop stopColor="#A8C7FA" stopOpacity="0.8" /><stop offset="1" stopColor="#DCE7FF" stopOpacity="0" /></linearGradient>
            <linearGradient id="water_grad2" x1="0" y1="450" x2="1440" y2="800" gradientUnits="userSpaceOnUse"><stop stopColor="#2E5CE6" stopOpacity="0.1" /><stop offset="1" stopColor="#E6F0FF" stopOpacity="0" /></linearGradient>
            <linearGradient id="water_grad3" x1="0" y1="600" x2="1440" y2="800" gradientUnits="userSpaceOnUse"><stop stopColor="#2E5CE6" stopOpacity="0.05" /><stop offset="1" stopColor="#F0F5FF" stopOpacity="0.5" /></linearGradient>
            
            <linearGradient id="water_grad1_success" x1="0" y1="300" x2="1440" y2="800" gradientUnits="userSpaceOnUse"><stop stopColor="#A7F3D0" stopOpacity="0.8" /><stop offset="1" stopColor="#D1FAE5" stopOpacity="0" /></linearGradient>
            <linearGradient id="water_grad2_success" x1="0" y1="450" x2="1440" y2="800" gradientUnits="userSpaceOnUse"><stop stopColor="#10B981" stopOpacity="0.1" /><stop offset="1" stopColor="#ECFDF5" stopOpacity="0" /></linearGradient>
            <linearGradient id="water_grad3_success" x1="0" y1="600" x2="1440" y2="800" gradientUnits="userSpaceOnUse"><stop stopColor="#10B981" stopOpacity="0.05" /><stop offset="1" stopColor="#ECFDF5" stopOpacity="0.5" /></linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[30px] pointer-events-none"></div>
      </div>

      <div className={`w-full ${step === 1 ? 'max-w-4xl' : 'max-w-xl'} relative z-10 transition-all duration-1000 ease-out ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} my-10`}>
        <div className="w-full bg-white/90 backdrop-blur-2xl rounded-[24px] border border-[#E5EAF3] shadow-[0_40px_100px_-20px_rgba(46,92,230,0.15)] p-8 md:p-12 relative">
          
          {/* Header */}
          <div className="text-center mb-10 flex flex-col items-center">
            {step === 3 ? (
              <div className="w-24 h-24 bg-[#ECFDF5] rounded-full flex items-center justify-center mx-auto text-[#10B981] shadow-sm mb-6">
                <CheckCircle2 className="w-14 h-14 drop-shadow-sm" />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 text-[#2E5CE6] font-bold text-xl tracking-widest uppercase mb-4">
                <img src="/icon.svg" className="w-8 h-8" alt="BizFlow" />
                <span>BizFlow Platform</span>
              </div>
            )}
            
            <h2 className="text-[32px] font-extrabold text-[#111827] tracking-tight mb-3">
              {step === 1 && "Mở gian hàng mới"}
              {step === 2 && "Nhập mã xác thực"}
              {step === 3 && "Đăng ký thành công!"}
            </h2>
            
            <div className="text-[15px] text-[#5B667A] flex flex-col items-center gap-2 justify-center font-medium mx-auto text-center leading-relaxed">
              {step === 1 && <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#2E5CE6]" /> Hệ sinh thái quản trị Hộ kinh doanh toàn diện</span>}
              {step === 2 && (
                <>
                  <span>Mã xác thực gồm 6 ký tự đã được gửi đến email</span>
                  <strong className="text-[#111827] bg-[#F3F4F6] px-3 py-1.5 rounded-md border border-[#E5EAF3]">{form.ownerEmail}</strong>
                  <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border font-bold text-[13px] transition-colors ${timeLeft > 0 ? 'text-[#EF4444] bg-red-50 border-red-100' : 'text-[#9CA3AF] bg-gray-50 border-gray-200'}`}>
                      <Timer className="w-4 h-4" /> 
                      <span>{Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{Math.floor(timeLeft % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={timeLeft > 0 || isLoading}
                      className={`text-[13px] font-bold transition-colors ${timeLeft > 0 ? 'text-[#9CA3AF] cursor-not-allowed' : 'text-[#2E5CE6] hover:text-[#1d4ed8] hover:underline cursor-pointer'}`}
                    >
                      Gửi lại mã
                    </button>
                  </div>
                </>
              )}
              {step === 3 && <span>Gian hàng <strong className="text-[#111827]">{form.name}</strong> đã được khởi tạo thành công.</span>}
            </div>
          </div>

          {/* Error Notification */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-sm animate-in slide-in-from-top-2 fade-in duration-300 shadow-sm">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
              <span className="font-semibold text-red-700 leading-relaxed">{error}</span>
            </div>
          )}

          {/* Step 1: Registration Form */}
          {step === 1 && (
            <form onSubmit={handleRegisterSubmit} className="space-y-8" autoComplete="off">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#2E5CE6] border-b border-[#E5EAF3] pb-3 mb-6">
                    Thông tin doanh nghiệp
                  </h3>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5B667A] mb-2">Tên cửa hàng *</label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-[#9CA3AF] group-focus-within/input:text-[#2E5CE6] transition-colors" />
                      </div>
                      <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ví dụ: Tạp Hóa Bình Minh" className="block w-full pl-11 pr-4 py-3.5 bg-white border border-[#E5EAF3] rounded-[12px] text-[15px] font-medium text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2E5CE6] focus:ring-4 focus:ring-[#2E5CE6]/10 transition-all shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5B667A] mb-2">Số điện thoại</label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-[#9CA3AF] group-focus-within/input:text-[#2E5CE6] transition-colors" />
                      </div>
                      <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="090 123 4567" className="block w-full pl-11 pr-4 py-3.5 bg-white border border-[#E5EAF3] rounded-[12px] text-[15px] font-medium text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2E5CE6] focus:ring-4 focus:ring-[#2E5CE6]/10 transition-all shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5B667A] mb-2">Địa chỉ kinh doanh</label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-[#9CA3AF] group-focus-within/input:text-[#2E5CE6] transition-colors" />
                      </div>
                      <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Số nhà, đường, phường/xã..." className="block w-full pl-11 pr-4 py-3.5 bg-white border border-[#E5EAF3] rounded-[12px] text-[15px] font-medium text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2E5CE6] focus:ring-4 focus:ring-[#2E5CE6]/10 transition-all shadow-sm" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-purple-600 border-b border-[#E5EAF3] pb-3 mb-6">
                    Tài khoản Quản trị
                  </h3>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5B667A] mb-2">Tên chủ doanh nghiệp *</label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-[#9CA3AF] group-focus-within/input:text-purple-600 transition-colors" />
                      </div>
                      <input required type="text" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} placeholder="Ví dụ: Nguyễn Văn A" className="block w-full pl-11 pr-4 py-3.5 bg-white border border-[#E5EAF3] rounded-[12px] text-[15px] font-medium text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5B667A] mb-2">Email / Tên đăng nhập *</label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-[#9CA3AF] group-focus-within/input:text-purple-600 transition-colors" />
                      </div>
                      <input required type="email" name="email" id="email" value={form.ownerEmail} onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })} placeholder="owner@example.com" autoComplete="username" readOnly onFocus={(e) => { e.target.readOnly = false; }} className="block w-full pl-11 pr-4 py-3.5 bg-white border border-[#E5EAF3] rounded-[12px] text-[15px] font-medium text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5B667A] mb-2">Mật khẩu đăng nhập *</label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-[#9CA3AF] group-focus-within/input:text-purple-600 transition-colors" />
                      </div>
                      <input required type={showPassword ? "text" : "password"} name="password" id="password" value={form.ownerPassword} onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })} placeholder="••••••••" autoComplete="new-password" readOnly onFocus={(e) => { e.target.readOnly = false; }} className="block w-full pl-11 pr-12 py-3.5 bg-white border border-[#E5EAF3] rounded-[12px] text-[15px] font-medium text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all shadow-sm tracking-wide" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#9CA3AF] hover:text-[#5B667A] transition-colors">
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-10 space-y-5">
                <button type="submit" disabled={isLoading} className="w-full py-4 bg-[#2E5CE6] hover:bg-[#234BCC] text-white font-bold rounded-[12px] text-[16px] shadow-[0_8px_20px_-6px_rgba(46,92,230,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(46,92,230,0.5)] transition-all flex items-center justify-center gap-3 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75 disabled:hover:translate-y-0 disabled:cursor-not-allowed">
                  {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : "Gửi Yêu Cầu Mở Gian Hàng"}
                </button>
                <div className="text-center pt-2">
                  <Link href="/login" className="text-[14px] font-bold text-[#5B667A] hover:text-[#2E5CE6] transition-colors inline-flex items-center gap-2 group/link">
                    <ArrowLeft className="w-4 h-4 group-hover/link:-translate-x-1 transition-transform" /> Đã có tài khoản? Quay lại Đăng nhập
                  </Link>
                </div>
              </div>
            </form>
          )}

          {/* Step 2: OTP Input */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="relative flex justify-center items-center my-10 max-w-fit mx-auto">
                <div className="flex justify-center gap-2 md:gap-4">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={inputRefs[idx]}
                      type="text"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-14 md:w-14 md:h-16 text-center text-xl md:text-2xl font-bold text-[#2E5CE6] bg-[#F8FAFC] border-2 border-[#E5EAF3] rounded-xl focus:border-[#2E5CE6] focus:ring-4 focus:ring-[#2E5CE6]/10 focus:bg-white outline-none transition-all uppercase placeholder-gray-300"
                      placeholder="-"
                    />
                  ))}
                </div>
                <div className="absolute left-full ml-2 sm:ml-4 top-1/2 -translate-y-1/2 group">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        const pasted = text.replace(/[^A-Za-z0-9]/g, '').trim().slice(0, 6).split("");
                        if (pasted.length === 0) return;
                        const newOtp = ["", "", "", "", "", ""];
                        for (let i = 0; i < pasted.length; i++) {
                          if (i < 6) newOtp[i] = pasted[i].toUpperCase();
                        }
                        setOtp(newOtp);
                        const nextIndex = Math.min(pasted.length, 5);
                        if (inputRefs[nextIndex]?.current) {
                          inputRefs[nextIndex].current?.focus();
                        }
                      } catch (err) {
                        console.error('Failed to read clipboard: ', err);
                      }
                    }}
                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-[#2E5CE6] hover:bg-[#F0F5FF] hover:text-[#1d4ed8] transition-colors"
                  >
                    <ClipboardPaste className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#111827] text-white text-[12px] font-medium py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50">
                    Dán mã
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#111827]"></div>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <button type="submit" disabled={isLoading || otp.join("").length !== 6 || timeLeft === 0} className="w-full py-4 bg-[#2E5CE6] hover:bg-[#234BCC] text-white font-bold rounded-[12px] text-[16px] shadow-[0_8px_20px_-6px_rgba(46,92,230,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(46,92,230,0.5)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : "Xác nhận OTP"}
                </button>
                <div className="text-center pt-2">
                  <button type="button" onClick={() => {
                    sessionStorage.removeItem("registerEmail");
                    setStep(1);
                  }} className="text-[14px] font-bold text-[#5B667A] hover:text-[#2E5CE6] transition-colors inline-flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Đổi Email hoặc sửa thông tin
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="animate-in zoom-in-95 duration-500">
              <div className="bg-[#FAFCFF] p-6 rounded-2xl border border-[#E5EAF3] text-[14px] text-[#5B667A] text-left space-y-3 mt-4 shadow-inner">
                <p className="font-bold text-[#111827] flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-[#10B981]" /> Thông tin đăng ký:
                </p>
                <ul className="space-y-2">
                  <li className="flex justify-between border-b border-[#E5EAF3] pb-2"><span className="font-medium">Doanh nghiệp:</span> <span className="font-bold text-[#111827]">{form.name}</span></li>
                  <li className="flex justify-between border-b border-[#E5EAF3] pb-2"><span className="font-medium">Chủ sở hữu:</span> <span className="font-bold text-[#111827]">{form.ownerName}</span></li>
                  <li className="flex justify-between"><span className="font-medium">Email đăng nhập:</span> <span className="font-bold text-[#111827]">{form.ownerEmail}</span></li>
                </ul>
              </div>

              <div className="pt-8">
                <Link 
                  href="/login" 
                  className="inline-flex items-center justify-center w-full gap-3 px-8 py-4 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-[12px] text-[16px] shadow-[0_8px_20px_-6px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(16,185,129,0.5)] transition-all transform hover:-translate-y-0.5"
                >
                  Đăng nhập ngay
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
