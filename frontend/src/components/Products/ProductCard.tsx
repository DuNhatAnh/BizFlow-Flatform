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
      className="p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
      style={{ animationDelay: `${index * 30}ms`, animationFillMode: "both" }}
    >
      <div className="flex gap-3 items-start">
        {/* Product Image */}
        <div className="w-16 h-16 rounded-xl border border-surface-container-high overflow-hidden flex-shrink-0 bg-slate-50 flex items-center justify-center text-slate-400">
          <img 
            src={displayImage} 
            alt={product.name} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = getFallbackProductImage(product.categoryId, product.name);
            }}
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div 
            className="font-bold text-on-surface text-sm sm:text-base hover:text-primary cursor-pointer select-none truncate"
            onClick={() => onSelectCalcProduct(product)}
            title="Click để tính quy đổi"
          >
            {product.name}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <span className="text-[10px] text-on-surface-variant font-mono bg-surface-container-high px-1.5 py-0.5 rounded">
              {product.code || "N/A"}
            </span>
            <span className="text-[10px] text-primary bg-primary/5 px-1.5 py-0.5 rounded truncate max-w-[120px]">
              📍 {displayLocation}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low p-2.5 rounded-lg border border-surface-container-high text-xs space-y-1.5">
        <div className="font-semibold text-on-surface-variant uppercase text-[9px] tracking-wider border-b pb-1 border-surface-container-high">
          Bảng giá quy đổi
        </div>
        <div className="grid grid-cols-2 gap-2">
          {product.units.map((u: any, idx: number) => (
            <div key={u.id ?? `u-${idx}`} className="flex flex-col">
              <span className="font-medium text-on-surface flex items-center gap-1">
                {u.unitName} {u.isDefault && <span className="text-[8px] bg-primary text-white px-0.5 rounded font-bold">Mặc định</span>}
              </span>
              <span className="text-secondary font-bold">{u.price.toLocaleString()}đ</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={() => onSelectCalcProduct(product)}
          className="px-3 py-1.5 border border-outline-variant hover:bg-surface-container-low rounded-lg text-xs font-semibold text-on-surface"
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
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm text-white ${
              product.stockQuantity <= 0
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary-container"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Bán hàng
          </button>
        ) : (
          <div className="flex gap-1.5">
            <button
              onClick={() => onEdit(product)}
              className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-lg"
            >
              Sửa
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="px-3 py-1.5 bg-error/10 hover:bg-error/20 text-error text-xs font-semibold rounded-lg"
            >
              Xóa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
