"use client";

import React from "react";
import { 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Tag, 
  UserPlus 
} from "lucide-react";

export default function AIInsight() {
  return (
    <div className="bg-gradient-to-r from-primary/5 via-white to-white p-6 rounded-xl border border-primary/20 shadow-card flex flex-col lg:flex-row items-center gap-8">
      
      {/* Left side: Message and Action */}
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2 text-primary font-bold">
          <Sparkles className="w-5 h-5 text-primary fill-primary/10" />
          <h3 className="text-base font-bold text-primary">Smart AI Insight</h3>
        </div>
        <p className="text-sm text-on-surface-variant mt-3 leading-relaxed">
          Doanh thu tăng trưởng <strong className="text-primary">18.5%</strong> so với hôm qua, chủ yếu nhờ vào nhóm sản phẩm <strong>Áo thun nam cổ tròn</strong>. Bạn nên nhập thêm sản phẩm này để đáp ứng nhu cầu khách hàng.
        </p>
        <button className="mt-5 flex items-center gap-2 px-4 py-2 bg-white border border-primary text-primary hover:bg-primary/5 rounded-lg text-sm font-semibold transition-all group">
          <span>Xem chi tiết phân tích</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Right side: 3 Mini metrics containers */}
      <div className="w-full lg:w-auto grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
        
        {/* Card 1: Dự báo doanh thu */}
        <div className="bg-white p-4 rounded-xl border border-surface-container flex items-center gap-4 min-w-[200px]">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-on-surface-variant">Dự báo doanh thu</p>
            <p className="text-sm font-bold text-on-surface mt-0.5">52.800.000 đ</p>
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">↑ 15.2% so với tuần trước</p>
          </div>
        </div>

        {/* Card 2: Sản phẩm tiềm năng */}
        <div className="bg-white p-4 rounded-xl border border-surface-container flex items-center gap-4 min-w-[200px]">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Tag className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-on-surface-variant">Sản phẩm tiềm năng</p>
            <p className="text-sm font-bold text-on-surface mt-0.5">3</p>
            <p className="text-[10px] text-on-surface-variant mt-0.5">Sản phẩm nên nhập thêm</p>
          </div>
        </div>

        {/* Card 3: Khách hàng mới */}
        <div className="bg-white p-4 rounded-xl border border-surface-container flex items-center gap-4 min-w-[200px]">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
            <UserPlus className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-on-surface-variant">Khách hàng mới</p>
            <p className="text-sm font-bold text-on-surface mt-0.5">248</p>
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">↑ 12.8% so với tuần trước</p>
          </div>
        </div>

      </div>

    </div>
  );
}
