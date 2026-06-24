import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Search, AlertCircle, ShoppingBag } from "lucide-react";

interface DraftEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: any;
  onSave: (updatedDraft: any) => void;
  rawProducts: any[];
  customers: any[];
}

export default function DraftEditModal({
  isOpen,
  onClose,
  draft,
  onSave,
  rawProducts,
  customers,
}: DraftEditModalProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [items, setItems] = useState<any[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState<string>("");
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    if (draft) {
      // Find original customer if matched
      const matchedCust = customers.find(
        (c) => c.fullname.toLowerCase() === draft.customer.toLowerCase()
      );
      setSelectedCustomerId(matchedCust ? matchedCust.id : "");
      setCustomerSearchQuery(draft.customer || "");
      
      const payment = draft.payment === "Ghi nợ (Nợ phải thu)" || draft.rawDraft?.paymentMethod === "Debt" ? "Debt" : "Cash";
      setPaymentMethod(payment);
      
      // Load draft items with resolved details
      const mappedItems = draft.items.map((item: any) => {
        // Try to match product by name in rawProducts
        const matchedProd = rawProducts.find(
          (p) => p.name.toLowerCase() === item.name.toLowerCase()
        );
        
        // Find selected unit in units of product
        const matchedUnit = matchedProd?.units?.find(
          (u: any) => u.unitName.toLowerCase() === item.unit.toLowerCase()
        ) || matchedProd?.units?.[0];

        return {
          productId: matchedProd ? matchedProd.id : item.productId || "",
          name: matchedProd ? matchedProd.name : item.name,
          quantity: item.qty,
          price: matchedUnit ? matchedUnit.price : item.price,
          unitId: matchedUnit ? matchedUnit.id : item.unitId || null,
          unitName: matchedUnit ? matchedUnit.unitName : item.unit,
          // Store raw product details to easily query other units
          rawProduct: matchedProd,
        };
      });
      setItems(mappedItems);
    }
  }, [draft, rawProducts, customers]);

  if (!isOpen || !draft) return null;

  // Filter customers for dropdown
  const filteredCustomers = customers.filter((c) =>
    c.fullname.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    c.phone?.includes(customerSearchQuery)
  );

  // Filter products for dropdown
  const filteredProducts = rawProducts.filter((p) =>
    p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
    p.code?.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  const handleSelectCustomer = (cust: any) => {
    setSelectedCustomerId(cust.id);
    setCustomerSearchQuery(cust.fullname);
    setIsCustomerDropdownOpen(false);
  };

  const handleSelectProduct = (prod: any) => {
    const defaultUnit = prod.units?.find((u: any) => u.isDefault) || prod.units?.[0];
    
    // Check if product already exists in items
    const existingIndex = items.findIndex((i) => i.productId === prod.id && i.unitId === defaultUnit?.id);
    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          productId: prod.id,
          name: prod.name,
          quantity: 1,
          price: defaultUnit ? defaultUnit.price : 0,
          unitId: defaultUnit ? defaultUnit.id : null,
          unitName: defaultUnit ? defaultUnit.unitName : prod.baseUnit,
          rawProduct: prod,
        },
      ]);
    }
    setProductSearchQuery("");
    setIsProductDropdownOpen(false);
  };

  const handleUpdateQty = (idx: number, delta: number) => {
    const updated = [...items];
    updated[idx].quantity = Math.max(1, updated[idx].quantity + delta);
    setItems(updated);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleUnitChange = (idx: number, unitId: string) => {
    const updated = [...items];
    const item = updated[idx];
    const newUnit = item.rawProduct?.units?.find((u: any) => u.id.toString() === unitId);
    if (newUnit) {
      item.unitId = newUnit.id;
      item.unitName = newUnit.unitName;
      item.price = newUnit.price;
    }
    setItems(updated);
  };

  // Validate stock level
  const checkStockError = (item: any) => {
    if (!item.rawProduct) return null;
    const selectedUnit = item.rawProduct.units?.find((u: any) => u.id === item.unitId);
    const rate = selectedUnit ? selectedUnit.conversionRate : 1;
    const requiredQty = item.quantity * rate;
    const availableQty = item.rawProduct.stockQuantity;
    if (requiredQty > availableQty) {
      return `Không đủ hàng! Còn ${availableQty} ${item.rawProduct.baseUnit} (Cần ${requiredQty})`;
    }
    return null;
  };

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const hasStockError = items.some((item) => checkStockError(item) !== null);
  const isDebtMethod = paymentMethod === "Debt";
  const customerError = isDebtMethod && !selectedCustomerId;

  const handleSaveAndConfirm = () => {
    if (hasStockError) return;
    if (customerError) return;

    // Build payload for confirm request
    const selectedCustObj = customers.find((c) => c.id === selectedCustomerId);
    
    // Map back to API format
    const confirmPayload = {
      ...draft.rawDraft,
      customerId: selectedCustomerId || null,
      customerName: selectedCustObj ? selectedCustObj.fullname : customerSearchQuery || "Khách Lẻ",
      paymentMethod: paymentMethod,
      totalAmount: totalAmount,
      orderItems: items.map((item) => ({
        productId: item.productId,
        productUnitId: item.unitId,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
      })),
    };

    const updatedDraftRepresentation = {
      ...draft,
      customer: selectedCustObj ? selectedCustObj.fullname : customerSearchQuery || "Khách Lẻ",
      payment: paymentMethod === "Debt" ? "Ghi nợ (Nợ phải thu)" : "Tiền mặt",
      items: items.map((item) => ({
        name: item.name,
        qty: item.quantity,
        price: item.price,
        unit: item.unitName,
        productId: item.productId,
        unitId: item.unitId,
      })),
      rawDraft: confirmPayload,
    };

    onSave(updatedDraftRepresentation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-surface-container-high w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-container-low flex justify-between items-center bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-on-surface">Chỉnh sửa đơn hàng nháp AI</h3>
              <p className="text-xs text-on-surface-variant">Rà soát và điều chỉnh chi tiết đơn trước khi duyệt vào sổ sách</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-surface-container-low rounded-lg text-on-surface-variant transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Row: Customer & Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Customer Search Dropdown */}
            <div className="relative">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Khách hàng liên kết
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customerSearchQuery}
                  onChange={(e) => {
                    setCustomerSearchQuery(e.target.value);
                    setSelectedCustomerId("");
                    setIsCustomerDropdownOpen(true);
                  }}
                  onFocus={() => setIsCustomerDropdownOpen(true)}
                  placeholder="Tìm kiếm khách hàng theo tên hoặc SĐT..."
                  className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    customerError ? "border-error focus:border-error focus:ring-error/20" : "border-outline-variant focus:border-primary"
                  }`}
                />
                {customerSearchQuery && (
                  <button 
                    onClick={() => {
                      setCustomerSearchQuery("");
                      setSelectedCustomerId("");
                    }} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-xs"
                  >
                    Xóa
                  </button>
                )}
              </div>

              {customerError && (
                <p className="text-[11px] text-error font-medium mt-1">
                  * Yêu cầu chọn khách hàng đã đăng ký để ghi nhận nợ.
                </p>
              )}

              {/* Customer Dropdown Menu */}
              {isCustomerDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsCustomerDropdownOpen(false)}></div>
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-surface-container-high rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                    {filteredCustomers.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-on-surface-variant text-center">
                        Không tìm thấy khách hàng. Nhập tên mới để lưu làm khách lẻ.
                      </div>
                    ) : (
                      filteredCustomers.map((cust) => (
                        <div
                          key={cust.id}
                          onClick={() => handleSelectCustomer(cust)}
                          className="px-4 py-2 hover:bg-surface-container-low cursor-pointer text-sm flex justify-between items-center transition-colors"
                        >
                          <span className="font-semibold text-on-surface">{cust.fullname}</span>
                          <span className="text-xs text-on-surface-variant">{cust.phone || "Không có SĐT"}</span>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Hình thức thanh toán
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "Cash", label: "Tiền mặt" },
                  { id: "Transfer", label: "Chuyển khoản" },
                  { id: "Debt", label: "Ghi nợ" },
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      paymentMethod === method.id
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container-low hover:text-on-surface"
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Cart Table */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Danh sách hàng hóa ({items.length})
              </label>
              
              {/* Product search box to add new items */}
              <div className="relative w-72">
                <Search className="w-3.5 h-3.5 text-on-surface-variant absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={(e) => {
                    setProductSearchQuery(e.target.value);
                    setIsProductDropdownOpen(true);
                  }}
                  onFocus={() => setIsProductDropdownOpen(true)}
                  placeholder="Thêm sản phẩm mới..."
                  className="w-full pl-8 pr-3 py-1 border border-outline-variant rounded-md text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
                
                {isProductDropdownOpen && productSearchQuery && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProductDropdownOpen(false)}></div>
                    <div className="absolute right-0 top-full mt-1 bg-white border border-surface-container-high rounded-lg shadow-lg z-20 w-80 max-h-48 overflow-y-auto">
                      {filteredProducts.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-on-surface-variant text-center">
                          Không tìm thấy sản phẩm.
                        </div>
                      ) : (
                        filteredProducts.map((prod) => (
                          <div
                            key={prod.id}
                            onClick={() => handleSelectProduct(prod)}
                            className="px-3 py-2 hover:bg-surface-container-low cursor-pointer text-xs flex justify-between items-center transition-colors border-b border-surface-container-lowest last:border-b-0"
                          >
                            <div className="text-left">
                              <span className="font-semibold text-on-surface block">{prod.name}</span>
                              <span className="text-[10px] text-on-surface-variant">Tồn kho: {prod.stockQuantity} {prod.baseUnit}</span>
                            </div>
                            <span className="text-primary font-bold text-[10px]">
                              {prod.units?.[0]?.price?.toLocaleString()}đ
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {items.length === 0 ? (
              <div className="bg-surface-container-low border border-dashed border-outline-variant p-8 rounded-xl text-center text-sm text-on-surface-variant">
                Giỏ hàng trống. Vui lòng thêm sản phẩm bằng ô tìm kiếm.
              </div>
            ) : (
              <div className="border border-surface-container-high rounded-xl overflow-hidden shadow-sm bg-white">
                <table className="w-full border-collapse text-left text-sm text-on-surface">
                  <thead className="bg-surface-container-low/50 text-xs font-bold text-on-surface-variant uppercase border-b border-surface-container-high">
                    <tr>
                      <th className="px-4 py-3">Sản phẩm</th>
                      <th className="px-4 py-3 w-32">Đơn vị</th>
                      <th className="px-4 py-3 w-32 text-center">Số lượng</th>
                      <th className="px-4 py-3 text-right w-28">Đơn giá</th>
                      <th className="px-4 py-3 text-right w-32">Thành tiền</th>
                      <th className="px-4 py-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low">
                    {items.map((item, idx) => {
                      const stockErr = checkStockError(item);
                      return (
                        <tr key={idx} className={`hover:bg-surface-container-lowest transition-colors ${stockErr ? "bg-error/[0.02]" : ""}`}>
                          <td className="px-4 py-3.5">
                            <span className="font-semibold text-on-surface block">{item.name}</span>
                            {stockErr && (
                              <span className="text-[10px] text-error font-medium flex items-center gap-0.5 mt-0.5">
                                <AlertCircle className="w-3 h-3" /> {stockErr}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            {item.rawProduct && item.rawProduct.units?.length > 0 ? (
                              <select
                                value={item.unitId || ""}
                                onChange={(e) => handleUnitChange(idx, e.target.value)}
                                className="w-full px-2 py-1 border border-outline-variant rounded-md text-xs focus:outline-none focus:border-primary"
                              >
                                {item.rawProduct.units.map((u: any) => (
                                  <option key={u.id} value={u.id}>
                                    {u.unitName}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-xs text-on-surface-variant px-2">{item.unitName}</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-center border border-outline-variant rounded-lg overflow-hidden w-28 mx-auto bg-white">
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(idx, -1)}
                                className="w-8 py-1 bg-surface-container-low hover:bg-surface-container-high text-on-surface font-bold text-sm transition-colors"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  const updated = [...items];
                                  updated[idx].quantity = isNaN(val) ? 1 : Math.max(1, val);
                                  setItems(updated);
                                }}
                                className="w-12 text-center text-xs font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(idx, 1)}
                                className="w-8 py-1 bg-surface-container-low hover:bg-surface-container-high text-on-surface font-bold text-sm transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right font-medium">
                            {item.price.toLocaleString()}đ
                          </td>
                          <td className="px-4 py-3.5 text-right font-bold text-on-surface">
                            {(item.price * item.quantity).toLocaleString()}đ
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 hover:bg-error/10 text-on-surface-variant hover:text-error rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-container-lowest border-t border-surface-container-low flex justify-between items-center">
          <div>
            <span className="text-xs text-on-surface-variant uppercase tracking-wider block font-bold">Tổng số tiền đơn hàng</span>
            <span className="text-2xl font-extrabold text-primary">{totalAmount.toLocaleString()}đ</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-bold text-on-surface hover:bg-surface-container-low border border-outline-variant rounded-xl transition-all"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSaveAndConfirm}
              disabled={hasStockError || customerError || items.length === 0}
              className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-sm transition-all ${
                hasStockError || customerError || items.length === 0
                  ? "bg-primary/45 cursor-not-allowed shadow-none"
                  : "bg-primary hover:bg-primary-container"
              }`}
            >
              Lưu & Xác nhận Duyệt
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
