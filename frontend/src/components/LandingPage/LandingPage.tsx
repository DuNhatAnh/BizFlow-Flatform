import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Building2, Sparkles, Mic, Calculator, Users, ArrowRight, 
  CheckCircle2, Zap, Lock, Store, ShoppingBag, Utensils, Coffee, Scissors,
  PieChart, Activity, FileText, ChevronRight, ShieldCheck, DollarSign, Clock
} from "lucide-react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    // Force rebuild
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFCFF] font-sans overflow-x-hidden selection:bg-[#2E5CE6]/20 selection:text-[#2E5CE6] text-[#111827]">
      
      {/* NAVBAR */}
      <nav className={`fixed w-full z-50 top-0 transition-all duration-700 bg-white/90 backdrop-blur-md border-b border-[#E5EAF3] ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/icon.svg" alt="BizFlow Logo" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
            <span className="font-extrabold text-2xl md:text-3xl tracking-tight text-[#111827]">BizFlow</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Link 
              href="/login"
              className="text-sm font-semibold text-[#5B667A] hover:text-[#2E5CE6] transition-colors px-3 py-2 hidden sm:block"
            >
              Đăng nhập
            </Link>
            <Link 
              href="/register"
              className="text-sm font-bold text-white bg-[#2E5CE6] hover:bg-[#2E5CE6]/90 transition-colors px-5 py-2 md:py-2.5 rounded-lg flex items-center gap-2 shadow-sm"
            >
              Mở gian hàng 
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-20">
        
        {/* HERO SECTION */}
        <section className="relative pt-8 md:pt-12 pb-24 md:pb-32 overflow-hidden">
          
          {/* Background Layer (SVG Water Waves) */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-end justify-center">
            <svg className="absolute w-[200%] h-full opacity-80 min-w-[1440px] top-0 left-[-50%]" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
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
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[30px]"></div>
          </div>

          <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Hero Text (Left - ~50%) */}
            <div className={`lg:col-span-6 relative z-20 transition-all duration-1000 delay-100 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'} lg:pr-4`}>
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F0FE] text-[#2E5CE6] text-sm font-semibold mb-6">
                <div className="w-2 h-2 rounded-full bg-[#2E5CE6]"></div>
                Nền tảng quản trị thế hệ mới
              </div>

              <h1 className="text-[36px] sm:text-[44px] lg:text-[40px] xl:text-[54px] font-extrabold text-[#111827] tracking-tight leading-[1.15] mb-6 flex flex-col items-start">
                <span className="whitespace-nowrap">Kinh doanh thịnh vượng</span>
                <span className="text-[#2E5CE6] whitespace-nowrap mt-1">đáp ứng mọi chuẩn mực</span>
              </h1>
              
              <p className="text-[17px] text-[#5B667A] mb-10 leading-relaxed font-medium">
                BizFlow là hệ sinh thái quản trị toàn diện dành cho hộ kinh doanh và doanh nghiệp nhỏ - từ bán hàng (POS), quản lý kho đến kế toán chuẩn Thông tư 88, giúp bạn vận hành hiệu quả và phát triển bền vững.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link href="/register" className="inline-flex justify-center items-center gap-2 px-8 py-3.5 rounded-[12px] bg-[#2E5CE6] text-white font-bold hover:bg-[#234BCC] transition-all shadow-[0_8px_20px_-6px_rgba(46,92,230,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(46,92,230,0.5)] hover:-translate-y-0.5">
                  Bắt đầu miễn phí <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="#features" className="inline-flex justify-center items-center px-8 py-3.5 rounded-[12px] bg-white text-[#2E5CE6] font-bold border-2 border-[#2E5CE6]/20 hover:border-[#2E5CE6] transition-all hover:bg-gray-50">
                  Khám phá tính năng
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-[#111827]">
                <div className="flex items-center gap-2.5 bg-white px-5 py-2.5 rounded-[12px] shadow-sm border border-[#E5EAF3]">
                  <div className="w-6 h-6 rounded-full bg-[#2E5CE6] flex items-center justify-center text-white"><ShieldCheck className="w-3.5 h-3.5"/></div>
                  Không phí ẩn
                </div>
                <div className="flex items-center gap-2.5 bg-white px-5 py-2.5 rounded-[12px] shadow-sm border border-[#E5EAF3]">
                  <div className="w-6 h-6 rounded-full bg-[#2E5CE6] flex items-center justify-center text-white"><Clock className="w-3.5 h-3.5"/></div>
                  Thiết lập 2 phút
                </div>
              </div>
            </div>

            {/* Hero Mockup (Right - ~50%) */}
            <div 
              className={`lg:col-span-6 relative z-10 transition-all duration-700 ease-out delay-300 mt-10 lg:mt-0 group ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'} w-full xl:w-[110%]`}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div 
                className="relative transition-all duration-700 ease-out [transform:perspective(2000px)_rotateY(-20deg)_rotateX(10deg)_rotateZ(-2deg)]"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Offset Backdrop Layer (Glassmorphism shadow effect) */}
                <div className="absolute top-10 -left-10 w-full h-full bg-[#2E5CE6]/10 backdrop-blur-3xl rounded-[20px] shadow-[0_40px_100px_-20px_rgba(46,92,230,0.3)] z-0 hidden lg:block" style={{ transform: "translateZ(-50px)" }}></div>

                {/* Main Mockup Container */}
                <div className="relative z-10 rounded-[20px] bg-white border border-[#E5EAF3] shadow-2xl overflow-hidden flex min-h-[500px]">
                
                {/* Sidebar */}
                <div className="w-[200px] bg-[#FAFCFF] border-r border-[#E5EAF3] flex flex-col hidden sm:flex">
                  <div className="flex flex-col items-center gap-2 mb-6 px-4 pt-6">
                    <img src="/icon.svg" className="w-10 h-10" alt="Logo" />
                    <div className="flex flex-col items-center">
                      <span className="font-extrabold text-[14px] text-[#2E5CE6] tracking-widest uppercase">BizFlow</span>
                      <span className="text-[8px] text-[#9CA3AF] tracking-[0.2em] uppercase">Platform</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto px-3 space-y-4 pb-4">
                    <div>
                      <div className="text-[9px] font-bold text-[#9CA3AF] uppercase mb-2 px-2 tracking-wider">Tổng quan</div>
                      <div className="flex items-center gap-2.5 px-3 py-2 bg-[#2E5CE6] text-white rounded-[8px] font-medium text-xs shadow-[0_4px_10px_rgba(46,92,230,0.2)]">
                        <Activity className="w-3.5 h-3.5" /> Tổng quan
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-[9px] font-bold text-[#9CA3AF] uppercase mb-2 px-2 tracking-wider">Quản lý</div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2.5 px-3 py-1.5 text-[#5B667A] hover:bg-gray-100 rounded-[8px] font-medium text-xs cursor-pointer">
                          <ShoppingBag className="w-3.5 h-3.5" /> Hàng hóa & Đơn vị
                        </div>
                        <div className="flex items-center gap-2.5 px-3 py-1.5 text-[#5B667A] hover:bg-gray-100 rounded-[8px] font-medium text-xs cursor-pointer">
                          <Store className="w-3.5 h-3.5" /> Quản lý Kho hàng
                        </div>
                        <div className="flex items-center gap-2.5 px-3 py-1.5 text-[#5B667A] hover:bg-gray-100 rounded-[8px] font-medium text-xs cursor-pointer">
                          <Users className="w-3.5 h-3.5" /> Khách hàng
                        </div>
                        <div className="flex items-center gap-2.5 px-3 py-1.5 text-[#5B667A] hover:bg-gray-100 rounded-[8px] font-medium text-xs cursor-pointer">
                          <Users className="w-3.5 h-3.5" /> Quản lý nhân sự
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-[9px] font-bold text-[#9CA3AF] uppercase mb-2 px-2 tracking-wider">Tài chính</div>
                      <div className="flex items-center gap-2.5 px-3 py-1.5 text-[#5B667A] hover:bg-gray-100 rounded-[8px] font-medium text-xs cursor-pointer">
                        <DollarSign className="w-3.5 h-3.5" /> Sổ quỹ & Thu chi
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-[9px] font-bold text-[#9CA3AF] uppercase mb-2 px-2 tracking-wider">Báo cáo & Cài đặt</div>
                      <div className="flex items-center gap-2.5 px-3 py-1.5 text-[#5B667A] hover:bg-gray-100 rounded-[8px] font-medium text-xs cursor-pointer">
                        <FileText className="w-3.5 h-3.5" /> Sổ sách Thuế (TT88)
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border-t border-[#E5EAF3] bg-white">
                    <div className="flex items-center gap-2 px-2">
                      <div className="w-7 h-7 rounded-full bg-[#E8F0FE] text-[#2E5CE6] font-bold text-[9px] flex items-center justify-center">DH</div>
                      <div>
                        <div className="text-[11px] font-bold text-[#111827]">Dư Nhật Hạ</div>
                        <div className="text-[9px] text-[#5B667A]">Vai trò: Chủ cửa hàng</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col bg-white">

                  {/* Dashboard Content */}
                  <div className="p-6 overflow-y-auto">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-[20px] font-bold text-[#111827]">Tổng quan kinh doanh</h2>
                        <div className="text-[13px] font-medium text-[#5B667A] mt-1">Hôm nay, 1 tháng 8, 2026</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-[#5B667A] cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#E8F0FE] text-[#2E5CE6] font-bold text-xs flex items-center justify-center">
                          AD
                        </div>
                      </div>
                    </div>

                    {/* Metric Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                      <div className="bg-white p-4 rounded-[16px] border border-[#E5EAF3] shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="text-[11px] uppercase text-[#5B667A] font-bold mb-1 tracking-wider">Doanh thu</div>
                          <div className="text-[24px] font-bold text-[#111827] mb-2 leading-none">12.5M đ</div>
                        </div>
                        <div className="text-[12px] font-semibold text-green-500 whitespace-nowrap">
                          ↑ 18.6% <span className="text-[#9CA3AF] font-medium ml-1">so với hôm qua</span>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-[16px] border border-[#E5EAF3] shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="text-[11px] uppercase text-[#5B667A] font-bold mb-1 tracking-wider">Đơn hàng</div>
                          <div className="text-[24px] font-bold text-[#111827] mb-2 leading-none">156</div>
                        </div>
                        <div className="text-[12px] font-semibold text-green-500 whitespace-nowrap">
                          ↑ 12.3% <span className="text-[#9CA3AF] font-medium ml-1">so với hôm qua</span>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-[16px] border border-[#E5EAF3] shadow-sm hidden md:flex flex-col justify-between">
                        <div>
                          <div className="text-[11px] uppercase text-[#5B667A] font-bold mb-1 tracking-wider">Khách mới</div>
                          <div className="text-[24px] font-bold text-green-600 mb-2 leading-none">+24</div>
                        </div>
                        <div className="text-[12px] font-semibold text-green-500 whitespace-nowrap">
                          ↑ 20.0% <span className="text-[#9CA3AF] font-medium ml-1">so với hôm qua</span>
                        </div>
                      </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white rounded-[12px] border border-[#E5EAF3] shadow-sm p-4 mt-2">
                      {/* Header Controls */}
                      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                        <div className="flex items-center gap-4">
                          <div className="text-[13px] font-bold text-[#111827]">Lịch sử Xuất kho</div>
                          <div className="hidden xl:flex items-center gap-1 bg-[#F5F8FF] p-0.5 rounded-full text-[9px] font-medium border border-[#E5EAF3]">
                            <div className="px-3 py-1 bg-white text-[#111827] rounded-full shadow-sm">Tất cả</div>
                            <div className="px-3 py-1 text-[#5B667A]">Phiếu xuất kho</div>
                            <div className="px-3 py-1 text-[#5B667A]">Xuất từ bán hàng</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5EAF3] rounded-full text-[9px] text-[#9CA3AF]">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            Tìm theo mã phiếu...
                          </div>
                          <div className="px-3 py-1.5 bg-[#FFF8E6] text-[#D97706] rounded-full text-[9px] font-bold border border-[#FDE68A] flex items-center gap-1 cursor-pointer hover:bg-[#FEF3C7] transition-colors">
                            <span>↑</span> Lập Phiếu Xuất Kho
                          </div>
                        </div>
                      </div>
                      
                      {/* Table Content */}
                      <div className="w-full overflow-hidden border border-[#E5EAF3] rounded-[8px]">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                          <thead>
                            <tr className="border-b border-[#E5EAF3] text-[8px] font-bold text-[#5B667A] uppercase tracking-wider bg-[#FAFCFF]">
                              <th className="p-2.5 font-bold text-center">STT</th>
                              <th className="p-2.5 font-bold">Ngày tạo</th>
                              <th className="p-2.5 font-bold">Loại phiếu</th>
                              <th className="p-2.5 font-bold">Mã phiếu</th>
                              <th className="p-2.5 font-bold text-right">Tổng tiền</th>
                              <th className="p-2.5 font-bold text-center">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="text-[10px] text-[#111827]">
                            <tr className="border-b border-[#E5EAF3]/50 hover:bg-[#FAFCFF]">
                              <td className="p-2.5 text-center font-bold">1</td>
                              <td className="p-2.5 text-[#5B667A]">16:29:20 27/6/2026</td>
                              <td className="p-2.5"><span className="px-1.5 py-0.5 bg-[#E8F0FE] text-[#2E5CE6] rounded-[4px] font-semibold text-[9px]">Bán hàng</span></td>
                              <td className="p-2.5 font-medium">128D12D7</td>
                              <td className="p-2.5 text-right font-bold text-[#2E5CE6]">170.000 đ</td>
                              <td className="p-2.5 text-center"><span className="px-2 py-1 bg-gray-100 text-[#5B667A] rounded-full text-[9px] font-medium">Bản nháp</span></td>
                            </tr>
                            <tr className="border-b border-[#E5EAF3]/50 hover:bg-[#FAFCFF]">
                              <td className="p-2.5 text-center font-bold">2</td>
                              <td className="p-2.5 text-[#5B667A]">14:53:58 27/6/2026</td>
                              <td className="p-2.5"><span className="px-1.5 py-0.5 bg-[#E8F0FE] text-[#2E5CE6] rounded-[4px] font-semibold text-[9px]">Bán hàng</span></td>
                              <td className="p-2.5 font-medium">AD3ABE58</td>
                              <td className="p-2.5 text-right font-bold text-[#2E5CE6]">2.500.000 đ</td>
                              <td className="p-2.5 text-center"><span className="px-2 py-1 bg-gray-100 text-[#5B667A] rounded-full text-[9px] font-medium">Bản nháp</span></td>
                            </tr>
                            <tr className="border-b border-[#E5EAF3]/50 hover:bg-[#FAFCFF]">
                              <td className="p-2.5 text-center font-bold">3</td>
                              <td className="p-2.5 text-[#5B667A]">14:45:25 27/6/2026</td>
                              <td className="p-2.5"><span className="px-1.5 py-0.5 bg-[#E8F0FE] text-[#2E5CE6] rounded-[4px] font-semibold text-[9px]">Bán hàng</span></td>
                              <td className="p-2.5 font-medium">HD010726-001</td>
                              <td className="p-2.5 text-right font-bold text-[#2E5CE6]">5.000.000 đ</td>
                              <td className="p-2.5 text-center"><span className="px-2 py-1 bg-[#E8F0FE] text-[#2E5CE6] rounded-full text-[9px] font-medium">Đã ghi sổ</span></td>
                            </tr>
                            <tr className="hover:bg-[#FAFCFF]">
                              <td className="p-2.5 text-center font-bold">4</td>
                              <td className="p-2.5 text-[#5B667A]">14:44:36 27/6/2026</td>
                              <td className="p-2.5"><span className="px-1.5 py-0.5 bg-[#E8F0FE] text-[#2E5CE6] rounded-[4px] font-semibold text-[9px]">Bán hàng</span></td>
                              <td className="p-2.5 font-medium">4BB01A3E</td>
                              <td className="p-2.5 text-right font-bold text-[#2E5CE6]">425.000 đ</td>
                              <td className="p-2.5 text-center"><span className="px-2 py-1 bg-gray-100 text-[#5B667A] rounded-full text-[9px] font-medium">Bản nháp</span></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
            </div>

            </div>
          </div>
        </section>

        {/* TRANSITION / VALUE PROPOSITION SECTION */}
        <section className="relative py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E5EAF3] p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[#E5EAF3]">
                <div className="px-6 pt-4 md:pt-0">
                  <div className="w-14 h-14 mx-auto bg-[#2E5CE6]/10 rounded-2xl flex items-center justify-center mb-5 transform transition-transform hover:scale-110">
                    <Zap className="w-7 h-7 text-[#2E5CE6]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#111827] mb-3 tracking-tight">Vận hành siêu tốc</h3>
                  <p className="text-[15px] text-[#5B667A] leading-relaxed">Lên đơn, thanh toán và in hóa đơn chỉ trong 3 giây. Trải nghiệm mượt mà không độ trễ.</p>
                </div>
                <div className="px-6 pt-10 md:pt-0">
                  <div className="w-14 h-14 mx-auto bg-green-500/10 rounded-2xl flex items-center justify-center mb-5 transform transition-transform hover:scale-110">
                    <ShieldCheck className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-[#111827] mb-3 tracking-tight">Chuẩn mực Thuế</h3>
                  <p className="text-[15px] text-[#5B667A] leading-relaxed">Tự động kết xuất sổ sách chứng từ tuân thủ tuyệt đối quy định của Thông tư 88.</p>
                </div>
                <div className="px-6 pt-10 md:pt-0">
                  <div className="w-14 h-14 mx-auto bg-purple-500/10 rounded-2xl flex items-center justify-center mb-5 transform transition-transform hover:scale-110">
                    <PieChart className="w-7 h-7 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-[#111827] mb-3 tracking-tight">Báo cáo trực quan</h3>
                  <p className="text-[15px] text-[#5B667A] leading-relaxed">Kiểm soát dòng tiền, doanh thu và lợi nhuận realtime mọi lúc, trên mọi thiết bị.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES Z-PATTERN */}
        <section id="features" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
            
            {/* Feature 1: Sổ sách (Text Left, Image Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-12 h-12 bg-[#2E5CE6]/10 rounded-xl flex items-center justify-center mb-6">
                  <Calculator className="w-6 h-6 text-[#2E5CE6]" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-4 tracking-tight">Tự động hoá sổ sách TT88</h2>
                <p className="text-lg text-[#5B667A] mb-8 leading-relaxed">Kế toán không còn là nỗi lo. Mọi giao dịch bán hàng, thu chi được tự động hạch toán đầy đủ các sổ từ S1 đến S7 theo đúng quy chuẩn của Thông tư 88.</p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#2E5CE6] shrink-0 mt-0.5" />
                    <span className="text-[#111827] font-medium">Đầy đủ các sổ S1 - S7 chuẩn Thuế</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#2E5CE6] shrink-0 mt-0.5" />
                    <span className="text-[#111827] font-medium">Hoá đơn bán hàng, phiếu thu, phiếu chi</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#2E5CE6] shrink-0 mt-0.5" />
                    <span className="text-[#111827] font-medium">Quản lý tồn kho, phiếu xuất/nhập kho</span>
                  </li>
                </ul>
              </div>
              <div className="relative bg-white p-6 rounded-2xl shadow-xl border border-[#E5EAF3] transform lg:rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#E5EAF3]">
                  <div className="font-bold text-[#111827]">Sổ chi tiết doanh thu (S1-ĐH)</div>
                  <div className="text-xs bg-[#DCE7FF] text-[#2E5CE6] px-2 py-1 rounded-md font-semibold">Tháng này</div>
                </div>
                <div className="space-y-3">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="text-[#111827] font-medium">Hóa đơn #{1024 + i}</span>
                        <span className="text-xs text-[#5B667A]">Hôm nay, 08:30</span>
                      </div>
                      <div className="font-semibold text-green-600">+{(150000 * i).toLocaleString('vi-VN')} đ</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature 2: Lên đơn AI (Image Left, Text Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 relative bg-white p-6 rounded-2xl shadow-xl border border-[#E5EAF3] transform lg:-rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="flex flex-col items-center justify-center p-8 bg-[#F5F8FF] rounded-xl border border-[#DCE7FF] border-dashed mb-4">
                  <div className="w-16 h-16 bg-[#2E5CE6] rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-sm font-medium text-[#2E5CE6]">"Cho 2 cafe sữa đá, 1 đen đá mang về..."</div>
                </div>
                <div className="bg-[#111827] text-white p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-sky-400 uppercase tracking-widest"><Sparkles className="w-3 h-3"/> AI Đã phân tích</div>
                  <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2 mb-2">
                    <span>2x Cafe sữa đá</span><span>70.000đ</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pb-2 mb-2 border-b border-white/10">
                    <span>1x Đen đá</span><span>25.000đ</span>
                  </div>
                  <div className="flex justify-between items-center font-bold">
                    <span>Tổng cộng:</span><span className="text-[#2E5CE6] bg-white px-2 py-0.5 rounded">95.000đ</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="w-12 h-12 bg-[#2E5CE6]/10 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-[#2E5CE6]" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-4 tracking-tight">Lên đơn hàng siêu tốc bằng giọng nói</h2>
                <p className="text-lg text-[#5B667A] mb-6 leading-relaxed">Đừng mất thời gian tìm món, gõ phím. AI thông minh của BizFlow tự động nghe, phân tích và tạo giỏ hàng chỉ trong tíc tắc.</p>
                <Link href="/register" className="inline-flex items-center gap-2 text-[#2E5CE6] font-bold hover:underline">
                  Trải nghiệm AI ngay <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Feature 3: Phân quyền (Text Left, Image Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-12 h-12 bg-[#2E5CE6]/10 rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6 text-[#2E5CE6]" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-4 tracking-tight">Phân quyền bảo mật tuyệt đối</h2>
                <p className="text-lg text-[#5B667A] mb-8 leading-relaxed">Phân chia rõ ràng vai trò Chủ cửa hàng, Quản lý và Thu ngân. Giới hạn quyền xem báo cáo doanh thu và thực hiện các thao tác xoá/sửa hoá đơn.</p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1.5 bg-white border border-[#E5EAF3] rounded-lg text-sm font-semibold text-[#111827] flex items-center gap-1.5 shadow-sm"><Users className="w-4 h-4 text-[#5B667A]"/> Chủ cửa hàng</span>
                  <span className="px-3 py-1.5 bg-white border border-[#E5EAF3] rounded-lg text-sm font-semibold text-[#111827] flex items-center gap-1.5 shadow-sm"><Users className="w-4 h-4 text-[#5B667A]"/> Quản lý</span>
                  <span className="px-3 py-1.5 bg-white border border-[#E5EAF3] rounded-lg text-sm font-semibold text-[#111827] flex items-center gap-1.5 shadow-sm"><Users className="w-4 h-4 text-[#5B667A]"/> Thu ngân</span>
                </div>
              </div>
              <div className="relative bg-white p-6 rounded-2xl shadow-xl border border-[#E5EAF3]">
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-[#E5EAF3] rounded-xl bg-[#F5F8FF]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#DCE7FF] rounded-full flex items-center justify-center text-[#2E5CE6] font-bold">QA</div>
                        <div>
                          <div className="font-bold text-[#111827] text-sm">Quản trị viên (Admin)</div>
                          <div className="text-xs text-[#5B667A]">Toàn quyền hệ thống</div>
                        </div>
                      </div>
                      <div className="w-12 h-6 bg-[#2E5CE6] rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-[#E5EAF3] rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-[#5B667A] font-bold">TN</div>
                        <div>
                          <div className="font-bold text-[#111827] text-sm">Nhân viên Thu ngân</div>
                          <div className="text-xs text-[#5B667A]">Chỉ tạo đơn & thanh toán</div>
                        </div>
                      </div>
                      <div className="w-12 h-6 bg-[#E5EAF3] rounded-full relative"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
                    </div>
                 </div>
              </div>
            </div>

          </div>
        </section>

        {/* CTA BOTTOM */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-[#F5F8FF] rounded-[2rem] p-10 md:p-16 border border-[#DCE7FF] shadow-sm">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#111827] mb-6 tracking-tight">Sẵn sàng để chuyển đổi?</h2>
            <p className="text-xl text-[#5B667A] mb-10 max-w-2xl mx-auto">
              Chỉ mất 2 phút để thiết lập gian hàng. Khởi tạo sổ sách tự động ngay hôm nay.
            </p>
            <Link 
              href="/register"
              className="inline-flex px-10 py-4 text-lg font-bold text-white bg-[#2E5CE6] hover:bg-[#2E5CE6]/90 rounded-xl shadow-lg shadow-[#2E5CE6]/20 transition-all items-center justify-center gap-3"
            >
              Mở gian hàng miễn phí
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#E5EAF3]/50 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src="/icon.svg" alt="BizFlow" className="w-8 h-8" />
                <span className="font-extrabold text-xl text-[#111827]">BizFlow Platform</span>
              </div>
              <p className="text-[#5B667A] text-sm leading-relaxed max-w-sm">
                Nền tảng quản trị thông minh dành riêng cho Hộ kinh doanh tại Việt Nam. Tuân thủ tuyệt đối quy chuẩn sổ sách TT88/2021/TT-BTC.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-[#111827] uppercase tracking-wider text-xs mb-4">Sản phẩm</h4>
              <ul className="space-y-3 text-sm text-[#5B667A]">
                <li><Link href="#" className="hover:text-[#2E5CE6]">Phần mềm Bán hàng POS</Link></li>
                <li><Link href="#" className="hover:text-[#2E5CE6]">Kế toán Sổ sách TT88</Link></li>
                <li><Link href="#" className="hover:text-[#2E5CE6]">Quản lý Tồn kho</Link></li>
                <li><Link href="#" className="hover:text-[#2E5CE6]">Trợ lý AI Order</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#111827] uppercase tracking-wider text-xs mb-4">Liên hệ</h4>
              <ul className="space-y-3 text-sm text-[#5B667A]">
                <li>Hotline: 1900 xxxx</li>
                <li>Email: hotro@bizflow.vn</li>
                <li>Địa chỉ: TP. Hồ Chí Minh</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[#E5EAF3] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#5B667A] text-sm">
              &copy; 2026 BizFlow Platform. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm font-medium text-[#5B667A]">
              <Link href="#" className="hover:text-[#2E5CE6]">Chính sách bảo mật</Link>
              <Link href="#" className="hover:text-[#2E5CE6]">Điều khoản sử dụng</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
