"use client";

import React, { useState, useEffect } from "react";
import { useQuery, keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { 
  Search, Plus, Package, Filter, FolderTree, RefreshCw, AlertCircle
} from "lucide-react";
import { Pagination } from "./ui/Pagination";

// Sub-components & Modals
import ProductTable from "./Products/ProductTable";
import ProductCardList from "./Products/ProductCardList";
import ProductEditModal from "./Products/ProductEditModal";
import CategoryModal from "./Products/CategoryModal";
import ProductHistoryModal from "./Products/ProductHistoryModal";
import UomCalculatorModal from "./Products/UomCalculatorModal";

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
  units: ProductUnit[];
}

const TENANT_ID = "11111111-1111-1111-1111-111111111111";
const API_URL = "http://localhost:5178/api/products";
const CATEGORY_API_URL = "http://localhost:5178/api/categories";
const HISTORY_API_URL = "http://localhost:5178/api/products/history/all";

interface ProductManagementProps {
  isReadOnly?: boolean;
  user?: any;
  onAddToCart?: (product: any) => void;
  stockUpdateTrigger?: number;
}

export default function ProductManagement({
  isReadOnly = false,
  user,
  onAddToCart,
  stockUpdateTrigger = 0
}: ProductManagementProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<number>(0);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Custom UI States
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ message: string, onConfirm: () => void } | null>(null);

  // Modal Visibility & Editing States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [selectedCalcProduct, setSelectedCalcProduct] = useState<any | null>(null);

  // Sync real-time updates from SignalR
  useEffect(() => {
    if (stockUpdateTrigger > 0) {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  }, [stockUpdateTrigger, queryClient]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const tenantIdHeader = user?.tenantId || TENANT_ID;
  const authTokenHeader = user?.token ? `Bearer ${user.token}` : "";

  const getHeaders = (contentType?: string) => {
    const headers: Record<string, string> = { "X-Tenant-Id": tenantIdHeader };
    if (authTokenHeader) {
      headers["Authorization"] = authTokenHeader;
    }
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    return headers;
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Products query
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", currentPage, debouncedSearch, user?.id],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: itemsPerPage.toString(),
      });
      if (debouncedSearch) queryParams.append("search", debouncedSearch);

      const res = await fetch(`${API_URL}?${queryParams.toString()}`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Network response was not ok");
      
      const data = await res.json();
      const normalized = (data.items || []).map((p: any) => ({
        ...p,
        units: (p.units || []).map((u: any) => ({
          ...u,
          id: u.id != null ? Number(u.id) : null
        }))
      }));
      return { ...data, items: normalized };
    },
    placeholderData: keepPreviousData,
  });

  const products = productsData?.items || [];
  const totalPages = productsData?.totalPages || 0;

  // Categories query
  const { data: categories = [] } = useQuery({
    queryKey: ["categories", user?.id],
    queryFn: async () => {
      const res = await fetch(CATEGORY_API_URL, { headers: getHeaders() });
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    }
  });

  // Client-side category filtering
  const filteredProducts = products.filter((p: any) => {
    return filterCategory === 0 || p.categoryId === filterCategory;
  });

  // Product Actions
  const handleOpenEditModal = (product?: Product) => {
    if (product) {
      setEditingProduct(JSON.parse(JSON.stringify(product)));
    } else {
      setEditingProduct({
        id: "",
        code: "",
        name: "",
        categoryId: categories.length > 0 ? categories[0].id : 0,
        baseUnit: "",
        description: "",
        units: [
          { id: null, unitName: "", conversionRate: 1, price: 0, isDefault: true }
        ]
      });
    }
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (sanitizedProduct: Product) => {
    const sanitizedUnits = sanitizedProduct.units.map(u => {
      const conversionRate = isNaN(Number(u.conversionRate)) ? 1 : Number(u.conversionRate);
      const price = isNaN(Number(u.price)) ? 0 : Number(u.price);
      const rawId = (u as any).id;
      const numericId: number | null = (rawId === null || rawId === undefined || rawId === "")
        ? null
        : (() => { const n = parseInt(String(rawId), 10); return isNaN(n) ? null : n; })();

      if (numericId === null) {
        return { unitName: u.unitName, conversionRate, price, isDefault: u.isDefault };
      } else {
        return { id: numericId, unitName: u.unitName, conversionRate, price, isDefault: u.isDefault };
      }
    });

    const payload = { ...sanitizedProduct, units: sanitizedUnits };

    try {
      if (sanitizedProduct.id === "") {
        // Create new
        const createPayload = { ...payload };
        delete (createPayload as any).id;

        const res = await fetch(API_URL, {
          method: "POST",
          headers: getHeaders("application/json"),
          body: JSON.stringify(createPayload)
        });

        if (res.ok) {
          handleCloseEditModal();
          queryClient.invalidateQueries({ queryKey: ["products"] });
          showToast("Tuyệt vời! Đã thêm sản phẩm mới thành công.");
        } else {
          showToast("Hệ thống từ chối lưu dữ liệu. Xin vui lòng kiểm tra lại các thông tin đã nhập.", "error");
        }
      } else {
        // Update
        const res = await fetch(`${API_URL}/${sanitizedProduct.id}`, {
          method: "PUT",
          headers: getHeaders("application/json"),
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          handleCloseEditModal();
          queryClient.invalidateQueries({ queryKey: ["products"] });
          showToast("Đã cập nhật thông tin sản phẩm thành công!");
        } else {
          showToast("Hệ thống từ chối lưu thay đổi. Xin vui lòng kiểm tra lại thông tin.", "error");
        }
      }
    } catch (error) {
      console.error("Save error", error);
      showToast("Máy chủ đang bị gián đoạn hoặc mất mạng. Xin vui lòng thử lại!", "error");
    }
  };

  const handleDeleteProduct = (id: string) => {
    setConfirmDialog({
      message: "Bạn có chắc chắn muốn xóa sản phẩm này không? Dữ liệu không thể khôi phục.",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: getHeaders()
          });
          if (res.ok) {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            showToast("Xóa sản phẩm thành công", "success");
          } else {
            showToast("Hệ thống chưa thể xóa lúc này, cô/chú vui lòng thử lại sau nhé.", "error");
          }
        } catch (error) {
          console.error("Delete error", error);
          showToast("Đường truyền mạng bị gián đoạn, không xóa được sản phẩm.", "error");
        }
      }
    });
  };

  // Category Actions
  const handleAddCategory = async (name: string, parentId: number | null, color: string | null) => {
    const res = await fetch(CATEGORY_API_URL, {
      method: "POST",
      headers: getHeaders("application/json"),
      body: JSON.stringify({ name, parentId, color })
    });
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      showToast("Thêm danh mục thành công!");
    } else {
      showToast("Thêm thất bại", "error");
    }
  };

  const handleUpdateCategory = async (id: number, name: string, parentId: number | null, color: string | null) => {
    const res = await fetch(`${CATEGORY_API_URL}/${id}`, {
      method: "PUT",
      headers: getHeaders("application/json"),
      body: JSON.stringify({ name, parentId, color })
    });
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showToast("Cập nhật thành công!");
    } else {
      const err = await res.text();
      showToast(err || "Cập nhật thất bại", "error");
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa danh mục "${name}"?`)) {
      const res = await fetch(`${CATEGORY_API_URL}/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
        showToast("Đã xóa danh mục!");
      } else {
        const errorText = await res.text();
        showToast(errorText || "Danh mục đang chứa sản phẩm hoặc danh mục con, không thể xóa.", "error");
      }
    }
  };

  // History Actions
  const handleViewGlobalHistory = async () => {
    setIsHistoryOpen(true);
    setLoadingHistory(true);
    try {
      const res = await fetch(HISTORY_API_URL, { headers: getHeaders() });
      if (res.ok) {
        setHistoryData(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch global history", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header Area Buttons */}
        {!isReadOnly && (
          <div className="flex justify-end gap-2 -mt-2">
            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-white border border-surface-container-high hover:bg-surface-container-low text-on-surface-variant px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-sm transition-all text-sm"
            >
              <FolderTree className="w-4 h-4 text-on-surface-variant" />
              Danh mục
            </button>
            <button 
              onClick={handleViewGlobalHistory}
              className="bg-white border border-surface-container-high hover:bg-surface-container-low text-on-surface-variant px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-sm transition-all text-sm"
            >
              <Package className="w-4 h-4 text-on-surface-variant" />
              Lịch sử
            </button>
            <button 
              onClick={() => handleOpenEditModal()}
              className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-sm transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              Thêm Sản phẩm
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-surface-container-high shadow-sm flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-on-surface-variant" />
            </div>
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm, mã vạch..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setDebouncedSearch(searchQuery);
                  setCurrentPage(1);
                }
              }}
              className="block w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary transition-colors text-on-surface"
            />
          </div>
          <div className="relative md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-on-surface-variant" />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(Number(e.target.value))}
              className="block w-full pl-9 pr-8 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary appearance-none cursor-pointer text-on-surface"
            >
              <option value={0}>Tất cả danh mục</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["products"] });
              showToast("Đã cập nhật tồn kho mới nhất!", "success");
            }}
            className="bg-white border border-outline-variant hover:bg-surface-container-low text-on-surface-variant p-2.5 rounded-lg font-semibold flex items-center justify-center shadow-sm transition-all"
            title="Tải lại tồn kho"
          >
            <RefreshCw className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        {/* Product List container */}
        <div className="bg-white rounded-xl border border-surface-container-high shadow-card flex flex-col">
          {/* Table view for Desktop */}
          <ProductTable
            products={filteredProducts}
            isLoading={isLoading}
            categories={categories}
            isReadOnly={isReadOnly}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteProduct}
            onAddToCart={onAddToCart || (() => {})}
            onSelectCalcProduct={setSelectedCalcProduct}
            showToast={showToast}
          />

          {/* Card view for Mobile */}
          <ProductCardList
            products={filteredProducts}
            isLoading={isLoading}
            categories={categories}
            isReadOnly={isReadOnly}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteProduct}
            onAddToCart={onAddToCart || (() => {})}
            onSelectCalcProduct={setSelectedCalcProduct}
            showToast={showToast}
          />

          {(productsData?.totalCount || 0) > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={itemsPerPage}
              totalItems={productsData?.totalCount || 0}
              itemName="sản phẩm"
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      {/* Edit Form Modal */}
      {isEditModalOpen && editingProduct && (
        <ProductEditModal
          product={editingProduct}
          categories={categories}
          onClose={handleCloseEditModal}
          onSave={handleSaveProduct}
          showToast={showToast}
        />
      )}

      {/* Categories Management Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* History Log Modal */}
      <ProductHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyData={historyData}
        isLoading={loadingHistory}
      />

      {/* Quick UOM conversion Modal */}
      {selectedCalcProduct && (
        <UomCalculatorModal
          product={selectedCalcProduct}
          categories={categories}
          isReadOnly={isReadOnly}
          onAddToCart={onAddToCart}
          onClose={() => setSelectedCalcProduct(null)}
          showToast={showToast}
        />
      )}

      {/* Custom Confirm Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Xác nhận</h3>
            </div>
            <p className="text-slate-600 mb-6">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors font-medium"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 rounded-xl text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-200 transition-colors font-medium"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[70] px-6 py-3 rounded-full shadow-lg border animate-in slide-in-from-top-4 fade-in duration-300 flex items-center gap-3 ${
          toast.type === "success" 
            ? "bg-teal-50 border-teal-200 text-teal-800" 
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            toast.type === "success" ? "bg-teal-100" : "bg-red-100"
          }`}>
            {toast.type === "success" ? (
              <Package className="w-4 h-4 text-teal-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
          </div>
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </>
  );
}
