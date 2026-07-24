"use client";

import React, { useState, useEffect } from "react";
import { Clock, CheckCircle2, AlertCircle, XCircle, Search, Calendar, MapPin, Wifi, Camera, Users } from "lucide-react";
import MetricCard from "@/components/Dashboard/Widgets/MetricCard";

export default function AttendanceReport() {
  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    late: 0,
    absent: 0
  });

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem("bizflow_user");
      if (!stored) return;
      const user = JSON.parse(stored);

      const res = await fetch("http://localhost:5178/api/attendance", {
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAttendanceData(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu chấm công:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: any[]) => {
    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0; // Giả sử tính vắng mặt cho nhân viên có trong danh sách nhưng không có record (logic có thể mở rộng)

    data.forEach(item => {
      if (item.status === 0 || item.status === 3) presentCount++; // Present, LeaveEarly
      else if (item.status === 1) lateCount++; // Late
      else if (item.status === 2) absentCount++; // Absent
    });

    setStats({
      total: data.length, // Tạm thời dùng tổng số record
      present: presentCount,
      late: lateCount,
      absent: absentCount
    });
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]"><CheckCircle2 className="w-3 h-3" /> Đúng giờ</span>;
      case 1:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFF8E1] text-[#F57F17] border border-[#FFE082]"><AlertCircle className="w-3 h-3" /> Đi trễ</span>;
      case 3:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFF3E0] text-[#E65100] border border-[#FFCC80]"><Clock className="w-3 h-3" /> Về sớm</span>;
      case 2:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFEBEE] text-[#C62828] border border-[#EF9A9A]"><XCircle className="w-3 h-3" /> Vắng mặt</span>;
      default:
        return <span>Khác</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Tìm kiếm nhân viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-surface-container-high bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="px-3 py-2 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all whitespace-nowrap">
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <MetricCard
          title="Tổng bản ghi"
          value={stats.total.toString()}
          trend="Tất cả ca làm việc"
          trendType="neutral"
          icon={Users}
          iconBgColor="bg-primary-container"
          iconColor="text-primary"
        />
        <MetricCard
          title="Đúng giờ"
          value={stats.present.toString()}
          trend="Đang làm việc"
          trendType="up"
          icon={CheckCircle2}
          iconBgColor="bg-[#E8F5E9]"
          iconColor="text-[#2E7D32]"
        />
        <MetricCard
          title="Đi trễ"
          value={stats.late.toString()}
          trend="Cần lưu ý"
          trendType="warning"
          icon={AlertCircle}
          iconBgColor="bg-[#FFF8E1]"
          iconColor="text-[#F57F17]"
        />
        <MetricCard
          title="Vắng mặt"
          value={stats.absent.toString()}
          trend="Chưa thấy check-in"
          trendType="warning"
          icon={XCircle}
          iconBgColor="bg-[#FFEBEE]"
          iconColor="text-[#C62828]"
        />
      </div>

      {/* Data Table */}
      <div className="bg-white border border-surface-container-high rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-surface-container-high text-xs uppercase tracking-wider text-on-surface-variant">
                <th className="px-4 py-3 font-bold">Nhân viên</th>
                <th className="px-4 py-3 font-bold">Ngày</th>
                <th className="px-4 py-3 font-bold">Giờ Vào</th>
                <th className="px-4 py-3 font-bold">Giờ Ra</th>
                <th className="px-4 py-3 font-bold">Tổng giờ</th>
                <th className="px-4 py-3 font-bold">Kết nối</th>
                <th className="px-4 py-3 font-bold">Trạng thái</th>
                <th className="px-4 py-3 font-bold text-center">Selfie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low text-sm">
              {attendanceData.filter(x => x.staffName.toLowerCase().includes(searchTerm.toLowerCase())).map((record) => (
                <tr key={record.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {record.staffName.charAt(0)}
                      </div>
                      <span className="font-semibold text-on-surface">{record.staffName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant font-medium">
                    {new Date(record.date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-mono ${record.checkInTime ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit'}) : "--:--"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-on-surface-variant">
                      {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit'}) : "--:--"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-on-surface">{record.totalHours}h</td>
                  <td className="px-4 py-3">
                    {record.checkInIpAddress ? (
                      <div className="flex flex-col gap-1 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1"><Wifi className="w-3 h-3 text-primary" /> {record.checkInWifiMac || record.checkInIpAddress}</span>
                        {record.checkInLatitude && record.checkInLongitude ? (
                           <a href={`https://www.google.com/maps?q=${record.checkInLatitude},${record.checkInLongitude}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                             <MapPin className="w-3 h-3" /> Xem vị trí
                           </a>
                        ) : (
                           <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-secondary" /> Chưa có GPS</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-on-surface-variant">--</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(record.status)}</td>
                  <td className="px-4 py-3 text-center">
                    {record.checkInPhotoUrl ? (
                       <button onClick={() => setSelectedPhoto(record.checkInPhotoUrl)} className="p-2 rounded-full hover:bg-surface-container-low text-primary transition-colors bg-primary/5" title="Xem ảnh Check-in">
                         <Camera className="w-4 h-4" />
                       </button>
                    ) : (
                      <span className="text-on-surface-variant/50">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <div className="p-6 text-center text-on-surface-variant">Đang tải dữ liệu...</div>}
        {!loading && attendanceData.length === 0 && (
          <div className="p-6 text-center text-on-surface-variant">
            Không tìm thấy dữ liệu chấm công nào.
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-3xl w-full p-4 flex flex-col items-center">
            <button className="absolute top-4 right-4 text-white hover:text-error bg-black/50 rounded-full p-2" onClick={() => setSelectedPhoto(null)}>
              <XCircle className="w-8 h-8" />
            </button>
            <img src={selectedPhoto} alt="Check-in Selfie" className="max-h-[85vh] object-contain rounded-xl shadow-2xl border-4 border-white" />
          </div>
        </div>
      )}

    </div>
  );
}
