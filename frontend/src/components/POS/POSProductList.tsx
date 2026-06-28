import React, { useState } from "react";
import { Search } from "lucide-react";
import POSProductCard from "./POSProductCard";

interface POSProductListProps {
  posProducts: any[];
  posSearch: string;
  setPosSearch: (val: string) => void;
  cart: any[];
  addToCart: (product: any) => void;
  updateCartQty: (productId: string, unitId: number | null, delta: number) => void;
  categories: any[];
}

export default function POSProductList({
  posProducts,
  posSearch,
  setPosSearch,
  cart,
  addToCart,
  updateCartQty,
  categories
}: POSProductListProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const filteredProducts = posProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(posSearch.toLowerCase()) || 
                          (p.code && p.code.toLowerCase().includes(posSearch.toLowerCase()));
    const matchesCategory = selectedCategoryId === null || p.categoryId === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search Input */}
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

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategoryId(null)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
            selectedCategoryId === null
              ? "bg-primary text-white border-primary shadow-sm"
              : "bg-white text-on-surface border-outline-variant hover:bg-surface-container-low"
          }`}
        >
          Tất cả
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryId(cat.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
              selectedCategoryId === cat.id
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-on-surface border-outline-variant hover:bg-surface-container-low"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
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
