"use client";

import React, { useState, useRef } from "react";
import { Package, X, AlertCircle, Save, Plus, Upload, Loader2 } from "lucide-react";
import UnitConfigRow from "./UnitConfigRow";
import { parseDescriptionMetadata, buildDescriptionMetadata } from "../../utils/metadata";
import imageCompression from 'browser-image-compression';
import { supabase } from '../../utils/supabase';

interface ProductUnit {
  id: number | null;
  unitName: string;
  conversionRate: number;
  price: number;
  isDefault: boolean;
}

interface Product {
  id: string;
  code: string;
  name: string;
  categoryId: number;
  baseUnit: string;
  description: string;
  vatRate?: string;
  priceIncludesVat?: boolean;
  units: ProductUnit[];
}

interface ProductEditModalProps {
  product: Product;
  categories: any[];
  onClose: () => void;
  onSave: (sanitizedProduct: Product) => Promise<void>;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export default function ProductEditModal({
  product: initialProduct,
  categories,
  onClose,
  onSave,
  showToast
}: ProductEditModalProps) {
  const [editingProduct, setEditingProduct] = useState<Product>(JSON.parse(JSON.stringify(initialProduct)));
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse metadata from description
  const parsedMeta = parseDescriptionMetadata(initialProduct.description);
  const getFallbackLocation = (categoryId: number) => {
    const catName = categories.find((c: any) => c.id === categoryId)?.name || '';
    if (catName.includes("Sắt") || catName.includes("Thép")) return "Bãi chứa số 1";
    if (catName.includes("Xi măng")) return "Kho A - Kệ 2";
    if (catName.includes("Gạch")) return "Khu bãi ngoài trời";
    if (catName.includes("Cát") || catName.includes("Đá")) return "Bãi xúc cát/đá";
    if (catName.includes("Sơn") || catName.includes("Hóa chất")) return "Khu Kệ B";
    return "Kho tổng - Kệ C";
  };

  const [descText, setDescText] = useState(parsedMeta.description);
  const [customMinStock, setCustomMinStock] = useState<number | "">(parsedMeta.minStock !== null ? parsedMeta.minStock : 10);
  const [customLocation, setCustomLocation] = useState(parsedMeta.location || getFallbackLocation(initialProduct.categoryId || 0));
  const initialUrls = (parsedMeta.imageUrl || "").split(",").map(s => s.trim()).filter(Boolean);
  const [imageUrls, setImageUrls] = useState<string[]>(initialUrls);

  const [availableVatRates, setAvailableVatRates] = useState<string[]>(["0", "5", "8", "10", "KCT"]);
  const [defaultVatRate, setDefaultVatRate] = useState<string>("10");
  
  React.useEffect(() => {
    const fetchStore = async () => {
      try {
        const auth = JSON.parse(localStorage.getItem("auth_info") || "{}");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5178/api'}/stores`, {
          headers: { "Authorization": `Bearer ${auth.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const store = data[0];
            if (store.availableVatRates) {
              setAvailableVatRates(store.availableVatRates.split(',').map((s:string) => s.trim()));
            }
            if (store.defaultVatRate) {
              setDefaultVatRate(store.defaultVatRate);
              if (!editingProduct.id && !editingProduct.vatRate) {
                setEditingProduct(prev => ({ ...prev, vatRate: store.defaultVatRate }));
              }
            }
          }
        }
      } catch (e) {}
    };
    fetchStore();
    
    // Set defaults if new product
    if (!editingProduct.id) {
      if (editingProduct.priceIncludesVat === undefined) {
        setEditingProduct(prev => ({ ...prev, priceIncludesVat: true }));
      }
    }
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setIsUploading(true);
      
      // Compress image
      const options = {
        maxSizeMB: 0.2, // 200KB limit
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };
      
      showToast(`Đang xử lý ${files.length} ảnh...`);
      const newUrls: string[] = [];

      for (const file of files) {
        const compressedFile = await imageCompression(file, options);
        const fileName = `images/${Date.now()}_${compressedFile.name}`;
        
        const { error } = await supabase
          .storage
          .from('products')
          .upload(fileName, compressedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;
        
        const { data: publicUrlData } = supabase
          .storage
          .from('products')
          .getPublicUrl(fileName);
          
        newUrls.push(publicUrlData.publicUrl);
      }
        
      setImageUrls(prev => [...prev, ...newUrls]);
      showToast("Tải ảnh thành công!", "success");
      
    } catch (error: any) {
      console.error("Lỗi upload ảnh:", error);
      showToast("Lỗi khi tải ảnh: " + error.message, "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleUnitChange = (index: number, field: keyof ProductUnit, value: any) => {
    const newUnits = [...editingProduct.units];
    newUnits[index] = { ...newUnits[index], [field]: value };
    setEditingProduct({ ...editingProduct, units: newUnits });
  };

  const handleSetDefaultUnit = (index: number) => {
    const newUnits = editingProduct.units.map((u, i) => ({
      ...u,
      isDefault: i === index
    }));
    setEditingProduct({ ...editingProduct, units: newUnits });
  };

  const handleAddUnit = () => {
    setEditingProduct({
      ...editingProduct,
      units: [
        ...editingProduct.units, 
        { id: null, unitName: "", conversionRate: 1, price: 0, isDefault: false }
      ]
    });
  };

  const handleRemoveUnit = (index: number) => {
    if (editingProduct.units.length <= 1) return;
    const newUnits = editingProduct.units.filter((_, i) => i !== index);
    if (!newUnits.find(u => u.isDefault)) {
      newUnits[0].isDefault = true;
    }
    setEditingProduct({ ...editingProduct, units: newUnits });
  };

  const handleSave = async () => {
    if (!editingProduct.name || !editingProduct.baseUnit || editingProduct.units.length === 0) {
      showToast("Vui lòng điền tên sản phẩm, đơn vị cơ bản và ít nhất 1 quy đổi.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const minStockVal = customMinStock === "" ? null : Number(customMinStock);
      const mergedImageUrl = imageUrls.join(",");
      const mergedDescription = buildDescriptionMetadata(descText, minStockVal, customLocation, mergedImageUrl);
      const finalProduct = {
        ...editingProduct,
        description: mergedDescription
      };
      await onSave(finalProduct);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 text-on-surface">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-surface-container-high flex justify-between items-center bg-surface-container-low/50">
          <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            {editingProduct.id ? "Cập nhật Sản phẩm" : "Thêm Sản phẩm Mới"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-surface-container-low/20">
          
          {/* Section 1: Basic Info */}
          <div className="bg-white p-5 rounded-xl border border-surface-container-high mb-6 shadow-sm">
            <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-4 border-b pb-2 border-surface-container-low">
              1. Thông tin chung
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Tên sản phẩm *</label>
                <input 
                  type="text" 
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary text-on-surface"
                  placeholder="VD: Xi măng Hà Tiên"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Mã vạch / SKU</label>
                <input 
                  type="text" 
                  value={editingProduct.code}
                  onChange={(e) => setEditingProduct({...editingProduct, code: e.target.value})}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm font-mono focus:outline-none focus:border-primary text-on-surface"
                  placeholder="VD: XM-HT-01"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Danh mục</label>
                <select 
                  value={editingProduct.categoryId || 0}
                  onChange={(e) => setEditingProduct({...editingProduct, categoryId: Number(e.target.value)})}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary text-on-surface cursor-pointer"
                >
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Đơn vị cơ bản (Base Unit) *</label>
                <input 
                  type="text" 
                  value={editingProduct.baseUnit}
                  onChange={(e) => setEditingProduct({...editingProduct, baseUnit: e.target.value})}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary text-on-surface"
                  placeholder="VD: Bao, Cái, Lon..."
                />
                <p className="text-[10px] text-on-surface-variant mt-1 italic">Đơn vị nhỏ nhất để kiểm kho.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Mức cảnh báo tồn kho tối thiểu</label>
                <input 
                  type="number" 
                  min="0"
                  value={customMinStock}
                  onChange={(e) => setCustomMinStock(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary text-on-surface"
                  placeholder="Mặc định: 10"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Vị trí lưu kho</label>
                <input 
                  type="text" 
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary text-on-surface"
                  placeholder="VD: Kho A - Kệ 2, Bãi 1..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Mức Thuế VAT</label>
                <select
                  value={editingProduct.vatRate || defaultVatRate}
                  onChange={(e) => setEditingProduct({...editingProduct, vatRate: e.target.value})}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary text-on-surface cursor-pointer"
                >
                  {availableVatRates.map(rate => (
                    <option key={rate} value={rate}>{rate === "KCT" ? "Không chịu thuế (KCT)" : `${rate}%`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Giá bán đã bao gồm VAT?</label>
                <div className="flex items-center gap-3 h-[38px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="priceIncludesVat" 
                      checked={editingProduct.priceIncludesVat !== false}
                      onChange={() => setEditingProduct({...editingProduct, priceIncludesVat: true})}
                      className="accent-primary"
                    />
                    <span className="text-sm">Đã bao gồm VAT</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="priceIncludesVat" 
                      checked={editingProduct.priceIncludesVat === false}
                      onChange={() => setEditingProduct({...editingProduct, priceIncludesVat: false})}
                      className="accent-primary"
                    />
                    <span className="text-sm">Chưa bao gồm</span>
                  </label>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Hình ảnh sản phẩm</label>
                <div className="flex gap-3 items-start flex-col">
                  <div>
                    <input 
                      type="file" 
                      accept="image/*"
                      multiple
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-on-secondary rounded-lg font-bold text-sm hover:bg-secondary-container hover:text-on-secondary-container transition-colors disabled:opacity-50 h-[38px] whitespace-nowrap"
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {isUploading ? "Đang xử lý..." : "Chọn ảnh"}
                    </button>
                  </div>
                  
                  {imageUrls.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-2">
                      {imageUrls.map((url, idx) => (
                        <div key={idx} className="relative w-24 h-24 rounded-lg border border-outline-variant overflow-hidden bg-surface-container-low flex items-center justify-center group">
                          <img src={url} alt="Preview" className="max-w-full max-h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=L%E1%BB%97i'; }} />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 bg-error text-on-error rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error-container hover:text-on-error-container"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Mô tả thêm</label>
                <textarea 
                  value={descText}
                  onChange={(e) => setDescText(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary text-on-surface"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Section 2: Units Config */}
          <div className="bg-white p-5 rounded-xl border border-surface-container-high shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-2 border-surface-container-low">
              <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
                2. Thiết lập Đơn vị & Giá bán
                <div className="group relative cursor-help">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-800 text-white text-xs p-2 rounded hidden group-hover:block z-10 font-normal">
                    1 Sản phẩm có thể có nhiều đơn vị. Tỷ lệ quy đổi tính theo Đơn vị cơ bản. <br/>
                    Ví dụ: Base = Lon. Lốc = 6 Lon (Tỷ lệ: 6).
                  </div>
                </div>
              </h4>
              <button 
                onClick={handleAddUnit}
                className="text-primary hover:text-primary-container text-xs font-bold flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-3 h-3" /> Thêm đơn vị
              </button>
            </div>

            <div className="space-y-3">
              {/* Headers for desktop */}
              <div className="hidden sm:grid grid-cols-12 gap-3 px-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                <div className="col-span-1 text-center">Mặc định</div>
                <div className="col-span-3">Tên Đơn Vị</div>
                <div className="col-span-3">Tỷ lệ (x {editingProduct.baseUnit || 'Base'})</div>
                <div className="col-span-4">Giá Bán (VNĐ)</div>
                <div className="col-span-1 text-center">Xóa</div>
              </div>

              {editingProduct.units.map((unit, index) => (
                <UnitConfigRow
                  key={unit.id ?? `new_${index}`}
                  unit={unit}
                  index={index}
                  baseUnit={editingProduct.baseUnit}
                  isDefaultChecked={unit.isDefault}
                  canRemove={editingProduct.units.length > 1}
                  onSetDefault={handleSetDefaultUnit}
                  onFieldChange={handleUnitChange}
                  onRemove={handleRemoveUnit}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-surface-container-high bg-surface-container-low/50 flex justify-end gap-3 rounded-b-2xl">
          <button 
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 text-sm font-bold bg-primary hover:bg-primary-container text-white rounded-lg flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Đang lưu..." : "Lưu Sản phẩm"}
          </button>
        </div>
      </div>
    </div>
  );
}
