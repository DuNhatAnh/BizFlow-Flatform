import React from "react";

export default function TenantTable() {
  return (
    <div className="bg-white rounded-xl border border-surface-container-high p-6 shadow-card">
      <h3 className="text-base font-bold text-on-surface mb-4">Các doanh nghiệp mới đăng ký gần đây</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-surface-container-high text-xs font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-low">
              <th className="p-4">Tên Doanh Nghiệp</th>
              <th className="p-4">Chủ sở hữu</th>
              <th className="p-4">Gói dịch vụ</th>
              <th className="p-4">Trạng thái CSDL</th>
              <th className="p-4 text-right">Ngày kích hoạt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low">
            <tr className="hover:bg-surface-container-low/50">
              <td className="p-4 font-bold text-on-surface">Cửa Hàng Tạp Hóa Bình Minh</td>
              <td className="p-4">Nguyễn Văn A</td>
              <td className="p-4">
                <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                  Gói Chuyên Nghiệp
                </span>
              </td>
              <td className="p-4">
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>Isolated Db Connection
                </span>
              </td>
              <td className="p-4 text-right text-on-surface-variant">11/06/2026</td>
            </tr>
            <tr className="hover:bg-surface-container-low/50">
              <td className="p-4 font-bold text-on-surface">Vật Liệu Xây Dựng Trường Sơn</td>
              <td className="p-4">Phan Thanh Tùng</td>
              <td className="p-4">
                <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                  Gói Chuyên Nghiệp
                </span>
              </td>
              <td className="p-4">
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>Isolated Db Connection
                </span>
              </td>
              <td className="p-4 text-right text-on-surface-variant">09/06/2026</td>
            </tr>
            <tr className="hover:bg-surface-container-low/50">
              <td className="p-4 font-bold text-on-surface">Nông Sản Sạch Đà Lạt Mart</td>
              <td className="p-4">Lê Thị Mai</td>
              <td className="p-4">
                <span className="px-2.5 py-1 bg-secondary/10 text-secondary text-xs font-semibold rounded-full">
                  Gói Cơ Bản
                </span>
              </td>
              <td className="p-4">
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>Isolated Db Connection
                </span>
              </td>
              <td className="p-4 text-right text-on-surface-variant">05/06/2026</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
