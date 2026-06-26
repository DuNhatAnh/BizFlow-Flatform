"use client";

import React from "react";
import { Search, Plus, Phone } from "lucide-react";

interface Customer {
  id: string;
  fullname: string;
  phone: string | null;
  totalDebt: number;
  debtLimit: number;
}

interface DebtCustomerListProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterType: "all" | "indebted" | "overlimit";
  setFilterType: (type: "all" | "indebted" | "overlimit") => void;
  isReadOnly: boolean;
  onAddCustomer: () => void;
  loading: boolean;
}

export default function DebtCustomerList({
  customers,
  selectedCustomer,
  onSelectCustomer,
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  isReadOnly,
  onAddCustomer,
  loading
}: DebtCustomerListProps) {
  
  // Filter and search logic
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.fullname.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (c.phone && c.phone.includes(searchQuery));
    
    if (!matchesSearch) return false;
    
    if (filterType === "indebted") {
      return c.totalDebt > 0;
    }
    if (filterType === "overlimit") {
      return c.totalDebt > c.debtLimit;
    }
    return true;
  });

  return (
    <div className="w-[30%] bg-white rounded-xl border border-surface-container-high flex flex-col h-full shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100 fill-mode-both">
      
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-surface-container-high space-y-3 bg-surface-container-lowest">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-primary" />
            Khách hàng
          </h3>
          {!isReadOnly && (
            <button 
              onClick={onAddCustomer}
              className="p-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all"
              title="Thêm khách hàng"
            >
              <Plus className="w-4.5 h-4.5" />
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo Tên hoặc Số ĐT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-background rounded-lg border border-outline/30 text-sm focus:outline-none focus:border-primary text-on-surface"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex gap-1.5 bg-background p-1 rounded-lg border border-outline-variant/35">
          <button
            onClick={() => setFilterType("all")}
            className={`flex-1 text-center py-1 rounded text-[11px] font-semibold transition-all ${
              filterType === "all" 
                ? "bg-white text-primary shadow-sm" 
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterType("indebted")}
            className={`flex-1 text-center py-1 rounded text-[11px] font-semibold transition-all ${
              filterType === "indebted" 
                ? "bg-white text-primary shadow-sm" 
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Đang nợ
          </button>
          <button
            onClick={() => setFilterType("overlimit")}
            className={`flex-1 text-center py-1 rounded text-[11px] font-semibold transition-all ${
              filterType === "overlimit" 
                ? "bg-white text-error shadow-sm" 
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Vượt hạn mức
          </button>
        </div>
      </div>

      {/* Customer items */}
      <div className="flex-1 overflow-y-auto divide-y divide-surface-container">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-sm text-on-surface-variant">
            Không tìm thấy khách hàng nào.
          </div>
        ) : (
          filteredCustomers.map((c) => {
            const isOverLimit = c.totalDebt > c.debtLimit;
            const isSelected = selectedCustomer?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => onSelectCustomer(c)}
                className={`p-3.5 cursor-pointer transition-all flex justify-between items-center ${
                  isSelected 
                    ? "bg-primary-container/20 border-l-4 border-l-primary" 
                    : "hover:bg-surface-container-low"
                }`}
              >
                <div className="space-y-0.5 min-w-0 pr-2">
                  <p className="font-bold text-sm text-on-surface truncate">{c.fullname}</p>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    {c.phone || "---"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-bold text-sm ${
                    c.totalDebt > 0 
                      ? (isOverLimit ? "text-error" : "text-status-warning") 
                      : "text-on-surface-variant"
                  }`}>
                    {c.totalDebt.toLocaleString()} đ
                  </p>
                  {isOverLimit && (
                    <span className="inline-block px-1.5 py-0.5 rounded bg-error-container text-on-error-container text-[9px] font-bold mt-0.5 uppercase tracking-wide">
                      Vượt hạn mức
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
