"use client";

import React, { useState } from "react";
import { Package, X, ShoppingCart } from "lucide-react";
import { parseDescriptionMetadata } from "../../utils/metadata";

interface UomCalculatorModalProps {
  product: any;
  categories: any[];
  isReadOnly: boolean;
  onAddToCart?: (product: any) => void;
  onClose: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export default function UomCalculatorModal({
  product,
  categories,
  isReadOnly,
  onAddToCart,
  onClose,
  showToast
}: UomCalculatorModalProps) {
  const [calcQuantity, setCalcQuantity] = useState<number>(1);
  const defaultUnit = product.units?.find((u: any) => u.isDefault) || product.units?.[0];
  const [selectedCalcUnitId, setSelectedCalcUnitId] = useState<number | null>(defaultUnit ? defaultUnit.id : null);

  const selectedUnitObj = product.units?.find((u: any) => u.id === selectedCalcUnitId);
  const uName = selectedUnitObj ? selectedUnitObj.unitName : product.baseUnit;
  const rate = selectedUnitObj ? selectedUnitObj.conversionRate : 1;
  const pricePerUOM = selectedUnitObj ? selectedUnitObj.price : (product.units?.find((u: any) => u.isDefault)?.price || 0);

  const totalEquivalentBase = calcQuantity * rate;
  const totalCost = calcQuantity * pricePerUOM;
  const stockEquivalentUnit = product.stockQuantity / rate;

  const { location: customLocation } = parseDescriptionMetadata(product.description);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col transform transition-all scale-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b bg-surface-container-low rounded-t-2xl">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Công cụ tính quy đổi UOM
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-on-surface-variant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Sản phẩm</span>
            <div className="text-lg font-bold text-on-surface">{product.name}</div>
            <div className="text-xs text-on-surface-variant font-mono mt-0.5">Mã SKU/Barcode: {product.code || "N/A"}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Tồn kho cơ bản</span>
              <div className="font-semibold text-sm text-on-surface bg-surface-container-low px-2 py-1 rounded">
                {product.stockQuantity} {product.baseUnit}
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Vị trí kho</span>
              <div className="font-semibold text-sm text-primary bg-primary/5 border border-primary/10 px-2 py-1 rounded">
                📍 {(() => {
                  if (customLocation) return customLocation;
                  const catName = categories.find((c: any) => c.id === product.categoryId)?.name || 'Không xác định';
                  if (catName.includes("Sắt") || catName.includes("Thép")) return "Bãi chứa số 1";
                  if (catName.includes("Xi măng")) return "Kho A - Kệ 2";
                  if (catName.includes("Gạch")) return "Khu bãi ngoài trời";
                  if (catName.includes("Cát") || catName.includes("Đá")) return "Bãi xúc cát/đá";
                  if (catName.includes("Sơn") || catName.includes("Hóa chất")) return "Khu Kệ B";
                  return "Kho tổng - Kệ C";
                })()}
              </div>
            </div>
          </div>

          <hr className="border-surface-container-high" />

          <div className="space-y-3 bg-surface-container-low p-4 rounded-xl border border-surface-container-high shadow-inner text-on-surface">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">Chọn đơn vị tính (UOM)</label>
              <select
                value={selectedCalcUnitId || ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? null : Number(e.target.value);
                  setSelectedCalcUnitId(val);
                }}
                className="w-full px-3 py-2 bg-white border border-outline-variant rounded-lg text-sm font-semibold focus:outline-none focus:border-primary cursor-pointer text-on-surface"
              >
                <option value="">{product.baseUnit} (Đơn vị cơ bản)</option>
                {product.units?.filter((u: any) => u.unitName !== product.baseUnit).map((u: any) => (
                  <option key={u.id} value={u.id}>{u.unitName} (1 = {u.conversionRate} {product.baseUnit})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">Nhập số lượng cần tính</label>
              <input
                type="number"
                min="1"
                value={calcQuantity}
                onChange={(e) => setCalcQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-white border border-outline-variant rounded-lg text-sm font-bold focus:outline-none focus:border-primary text-secondary"
              />
            </div>
          </div>

          {/* Calculator Output */}
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-2 text-on-surface">
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant font-medium">Đơn giá bán:</span>
              <span className="font-bold text-on-surface">{pricePerUOM.toLocaleString()} đ / {uName}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant font-medium">Tỷ lệ quy đổi:</span>
              <span className="font-bold text-on-surface">1 {uName} = {rate} {product.baseUnit}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant font-medium">Quy đổi tồn kho:</span>
              <span className="font-bold text-primary">Tương đương {Number(stockEquivalentUnit.toFixed(2)).toLocaleString()} {uName}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t pt-2 border-primary/10 mt-1">
              <span className="text-on-surface-variant font-medium">Quy đổi lượng mua:</span>
              <span className="font-bold text-on-surface">{totalEquivalentBase.toLocaleString()} {product.baseUnit}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-dashed pt-2 border-primary/20 mt-1">
              <span className="text-on-surface font-bold text-sm">Tổng thành tiền:</span>
              <span className="text-lg font-extrabold text-secondary">{totalCost.toLocaleString()} đ</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-container-high bg-surface-container-low/50 flex justify-between gap-3 rounded-b-2xl">
          {isReadOnly && onAddToCart ? (
            <button
              onClick={() => {
                const mappedProduct = {
                  id: product.id,
                  name: product.name,
                  price: pricePerUOM,
                  unit: uName,
                  unitId: selectedCalcUnitId,
                  stock: product.stockQuantity
                };

                // Add dynamic quantity
                for (let i = 0; i < calcQuantity; i++) {
                  onAddToCart(mappedProduct);
                }
                
                showToast(`Đã thêm ${calcQuantity} ${uName} ${product.name} vào giỏ POS!`);
                onClose();
              }}
              disabled={product.stockQuantity <= 0}
              className={`flex-1 px-5 py-2.5 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-2 shadow-sm transition-all ${
                product.stockQuantity <= 0
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary-container hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              <ShoppingCart className="w-4 h-4" /> Thêm {calcQuantity} vào giỏ POS
            </button>
          ) : (
            <div className="flex-1 text-center text-xs text-on-surface-variant font-medium self-center">
              Bảng giá hiển thị theo cấu hình của cửa hàng
            </div>
          )}
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors border border-outline-variant bg-white"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
