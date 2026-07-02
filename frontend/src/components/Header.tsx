"use client";

import React, { useState, useEffect, useRef } from "react";
import { Clock, MapPin, Camera, CheckCircle2, RefreshCw, Bell } from "lucide-react";

interface HeaderProps {
  showGreeting?: boolean;
  title?: string;
  subtitle?: string;
}

export default function Header({ showGreeting = true, title, subtitle }: HeaderProps) {
  const [time, setTime] = useState<Date | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // GPS & Camera states
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>("Đang tìm vị trí...");
  const [photoData, setPhotoData] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [todayShift, setTodayShift] = useState<any>(null);

  // Notification states
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("bizflow_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserRole(parsed.role);
        if (parsed.role === "Employee") {
          fetchTodayShift();
          fetchNotifications();
        }
      } catch (e) {
        console.error("Lỗi parse thông tin user trong Header", e);
      }
    }

    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const stored = localStorage.getItem("bizflow_user");
      if (!stored) return;
      const user = JSON.parse(stored);
      
      const res = await fetch("http://localhost:5178/api/notifications", {
        headers: { "Authorization": `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const handleNewNotification = (e: any) => {
      const notif = e.detail;
      setNotifications(prev => [
        {
          id: notif.id || notif.Id,
          title: notif.title || notif.Title,
          message: notif.message || notif.Message,
          type: notif.type || notif.Type,
          isRead: false,
          createdAt: notif.createdAt || notif.CreatedAt || new Date().toISOString()
        },
        ...prev
      ]);
      setUnreadCount(prev => prev + 1);
    };

    window.addEventListener("new_notification", handleNewNotification);
    return () => {
      window.removeEventListener("new_notification", handleNewNotification);
    };
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const stored = localStorage.getItem("bizflow_user");
      if (!stored) return;
      const user = JSON.parse(stored);

      const res = await fetch(`http://localhost:5178/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { "Authorization": `Bearer ${user.token}` }
      });

      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTodayShift = async () => {
    try {
      const stored = localStorage.getItem("bizflow_user");
      if (!stored) return;
      const user = JSON.parse(stored);
      
      const res = await fetch("http://localhost:5178/api/shifts/my-shift-today", {
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTodayShift(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (showCheckIn) {
      // Get Location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
            setLocationStatus("Đã xác định vị trí");
          },
          (error) => {
            console.error(error);
            setLocationStatus("Không thể lấy vị trí GPS");
          },
          { enableHighAccuracy: true }
        );
      } else {
        setLocationStatus("Trình duyệt không hỗ trợ GPS");
      }

      // Start Camera
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
        .then((mediaStream) => {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        })
        .catch(err => {
          console.error("Camera error:", err);
        });
    } else {
      // Stop Camera when closing
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setPhotoData(null);
      setLocation(null);
      setLocationStatus("Đang tìm vị trí...");
    }
  }, [showCheckIn]);

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, -canvas.width, 0);
        // Nén ảnh xuống chất lượng 70% để tiết kiệm băng thông và DB
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setPhotoData(dataUrl);
      }
    }
  };

  const handleCheckIn = async () => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem("bizflow_user");
      if (!stored) throw new Error("Chưa đăng nhập");
      const user = JSON.parse(stored);
      
      let finalPhoto = photoData;
      
      if (!finalPhoto && videoRef.current) {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.scale(-1, 1);
          ctx.drawImage(videoRef.current, -canvas.width, 0);
          finalPhoto = canvas.toDataURL("image/jpeg", 0.7);
          setPhotoData(finalPhoto);
        }
      }

      if (!finalPhoto) {
        alert("Không thể lấy hình ảnh từ Camera. Vui lòng cho phép quyền Camera!");
        setIsLoading(false);
        return;
      }
      if (!location) {
        alert("Chưa lấy được vị trí GPS. Vui lòng cấp quyền định vị!");
        setIsLoading(false);
        return;
      }

      const payload = {
        IpAddress: "3G/4G/Wi-Fi", // Thông tin thật lấy qua trình duyệt
        WifiMac: "Cellular",
        Latitude: location.lat,
        Longitude: location.lng,
        PhotoUrl: finalPhoto
      };

      const res = await fetch("http://localhost:5178/api/attendance/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsCheckedIn(true);
        setShowCheckIn(false);
      } else {
        const errorText = await res.text();
        try {
          const error = JSON.parse(errorText);
          alert(error.message || "Lỗi Check-in: " + res.status);
        } catch {
          alert("Lỗi Check-in (" + res.status + "): " + errorText);
        }
      }
    } catch (error: any) {
      console.error(error);
      alert("Đã xảy ra lỗi khi Check-in: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem("bizflow_user");
      if (!stored) throw new Error("Chưa đăng nhập");
      const user = JSON.parse(stored);
      
      const payload = {
        IpAddress: "192.168.1.10",
        WifiMac: "Cửa hàng Bình Minh"
      };

      const res = await fetch("http://localhost:5178/api/attendance/check-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsCheckedIn(false);
        alert("Kết ca thành công!");
      } else {
        const error = await res.json();
        alert(error.message || "Lỗi Kết ca");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Real-time Clock & Check-in */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-surface-container-high shadow-sm text-sm font-medium text-on-surface">
          <Clock className="w-4 h-4 text-primary" />
          <span className="min-w-[220px] text-center">{formatDateTime(time)}</span>
        </div>

        {userRole === "Employee" && (
          <div className="flex items-center gap-3">
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl bg-white border border-surface-container-high shadow-sm hover:shadow-md hover:border-primary/50 transition-all text-on-surface-variant hover:text-primary group"
                title="Thông báo"
              >
                <Bell className="w-5 h-5 group-hover:animate-wiggle" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              {/* Notifications Popover */}
              {showNotifications && (
                <div className="absolute top-full mt-2 right-0 w-80 bg-white rounded-xl shadow-xl border border-surface-container-high z-50 overflow-hidden flex flex-col max-h-[400px]">
                  <div className="px-4 py-3 border-b border-surface-container-high bg-surface-container-lowest flex items-center justify-between">
                    <h3 className="font-bold text-on-surface">Thông báo</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                        {unreadCount} chưa đọc
                      </span>
                    )}
                  </div>
                  <div className="overflow-y-auto flex-1 p-2 flex flex-col gap-1">
                    {notifications.length === 0 ? (
                      <div className="text-center p-6 text-on-surface-variant text-sm">
                        Chưa có thông báo nào.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={(e) => { if (!n.isRead) handleMarkAsRead(n.id, e); }}
                          className={`p-3 rounded-lg flex flex-col gap-1 transition-colors cursor-pointer ${n.isRead ? 'opacity-70 hover:bg-surface-container-lowest' : 'bg-primary/5 hover:bg-primary/10 border-l-2 border-primary'}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className={`text-sm ${n.isRead ? 'font-medium' : 'font-bold'} text-on-surface leading-tight`}>{n.title}</span>
                            {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1"></span>}
                          </div>
                          <p className="text-xs text-on-surface-variant leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-on-surface-variant/70 mt-1">
                            {new Date(n.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {!isCheckedIn ? (
            <button 
              onClick={() => setShowCheckIn(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-container text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-primary/30 hover:shadow-lg hover:scale-105 transition-all relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <Clock className="w-4 h-4 animate-pulse" />
              <span className="relative z-10">Vào ca</span>
            </button>
          ) : (
            <button 
              onClick={handleCheckOut}
              disabled={isLoading}
              className="flex items-center gap-2 bg-error text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-error/30 hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
            >
              <span className="relative z-10">{isLoading ? "..." : "Kết ca"}</span>
            </button>
          )}
          </div>
        )}
      </div>

      {/* Check-in Modal (Glassmorphism) */}
      {showCheckIn && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 md:p-8">
              {/* Header Modal */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-4xl font-black text-on-surface tracking-tighter mb-1">
                    {time?.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </h2>
                  <p className="text-on-surface-variant font-medium">
                    {time?.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center relative">
                   <div className="absolute inset-0 border-4 border-primary rounded-full animate-ping opacity-20"></div>
                   <Clock className="w-7 h-7 text-primary relative z-10" />
                </div>
              </div>

              {/* Bố cục 2 cột cho thông tin Check-in */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* Selfie Camera */}
                <div className="flex flex-col gap-3 bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high h-full">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Camera className="w-5 h-5 text-on-surface-variant" />
                      <p className="text-sm font-medium text-on-surface">Ảnh xác thực</p>
                    </div>
                    {!photoData ? (
                      <button onClick={takePhoto} className="text-xs font-bold text-primary px-3 py-1.5 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1">
                        Chụp ảnh
                      </button>
                    ) : (
                      <button onClick={() => setPhotoData(null)} className="text-xs font-bold text-error px-3 py-1.5 bg-error/10 rounded-lg hover:bg-error/20 transition-colors flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" /> Chụp lại
                      </button>
                    )}
                  </div>
                  
                  {/* Khung hiển thị Camera hoặc Ảnh đã chụp */}
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black/5 mb-6 shadow-inner ring-1 ring-black/5">
                    {photoData ? (
                      <img src={photoData} alt="Selfie" className="w-full h-full object-cover" />
                    ) : (
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                    )}
                    {/* Face outline guide */}
                    {!photoData && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-3/4 h-3/4 border-2 border-dashed border-white/50 rounded-[40%] animate-pulse-slow"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vị trí GPS & Thông tin mạng */}
                <div className="flex flex-col gap-4">
                  {/* Shift Info */}
                  <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high text-center">
                    {todayShift ? (
                      <div>
                        <p className="text-sm font-medium text-on-surface-variant mb-1">Ca làm việc của bạn:</p>
                        <p className="text-lg font-bold text-primary">{todayShift.name}</p>
                        <p className="text-sm text-on-surface">({todayShift.startTime} - {todayShift.endTime})</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-error mb-1">Lưu ý:</p>
                        <p className="text-sm text-on-surface">Bạn chưa được phân ca hôm nay. Hệ thống sẽ ghi nhận làm ngoài ca.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-3 bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="text-left flex-1">
                      <p className="text-xs text-on-surface-variant">Vị trí hiện tại (GPS)</p>
                      <p className="text-sm font-bold text-on-surface mt-0.5">{locationStatus}</p>
                      {location && <p className="text-xs text-primary mt-1 font-mono">{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</p>}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-surface-container-lowest p-4 rounded-2xl border border-[#A5D6A7]">
                    <CheckCircle2 className="w-5 h-5 text-[#4CAF50] mt-0.5 shrink-0" />
                    <div className="text-left flex-1">
                      <p className="text-xs text-on-surface-variant">Kết nối mạng</p>
                      <p className="text-sm font-bold text-[#2E7D32] mt-0.5">Dữ liệu di động / Wi-Fi</p>
                      <p className="text-xs text-[#2E7D32]/70 mt-1">Đã xác thực</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setShowCheckIn(false)}
                  disabled={isLoading}
                  className="flex-1 py-3.5 rounded-2xl text-on-surface-variant font-bold hover:bg-surface-container-low transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleCheckIn}
                  disabled={isLoading}
                  className="flex-[2] py-3.5 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:-translate-y-1 transition-all disabled:opacity-50"
                >
                  {isLoading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN VÀO CA"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>

  );
}

