import React from "react";
import { ShoppingCart } from "lucide-react";
import POSCartItem from "./POSCartItem";
import CustomerSelector from "./CustomerSelector";

interface POSCartProps {
  cart: any[];
  setCart: React.Dispatch<React.SetStateAction<any[]>>;
  customers: any[];
  selectedCustomer: any;
  setSelectedCustomer: (customer: any) => void;
  customerSearch: string;
  setCustomerSearch: (val: string) => void;
  isCustomerDropdownOpen: boolean;
  setIsCustomerDropdownOpen: (open: boolean) => void;
  isDebt: boolean;
  setIsDebt: (val: boolean) => void;
  validationErrors: {
    cart?: string;
    customer?: string;
  };
  handleCheckout: () => void;
}

export default function POSCart({
  cart,
  setCart,
  customers,
  selectedCustomer,
  setSelectedCustomer,
  customerSearch,
  setCustomerSearch,
  isCustomerDropdownOpen,
  setIsCustomerDropdownOpen,
  isDebt,
  setIsDebt,
  validationErrors,
  handleCheckout
}: POSCartProps) {
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleRemoveItem = (productId: string, unitId: number | null) => {
    setCart(cart.filter((c) => !(c.id === productId && c.unitId === unitId)));
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-surface-container-high shadow-card space-y-6 sticky top-8">
      <h3 className="font-bold text-on-surface flex items-center gap-2 border-b border-surface-container-high pb-4">
        <ShoppingCart className="w-5 h-5 text-primary" />
        Đơn hàng thanh toán
      </h3>

      {/* Cart list */}
      <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
        {cart.length === 0 ? (
          <div className="text-center py-8 text-on-surface-variant/50 text-xs">
            Chưa có hàng hóa nào trong giỏ
          </div>
        ) : (
          cart.map((item) => (
            <POSCartItem
              key={`${item.id}-${item.unitId}`}
              item={item}
              onRemove={handleRemoveItem}
            />
          ))
        )}
      </div>
      {validationErrors.cart && (
        <p className="text-xs font-bold text-error mt-2 text-center bg-error/5 py-1.5 rounded-lg border border-error/10">
          {validationErrors.cart}
        </p>
      )}

      <div className="border-t border-surface-container-high pt-4 space-y-4">
        <CustomerSelector
          customers={customers}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          customerSearch={customerSearch}
          setCustomerSearch={setCustomerSearch}
          isCustomerDropdownOpen={isCustomerDropdownOpen}
          setIsCustomerDropdownOpen={setIsCustomerDropdownOpen}
          validationError={validationErrors.customer}
        />

        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Bán ghi nợ (Công nợ TT88)
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isDebt}
              onChange={(e) => setIsDebt(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="flex justify-between items-center text-sm font-bold text-on-surface border-t border-surface-container-low pt-4">
          <span>Tổng tiền hóa đơn:</span>
          <span className="text-lg text-primary">
            {totalAmount.toLocaleString()} đ
          </span>
        </div>

        <button
          onClick={handleCheckout}
          className="w-full py-3 bg-primary hover:bg-primary-container text-white font-bold rounded-lg text-sm shadow-sm transition-all"
        >
          Xác nhận và In Hóa đơn [F9]
        </button>
      </div>
    </div>
  );
}
