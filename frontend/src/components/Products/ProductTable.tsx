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
    <div className="hidden md:block overflow-auto max-h-[600px] custom-scrollbar rounded-xl border border-slate-200 shadow-sm bg-white">
      <table className="w-full text-left text-sm border-collapse relative text-slate-700 min-w-[1050px]">
        <thead className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-sm shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <tr className="text-slate-500 uppercase tracking-wider text-xs font-bold">
            <th className="py-3 px-4 w-16 text-center font-semibold">STT</th>
            <th className="py-3 px-4 min-w-[220px] font-semibold">Sản phẩm</th>
            <th className="py-3 px-4 min-w-[140px] font-semibold">Danh mục</th>
            <th className="py-3 px-4 min-w-[320px] font-semibold">Cấu hình quy đổi & Giá</th>
            {!isReadOnly ? (
              <th className="py-3 px-4 text-right min-w-[100px] font-semibold">Thao tác</th>
            ) : (
              <th className="py-3 px-4 text-center min-w-[100px] font-semibold">Bán hàng</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={`skeleton-${idx}`} className="animate-pulse">
                <td className="p-4"><div className="h-4 w-8 bg-slate-200 rounded mx-auto" /></td>
                <td className="p-4">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 bg-slate-200 rounded-lg shrink-0" />
                    <div className="flex flex-col justify-center">
                      <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
                      <div className="h-3 w-20 bg-slate-100 rounded" />
                    </div>
                  </div>
                </td>
                <td className="p-4"><div className="h-6 w-24 bg-slate-100 rounded-full" /></td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <div className="h-10 w-32 bg-slate-100 rounded-lg" />
                    <div className="h-10 w-32 bg-slate-100 rounded-lg" />
                  </div>
                </td>
                <td className="p-4"><div className="h-8 w-8 ml-auto bg-slate-100 rounded-lg" /></td>
              </tr>
            ))
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-8 text-center text-on-surface-variant">
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
