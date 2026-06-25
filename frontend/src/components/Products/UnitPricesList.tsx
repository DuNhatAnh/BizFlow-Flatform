"use client";

import React from "react";

interface ProductUnit {
  id: number | null;
  unitName: string;
  conversionRate: number;
  price: number;
  isDefault: boolean;
}

interface UnitPricesListProps {
  units: ProductUnit[];
  baseUnit: string;
}

export default function UnitPricesList({ units, baseUnit }: UnitPricesListProps) {
  const sortedUnits = [...units].sort(
    (a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)
  );

  return (
    <div className="flex items-center gap-2 flex-wrap py-1">
      {sortedUnits.map((u, idx) => (
        <div
          key={u.id ?? `unit-${idx}`}
          className={`flex flex-col rounded-xl border px-3 py-2 w-fit whitespace-nowrap ${
            u.isDefault ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-bold text-[13px] ${u.isDefault ? "text-blue-700" : "text-slate-700"}`}>
              {u.unitName}
            </span>
            {u.isDefault && (
              <span className="bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Mặc định
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-slate-600 font-medium">
              1 = {u.isDefault ? 1 : u.conversionRate} {baseUnit}
            </span>
            <span className="font-bold text-primary text-[13px]">
              {u.price.toLocaleString()} đ
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
