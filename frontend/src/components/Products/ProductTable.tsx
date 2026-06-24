"use client";

import React from "react";
import { Package } from "lucide-react";
import { Skeleton } from "../ui/Skeleton";
import ProductRow from "./ProductRow";

interface ProductTableProps {
  products: any[];
  isLoading: boolean;
  categories: any[];
  isReadOnly: boolean;
  currentPage: number;
  itemsPerPage: number;
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
  onAddToCart: (mappedProduct: any) => void;
  onSelectCalcProduct: (product: any) => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export default function ProductTable({
  products,
  isLoading,
  categories,
  isReadOnly,
  currentPage,
  itemsPerPage,
  onEdit,
  onDelete,
  onAddToCart,
  onSelectCalcProduct,
  showToast
}: ProductTableProps) {
  return (
    <div className="hidden md:block overflow-auto max-h-[500px]">
      <table className="w-full text-left text-sm border-collapse relative text-on-surface">
        <thead className="sticky top-0 z-10 bg-surface-container-low shadow-sm">
          <tr className="text-on-surface-variant border-b border-surface-container-high uppercase tracking-wider text-xs font-bold">
            <th className="py-2.5 px-4 w-16 text-center">STT</th>
            <th className="py-2.5 px-4">Sản phẩm</th>
            <th className="py-2.5 px-4">Danh mục</th>
            <th className="py-2.5 px-4">Tồn kho</th>
            <th className="py-2.5 px-4 min-w-[240px]">Cấu hình quy đổi & Giá</th>
            {!isReadOnly ? (
              <th className="py-2.5 px-4 text-right">Thao tác</th>
            ) : (
              <th className="py-2.5 px-4 text-center">Bán hàng</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container-low">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={`skeleton-${idx}`}>
                <td className="p-4"><Skeleton className="h-4 w-8 mx-auto" /></td>
                <td className="p-4">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="p-4"><Skeleton className="h-6 w-24 rounded-md" /></td>
                <td className="p-4"><Skeleton className="h-5 w-16" /></td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Skeleton className="h-14 w-40 rounded-lg" />
                    <Skeleton className="h-14 w-40 rounded-lg" />
                  </div>
                </td>
                <td className="p-4"><Skeleton className="h-8 w-8 ml-auto rounded-lg" /></td>
              </tr>
            ))
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                <Package className="w-12 h-12 mx-auto text-on-surface-variant/30 mb-3" />
                Không tìm thấy sản phẩm nào phù hợp.
              </td>
            </tr>
          ) : (
            products.map((product: any, idx: number) => (
              <ProductRow
                key={product.id}
                product={product}
                index={idx}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
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
        </tbody>
      </table>
    </div>
  );
}
