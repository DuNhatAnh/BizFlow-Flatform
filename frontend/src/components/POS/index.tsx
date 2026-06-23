import React from "react";
import POSProductList from "./POSProductList";
import POSCart from "./POSCart";

interface POSProps {
  posProducts: any[];
  posSearch: string;
  setPosSearch: (val: string) => void;
  cart: any[];
  addToCart: (product: any) => void;
  updateCartQty: (productId: string, unitId: number | null, delta: number) => void;
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

export default function POS({
  posProducts,
  posSearch,
  setPosSearch,
  cart,
  addToCart,
  updateCartQty,
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
}: POSProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Products Left Section */}
      <div className="lg:col-span-7 xl:col-span-8">
        <POSProductList
          posProducts={posProducts}
          posSearch={posSearch}
          setPosSearch={setPosSearch}
          cart={cart}
          addToCart={addToCart}
          updateCartQty={updateCartQty}
        />
      </div>

      {/* Shopping Cart Right Section */}
      <div className="lg:col-span-5 xl:col-span-4">
        <POSCart
          cart={cart}
          setCart={setCart}
          customers={customers}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          customerSearch={customerSearch}
          setCustomerSearch={setCustomerSearch}
          isCustomerDropdownOpen={isCustomerDropdownOpen}
          setIsCustomerDropdownOpen={setIsCustomerDropdownOpen}
          isDebt={isDebt}
          setIsDebt={setIsDebt}
          validationErrors={validationErrors}
          handleCheckout={handleCheckout}
        />
      </div>
    </div>
  );
}
