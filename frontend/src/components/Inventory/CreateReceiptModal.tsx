import React from "react";
import { ArrowDownToLine, ArrowUpFromLine, X, Plus, Trash2, Save } from "lucide-react";

interface CreateReceiptModalProps {
  isReceiptModalOpen: boolean;
  setIsReceiptModalOpen: (val: boolean) => void;
  receiptForm: any;
  setReceiptForm: (val: any) => void;
  products: any[];
  isLoading: boolean;
  handleAddReceiptItem: () => void;
  handleItemChange: (index: number, field: string, value: any) => void;
  handleRemoveReceiptItem: (index: number) => void;
  handleExportPriceTypeChange: (val: string) => void;
  handleSubmitReceipt: () => void;
}

export default function CreateReceiptModal({
  isReceiptModalOpen,
  setIsReceiptModalOpen,
  receiptForm,
  setReceiptForm,
  products,
  isLoading,
  handleAddReceiptItem,
  handleItemChange,
  handleRemoveReceiptItem,
  handleExportPriceTypeChange,
  handleSubmitReceipt
}: CreateReceiptModalProps) {
  if (!isReceiptModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-surface-container-high">
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
            {receiptForm.type === 1 ? <ArrowDownToLine className="text-emerald-600" /> : <ArrowUpFromLine className="text-amber-600" />}
            Lập Phiếu {receiptForm.type === 1 ? "Nhập Kho" : "Xuất Kho Khác"}
          </h3>
          <button onClick={() => setIsReceiptModalOpen(false)} className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">Số phiếu</label>
              <input
                type="text"
                value="Tự động sinh"
                disabled
                className="w-full px-4 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-highest text-on-surface-variant cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">Ngày lập phiếu</label>
              <input
                type="date"
                value={receiptForm.date}
                onChange={(e) => setReceiptForm({ ...receiptForm, date: e.target.value })}
                className="w-full px-4 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-on-surface-variant mb-2">
                {receiptForm.type === 1 ? "Họ tên người giao hàng" : "Họ tên người nhận hàng"}
              </label>
              <input
                type="text"
                value={receiptForm.delivererReceiverName}
                onChange={(e) => setReceiptForm({ ...receiptForm, delivererReceiverName: e.target.value })}
                placeholder={receiptForm.type === 1 ? "Nguyễn Văn A..." : "Trần Văn B..."}
                className="w-full px-4 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">Theo chứng từ gốc số</label>
              <input
                type="text"
                value={receiptForm.referenceDocumentNo}
                onChange={(e) => setReceiptForm({ ...receiptForm, referenceDocumentNo: e.target.value })}
                placeholder="VD: HD00123"
                className="w-full px-4 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">Ngày chứng từ gốc</label>
              <input
                type="date"
                value={receiptForm.referenceDocumentDate}
                onChange={(e) => setReceiptForm({ ...receiptForm, referenceDocumentDate: e.target.value })}
                className="w-full px-4 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">Đơn vị ban hành chứng từ</label>
              <input
                type="text"
                value={receiptForm.referenceDocumentIssuer}
                onChange={(e) => setReceiptForm({ ...receiptForm, referenceDocumentIssuer: e.target.value })}
                placeholder="VD: Công ty TNHH ABC"
                className="w-full px-4 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">Địa điểm nhập/xuất kho</label>
              <input
                type="text"
                value={receiptForm.warehouseLocation}
                onChange={(e) => setReceiptForm({ ...receiptForm, warehouseLocation: e.target.value })}
                placeholder="VD: Kho chính"
                className="w-full px-4 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-on-surface-variant mb-2">Ghi chú / Lý do {receiptForm.type === 1 ? "nhập" : "xuất"} kho</label>
              <input
                type="text"
                value={receiptForm.note}
                onChange={(e) => setReceiptForm({ ...receiptForm, note: e.target.value })}
                placeholder="VD: Nhập hàng đợt 1..."
                className="w-full px-4 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low focus:border-primary focus:outline-none"
              />
            </div>

            {receiptForm.type === 2 && (
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-on-surface-variant mb-2">Loại giá xuất (Đơn giá)</label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="exportPriceType" value="cogs" checked={receiptForm.exportPriceType === "cogs"} onChange={(e) => handleExportPriceTypeChange(e.target.value)} className="w-4 h-4 text-primary focus:ring-primary" />
                    <span className="text-sm font-semibold">Giá gốc (Tự động lấy trung bình giá vốn hiện tại)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="exportPriceType" value="selling" checked={receiptForm.exportPriceType === "selling"} onChange={(e) => handleExportPriceTypeChange(e.target.value)} className="w-4 h-4 text-primary focus:ring-primary" />
                    <span className="text-sm font-semibold">Giá bán (Nhập thủ công hoặc theo giá bán)</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-xs font-bold text-on-surface-variant uppercase">Danh sách hàng hóa</label>
              <button onClick={handleAddReceiptItem} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                <Plus className="w-3 h-3" /> Thêm dòng
              </button>
            </div>

            <div className="space-y-3 overflow-x-auto pb-2">
              {receiptForm.items.map((item: any, index: number) => (
                <div key={index} className="flex gap-3 items-end bg-surface-container-low/50 p-3 rounded-lg border border-surface-container-high min-w-max">
                  <div className="w-[250px] shrink-0">
                    <label className="block text-[10px] text-on-surface-variant mb-1 font-semibold">Sản phẩm</label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                      className="w-full px-3 py-1.5 border border-outline-variant rounded bg-white text-sm focus:border-primary focus:outline-none"
                    >
                      <option key="empty" value="">Chọn sản phẩm</option>
                      {products.map((p: any) => {
                        const isOutOfStock = !p.stockQuantity || p.stockQuantity <= 0;
                        const isExport = receiptForm.type !== 1;
                        const disabled = isExport && isOutOfStock;
                        return (
                          <option key={p.id} value={p.id} disabled={disabled}>
                            {p.name} ({p.stockQuantity || 0})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="w-16">
                    <label className="block text-[10px] text-on-surface-variant mb-1 font-semibold text-center">ĐVT</label>
                    <div className="w-full px-2 py-1.5 border border-outline-variant rounded bg-surface-container-highest text-sm text-center text-on-surface-variant">
                      {products.find((p: any) => p.id === item.productId)?.baseUnit || "-"}
                    </div>
                  </div>
                  <div className="w-20">
                    <label className="block text-[10px] text-on-surface-variant mb-1 font-semibold">SL Y/C</label>
                    <input
                      type="number" min="1"
                      value={item.documentQuantity}
                      onChange={(e) => handleItemChange(index, "documentQuantity", e.target.value)}
                      className="w-full px-3 py-1.5 border border-outline-variant rounded bg-white text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="w-20">
                    <label className="block text-[10px] text-on-surface-variant mb-1 font-semibold">SL Thực</label>
                    <input
                      type="number" min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      className="w-full px-3 py-1.5 border border-outline-variant rounded bg-white text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-[10px] text-on-surface-variant mb-1 font-semibold">Đơn giá</label>
                    <input
                      type="number" min="0"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                      disabled={receiptForm.type === 2 && receiptForm.exportPriceType === "cogs"}
                      title={receiptForm.type === 2 && receiptForm.exportPriceType === "cogs" ? "Giá gốc được hệ thống tính tự động từ giá vốn" : ""}
                      className={`w-full px-2 py-1.5 border border-outline-variant rounded text-sm focus:border-primary focus:outline-none ${receiptForm.type === 2 && receiptForm.exportPriceType === "cogs" ? 'bg-surface-container-highest cursor-not-allowed text-on-surface-variant' : 'bg-white'}`}
                    />
                  </div>
                  {receiptForm.type === 1 && (
                    <div className="w-20">
                      <label className="block text-[10px] text-on-surface-variant mb-1 font-semibold">Thuế VAT</label>
                      <select
                        value={item.vatRate || ""}
                        onChange={(e) => handleItemChange(index, "vatRate", e.target.value)}
                        className="w-full px-1 py-1.5 border border-outline-variant rounded bg-white text-[11px] focus:border-primary focus:outline-none"
                      >
                        <option value="">
                          Theo SP {products.find((p: any) => p.id === item.productId)?.vatRate ? `(${products.find((p: any) => p.id === item.productId)?.vatRate === 'KCT' ? 'KCT' : products.find((p: any) => p.id === item.productId)?.vatRate + '%'})` : ''}
                        </option>
                        <option value="KCT">KCT</option>
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="8">8%</option>
                        <option value="10">10%</option>
                      </select>
                    </div>
                  )}
                  {receiptForm.type === 1 && (
                    <div className="w-16 flex flex-col items-center">
                      <label className="block text-[10px] text-on-surface-variant mb-1 font-semibold whitespace-nowrap">Đã gồm VAT</label>
                      <input
                        type="checkbox"
                        checked={item.priceIncludesVat !== false}
                        onChange={(e) => handleItemChange(index, "priceIncludesVat", e.target.checked)}
                        className="mt-2 text-primary"
                      />
                    </div>
                  )}
                  <div className="w-24">
                    <label className="block text-[10px] text-on-surface-variant mb-1 font-semibold text-right">Thành tiền</label>
                    <div className="w-full px-3 py-1.5 border border-outline-variant rounded text-sm font-semibold text-right bg-surface-container-highest text-primary">
                      {(item.quantity * item.unitPrice).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveReceiptItem(index)}
                    className="p-1.5 text-error hover:bg-error/10 rounded mb-0.5 transition-colors"
                    disabled={receiptForm.items.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-surface-container-high bg-surface-container-low/50 flex justify-between items-center gap-3">
          <div className="text-sm font-bold text-on-surface flex flex-col">
            <div>
              Tổng cộng:
              <span className="text-primary text-lg ml-2">
                {receiptForm.type === 2 ? "Tự động tính giá vốn" : receiptForm.items.reduce((sum: number, i: any) => sum + (i.quantity * i.unitPrice), 0).toLocaleString() + " VNĐ"}
              </span>
            </div>
            {receiptForm.type === 1 && (
              <div className="text-xs text-on-surface-variant font-normal mt-1">
                (Bao gồm Tổng thuế: <span className="font-semibold text-amber-600">
                  {receiptForm.items.reduce((sum: number, i: any) => {
                    const p = products.find((p: any) => p.id === i.productId);
                    const rateStr = i.vatRate || p?.vatRate || "0";
                    const rate = rateStr === "KCT" ? 0 : parseFloat(rateStr) || 0;
                    const includesVat = i.priceIncludesVat !== undefined ? i.priceIncludesVat : (p?.priceIncludesVat !== false);
                    const lineTotal = i.quantity * i.unitPrice;
                    if (includesVat) {
                      const lineSubtotal = lineTotal / (1 + rate / 100);
                      return sum + (lineTotal - lineSubtotal);
                    } else {
                      return sum + (lineTotal * (rate / 100));
                    }
                  }, 0).toLocaleString(undefined, {maximumFractionDigits: 0})} VNĐ
                </span>)
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setIsReceiptModalOpen(false)} className="px-5 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-lg">
              Hủy
            </button>
            <button
              onClick={handleSubmitReceipt}
              disabled={isLoading}
              className={`px-5 py-2 text-sm font-bold text-white rounded-lg flex items-center gap-2 ${isLoading ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary-container'}`}
            >
              <Save className="w-4 h-4" /> {isLoading ? 'Đang lưu...' : 'Lưu Phiếu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
