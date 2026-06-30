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
  let subtotalAmount = 0;
  let vatAmount = 0;
  let totalAmount = 0;

  cart.forEach(item => {
    const qty = item.quantity;
    const price = item.price;
    const rateStr = item.vatRate || "10";
    const rate = rateStr === "KCT" ? 0 : (parseFloat(rateStr) || 0);
    const includesVat = item.priceIncludesVat !== false;

    if (includesVat) {
      const lineTotal = price * qty;
      const lineSubtotal = lineTotal / (1 + rate / 100);
      const lineVat = lineTotal - lineSubtotal;
      
      subtotalAmount += lineSubtotal;
      vatAmount += lineVat;
      totalAmount += lineTotal;
    } else {
      const lineSubtotal = price * qty;
      const lineVat = lineSubtotal * (rate / 100);
      const lineTotal = lineSubtotal + lineVat;

      subtotalAmount += lineSubtotal;
      vatAmount += lineVat;
      totalAmount += lineTotal;
    }
  });

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

        <div className="space-y-2 border-t border-surface-container-low pt-4">
          <div className="flex justify-between items-center text-sm text-on-surface-variant">
            <span>Tạm tính (chưa thuế):</span>
            <span className="font-bold">{subtotalAmount.toLocaleString(undefined, {maximumFractionDigits: 0})} đ</span>
          </div>
          <div className="flex justify-between items-center text-sm text-on-surface-variant">
            <span>Thuế VAT:</span>
            <span className="font-bold">{vatAmount.toLocaleString(undefined, {maximumFractionDigits: 0})} đ</span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold text-on-surface pt-2 border-t border-surface-container-low border-dashed">
            <span>Tổng cộng:</span>
            <span className="text-lg text-primary">
              {totalAmount.toLocaleString(undefined, {maximumFractionDigits: 0})} đ
            </span>
          </div>
        </div>

        {isDebt && selectedCustomer && (selectedCustomer.totalDebt + totalAmount) > (selectedCustomer.debtLimit !== undefined ? selectedCustomer.debtLimit : 10000000) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-600 animate-in fade-in duration-200">
            <span className="text-sm shrink-0">⚠️</span>
            <div className="space-y-0.5">
              <p className="text-[11px] font-black uppercase tracking-wider">Cảnh báo: Vượt hạn mức nợ!</p>
              <p className="text-[10px] text-red-500 font-medium">
                Nợ cũ: {selectedCustomer.totalDebt.toLocaleString()}đ. Hóa đơn mới: {totalAmount.toLocaleString()}đ. Tổng nợ sẽ vượt hạn mức cho phép ({(selectedCustomer.debtLimit || 10000000).toLocaleString()}đ).
              </p>
            </div>
          </div>
        )}

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
