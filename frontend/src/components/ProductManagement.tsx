"use client";

import React, { useState, useEffect } from "react";
import { useQuery, keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { 
  Search, Plus, Edit2, Trash2, Package, Tag, Filter, X, Save, AlertCircle, Check,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FolderTree, MoreHorizontal
} from "lucide-react";
import { Skeleton } from "./ui/Skeleton";
import { FadeIn } from "./ui/FadeIn";
import { Pagination } from "./ui/Pagination";

interface ProductUnit {
  id: number | null;  // null if newly added on frontend
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

const TENANT_ID = "11111111-1111-1111-1111-111111111111"; // Tạm thời dùng biến này
const API_URL = "http://localhost:5178/api/products";
const CATEGORY_API_URL = "http://localhost:5178/api/categories";

export default function ProductManagement() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<number>(0);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", currentPage, debouncedSearch],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: itemsPerPage.toString(),
      });
      if (debouncedSearch) queryParams.append("search", debouncedSearch);

      const res = await fetch(`${API_URL}?${queryParams.toString()}`, {
        headers: { "X-Tenant-Id": TENANT_ID }
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

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(CATEGORY_API_URL, { headers: { "X-Tenant-Id": TENANT_ID } });
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    }
  });
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // History Pagination State
  const [currentHistoryPage, setCurrentHistoryPage] = useState(1);
  const historyItemsPerPage = 10;

  // History State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const HISTORY_API_URL = "http://localhost:5178/api/products/history/all";

  // Category Management State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryParentId, setNewCategoryParentId] = useState<number | "">("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingCategoryParentId, setEditingCategoryParentId] = useState<number | "">("");

  // Build category tree
  const buildCategoryTree = (cats: any[]) => {
    const map = new Map();
    const roots: any[] = [];
    cats.forEach(c => map.set(c.id, { ...c, children: [] }));
    cats.forEach(c => {
      if (c.parentId) {
        const parent = map.get(c.parentId);
        if (parent) parent.children.push(map.get(c.id));
      } else {
        roots.push(map.get(c.id));
      }
    });
    return roots;
  };
  const categoryTree = buildCategoryTree(categories);

  const renderCategoryNode = (node: any, level: number = 0) => {
    return (
      <React.Fragment key={node.id}>
        <li className="p-3 flex justify-between items-center hover:bg-surface-container-low/50 transition-colors border-b border-surface-container-low last:border-0" style={{ paddingLeft: `${Math.max(12, level * 24 + 12)}px` }}>
          {editingCategoryId === node.id ? (
            <div className="flex flex-1 gap-2 mr-2">
              <input 
                type="text" 
                value={editingCategoryName}
                onChange={e => setEditingCategoryName(e.target.value)}
                className="flex-1 px-2 py-1 border rounded text-sm"
                autoFocus
              />
              <select
                value={editingCategoryParentId}
                onChange={e => setEditingCategoryParentId(e.target.value === "" ? "" : Number(e.target.value))}
                className="px-2 py-1 border rounded text-sm max-w-[150px]"
              >
                <option value="">-- Không có cha --</option>
                {categories.filter((c: any) => c.id !== node.id).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button
                onClick={async () => {
                  if (!editingCategoryName.trim()) return;
                  const res = await fetch(`${CATEGORY_API_URL}/${node.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': TENANT_ID },
                    body: JSON.stringify({ name: editingCategoryName.trim(), parentId: editingCategoryParentId === "" ? null : editingCategoryParentId })
                  });
                  if (res.ok) {
                    setEditingCategoryId(null);
                    queryClient.invalidateQueries({ queryKey: ["categories"] });
                    showToast("Cập nhật thành công!");
                  } else {
                    const err = await res.text();
                    showToast(err || "Cập nhật thất bại", "error");
                  }
                }}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
              >
                <Check className="w-5 h-5" />
              </button>
              <button onClick={() => setEditingCategoryId(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <span className="text-sm font-medium text-on-surface flex items-center gap-2">
                {level > 0 && <span className="w-3 border-b border-l h-4 inline-block -mt-4 border-slate-300"></span>}
                {node.name}
              </span>
              <div className="flex gap-1">
                <button 
                  onClick={() => {
                    setEditingCategoryId(node.id);
                    setEditingCategoryName(node.name);
                    setEditingCategoryParentId(node.parentId || "");
                  }}
                  className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded transition-colors"
                  title="Sửa danh mục"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={async () => {
                    if (confirm(`Bạn có chắc muốn xóa danh mục "${node.name}"?`)) {
                      const res = await fetch(`${CATEGORY_API_URL}/${node.id}`, {
                        method: 'DELETE',
                        headers: { 'X-Tenant-Id': TENANT_ID }
                      });
                      if (res.ok) {
                        queryClient.invalidateQueries({ queryKey: ["categories"] });
                        showToast("Đã xóa danh mục!");
                        queryClient.invalidateQueries({ queryKey: ["products"] });
                      } else {
                        const errorText = await res.text();
                        showToast(errorText || "Danh mục đang chứa sản phẩm hoặc danh mục con, không thể xóa.", "error");
                      }
                    }
                  }}
                  className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors"
                  title="Xóa danh mục"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </li>
        {node.children && node.children.length > 0 && node.children.map((child: any) => renderCategoryNode(child, level + 1))}
      </React.Fragment>
    );
  };

  // Custom UI States
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ message: string, onConfirm: () => void } | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };



  // Client-side category filtering (since backend doesn't filter by category yet, we can filter locally or add it to backend. 
  // Given the backend changes, we only added search by name/code. For now, filter category locally over the paginated items if needed, 
  // or just apply it directly to `products`.
  const filteredProducts = products.filter((p: any) => {
    const matchCat = filterCategory === 0 || (p as any).categoryId === filterCategory;
    return matchCat;
  });

  // History Pagination Logic
  const totalHistoryPages = Math.ceil(historyData.length / historyItemsPerPage);

  useEffect(() => {
    if (currentHistoryPage > totalHistoryPages && totalHistoryPages > 0) {
      setCurrentHistoryPage(totalHistoryPages);
    } else if (currentHistoryPage === 0 && totalHistoryPages > 0) {
      setCurrentHistoryPage(1);
    }
  }, [historyData.length, currentHistoryPage, totalHistoryPages]);

  const historyStartIndex = Math.max(0, (currentHistoryPage - 1) * historyItemsPerPage);
  const paginatedHistory = historyData.slice(historyStartIndex, historyStartIndex + historyItemsPerPage);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(JSON.parse(JSON.stringify(product))); // Deep copy
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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    setConfirmDialog({
      message: "Bạn có chắc chắn muốn xóa sản phẩm này không? Dữ liệu không thể khôi phục.",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: { "X-Tenant-Id": TENANT_ID }
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

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    
    // Validate
    if (!editingProduct.name || !editingProduct.baseUnit || editingProduct.units.length === 0) {
      showToast("Vui lòng điền tên sản phẩm, đơn vị cơ bản và ít nhất 1 quy đổi.", "error");
      return;
    }
    
    // Build correct payload for backend
    // - existing units: send { id: <number>, ... }
    // - new units (id===null): send without id field so backend treats as insert
    // NOTE: id might be a string from hot-reload preserved state, so always parse to number
    const sanitizedUnits = editingProduct.units.map(u => {
      const conversionRate = isNaN(Number(u.conversionRate)) ? 1 : Number(u.conversionRate);
      const price = isNaN(Number(u.price)) ? 0 : Number(u.price);
      
      // Convert id safely: null/undefined/NaN → null, "3"/3 → 3
      const rawId = (u as any).id;
      const numericId: number | null = (rawId === null || rawId === undefined || rawId === "")
        ? null
        : (() => { const n = parseInt(String(rawId), 10); return isNaN(n) ? null : n; })();

      if (numericId === null) {
        // New unit — no id field
        return { unitName: u.unitName, conversionRate, price, isDefault: u.isDefault };
      } else {
        // Existing unit — pass numeric id
        return { id: numericId, unitName: u.unitName, conversionRate, price, isDefault: u.isDefault };
      }
    });
    const sanitizedProduct = { ...editingProduct, units: sanitizedUnits };

    try {
      if (editingProduct.id === "") {
        // Create new
        const payload = { ...sanitizedProduct };
        delete (payload as any).id; // Remove empty id for creation

        console.log("POST payload:", JSON.stringify(payload, null, 2));
        const res = await fetch(`${API_URL}`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "X-Tenant-Id": TENANT_ID
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          handleCloseModal();
          queryClient.invalidateQueries({ queryKey: ["products"] }); // Re-sync from DB
          showToast("Tuyệt vời! Đã thêm sản phẩm mới thành công.");
        } else {
          showToast("Hệ thống từ chối lưu dữ liệu. Xin vui lòng kiểm tra lại các thông tin đã nhập.", "error");
        }
      } else {
        // Update
        console.log("PUT payload:", JSON.stringify(sanitizedProduct, null, 2));
        const res = await fetch(`${API_URL}/${editingProduct.id}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "X-Tenant-Id": TENANT_ID
          },
          body: JSON.stringify(sanitizedProduct)
        });

        if (res.ok) {
          handleCloseModal();
          queryClient.invalidateQueries({ queryKey: ["products"] }); // Re-sync from DB
          showToast("Đã cập nhật thông tin sản phẩm thành công!");
        } else {
          const errText = await res.text().catch(() => "");
          console.error("PUT 400 body:", errText);
          showToast("Hệ thống từ chối lưu thay đổi. Xin vui lòng kiểm tra lại thông tin.", "error");
        }
      }
    } catch (error) {
      console.error("Save error", error);
      showToast("Máy chủ đang bị gián đoạn hoặc mất mạng. Xin cô/chú vui lòng nhấn F5 tải lại trang và thử lại nhé!", "error");
    }
  };

  // Form handling functions
  const handleUnitChange = (index: number, field: keyof ProductUnit, value: any) => {
    if (!editingProduct) return;
    const newUnits = [...editingProduct.units];
    newUnits[index] = { ...newUnits[index], [field]: value };
    setEditingProduct({ ...editingProduct, units: newUnits });
  };

  const handleSetDefaultUnit = (index: number) => {
    if (!editingProduct) return;
    const newUnits = editingProduct.units.map((u, i) => ({
      ...u,
      isDefault: i === index
    }));
    setEditingProduct({ ...editingProduct, units: newUnits });
  };

  const handleAddUnit = () => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      units: [
        ...editingProduct.units, 
        { id: null, unitName: "", conversionRate: 1, price: 0, isDefault: false }
      ]
    });
  };

  const handleRemoveUnit = (index: number) => {
    if (!editingProduct) return;
    if (editingProduct.units.length <= 1) return;
    const newUnits = editingProduct.units.filter((_, i) => i !== index);
    // If we removed the default, make the first one default
    if (!newUnits.find(u => u.isDefault)) {
      newUnits[0].isDefault = true;
    }
    setEditingProduct({ ...editingProduct, units: newUnits });
  };

  const handleViewGlobalHistory = async () => {
    setIsHistoryOpen(true);
    setLoadingHistory(true);
    setCurrentHistoryPage(1);
    try {
      const res = await fetch(HISTORY_API_URL, {
        headers: { "X-Tenant-Id": TENANT_ID }
      });
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
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-sm transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Thêm Sản phẩm
        </button>
      </div>

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
              setCurrentPage(1); // Reset to page 1 on search
            }}
            className="block w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="relative md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-on-surface-variant" />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(Number(e.target.value))}
            className="block w-full pl-9 pr-8 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary appearance-none cursor-pointer"
          >
            <option value={0}>Tất cả danh mục</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-xl border border-surface-container-high shadow-card flex flex-col">
        <div className="overflow-auto max-h-[500px]">
          <table className="w-full text-left text-sm border-collapse relative">
            <thead className="sticky top-0 z-10 bg-surface-container-low shadow-sm">
              <tr className="text-on-surface-variant border-b border-surface-container-high uppercase tracking-wider text-xs font-bold">
                <th className="p-4 w-16 text-center">STT</th>
                <th className="p-4">Sản phẩm</th>
                <th className="p-4">Danh mục</th>
                <th className="p-4">Đơn vị cơ bản</th>
                <th className="p-4 min-w-[300px]">Cấu hình quy đổi & Giá</th>
                <th className="p-4 text-right">Thao tác</th>
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
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                        <Package className="w-12 h-12 mx-auto text-on-surface-variant/30 mb-3" />
                        Không tìm thấy sản phẩm nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p: any, index: number) => (
                      <tr key={p.id} className="hover:bg-surface-container-low/50 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}>
                        <td className="p-4 text-center text-on-surface-variant font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td className="p-4">
                          <div className="font-bold text-on-surface">{p.name}</div>
                          <div className="text-xs text-on-surface-variant mt-0.5 font-mono bg-surface-container-high inline-block px-1.5 py-0.5 rounded">{p.code || "N/A"}</div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                            <Tag className="w-3 h-3" />
                            {categories.find((c: any) => c.id === p.categoryId)?.name || 'Không xác định'}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-on-surface">{p.baseUnit}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-2">
                            {[...p.units].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)).map(u => (
                              <div 
                                key={u.id} 
                                className={`px-3 py-1.5 rounded-lg border text-xs flex flex-col gap-0.5 ${
                                  u.isDefault 
                                    ? 'bg-primary/10 border-primary/30' 
                                    : 'bg-surface-container-low border-outline-variant text-on-surface-variant'
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-bold ${u.isDefault ? 'text-primary' : 'text-on-surface'}`}>{u.unitName}</span>
                                  {u.isDefault && <span className="bg-primary text-white text-[9px] px-1 rounded uppercase font-bold">Mặc định</span>}
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span>1 = {u.conversionRate} {p.baseUnit}</span>
                                  <span className="font-bold text-secondary">{u.price.toLocaleString()} đ</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={(e) => {
                              if (openDropdownId === p.id) {
                                setOpenDropdownId(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setDropdownPos({
                                  top: rect.bottom + 4,
                                  right: window.innerWidth - rect.right
                                });
                                setOpenDropdownId(p.id);
                              }
                            }}
                            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                          {openDropdownId === p.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)}></div>
                              <div 
                                className="fixed w-48 bg-white rounded-xl shadow-lg border border-surface-container-high z-50 overflow-hidden text-left"
                                style={{ top: dropdownPos.top, right: dropdownPos.right }}
                              >
                                <button
                                  onClick={() => {
                                    handleOpenModal(p);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container-low flex items-center gap-2 transition-colors"
                                >
                                  <Edit2 className="w-4 h-4 text-primary" /> Sửa sản phẩm
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteProduct(p.id);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full text-left px-4 py-3 text-sm text-error hover:bg-error/10 flex items-center gap-2 border-t border-surface-container-low transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" /> Xóa sản phẩm
                                </button>
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
            </tbody>
          </table>
        </div>
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

      {/* Add / Edit Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-surface-container-high flex justify-between items-center bg-surface-container-low/50">
              <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                {editingProduct.id ? "Cập nhật Sản phẩm" : "Thêm Sản phẩm Mới"}
              </h3>
              <button onClick={handleCloseModal} className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-surface-container-low/20">
              
              {/* Section 1: Basic Info */}
              <div className="bg-white p-5 rounded-xl border border-surface-container-high mb-6 shadow-sm">
                <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-4 border-b pb-2 border-surface-container-low">
                  1. Thông tin chung
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Tên sản phẩm *</label>
                    <input 
                      type="text" 
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary"
                      placeholder="VD: Xi măng Hà Tiên"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Mã vạch / SKU</label>
                    <input 
                      type="text" 
                      value={editingProduct.code}
                      onChange={(e) => setEditingProduct({...editingProduct, code: e.target.value})}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm font-mono focus:outline-none focus:border-primary"
                      placeholder="VD: XM-HT-01"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Danh mục</label>
                    <select 
                      value={editingProduct.categoryId || 0}
                      onChange={(e) => setEditingProduct({...editingProduct, categoryId: Number(e.target.value)})}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary"
                    >
                      {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Đơn vị cơ bản (Base Unit) *</label>
                    <input 
                      type="text" 
                      value={editingProduct.baseUnit}
                      onChange={(e) => setEditingProduct({...editingProduct, baseUnit: e.target.value})}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary"
                      placeholder="VD: Bao, Cái, Lon..."
                    />
                    <p className="text-[10px] text-on-surface-variant mt-1 italic">Đơn vị nhỏ nhất để kiểm kho.</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Mô tả thêm</label>
                    <textarea 
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Section 2: Units Config */}
              <div className="bg-white p-5 rounded-xl border border-surface-container-high shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b pb-2 border-surface-container-low">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
                    2. Thiết lập Đơn vị & Giá bán
                    <div className="group relative cursor-help">
                      <AlertCircle className="w-4 h-4 text-primary" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-800 text-white text-xs p-2 rounded hidden group-hover:block z-10">
                        1 Sản phẩm có thể có nhiều đơn vị. Tỷ lệ quy đổi tính theo Đơn vị cơ bản. <br/>
                        Ví dụ: Base = Lon. Lốc = 6 Lon (Tỷ lệ: 6).
                      </div>
                    </div>
                  </h4>
                  <button 
                    onClick={handleAddUnit}
                    className="text-primary hover:text-primary-container text-xs font-bold flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Thêm đơn vị
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Headers for desktop */}
                  <div className="hidden sm:grid grid-cols-12 gap-3 px-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    <div className="col-span-1 text-center">Mặc định</div>
                    <div className="col-span-3">Tên Đơn Vị</div>
                    <div className="col-span-3">Tỷ lệ (x {editingProduct.baseUnit || 'Base'})</div>
                    <div className="col-span-4">Giá Bán (VNĐ)</div>
                    <div className="col-span-1 text-center">Xóa</div>
                  </div>

                  {editingProduct.units.map((unit, index) => (
                    <div key={unit.id ?? `new_${index}`} className={`grid grid-cols-1 sm:grid-cols-12 gap-3 items-center p-3 sm:p-2 border sm:border-none rounded-lg sm:rounded-none ${unit.isDefault ? 'bg-primary/5 border-primary/30' : 'bg-surface-container-low/30 border-surface-container-high'}`}>
                      <div className="col-span-1 flex justify-center items-center gap-2 sm:gap-0">
                        <span className="sm:hidden text-xs font-bold text-on-surface-variant">Bán mặc định:</span>
                        <input 
                          type="radio" 
                          name="defaultUnit" 
                          checked={unit.isDefault}
                          onChange={() => handleSetDefaultUnit(index)}
                          className="w-4 h-4 text-primary focus:ring-primary accent-primary cursor-pointer"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="sm:hidden block text-xs font-bold text-on-surface-variant mb-1">Tên Đơn Vị</label>
                        <input 
                          type="text" 
                          value={unit.unitName}
                          onChange={(e) => handleUnitChange(index, "unitName", e.target.value)}
                          placeholder="VD: Thùng, Lốc..."
                          className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-sm focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="sm:hidden block text-xs font-bold text-on-surface-variant mb-1">Tỷ lệ quy đổi</label>
                        <input 
                          type="number" 
                          step="any"
                          min="0"
                          value={unit.conversionRate}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            handleUnitChange(index, "conversionRate", isNaN(val) ? 0 : val);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-sm focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="col-span-4 relative">
                        <label className="sm:hidden block text-xs font-bold text-on-surface-variant mb-1">Giá Bán</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            min="0"
                            value={unit.price}
                            onChange={(e) => handleUnitChange(index, "price", Number(e.target.value))}
                            className="w-full pl-3 pr-8 py-1.5 bg-white border border-outline-variant rounded text-sm font-bold text-secondary focus:outline-none focus:border-primary"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant font-bold">đ</span>
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-end sm:justify-center">
                        <button 
                          onClick={() => handleRemoveUnit(index)}
                          disabled={editingProduct.units.length === 1}
                          className="p-1.5 text-error hover:bg-error/10 rounded disabled:opacity-30 transition-colors"
                          title="Xóa đơn vị"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-surface-container-high bg-surface-container-low/50 flex justify-end gap-3">
              <button 
                onClick={handleCloseModal}
                className="px-5 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSaveProduct}
                className="px-5 py-2 text-sm font-bold bg-primary hover:bg-primary-container text-white rounded-lg flex items-center gap-2 shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                Lưu Sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render Custom Confirm Dialog */}
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

      {/* Render Custom Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[70] px-6 py-3 rounded-full shadow-lg border animate-in slide-in-from-top-4 fade-in duration-300 flex items-center gap-3 ${
          toast.type === 'success' 
            ? 'bg-teal-50 border-teal-200 text-teal-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? (
            <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
              <Package className="w-4 h-4 text-teal-600" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
      {/* Render History Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col transform transition-all scale-100 max-h-[85vh]">
            <div className="flex justify-between items-center p-5 border-b bg-surface-container-low rounded-t-2xl">
              <h3 className="text-lg font-bold text-slate-800">Lịch sử thao tác sản phẩm</h3>
              <button onClick={() => setIsHistoryOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5">
              {loadingHistory ? (
                <div className="text-center py-8 text-slate-500 flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-3"></div>
                  Đang tải lịch sử...
                </div>
              ) : historyData.length === 0 ? (
                <div className="text-center py-8 text-slate-500">Chưa có lịch sử thay đổi nào.</div>
              ) : (
                <div className="space-y-4">
                  {paginatedHistory.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 border rounded-xl bg-slate-50 hover:border-primary/30 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold text-sm">{item.actionBy?.[0] || 'S'}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-800">{item.actionName}</span>
                          <span className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString('vi-VN')}</span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">{item.changeDetails}</p>
                        <p className="text-xs text-slate-400 mt-2">Người thực hiện: <span className="font-semibold">{item.actionBy}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* History Pagination Controls */}
            {!loadingHistory && historyData.length > 0 && (
              <div className="p-4 border-t border-surface-container-high flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container-low/30 rounded-b-2xl">
                <div className="text-sm text-on-surface-variant">
                  Hiển thị <span className="font-bold text-on-surface">{historyStartIndex + 1}</span> - <span className="font-bold text-on-surface">{Math.min(historyStartIndex + historyItemsPerPage, historyData.length)}</span> / <span className="font-bold text-on-surface">{historyData.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setCurrentHistoryPage(1)} 
                    disabled={currentHistoryPage === 1}
                    className="p-1.5 rounded-lg border border-outline-variant hover:bg-white hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit transition-colors"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setCurrentHistoryPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentHistoryPage === 1}
                    className="p-1.5 rounded-lg border border-outline-variant hover:bg-white hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="px-4 py-1.5 text-sm font-bold text-on-surface bg-white border border-outline-variant rounded-lg mx-1 shadow-sm">
                    {currentHistoryPage} / {totalHistoryPages || 1}
                  </div>
                  <button 
                    onClick={() => setCurrentHistoryPage(prev => Math.min(prev + 1, totalHistoryPages))} 
                    disabled={currentHistoryPage === totalHistoryPages || totalHistoryPages === 0}
                    className="p-1.5 rounded-lg border border-outline-variant hover:bg-white hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setCurrentHistoryPage(totalHistoryPages)} 
                    disabled={currentHistoryPage === totalHistoryPages || totalHistoryPages === 0}
                    className="p-1.5 rounded-lg border border-outline-variant hover:bg-white hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit transition-colors"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Render Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col transform transition-all scale-100 max-h-[85vh]">
            <div className="flex justify-between items-center p-5 border-b bg-surface-container-low rounded-t-2xl">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-primary" />
                Quản lý Danh mục
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nhập tên danh mục mới..."
                  className="flex-1 px-3 py-2 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary"
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && newCategoryName.trim()) {
                      setIsSavingCategory(true);
                      try {
                        const res = await fetch(CATEGORY_API_URL, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': TENANT_ID },
                          body: JSON.stringify({ name: newCategoryName.trim(), parentId: newCategoryParentId === "" ? null : newCategoryParentId })
                        });
                        if (res.ok) {
                          setNewCategoryName("");
                          setNewCategoryParentId("");
                          queryClient.invalidateQueries({ queryKey: ["categories"] });
                          showToast("Thêm danh mục thành công!");
                        } else {
                          showToast("Thêm thất bại", "error");
                        }
                      } finally {
                        setIsSavingCategory(false);
                      }
                    }
                  }}
                />
                <select
                  value={newCategoryParentId}
                  onChange={(e) => setNewCategoryParentId(e.target.value === "" ? "" : Number(e.target.value))}
                  className="px-3 py-2 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary max-w-[150px]"
                >
                  <option value="">-- Không có cha --</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button 
                  onClick={async () => {
                    if (!newCategoryName.trim()) return;
                    setIsSavingCategory(true);
                    try {
                      const res = await fetch(CATEGORY_API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': TENANT_ID },
                        body: JSON.stringify({ name: newCategoryName.trim(), parentId: newCategoryParentId === "" ? null : newCategoryParentId })
                      });
                      if (res.ok) {
                        setNewCategoryName("");
                        setNewCategoryParentId("");
                        queryClient.invalidateQueries({ queryKey: ["categories"] });
                        showToast("Thêm danh mục thành công!");
                      } else {
                        showToast("Thêm thất bại", "error");
                      }
                    } finally {
                      setIsSavingCategory(false);
                    }
                  }}
                  disabled={!newCategoryName.trim() || isSavingCategory}
                  className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center disabled:opacity-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 border border-surface-container-high rounded-xl overflow-hidden">
                {categoryTree.length === 0 ? (
                  <div className="p-6 text-center text-on-surface-variant text-sm">
                    Chưa có danh mục nào.
                  </div>
                ) : (
                  <ul className="max-h-[400px] overflow-y-auto">
                    {categoryTree.map((c: any) => renderCategoryNode(c, 0))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
