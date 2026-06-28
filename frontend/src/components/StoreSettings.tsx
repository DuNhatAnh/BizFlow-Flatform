"use client";

import React, { useState, useEffect } from "react";
import { Store, Settings2, PackageCheck, Save, CheckCircle2, AlertCircle, Building2, HelpCircle, Pencil, X } from "lucide-react";

export default function StoreSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState<{ tenantId: string; token: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingTax, setIsEditingTax] = useState(false);
  const [vatInput, setVatInput] = useState("");

  const [storeData, setStoreData] = useState({
    id: "",
    name: "",
    address: "",
    phone: "",
    taxCode: "",
    email: "",
    logoUrl: "",
    enableVat: false,
    defaultVatRate: "10",
    availableVatRates: "0, 5, 8, 8.5, 10, KCT",
    cogsMethod: "WeightedAverage" // Default, this might come from tenant or store in the future
  });

  useEffect(() => {
    const stored = localStorage.getItem("bizflow_user");
    if (stored) {
      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);
      fetchStoreInfo(parsedUser);
    }
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStoreInfo = async (userObj: any) => {
    try {
      const res = await fetch(`http://localhost:5178/api/stores`, {
        headers: { "Authorization": `Bearer ${userObj.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const store = data[0]; // Assuming 1 store per tenant for now
          setIsEditingProfile(false);
          setStoreData({
            id: store.id,
            name: store.name || "",
            address: store.address || "",
            phone: store.phone || "",
            taxCode: store.taxCode || "",
            email: store.email || "",
            logoUrl: store.logoUrl || "",
            enableVat: store.enableVat ?? false,
            defaultVatRate: store.defaultVatRate || "10",
            availableVatRates: store.availableVatRates || "0, 5, 8, 8.5, 10, KCT",
            cogsMethod: store.cogsMethod || "WeightedAverage"
          });
        } else {
          setIsEditingProfile(true);
        }
      }
    } catch (e) {
      console.error("Failed to fetch store info", e);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    if (!storeData.name) {
      showToast("Vui lòng nhập tên cửa hàng", "error");
      return;
    }
    setIsLoading(true);
    try {
      const isNew = !storeData.id;
      const url = isNew ? `http://localhost:5178/api/stores` : `http://localhost:5178/api/stores/${storeData.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method: method,
        headers: { 
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: storeData.name,
          address: storeData.address,
          phone: storeData.phone,
          taxCode: storeData.taxCode,
          email: storeData.email,
          logoUrl: storeData.logoUrl,
          enableVat: storeData.enableVat,
          defaultVatRate: storeData.defaultVatRate,
          availableVatRates: storeData.availableVatRates
        })
      });

      if (res.ok) {
        const savedStore = await res.json();
        if (isNew && savedStore && savedStore.id) {
          setStoreData(prev => ({ ...prev, id: savedStore.id }));
        }
        setIsEditingProfile(false);
        showToast("Cập nhật thông tin cửa hàng thành công!");
      } else {
        showToast("Cập nhật thất bại", "error");
      }
    } catch (e) {
      showToast("Có lỗi xảy ra", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCogs = async () => {
    // In a real implementation, COGS might be saved to Tenant or Store API
    showToast("Đã lưu thiết lập kho & kế toán!");
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[70] px-6 py-3 rounded-full shadow-lg border animate-in slide-in-from-top-4 flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2">
          <Store className="w-7 h-7 text-primary" />
          Cài đặt Cửa hàng
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">Quản lý hồ sơ cửa hàng, cấu hình bán hàng và phương pháp kế toán.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-surface-container-high shadow-sm overflow-hidden flex flex-col">
            <button 
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 px-4 py-4 text-sm font-bold transition-colors border-l-4 ${
                activeTab === "profile" ? "border-primary bg-primary/5 text-primary" : "border-transparent text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <Building2 className="w-5 h-5" /> Thông tin chung
            </button>
            <button 
              onClick={() => setActiveTab("tax")}
              className={`flex items-center gap-3 px-4 py-4 text-sm font-bold transition-colors border-l-4 border-t border-surface-container-low ${
                activeTab === "tax" ? "border-primary bg-primary/5 text-primary" : "border-transparent text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <Settings2 className="w-5 h-5" /> Thiết lập Thuế VAT
            </button>
            <button 
              onClick={() => setActiveTab("inventory")}
              className={`flex items-center gap-3 px-4 py-4 text-sm font-bold transition-colors border-l-4 border-t border-surface-container-low ${
                activeTab === "inventory" ? "border-primary bg-primary/5 text-primary" : "border-transparent text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <PackageCheck className="w-5 h-5" /> Thiết lập Kho & Giá vốn
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <div className="bg-white rounded-2xl border border-surface-container-high shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-surface-container-low bg-surface-container-lowest flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-on-surface">Hồ sơ Cửa hàng</h3>
                  <p className="text-sm text-on-surface-variant mt-1">Thông tin này được sử dụng để in lên hóa đơn và báo cáo.</p>
                </div>
                {!isEditingProfile && (
                  <button 
                    onClick={() => setIsEditingProfile(true)}
                    className="px-4 py-2 border border-outline-variant hover:bg-surface-container-low text-on-surface-variant font-medium rounded-lg text-sm flex items-center gap-2 transition-colors"
                  >
                    <Pencil className="w-4 h-4" /> Chỉnh sửa
                  </button>
                )}
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Tên cửa hàng *</label>
                    <input 
                      type="text" 
                      value={storeData.name}
                      onChange={(e) => setStoreData({...storeData, name: e.target.value})}
                      disabled={!isEditingProfile}
                      className={`w-full p-3 border rounded-xl text-sm transition-all ${isEditingProfile ? "border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" : "border-transparent bg-surface-container-lowest text-on-surface disabled:opacity-100 disabled:cursor-default"}`} 
                      placeholder="VD: Cửa hàng tạp hóa Bình Minh"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Số điện thoại *</label>
                    <input 
                      type="text" 
                      value={storeData.phone}
                      onChange={(e) => setStoreData({...storeData, phone: e.target.value})}
                      disabled={!isEditingProfile}
                      className={`w-full p-3 border rounded-xl text-sm transition-all ${isEditingProfile ? "border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" : "border-transparent bg-surface-container-lowest text-on-surface disabled:opacity-100 disabled:cursor-default"}`} 
                      placeholder="Nhập số điện thoại liên hệ"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Địa chỉ cửa hàng *</label>
                    <textarea 
                      value={storeData.address}
                      onChange={(e) => setStoreData({...storeData, address: e.target.value})}
                      disabled={!isEditingProfile}
                      className={`w-full p-3 border rounded-xl text-sm transition-all min-h-[80px] ${isEditingProfile ? "border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" : "border-transparent bg-surface-container-lowest text-on-surface disabled:opacity-100 disabled:cursor-default"}`} 
                      placeholder="Nhập địa chỉ đầy đủ để in hóa đơn"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Mã số thuế (Tùy chọn)</label>
                    <input 
                      type="text" 
                      value={storeData.taxCode}
                      onChange={(e) => setStoreData({...storeData, taxCode: e.target.value})}
                      disabled={!isEditingProfile}
                      className={`w-full p-3 border rounded-xl text-sm transition-all ${isEditingProfile ? "border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" : "border-transparent bg-surface-container-lowest text-on-surface disabled:opacity-100 disabled:cursor-default"}`} 
                      placeholder="Mã số thuế Hộ kinh doanh"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Email (Tùy chọn)</label>
                    <input 
                      type="email" 
                      value={storeData.email}
                      onChange={(e) => setStoreData({...storeData, email: e.target.value})}
                      disabled={!isEditingProfile}
                      className={`w-full p-3 border rounded-xl text-sm transition-all ${isEditingProfile ? "border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" : "border-transparent bg-surface-container-lowest text-on-surface disabled:opacity-100 disabled:cursor-default"}`} 
                      placeholder="Email liên hệ"
                    />
                  </div>
                </div>
                {isEditingProfile && (
                  <div className="pt-4 flex justify-end gap-3 border-t border-surface-container-low">
                    <button 
                      onClick={() => {
                        setIsEditingProfile(false);
                        if (user) fetchStoreInfo(user); // reset data
                      }}
                      className="px-6 py-2.5 border border-outline-variant hover:bg-surface-container-low text-on-surface-variant font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all"
                    >
                      <X className="w-4 h-4" /> Hủy
                    </button>
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isLoading || !storeData.name}
                      className="px-6 py-2.5 bg-primary hover:bg-primary-container text-white font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isLoading ? "Đang lưu..." : <><Save className="w-4 h-4" /> Lưu cấu hình</>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "tax" && (
            <div className="bg-white rounded-2xl border border-surface-container-high shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-surface-container-low bg-surface-container-lowest flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-on-surface">Thiết lập Thuế VAT (Giá trị gia tăng)</h3>
                  <p className="text-sm text-on-surface-variant mt-1">Cấu hình các mức thuế và thuế mặc định khi tạo mới sản phẩm hoặc bán hàng.</p>
                </div>
                {!isEditingTax && (
                  <button 
                    onClick={() => setIsEditingTax(true)}
                    className="px-4 py-2 border border-outline-variant hover:bg-surface-container-low text-on-surface-variant font-medium rounded-lg text-sm flex items-center gap-2 transition-colors"
                  >
                    <Pencil className="w-4 h-4" /> Chỉnh sửa
                  </button>
                )}
              </div>
              <div className="p-6 space-y-6">
                
                <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-surface-container-low hover:border-primary/30 transition-colors">
                  <div>
                    <h4 className="font-bold text-sm text-on-surface">Kích hoạt tính Thuế VAT</h4>
                    <p className="text-xs text-on-surface-variant mt-1">Hệ thống sẽ hiển thị và hỗ trợ tính toán thuế VAT trên giao diện bán hàng và báo cáo.</p>
                  </div>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input 
                      type="checkbox" 
                      id="enableVat"
                      disabled={!isEditingTax}
                      checked={storeData.enableVat}
                      onChange={(e) => setStoreData({...storeData, enableVat: e.target.checked})}
                      className="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none transition-all z-10 disabled:opacity-50"
                      style={{ 
                        left: storeData.enableVat ? '1.5rem' : '0', 
                        borderColor: storeData.enableVat ? '#15803d' : '#cbd5e1' 
                      }}
                    />
                    <label 
                      htmlFor="enableVat" 
                      className={`block overflow-hidden h-6 rounded-full transition-colors ${!isEditingTax ? 'cursor-default opacity-50' : 'cursor-pointer'} ${storeData.enableVat ? 'bg-green-600' : 'bg-gray-300'}`}
                    ></label>
                  </div>
                </div>

                {storeData.enableVat && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-surface-container-lowest rounded-xl border border-surface-container-low animate-in fade-in slide-in-from-top-2 duration-300">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Các mức thuế có thể chọn</label>
                      
                      <div className="w-full p-2 border border-outline-variant rounded-xl text-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all bg-white min-h-[48px] flex flex-wrap gap-2 items-center">
                        {storeData.availableVatRates.split(',').map(r => r.trim()).filter(r => r).map((rate, idx) => (
                          <span key={idx} className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-bold text-xs">
                            {rate === 'KCT' ? 'KCT' : `${rate}%`}
                            {isEditingTax && (
                              <button 
                                type="button" 
                                className="hover:bg-primary/20 p-0.5 rounded-full transition-colors"
                              onClick={() => {
                                const currentList = storeData.availableVatRates.split(',').map(r => r.trim()).filter(r => r);
                                const newList = currentList.filter((_, i) => i !== idx);
                                const newRatesString = newList.join(', ');
                                
                                if (storeData.defaultVatRate === rate && newList.length > 0) {
                                   setStoreData({...storeData, availableVatRates: newRatesString, defaultVatRate: newList[0]});
                                } else {
                                   setStoreData({...storeData, availableVatRates: newRatesString});
                                }
                              }}
                            >
                              <X className="w-3 h-3" />
                              </button>
                            )}
                          </span>
                        ))}
                        {isEditingTax && (
                          <input 
                            type="text" 
                            value={vatInput}
                          onChange={(e) => setVatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault();
                              const val = vatInput.trim().toUpperCase();
                              const currentList = storeData.availableVatRates.split(',').map(r => r.trim()).filter(r => r);
                              if (val && !currentList.includes(val)) {
                                const newList = [...currentList, val];
                                setStoreData({...storeData, availableVatRates: newList.join(', ')});
                              }
                              setVatInput('');
                            }
                          }}
                          onBlur={() => {
                            const val = vatInput.trim().toUpperCase();
                            const currentList = storeData.availableVatRates.split(',').map(r => r.trim()).filter(r => r);
                            if (val && !currentList.includes(val)) {
                              const newList = [...currentList, val];
                              setStoreData({...storeData, availableVatRates: newList.join(', ')});
                            }
                            setVatInput('');
                          }}
                          className="flex-1 min-w-[120px] outline-none bg-transparent"
                            placeholder={!storeData.availableVatRates ? "Nhập mức thuế và nhấn Enter..." : ""}
                          />
                        )}
                      </div>
                      <p className="text-xs text-on-surface-variant mt-2">Nhập mức thuế và nhấn Enter. Hỗ trợ số (VD: 8.5) và chữ (VD: KCT).</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Mức thuế mặc định</label>
                      <select 
                        disabled={!isEditingTax}
                        value={storeData.defaultVatRate}
                        onChange={(e) => setStoreData({...storeData, defaultVatRate: e.target.value})}
                        className="w-full p-3 border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white disabled:opacity-70 disabled:cursor-default" 
                      >
                        {storeData.availableVatRates.split(',').map(r => r.trim()).filter(r => r).map(rate => (
                          <option key={rate} value={rate}>{rate === 'KCT' ? 'KCT (Không chịu thuế)' : `${rate}%`}</option>
                        ))}
                      </select>
                      <p className="text-xs text-on-surface-variant mt-2">Được tự động áp dụng khi thêm mới hàng hóa hoặc dịch vụ.</p>
                    </div>
                  </div>
                )}

                {isEditingTax && (
                  <div className="pt-4 flex justify-end gap-3 border-t border-surface-container-low mt-4">
                    <button 
                      onClick={() => {
                        setIsEditingTax(false);
                        if (user) fetchStoreInfo(user);
                      }}
                      className="px-6 py-2.5 border border-outline-variant hover:bg-surface-container-low text-on-surface-variant font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all"
                    >
                      <X className="w-4 h-4" /> Hủy
                    </button>
                    <button 
                      onClick={() => handleSaveProfile().then(() => setIsEditingTax(false))}
                      disabled={isLoading}
                      className="px-6 py-2.5 bg-primary hover:bg-primary-container text-white font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isLoading ? "Đang lưu..." : <><Save className="w-4 h-4" /> Lưu cấu hình VAT</>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="bg-white rounded-2xl border border-surface-container-high shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-surface-container-low bg-surface-container-lowest">
                <h3 className="font-bold text-lg text-on-surface">Cài đặt Phương pháp Tính giá Vốn (COGS)</h3>
                <p className="text-sm text-on-surface-variant mt-1">Lựa chọn cách hệ thống tính toán giá vốn hàng bán trên Sổ S2.</p>
              </div>
              <div className="p-6 space-y-6">
                
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex gap-4">
                  <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-red-800 font-bold text-sm">Khóa an toàn dữ liệu (Safe Lock)</h4>
                    <p className="text-xs text-red-700/80 mt-1 leading-relaxed">
                      Hệ thống đã ghi nhận các giao dịch xuất/nhập kho. Để đảm bảo tính nhất quán của Sổ S2 theo Chuẩn mực Kế toán, bạn không thể thay đổi phương pháp lúc này. Việc thay đổi chỉ được phép khi kho hàng đã được reset về 0.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className={`block relative p-5 border-2 rounded-xl cursor-pointer transition-all ${storeData.cogsMethod === "WeightedAverage" ? "border-primary bg-primary/5" : "border-outline-variant hover:border-primary/50"}`}>
                    <div className="flex items-center gap-4">
                      <input 
                        type="radio" 
                        name="cogs" 
                        value="WeightedAverage" 
                        checked={storeData.cogsMethod === "WeightedAverage"}
                        readOnly
                        className="w-5 h-5 text-primary accent-primary" 
                      />
                      <div>
                        <h4 className="font-bold text-on-surface text-sm">Bình quân gia quyền cả kỳ dự trữ (Mặc định)</h4>
                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                          Phù hợp với hầu hết các hộ kinh doanh bán lẻ. Giá trị mỗi đơn vị hàng hóa xuất kho được tính bằng trung bình cộng của giá trị hàng tồn đầu kỳ và giá trị hàng nhập trong kỳ.
                        </p>
                        <p className="text-[11px] text-primary/80 mt-2 bg-white px-3 py-1.5 rounded inline-block border border-primary/10">
                          <span className="font-bold">Ví dụ:</span> Nhập 10 cái giá 10k, nhập thêm 10 cái giá 12k. Giá bình quân xuất kho sẽ là 11k/cái.
                        </p>
                      </div>
                    </div>
                  </label>

                  <label className={`block relative p-5 border-2 rounded-xl cursor-pointer transition-all ${storeData.cogsMethod === "FIFO" ? "border-primary bg-primary/5" : "border-outline-variant opacity-60"}`}>
                    <div className="flex items-center gap-4">
                      <input 
                        type="radio" 
                        name="cogs" 
                        value="FIFO" 
                        checked={storeData.cogsMethod === "FIFO"}
                        disabled
                        className="w-5 h-5 text-primary accent-primary" 
                      />
                      <div>
                        <h4 className="font-bold text-on-surface text-sm">Nhập trước, Xuất trước (FIFO)</h4>
                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                          Phù hợp với các mặt hàng có hạn sử dụng (Thực phẩm, Dược phẩm). Hệ thống sẽ trừ xuất kho vào những lô hàng được nhập vào kho sớm nhất.
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="pt-4 flex justify-end border-t border-surface-container-low">
                  <button 
                    onClick={handleSaveCogs}
                    className="px-6 py-2.5 bg-primary hover:bg-primary-container text-white font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all"
                  >
                    <Save className="w-4 h-4" /> Lưu cấu hình
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
