import React from "react";
import { Search, AlertCircle } from "lucide-react";
import { Skeleton } from "../../ui/Skeleton";
import { Pagination } from "../../ui/Pagination";

interface StockTabProps {
  productSearch: string;
  setProductSearch: (val: string) => void;
  setProductPage: (val: number) => void;
  isProductsLoading: boolean;
  isProductsError: boolean;
  productsError: any;
  products: any[];
  productsData: any;
  productPage: number;
  productTotalPages: number;
}

export default function StockTab({
  productSearch,
  setProductSearch,
  setProductPage,
  isProductsLoading,
  isProductsError,
  productsError,
  products,
  productsData,
  productPage,
  productTotalPages
}: StockTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-on-surface">Danh sách Hàng hóa & Tồn kho</h3>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              value={productSearch}
              onChange={(e: any) => {
                setProductSearch(e.target.value);
                setProductPage(1);
              }}
              className="pl-9 pr-4 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary" 
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-surface-container-high text-xs font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-low">
              <th className="p-4 rounded-tl-lg w-16 text-center">STT</th>
              <th className="p-4">Mã SP</th>
              <th className="p-4">Tên Sản Phẩm</th>
              <th className="p-4 text-center">ĐVT</th>
              <th className="p-4 text-right">Tồn Kho</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low">
            {isProductsLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`}>
                  <td className="p-4"><Skeleton className="h-5 w-8 mx-auto" /></td>
                  <td className="p-4"><Skeleton className="h-5 w-24" /></td>
                  <td className="p-4"><Skeleton className="h-5 w-48" /></td>
                  <td className="p-4"><Skeleton className="h-5 w-16 mx-auto" /></td>
                  <td className="p-4"><Skeleton className="h-6 w-16 ml-auto rounded-md" /></td>
                </tr>
              ))
            ) : isProductsError ? (
              <tr>
                <td colSpan={5} className="p-8 text-center bg-red-50">
                  <div className="flex flex-col items-center justify-center text-red-600 gap-2">
                    <AlertCircle className="w-8 h-8" />
                    <p className="font-bold text-lg">Lỗi tải dữ liệu sản phẩm!</p>
                    <p className="text-sm">Server đang lỗi do Hot Reload. Hãy thử khởi động lại Backend.</p>
                    <code className="mt-2 text-xs bg-red-100 px-2 py-1 rounded text-red-800">
                      {productsError?.message || "Unknown error"}
                    </code>
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">Chưa có dữ liệu hàng hóa</td></tr>
            ) : products.filter((s: any, i: number) => i < 10).map((s: any, i: number) => (
              <tr key={s.id} className="even:bg-slate-50 odd:bg-white hover:bg-surface-container-low/80 transition-colors">
                <td className="p-4 text-center text-on-surface-variant font-medium">{(productPage - 1) * 10 + i + 1}</td>
                <td className="p-4 font-semibold text-primary">{s.code || "N/A"}</td>
                <td className="p-4 font-bold text-on-surface">{s.name}</td>
                <td className="p-4 text-center text-on-surface-variant">{s.baseUnit}</td>
                <td className="p-4 text-right font-bold">
                  <span className={`px-2 py-1 rounded-md ${s.stockQuantity <= 0 ? 'bg-error/10 text-error' : 'bg-emerald-50 text-emerald-700'}`}>
                    {s.stockQuantity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(productsData?.totalCount || 0) > 0 && (
        <Pagination
          currentPage={productPage}
          totalPages={productTotalPages}
          pageSize={10}
          totalItems={productsData?.totalCount || 0}
          itemName="hàng hóa"
          onPageChange={setProductPage}
        />
      )}
    </div>
  );
}
