import React from "react";
import { Trash2 } from "lucide-react";

interface CustomerSelectorProps {
  customers: any[];
  selectedCustomer: any;
  setSelectedCustomer: (customer: any) => void;
  customerSearch: string;
  setCustomerSearch: (val: string) => void;
  isCustomerDropdownOpen: boolean;
  setIsCustomerDropdownOpen: (open: boolean) => void;
  validationError: string | undefined;
}

export default function CustomerSelector({
  customers,
  selectedCustomer,
  setSelectedCustomer,
  customerSearch,
  setCustomerSearch,
  isCustomerDropdownOpen,
  setIsCustomerDropdownOpen,
  validationError
}: CustomerSelectorProps) {
  const filteredCustomers = customers.filter((c) => {
    const query = customerSearch.toLowerCase();
    return (
      c.fullname.toLowerCase().includes(query) ||
      (c.phone && c.phone.includes(query))
    );
  });

  return (
    <div className="relative">
      <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
        Khách hàng
      </label>
      <div className={selectedCustomer ? "block" : "hidden"}>
        {selectedCustomer && (
          <div className="flex items-center justify-between p-2.5 bg-primary/5 border border-primary/20 rounded-lg text-sm">
            <div className="flex-1">
              <p className="font-bold text-on-surface">{selectedCustomer.fullname}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                SĐT: {selectedCustomer.phone || "N/A"} | Nợ:{" "}
                {Number(selectedCustomer.totalDebt).toLocaleString()}đ
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCustomer(null);
                setCustomerSearch("");
              }}
              className="p-1 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className={!selectedCustomer ? "block" : "hidden"}>
        <div className="relative flex items-center">
          <input
            id="pos-customer-input"
            type="text"
            placeholder="Tìm khách hàng [F4]..."
            value={customerSearch}
            onChange={(e) => {
              setCustomerSearch(e.target.value);
              setIsCustomerDropdownOpen(true);
            }}
            onFocus={() => setIsCustomerDropdownOpen(true)}
            className="w-full px-3 py-2 pr-8 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary"
          />
          {customerSearch && (
            <button
              type="button"
              onClick={() => setCustomerSearch("")}
              className="absolute right-2.5 text-on-surface-variant hover:text-on-surface text-xs font-medium"
            >
              Xóa
            </button>
          )}
        </div>

        {isCustomerDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsCustomerDropdownOpen(false)}
            />
            <div className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-surface-container-high rounded-lg shadow-lg z-20 divide-y divide-surface-container-low">
              <div
                onClick={() => {
                  setSelectedCustomer(null);
                  setIsCustomerDropdownOpen(false);
                  setCustomerSearch("");
                }}
                className="px-3 py-2 text-xs font-medium text-on-surface-variant hover:bg-surface-container-low cursor-pointer transition-colors"
              >
                Khách vãng lai (Không ghi nợ)
              </div>
              {filteredCustomers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCustomer(c);
                    setIsCustomerDropdownOpen(false);
                    setCustomerSearch("");
                  }}
                  className="px-3 py-2 hover:bg-surface-container-low cursor-pointer transition-colors text-sm"
                >
                  <div className="flex justify-between font-medium text-on-surface">
                    <span>{c.fullname}</span>
                    <span className="text-xs text-on-surface-variant">
                      Nợ: {Number(c.totalDebt).toLocaleString()}đ
                    </span>
                  </div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    SĐT: {c.phone || "N/A"}
                  </div>
                </div>
              ))}
              {filteredCustomers.length === 0 && (
                <div className="px-3 py-3 text-xs text-on-surface-variant text-center">
                  Không tìm thấy khách hàng nào
                </div>
              )}
            </div>
          </>
        )}
        {validationError && (
          <p className="text-xs font-bold text-error mt-1.5 bg-error/5 px-2.5 py-1.5 rounded-lg border border-error/10">
            {validationError}
          </p>
        )}
      </div>
    </div>
  );
}
