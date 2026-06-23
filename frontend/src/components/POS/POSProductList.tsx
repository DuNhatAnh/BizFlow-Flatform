import React from "react";
import { Search } from "lucide-react";
import POSProductCard from "./POSProductCard";

interface POSProductListProps {
  posProducts: any[];
  posSearch: string;
  setPosSearch: (val: string) => void;
  cart: any[];
  addToCart: (product: any) => void;
  updateCartQty: (productId: string, unitId: number | null, delta: number) => void;
}

export default function POSProductList({
  posProducts,
  posSearch,
  setPosSearch,
  cart,
  addToCart,
  updateCartQty
}: POSProductListProps) {
  const filteredProducts = posProducts.filter((p) =>
    p.name.toLowerCase().includes(posSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-surface-container-high shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-on-surface-variant" />
        <input
          id="pos-search-input"
          type="text"
          placeholder="Tìm nhanh mặt hàng [F2]..."
          value={posSearch}
          onChange={(e) => setPosSearch(e.target.value)}
          className="w-full text-sm bg-transparent outline-none text-on-surface placeholder-on-surface-variant/40"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredProducts.map((p) => {
          const cartItem = cart.find(
            (item) => item.id === p.id && item.unitId === p.unitId
          );
          return (
            <POSProductCard
              key={`${p.id}-${p.unitId}`}
              product={p}
              cartItem={cartItem}
              addToCart={addToCart}
              updateCartQty={updateCartQty}
            />
          );
        })}
      </div>
    </div>
  );
}
