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
    <div className="flex flex-col gap-1.5 py-0.5">
      {sortedUnits.map((u, idx) => (
        <div
          key={u.id ?? `unit-${idx}`}
          className="flex items-center justify-between text-xs py-1 border-b border-dashed border-slate-200/60 last:border-b-0 gap-8"
        >
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${u.isDefault ? "text-primary" : "text-slate-700"}`}>
              {u.unitName}
            </span>
            {u.isDefault ? (
              <span className="bg-primary/10 text-primary text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                Mặc định
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-medium">
                (1 = {u.conversionRate} {baseUnit})
              </span>
            )}
          </div>
          <span className="font-bold text-secondary">
            {u.price.toLocaleString()} đ
          </span>
        </div>
      ))}
    </div>
  );
}
