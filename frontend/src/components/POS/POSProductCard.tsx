import React from "react";
import { Plus } from "lucide-react";

interface POSProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
    unitId: number | null;
    stock: number;
  };
  cartItem: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    unit: string;
    unitId: number | null;
  } | undefined;
  addToCart: (product: any) => void;
  updateCartQty: (productId: string, unitId: number | null, delta: number) => void;
}

export default function POSProductCard({
  product,
  cartItem,
  addToCart,
  updateCartQty
}: POSProductCardProps) {
  return (
    <div
      onClick={() => {
        if (!cartItem) addToCart(product);
      }}
      className={`bg-white p-4 rounded-xl border border-surface-container-high transition-all flex justify-between items-start group ${
        !cartItem ? "hover:border-primary/50 hover:shadow-md cursor-pointer" : ""
      }`}
    >
      <div>
        <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">
          {product.name}
        </h4>
        <p className="text-xs text-on-surface-variant mt-1">
          Đơn vị: {product.unit} | Tồn: {product.stock}
        </p>
        <p className="text-sm font-bold text-primary mt-2">
          {product.price.toLocaleString()} đ
        </p>
      </div>
      {cartItem ? (
        <div
          className="flex items-center gap-1.5 bg-primary/5 rounded-lg p-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => updateCartQty(product.id, product.unitId, -1)}
            className="w-7 h-7 flex items-center justify-center bg-white text-primary rounded border border-primary/20 hover:bg-primary hover:text-white transition-all font-bold"
          >
            -
          </button>
          <span className="text-sm font-bold text-on-surface px-2 min-w-[24px] text-center">
            {cartItem.quantity}
          </span>
          <button
            onClick={() => updateCartQty(product.id, product.unitId, 1)}
            className="w-7 h-7 flex items-center justify-center bg-white text-primary rounded border border-primary/20 hover:bg-primary hover:text-white transition-all font-bold"
          >
            +
          </button>
        </div>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
          }}
          className="p-1.5 bg-primary/5 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
