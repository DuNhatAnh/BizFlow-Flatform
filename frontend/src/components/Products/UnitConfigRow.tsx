"use client";

import React from "react";
import { Trash2 } from "lucide-react";

interface ProductUnit {
  id: number | null;
  unitName: string;
  conversionRate: number;
  price: number;
  isDefault: boolean;
}

interface UnitConfigRowProps {
  unit: ProductUnit;
  index: number;
  baseUnit: string;
  isDefaultChecked: boolean;
  canRemove: boolean;
  onSetDefault: (index: number) => void;
  onFieldChange: (index: number, field: keyof ProductUnit, value: any) => void;
  onRemove: (index: number) => void;
}

export default function UnitConfigRow({
  unit,
  index,
  baseUnit,
  isDefaultChecked,
  canRemove,
  onSetDefault,
  onFieldChange,
  onRemove
}: UnitConfigRowProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-12 gap-3 items-center p-3 sm:p-2 border sm:border-none rounded-lg sm:rounded-none ${unit.isDefault ? 'bg-primary/5 border-primary/30' : 'bg-surface-container-low/30 border-surface-container-high'}`}>
      <div className="col-span-1 flex justify-center items-center gap-2 sm:gap-0">
        <span className="sm:hidden text-xs font-bold text-on-surface-variant">Bán mặc định:</span>
        <input 
          type="radio" 
          name="defaultUnit" 
          checked={isDefaultChecked}
          onChange={() => onSetDefault(index)}
          className="w-4 h-4 text-primary focus:ring-primary accent-primary cursor-pointer"
        />
      </div>
      <div className="col-span-3">
        <label className="sm:hidden block text-xs font-bold text-on-surface-variant mb-1">Tên Đơn Vị</label>
        <input 
          type="text" 
          value={unit.unitName}
          onChange={(e) => onFieldChange(index, "unitName", e.target.value)}
          placeholder="VD: Thùng, Lốc..."
          className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-sm focus:outline-none focus:border-primary text-on-surface"
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
            onFieldChange(index, "conversionRate", isNaN(val) ? 0 : val);
          }}
          className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded text-sm focus:outline-none focus:border-primary text-on-surface"
        />
      </div>
      <div className="col-span-4 relative">
        <label className="sm:hidden block text-xs font-bold text-on-surface-variant mb-1">Giá Bán</label>
        <div className="relative">
          <input 
            type="number" 
            min="0"
            value={unit.price}
            onChange={(e) => onFieldChange(index, "price", Number(e.target.value))}
            className="w-full pl-3 pr-8 py-1.5 bg-white border border-outline-variant rounded text-sm font-bold text-secondary focus:outline-none focus:border-primary"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant font-bold">đ</span>
        </div>
      </div>
      <div className="col-span-1 flex justify-end sm:justify-center">
        <button 
          onClick={() => onRemove(index)}
          disabled={!canRemove}
          className="p-1.5 text-error hover:bg-error/10 rounded disabled:opacity-30 transition-colors"
          title="Xóa đơn vị"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
