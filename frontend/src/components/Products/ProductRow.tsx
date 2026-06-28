"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Tag, MoreHorizontal, Edit2, Trash2, ShoppingCart, Package } from "lucide-react";
import StockBadge from "./StockBadge";
import UnitPricesList from "./UnitPricesList";
import { parseDescriptionMetadata } from "../../utils/metadata";

interface ProductRowProps {
  product: any;
  index: number;
  currentPage: number;
  itemsPerPage: number;
  categories: any[];
  isReadOnly: boolean;
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
  onAddToCart: (mappedProduct: any) => void;
  onSelectCalcProduct: (product: any) => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export default function ProductRow({
  product,
  index,
  currentPage,
  itemsPerPage,
  categories,
  isReadOnly,
  onEdit,
  onDelete,
  onAddToCart,
  onSelectCalcProduct,
  showToast
}: ProductRowProps) {
  const [openDropdownId, setOpenDropdownId] = useState<boolean>(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  const cat = categories.find((c: any) => c.id === product.categoryId);
  const catName = cat?.name || "Không xác định";
  const catColor = cat?.color;

  const getMockLocation = (categoryName: string) => {
    if (categoryName.includes("Sắt") || categoryName.includes("Thép")) return "Bãi chứa số 1";
    if (categoryName.includes("Xi măng")) return "Kho A - Kệ 2";
    if (categoryName.includes("Gạch")) return "Khu bãi ngoài trời";
    if (categoryName.includes("Cát") || categoryName.includes("Đá")) return "Bãi xúc cát/đá";
    if (categoryName.includes("Sơn") || categoryName.includes("Hóa chất")) return "Khu Kệ B";
    return "Kho tổng - Kệ C";
  };

  const defaultLocation = getMockLocation(catName);
  const { minStock, location: customLocation, imageUrl } = parseDescriptionMetadata(product.description);
  const displayLocation = customLocation || defaultLocation;
  const minStockLimit = minStock !== null ? minStock : 10;

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
      case 1: return "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=200&auto=format&fit=crop&q=60";
      case 2: return "https://images.unsplash.com/photo-1558244661-d248897f7bc4?w=200&auto=format&fit=crop&q=60";
      case 3: return "https://images.unsplash.com/photo-1527960656-26799343849b?w=200&auto=format&fit=crop&q=60";
      case 4: return "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=60";
      default: return "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=200&auto=format&fit=crop&q=60";
    }
  };

  const displayImage = imageUrl || getFallbackProductImage(product.categoryId, product.name);

  return (
    <tr
      className="even:bg-slate-50/50 odd:bg-white hover:bg-slate-50 transition-colors"
    >
      <td className="py-2 px-4 text-center text-on-surface-variant font-medium">
        {(currentPage - 1) * itemsPerPage + index + 1}
      </td>
      <td className="py-2 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 flex-shrink-0 overflow-hidden">
            <img 
              src={displayImage} 
              alt={product.name} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = getFallbackProductImage(product.categoryId, product.name);
              }}
            />
          </div>
          <div>
            <div
              className="font-semibold text-slate-800 hover:text-primary cursor-pointer transition-colors select-none text-[13.5px]"
              onClick={() => onSelectCalcProduct(product)}
              title="Click để tính toán quy đổi giá bán"
            >
              {product.name}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                {product.code || "N/A"}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10.5px] text-slate-400">
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                {displayLocation}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="py-2 px-4">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0"
          style={catColor ? {
            backgroundColor: catColor + '1a',
            borderColor: catColor + '33',
            color: '#334155'
          } : {
            backgroundColor: '#f8fafc',
            borderColor: '#e2e8f0',
            color: '#475569'
          }}
        >
          {catColor ? (
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: catColor }}></span>
          ) : (
            <Tag className="w-3 h-3 text-slate-400 flex-shrink-0" />
          )}
          {catName}
        </span>
      </td>
      <td className="py-2 px-4">
        <UnitPricesList units={product.units} baseUnit={product.baseUnit} />
      </td>
      {!isReadOnly ? (
        <td className="py-2 px-4 text-center relative">
          <button
            onClick={(e) => {
              if (openDropdownId) {
                setOpenDropdownId(false);
              } else {
                const rect = e.currentTarget.getBoundingClientRect();
                setDropdownPos({
                  top: rect.bottom + 4,
                  right: window.innerWidth - rect.right
                });
                setOpenDropdownId(true);
              }
            }}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {openDropdownId && typeof document !== 'undefined' && createPortal(
            <>
              <div className="fixed inset-0 z-[100]" onClick={(e) => { e.stopPropagation(); setOpenDropdownId(false); }}></div>
              <div
                className="fixed w-48 bg-white rounded-xl shadow-lg border border-surface-container-high z-[101] overflow-hidden text-left animate-in fade-in zoom-in-95 duration-100"
                style={{ top: dropdownPos.top, right: dropdownPos.right }}
              >
                <button
                  onClick={() => {
                    onEdit(product);
                    setOpenDropdownId(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container-low flex items-center gap-2 transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-primary" /> Sửa sản phẩm
                </button>
                <button
                  onClick={() => {
                    onDelete(product.id);
                    setOpenDropdownId(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-error hover:bg-error/10 flex items-center gap-2 border-t border-surface-container-low transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Xóa sản phẩm
                </button>
              </div>
            </>,
            document.body
          )}
        </td>
      ) : (
        <td className="py-2 px-4 text-center">
          <button
            onClick={() => {
              const defaultUnit = product.units?.find((u: any) => u.isDefault) || product.units?.[0];
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
            className={`p-2 rounded-lg transition-all flex items-center justify-center mx-auto shadow-sm ${product.stockQuantity <= 0
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary-container hover:scale-105 active:scale-95"
              }`}
            title={product.stockQuantity <= 0 ? "Hết hàng trong kho" : "Thêm nhanh vào giỏ hàng POS"}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </td>
      )}
    </tr>
  );
}
