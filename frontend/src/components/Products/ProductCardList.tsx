"use client";

import React from "react";
import { Package } from "lucide-react";
import { Skeleton } from "../ui/Skeleton";
import ProductCard from "./ProductCard";

interface ProductCardListProps {
  products: any[];
  isLoading: boolean;
  categories: any[];
  isReadOnly: boolean;
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
  onAddToCart: (mappedProduct: any) => void;
  onSelectCalcProduct: (product: any) => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export default function ProductCardList({
  products,
  isLoading,
  categories,
  isReadOnly,
  onEdit,
  onDelete,
  onAddToCart,
  onSelectCalcProduct,
  showToast
}: ProductCardListProps) {
  return (
    <div className="block md:hidden overflow-y-auto max-h-[600px] p-2 space-y-3 bg-slate-50/50 rounded-xl custom-scrollbar">
      {isLoading ? (
        Array.from({ length: 3 }).map((_, idx) => (
          <div key={`mob-skeleton-${idx}`} className="p-4 space-y-3 bg-white rounded-2xl shadow-sm border border-slate-200 animate-pulse">
            <div className="flex gap-3">
              <div className="h-16 w-16 bg-slate-200 rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 w-48 bg-slate-200 rounded"></div>
                <div className="h-4 w-32 bg-slate-100 rounded"></div>
              </div>
            </div>
            <div className="h-20 w-full bg-slate-50 rounded-xl border border-slate-100"></div>
          </div>
        ))
      ) : products.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          Không tìm thấy sản phẩm nào phù hợp.
        </div>
      ) : (
        products.map((product: any, idx: number) => (
          <ProductCard
            key={product.id}
            product={product}
            index={idx}
            categories={categories}
            isReadOnly={isReadOnly}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddToCart={onAddToCart}
            onSelectCalcProduct={onSelectCalcProduct}
            showToast={showToast}
          />
        ))
      )}
    </div>
  );
}
