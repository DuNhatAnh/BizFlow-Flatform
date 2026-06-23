import React from "react";

interface POSCartItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    unit: string;
    unitId: number | null;
  };
  onRemove: (productId: string, unitId: number | null) => void;
}

export default function POSCartItem({ item, onRemove }: POSCartItemProps) {
  return (
    <div className="flex justify-between items-start text-sm border-b border-surface-container-low pb-3">
      <div className="flex-1">
        <p className="font-semibold text-on-surface">{item.name}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">
          {item.quantity} {item.unit} x {item.price.toLocaleString()} đ
        </p>
      </div>
      <div className="text-right">
        <p className="font-bold text-on-surface">
          {(item.price * item.quantity).toLocaleString()} đ
        </p>
        <button
          onClick={() => onRemove(item.id, item.unitId)}
          className="text-xs text-error hover:underline mt-1 font-medium inline-block"
        >
          Xóa
        </button>
      </div>
    </div>
  );
}
