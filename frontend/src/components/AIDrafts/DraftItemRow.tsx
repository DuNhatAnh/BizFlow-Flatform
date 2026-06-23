import React from "react";

interface DraftItemRowProps {
  item: {
    name: string;
    qty: number;
    unit: string;
    price: number;
  };
}

export default function DraftItemRow({ item }: DraftItemRowProps) {
  return (
    <div className="flex justify-between items-center text-sm text-on-surface bg-surface-container-low/30 px-3 py-2 rounded border border-surface-container-low">
      <span className="font-semibold">{item.name}</span>
      <span className="text-on-surface-variant">
        {item.qty} {item.unit} x {item.price.toLocaleString()} đ
      </span>
      <span className="font-bold">{(item.qty * item.price).toLocaleString()} đ</span>
    </div>
  );
}
