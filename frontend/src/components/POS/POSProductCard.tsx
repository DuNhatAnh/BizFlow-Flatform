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
    categoryId?: number | null;
    imageUrl?: string | null;
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

const getFallbackProductImage = (categoryId: number | null | undefined, name: string) => {
  const lowercaseName = name.toLowerCase();
  
  if (lowercaseName.includes("sắt") || lowercaseName.includes("thép")) {
    return "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=200&auto=format&fit=crop&q=60";
  }
  if (lowercaseName.includes("gạch")) {
    return "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=200&auto=format&fit=crop&q=60";
  }
  if (lowercaseName.includes("cát")) {
    return "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?w=200&auto=format&fit=crop&q=60";
  }
  if (lowercaseName.includes("xi măng")) {
    return "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200&auto=format&fit=crop&q=60";
  }

  switch (categoryId) {
    case 1:
      return "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=200&auto=format&fit=crop&q=60";
    case 2:
      return "https://images.unsplash.com/photo-1558244661-d248897f7bc4?w=200&auto=format&fit=crop&q=60";
    case 3:
      return "https://images.unsplash.com/photo-1527960656-26799343849b?w=200&auto=format&fit=crop&q=60";
    case 4:
      return "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=60";
    default:
      return "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=200&auto=format&fit=crop&q=60";
  }
};

export default function POSProductCard({
  product,
  cartItem,
  addToCart,
  updateCartQty
}: POSProductCardProps) {
  const displayImage = product.imageUrl || getFallbackProductImage(product.categoryId, product.name);

  return (
    <div
      onClick={() => {
        if (!cartItem) addToCart(product);
      }}
      className={`bg-white p-3.5 rounded-xl border border-surface-container-high transition-all flex gap-3 items-center group min-h-[96px] ${
        !cartItem ? "hover:border-primary/50 hover:shadow-md cursor-pointer" : ""
      }`}
    >
      {/* Product Image */}
      <div className="w-16 h-16 rounded-lg border border-surface-container-high overflow-hidden flex-shrink-0 bg-slate-50 flex items-center justify-center text-slate-400">
        <img 
          src={displayImage} 
          alt={product.name} 
          className="w-full h-full object-cover" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = getFallbackProductImage(product.categoryId, product.name);
          }}
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors text-sm truncate" title={product.name}>
          {product.name}
        </h4>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Đơn vị: {product.unit} | Tồn: {product.stock}
        </p>
        <p className="text-sm font-bold text-primary mt-1">
          {product.price.toLocaleString()} đ
        </p>
      </div>

      {/* Cart Action */}
      <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
        {cartItem ? (
          <div className="flex items-center gap-1 bg-primary/5 rounded-lg p-0.5">
            <button
              onClick={() => updateCartQty(product.id, product.unitId, -1)}
              className="w-6.5 h-6.5 flex items-center justify-center bg-white text-primary rounded border border-primary/20 hover:bg-primary hover:text-white transition-all font-bold text-xs"
            >
              -
            </button>
            <span className="text-xs font-bold text-on-surface px-1.5 min-w-[20px] text-center">
              {cartItem.quantity}
            </span>
            <button
              onClick={() => updateCartQty(product.id, product.unitId, 1)}
              className="w-6.5 h-6.5 flex items-center justify-center bg-white text-primary rounded border border-primary/20 hover:bg-primary hover:text-white transition-all font-bold text-xs"
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() => addToCart(product)}
            className="p-1.5 bg-primary/5 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
