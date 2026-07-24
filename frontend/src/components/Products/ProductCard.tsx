"use client";

import React from "react";
import { ShoppingCart } from "lucide-react";
import StockBadge from "./StockBadge";
import { parseDescriptionMetadata } from "../../utils/metadata";

interface ProductCardProps {
  product: any;
  categories: any[];
  isReadOnly: boolean;
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
  onAddToCart: (mappedProduct: any) => void;
  onSelectCalcProduct: (product: any) => void;
  showToast: (msg: string, type?: "success" | "error") => void;
  index?: number;
}

export default function ProductCard({
  product,
  categories,
  isReadOnly,
  onEdit,
  onDelete,
  onAddToCart,
  onSelectCalcProduct,
  showToast,
  index = 0
}: ProductCardProps) {
  const catName = categories.find((c: any) => c.id === product.categoryId)?.name || "Không xác định";
  const defaultUnit = product.units?.find((u: any) => u.isDefault) || product.units?.[0];

  const getMockLocation = (categoryName: string) => {
    if (categoryName.includes("Sắt") || categoryName.includes("Thép")) return "Bãi chứa số 1";
    if (categoryName.includes("Xi măng")) return "Kho A - Kệ 2";
    if (categoryName.includes("Gạch")) return "Khu bãi ngoài trời";
    if (categoryName.includes("Cát") || categoryName.includes("Đá")) return "Bãi xúc cát/đá";
    if (categoryName.includes("Sơn") || categoryName.includes("Hóa chất")) return "Khu Kệ B";
    return "Kho tổng - Kệ C";
  };
  
  const getFallbackProductImage = (categoryId: number | null | undefined, name: string) => {
    const lowercaseName = name.toLowerCase();
    
    if (lowercaseName.includes("sắt") || lowercaseName.includes("thép")) {
      return "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=200&auto=format&fit=crop&q=60";
    }
    if (lowercaseName.includes("gạch")) {
      return "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=200&auto=format&fit=crop&q=60";
    }
    if (lowercaseName.includes("cát")) {
      return "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?w=200&auto=format&fit=crop&q=60";
    }
    if (lowercaseName.includes("xi măng")) {
      return "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200&auto=format&fit=crop&q=60";
    }

    switch (categoryId) {
      case 1:
        return "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=200&auto=format&fit=crop&q=60";
      case 2:
        return "https://images.unsplash.com/photo-1558244661-d248897f7bc4?w=200&auto=format&fit=crop&q=60";
      case 3:
        return "https://images.unsplash.com/photo-1527960656-26799343849b?w=200&auto=format&fit=crop&q=60";
      case 4:
        return "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=60";
      default:
        return "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=200&auto=format&fit=crop&q=60";
    }
  };

  const defaultLocation = getMockLocation(catName);
  const { minStock, location: customLocation, imageUrl } = parseDescriptionMetadata(product.description);
  const displayLocation = customLocation || defaultLocation;
  const minStockLimit = minStock !== null ? minStock : 10;
  const displayImage = imageUrl || getFallbackProductImage(product.categoryId, product.name);

  return (
    <div 
      className="p-4 space-y-3 bg-white rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-300 hover:shadow-md transition-shadow"
      style={{ animationDelay: `${index * 30}ms`, animationFillMode: "both" }}
    >
      <div className="flex gap-3 items-start">
        {/* Product Image */}
        <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden flex-shrink-0 bg-slate-50 flex items-center justify-center text-slate-400">
          <img 
            src={displayImage} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform hover:scale-110 duration-500" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = getFallbackProductImage(product.categoryId, product.name);
            }}
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div 
            className="font-bold text-slate-800 text-sm hover:text-primary cursor-pointer select-none truncate transition-colors"
            onClick={() => onSelectCalcProduct(product)}
            title="Click để tính quy đổi"
          >
            {product.name}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded font-medium border border-slate-200/50">
              {product.code || "N/A"}
            </span>
            <span className="text-[10px] text-primary bg-primary/5 px-1.5 py-0.5 rounded truncate max-w-[120px] font-medium border border-primary/10">
              📍 {displayLocation}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-2">
        <div className="font-bold text-slate-400 uppercase text-[9px] tracking-wider border-b pb-1.5 border-slate-200/60 flex items-center justify-between">
          <span>Bảng giá quy đổi</span>
          <span className="text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200/60 text-[8px]">{product.units?.length || 0} ĐVT</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {product.units.map((u: any, idx: number) => (
            <div key={u.id ?? `u-${idx}`} className="flex flex-col bg-white p-1.5 rounded-lg border border-slate-100 shadow-sm">
              <span className="font-medium text-slate-700 flex items-center gap-1 text-[10px]">
                {u.unitName} {u.isDefault && <span className="text-[8px] bg-primary text-white px-1 py-0.5 rounded font-bold shadow-sm shadow-primary/20">Mặc định</span>}
              </span>
              <span className="text-emerald-600 font-bold mt-0.5">{u.price.toLocaleString()}đ</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button
          onClick={() => onSelectCalcProduct(product)}
          className="px-3 py-2 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-600 transition-all flex-1 text-center shadow-sm"
        >
          Tính quy đổi
        </button>
        {isReadOnly ? (
          <button
            onClick={() => {
              const mappedProduct = {
                id: product.id,
                name: product.name,
                price: defaultUnit ? defaultUnit.price : 0,
                unit: defaultUnit ? defaultUnit.unitName : product.baseUnit,
                unitId: defaultUnit ? defaultUnit.id : null,
                stock: product.stockQuantity
              };
              onAddToCart(mappedProduct);
              showToast(`Đã thêm 1 ${mappedProduct.unit} ${product.name} vào giỏ POS!`);
            }}
            disabled={product.stockQuantity <= 0}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm text-white flex-1 transition-all ${
              product.stockQuantity <= 0
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary-container shadow-primary/20 hover:shadow-md hover:-translate-y-0.5"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Bán hàng
          </button>
        ) : (
          <div className="flex gap-2 w-full max-w-[140px]">
            <button
              onClick={() => onEdit(product)}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex-1 text-center transition-colors shadow-sm"
            >
              Sửa
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-xs font-semibold rounded-xl flex-1 text-center transition-colors shadow-sm"
            >
              Xóa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
