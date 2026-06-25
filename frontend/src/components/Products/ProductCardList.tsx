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
    <div className="block md:hidden overflow-y-auto max-h-[500px] divide-y divide-surface-container-low">
      {isLoading ? (
        Array.from({ length: 3 }).map((_, idx) => (
          <div key={`mob-skeleton-${idx}`} className="p-4 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))
      ) : products.length === 0 ? (
        <div className="p-8 text-center text-on-surface-variant">
          <Package className="w-12 h-12 mx-auto text-on-surface-variant/30 mb-3" />
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
