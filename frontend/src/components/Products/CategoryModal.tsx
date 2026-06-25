"use client";

import React, { useState } from "react";
import { FolderTree, X, Plus } from "lucide-react";
import CategoryItem from "./CategoryItem";

interface CategoryNode {
  id: number;
  name: string;
  parentId: number | null;
  children?: CategoryNode[];
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  onAddCategory: (name: string, parentId: number | null, color: string | null) => Promise<void>;
  onUpdateCategory: (id: number, name: string, parentId: number | null, color: string | null) => Promise<void>;
  onDeleteCategory: (id: number, name: string) => Promise<void>;
}

const AVAILABLE_COLORS = [
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#f59e0b", // amber-500
  "#84cc16", // lime-500
  "#22c55e", // green-500
  "#10b981", // emerald-500
  "#14b8a6", // teal-500
  "#0ea5e9", // sky-500
  "#6366f1", // indigo-500
  "#a855f7", // purple-500
  "#ec4899", // pink-500
];

export default function CategoryModal({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory
}: CategoryModalProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryParentId, setNewCategoryParentId] = useState<number | "">("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

  const usedColors = categories.map((c: any) => c.color).filter(Boolean);
  const sortedColors = [...AVAILABLE_COLORS].sort((a, b) => {
    const aUsed = usedColors.includes(a);
    const bUsed = usedColors.includes(b);
    if (aUsed && !bUsed) return 1;
    if (!aUsed && bUsed) return -1;
    return 0;
  });

  const [newCategoryColor, setNewCategoryColor] = useState<string>(sortedColors[0]);

  if (!isOpen) return null;

  // Build category tree
  const buildCategoryTree = (cats: any[]): CategoryNode[] => {
    const map = new Map<number, CategoryNode>();
    const roots: CategoryNode[] = [];
    cats.forEach(c => map.set(c.id, { ...c, children: [] }));
    cats.forEach(c => {
      if (c.parentId) {
        const parent = map.get(c.parentId);
        if (parent) parent.children?.push(map.get(c.id)!);
      } else {
        const root = map.get(c.id);
        if (root) roots.push(root);
      }
    });
    return roots;
  };

  const categoryTree = buildCategoryTree(categories);

  const handleAdd = async () => {
    if (!newCategoryName.trim()) return;
    setIsSavingCategory(true);
    try {
      await onAddCategory(
        newCategoryName.trim(),
        newCategoryParentId === "" ? null : newCategoryParentId,
        newCategoryColor
      );
      setNewCategoryName("");
      setNewCategoryParentId("");
      // select next unused color
      const newUsedColors = [...usedColors, newCategoryColor];
      const nextColor = sortedColors.find(c => !newUsedColors.includes(c)) || sortedColors[0];
      setNewCategoryColor(nextColor);
    } finally {
      setIsSavingCategory(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col transform transition-all scale-100 max-h-[85vh]">
        <div className="flex justify-between items-center p-5 border-b bg-surface-container-low rounded-t-2xl">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-primary" />
            Quản lý Danh mục
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-on-surface-variant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 w-full">
              <input 
                type="text" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nhập tên danh mục mới..."
                className="flex-1 px-3 py-2 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary text-on-surface min-w-[120px]"
                onKeyDown={async (e) => {
                  if (e.key === "Enter" && newCategoryName.trim() && !isSavingCategory) {
                    await handleAdd();
                  }
                }}
              />
              <select
                value={newCategoryParentId}
                onChange={(e) => setNewCategoryParentId(e.target.value === "" ? "" : Number(e.target.value))}
                className="px-3 py-2 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary max-w-[140px] text-on-surface cursor-pointer shrink-0"
              >
                <option value="">- Không có cha -</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button 
                onClick={handleAdd}
                disabled={!newCategoryName.trim() || isSavingCategory}
                className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center disabled:opacity-50 transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex gap-3 items-center px-1">
              <span className="text-xs text-on-surface-variant font-medium shrink-0">Màu sắc:</span>
              <div className="flex gap-2.5 flex-wrap">
                {sortedColors.slice(0, 10).map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewCategoryColor(color)}
                    className={`w-6 h-6 rounded-full transition-transform shrink-0 ${newCategoryColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: color }}
                    title="Chọn màu"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 border border-surface-container-high rounded-xl overflow-hidden">
            {categoryTree.length === 0 ? (
              <div className="p-6 text-center text-on-surface-variant text-sm">
                Chưa có danh mục nào.
              </div>
            ) : (
              <ul className="max-h-[400px] overflow-y-auto">
                {categoryTree.map((c: any) => (
                  <CategoryItem
                    key={c.id}
                    node={c}
                    level={0}
                    categories={categories}
                    editingCategoryId={editingCategoryId}
                    setEditingCategoryId={setEditingCategoryId}
                    onUpdateCategory={onUpdateCategory}
                    onDeleteCategory={onDeleteCategory}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
