"use client";

import React, { useState } from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";

interface CategoryNode {
  id: number;
  name: string;
  parentId: number | null;
  color?: string | null;
  children?: CategoryNode[];
}

interface CategoryItemProps {
  node: CategoryNode;
  level: number;
  categories: any[];
  editingCategoryId: number | null;
  setEditingCategoryId: (id: number | null) => void;
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

export default function CategoryItem({
  node,
  level,
  categories,
  editingCategoryId,
  setEditingCategoryId,
  onUpdateCategory,
  onDeleteCategory
}: CategoryItemProps) {
  const [editName, setEditName] = useState(node.name);
  const [editParentId, setEditParentId] = useState<number | "">(node.parentId || "");
  const [editColor, setEditColor] = useState<string>(node.color || AVAILABLE_COLORS[0]);

  const isEditing = editingCategoryId === node.id;

  const usedColors = categories.map((c: any) => c.color).filter(Boolean);
  const sortedColors = [...AVAILABLE_COLORS].sort((a, b) => {
    const aUsed = usedColors.includes(a);
    const bUsed = usedColors.includes(b);
    if (aUsed && !bUsed) return 1;
    if (!aUsed && bUsed) return -1;
    return 0;
  });

  const handleSave = async () => {
    if (!editName.trim()) return;
    await onUpdateCategory(node.id, editName.trim(), editParentId === "" ? null : editParentId, editColor);
    setEditingCategoryId(null);
  };

  return (
    <React.Fragment>
      <li 
        className="p-3 flex justify-between items-center hover:bg-surface-container-low/50 transition-colors border-b border-surface-container-low last:border-0" 
        style={{ paddingLeft: `${Math.max(12, level * 24 + 12)}px` }}
      >
        {isEditing ? (
          <div className="flex flex-col gap-2 w-full mr-2">
            <div className="flex gap-2 w-full">
              <input 
                type="text" 
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="flex-1 px-2 py-1 border rounded text-sm text-on-surface min-w-[100px]"
                autoFocus
              />
              <select
                value={editParentId}
                onChange={e => setEditParentId(e.target.value === "" ? "" : Number(e.target.value))}
                className="px-2 py-1 border rounded text-sm max-w-[130px] text-on-surface shrink-0"
              >
                <option value="">- Không có cha -</option>
                {categories.filter((c: any) => c.id !== node.id).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-between items-center w-full">
              <div className="flex gap-1.5 items-center flex-wrap px-1">
                {sortedColors.slice(0, 10).map((color) => (
                  <button
                    key={color}
                    onClick={() => setEditColor(color)}
                    className={`w-5 h-5 rounded-full transition-transform shrink-0 ${editColor === color ? 'ring-2 ring-offset-1 ring-primary scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: color }}
                    title="Chọn màu"
                  />
                ))}
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={handleSave}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                  title="Lưu"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => {
                    setEditingCategoryId(null);
                    setEditName(node.name);
                    setEditParentId(node.parentId || "");
                    setEditColor(node.color || sortedColors[0]);
                  }} 
                  className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                  title="Hủy"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <span className="text-sm font-medium text-on-surface flex items-center gap-2">
              {level > 0 && <span className="w-3 border-b border-l h-4 inline-block -mt-4 border-slate-300"></span>}
              {node.color && (
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: node.color }}></span>
              )}
              {node.name}
            </span>
            <div className="flex gap-1">
              <button 
                onClick={() => {
                  setEditingCategoryId(node.id);
                  setEditName(node.name);
                  setEditParentId(node.parentId || "");
                }}
                className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded transition-colors"
                title="Sửa danh mục"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDeleteCategory(node.id, node.name)}
                className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors"
                title="Xóa danh mục"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </li>
      {node.children && node.children.length > 0 && node.children.map((child: any) => (
        <CategoryItem
          key={child.id}
          node={child}
          level={level + 1}
          categories={categories}
          editingCategoryId={editingCategoryId}
          setEditingCategoryId={setEditingCategoryId}
          onUpdateCategory={onUpdateCategory}
          onDeleteCategory={onDeleteCategory}
        />
      ))}
    </React.Fragment>
  );
}
