import React, { useState } from "react";
import { ArrowUpFromLine, ArrowDownToLine, AlertCircle, MoreHorizontal, Eye, Trash2, Search, Filter } from "lucide-react";
import { createPortal } from "react-dom";
import { Skeleton } from "../../ui/Skeleton";
import { Pagination } from "../../ui/Pagination";

interface ReceiptHistoryTabProps {
  activeSubTab: string;
  exportFilterTab: string;
  setExportFilterTab: (val: string) => void;
  handleOpenReceiptModal: (type: number) => void;
  isReceiptsLoading: boolean;
  isOrdersLoading: boolean;
  isReceiptsError: boolean;
  isOrdersError: boolean;
  receiptsError: any;
  ordersError: any;
  displayData: any[];
  receiptPage: number;
  setReceiptPage: (val: number) => void;
  setViewReceiptDetails: (val: any) => void;
  setCancelReceiptId: (val: string) => void;
  setCancelModalOpen: (val: boolean) => void;
  receiptsData: any;
  receiptTotalPages: number;
}

export default function ReceiptHistoryTab({
  activeSubTab,
  exportFilterTab,
  setExportFilterTab,
  handleOpenReceiptModal,
  isReceiptsLoading,
  isOrdersLoading,
  isReceiptsError,
  isOrdersError,
  receiptsError,
  ordersError,
  displayData,
  receiptPage,
  setReceiptPage,
  setViewReceiptDetails,
  setCancelReceiptId,
  setCancelModalOpen,
  receiptsData,
  receiptTotalPages
}: ReceiptHistoryTabProps) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const [sortOption, setSortOption] = useState("newest"); // Default to newest
  const [searchQuery, setSearchQuery] = useState("");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const filteredAndSortedData = [...displayData].filter(item => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    const code = (item.code || "").toLowerCase();
    const note = (item.note || "").toLowerCase();
    const customer = (item.customerName || "").toLowerCase();
    return code.includes(lowerQuery) || note.includes(lowerQuery) || customer.includes(lowerQuery);
  }).sort((a, b) => {
    const dateA = new Date(a.createdAt || a.date || 0).getTime();
    const dateB = new Date(b.createdAt || b.date || 0).getTime();
    
    const amountA = activeSubTab === "receipts_out" && exportFilterTab === "export_slip" ? (a.totalCostPrice || 0) : (a.totalAmount || 0);
    const amountB = activeSubTab === "receipts_out" && exportFilterTab === "export_slip" ? (b.totalCostPrice || 0) : (b.totalAmount || 0);

    if (sortOption === "newest") return dateB - dateA;
    if (sortOption === "oldest") return dateA - dateB;
    if (sortOption === "price_asc") return amountA - amountB;
    if (sortOption === "price_desc") return amountB - amountA;
    return 0;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold text-on-surface">
            {activeSubTab === "receipts_in" ? "Lịch sử Nhập kho" : "Lịch sử Xuất kho"}
          </h3>
          {activeSubTab === "receipts_out" && (
            <div className="flex flex-wrap gap-1 bg-surface-container-low p-1 rounded-lg w-max mt-2">
              <button onClick={() => setExportFilterTab("all")} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${exportFilterTab === "all" ? "bg-white shadow text-primary" : "text-on-surface-variant hover:bg-surface-container"}`}>Tất cả</button>
              <button onClick={() => setExportFilterTab("export_slip")} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${exportFilterTab === "export_slip" ? "bg-white shadow text-primary" : "text-on-surface-variant hover:bg-surface-container"}`}>Phiếu xuất kho</button>
              <button onClick={() => setExportFilterTab("sales_slip")} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${exportFilterTab === "sales_slip" ? "bg-white shadow text-primary" : "text-on-surface-variant hover:bg-surface-container"}`}>Xuất từ bán hàng</button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
          <div className="relative flex-grow lg:flex-grow-0 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Tìm theo mã phiếu, lý do..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-surface-container-high rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full lg:w-64 bg-white shadow-sm transition-all"
            />
          </div>


          {activeSubTab === "receipts_in" && (
            <button
              onClick={() => handleOpenReceiptModal(1)}
              className="whitespace-nowrap shrink-0 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary/20 transition-colors"
            >
              <ArrowDownToLine className="w-4 h-4 shrink-0" /> Lập Phiếu Nhập Kho
            </button>
          )}
          {activeSubTab === "receipts_out" && (
            <button
              onClick={() => handleOpenReceiptModal(2)}
              className="whitespace-nowrap shrink-0 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-amber-100"
            >
              <ArrowUpFromLine className="w-4 h-4 shrink-0" /> Lập Phiếu Xuất Kho
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-surface-container-high text-xs font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-low">
              <th className="p-4 rounded-tl-lg w-16 text-center">STT</th>
              <th className="p-4">Ngày tạo</th>
              <th className="p-4">Loại phiếu</th>
              <th className="p-4">Mã phiếu</th>
              {activeSubTab === "receipts_out" && exportFilterTab === "sales_slip" ? (
                <>
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4 text-right">Tổng Tiền Bán</th>
                  <th className="p-4 text-right text-amber-700">Tổng Giá Vốn</th>
                  <th className="p-4 text-right text-emerald-600">Lãi Gộp</th>
                </>
              ) : (
                <>
                  <th className="p-4">Ghi chú</th>
                  <th className="p-4 text-right">{activeSubTab === "receipts_out" && exportFilterTab === "export_slip" ? "Tổng Giá Vốn" : "Tổng Tiền"}</th>
                </>
              )}
              <th className="p-4 text-center">Trạng thái</th>
              <th className="p-4 rounded-tr-lg w-16 text-center relative">
                <div 
                  className="flex justify-center items-center cursor-pointer hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container" 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  title="Sắp xếp danh sách"
                >
                  <Filter className={`w-4 h-4 ${sortOption !== 'newest' ? 'text-primary' : 'text-gray-400'}`} />
                </div>
                {isSortOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)}></div>
                    <div className="absolute right-4 top-full mt-1 bg-white border shadow-lg rounded-lg z-50 w-48 py-1.5 font-normal text-gray-700 normal-case tracking-normal text-left">
                      <div className="px-3 py-1 text-xs text-gray-400 uppercase tracking-wider font-semibold">Sắp xếp theo</div>
                      <button onClick={() => {setSortOption("newest"); setIsSortOpen(false)}} className={`w-full text-left px-4 py-2 hover:bg-gray-50 text-sm ${sortOption === 'newest' ? 'text-primary font-medium bg-primary/5' : ''}`}>Ngày: Mới nhất</button>
                      <button onClick={() => {setSortOption("oldest"); setIsSortOpen(false)}} className={`w-full text-left px-4 py-2 hover:bg-gray-50 text-sm ${sortOption === 'oldest' ? 'text-primary font-medium bg-primary/5' : ''}`}>Ngày: Cũ nhất</button>
                      <div className="border-t my-1"></div>
                      <button onClick={() => {setSortOption("price_desc"); setIsSortOpen(false)}} className={`w-full text-left px-4 py-2 hover:bg-gray-50 text-sm ${sortOption === 'price_desc' ? 'text-primary font-medium bg-primary/5' : ''}`}>Giá: Cao đến thấp</button>
                      <button onClick={() => {setSortOption("price_asc"); setIsSortOpen(false)}} className={`w-full text-left px-4 py-2 hover:bg-gray-50 text-sm ${sortOption === 'price_asc' ? 'text-primary font-medium bg-primary/5' : ''}`}>Giá: Thấp đến cao</button>
                    </div>
                  </>
                )}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low">
            {isReceiptsLoading || isOrdersLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`}>
                  <td className="p-4"><Skeleton className="h-5 w-8 mx-auto" /></td>
                  <td className="p-4"><Skeleton className="h-5 w-32" /></td>
                  <td className="p-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                  <td className="p-4"><Skeleton className="h-5 w-32" /></td>
                  <td className="p-4"><Skeleton className="h-5 w-48" /></td>
                  <td className="p-4"><Skeleton className="h-5 w-24 ml-auto" /></td>
                  <td className="p-4"><Skeleton className="h-6 w-24 mx-auto rounded-full" /></td>
                  <td className="p-4"><Skeleton className="h-8 w-8 mx-auto rounded-lg" /></td>
                </tr>
              ))
            ) : (isReceiptsError || isOrdersError) ? (
              <tr>
                <td colSpan={8} className="p-8 text-center bg-red-50">
                  <div className="flex flex-col items-center justify-center text-red-600 gap-2">
                    <AlertCircle className="w-8 h-8" />
                    <p className="font-bold text-lg">Lỗi hệ thống hoặc mất kết nối máy chủ!</p>
                    <p className="text-sm">Đây không phải là dữ liệu trống. Hệ thống đang gặp lỗi (có thể do Hot Reload). Hãy thử khởi động lại Backend.</p>
                    <code className="mt-2 text-xs bg-red-100 px-2 py-1 rounded text-red-800">
                      {receiptsError?.message || ordersError?.message || "Unknown error"}
                    </code>
                  </div>
                </td>
              </tr>
            ) : filteredAndSortedData.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-on-surface-variant">Chưa có dữ liệu phiếu</td></tr>
            ) : filteredAndSortedData.map((r: any, i: number) => {
                const isOrder = r.customer !== undefined || r.orderItems !== undefined;
                const isExport = isOrder || r.type === 1 || r.type === "Export";
                const code = isOrder ? (r.code ? r.code : (r.id ? r.id.substring(0, 8).toUpperCase() : "N/A")) : (r.referenceDocumentNo || r.referenceId || "N/A");
                const date = new Date(r.createdAt || r.date).toLocaleString('vi-VN');
                const totalAmount = r.totalAmount || 0;
                // Lãi gộp and Giá vốn mock for now if not available
                const totalCost = r.totalCostPrice || 0;
                const profit = isOrder ? (totalAmount - totalCost) : 0;
                
                return (
                <tr key={r.id || i} className="even:bg-slate-50 odd:bg-white hover:bg-surface-container-low/80 transition-colors">
                  <td className="p-4 text-center text-on-surface-variant font-medium">{(receiptPage - 1) * 10 + i + 1}</td>
                  <td className="p-4 text-on-surface-variant">{date}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full whitespace-nowrap inline-block ${
                      isOrder ? 'bg-blue-100 text-blue-700' : 
                      (isExport ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700')
                    }`}>
                      {isOrder ? 'Bán hàng' : (isExport ? 'Xuất kho' : 'Nhập kho')}
                    </span>
                  </td>
                  <td className="p-4 text-on-surface-variant font-mono">{code}</td>
                  
                  {activeSubTab === "receipts_out" && exportFilterTab === "sales_slip" ? (
                    <>
                      <td className="p-4 text-on-surface-variant">{r.customer?.name || "Khách lẻ"}</td>
                      <td className="p-4 text-right font-bold text-primary">{totalAmount.toLocaleString()} đ</td>
                      <td className="p-4 text-right font-medium text-amber-700">{totalCost.toLocaleString()} đ</td>
                      <td className="p-4 text-right font-bold text-emerald-600">{profit.toLocaleString()} đ</td>
                    </>
                  ) : (
                    <>
                      <td className="p-4 text-on-surface-variant max-w-[200px] truncate">{isOrder ? "Bán cho khách" : r.note}</td>
                      <td className="p-4 text-right font-bold text-primary">{activeSubTab === "receipts_out" && exportFilterTab === "export_slip" ? totalCost.toLocaleString() : totalAmount.toLocaleString()} đ</td>
                    </>
                  )}
                <td className="p-4 text-center">
                  {r.status === 1 || r.status === "Cancelled" || r.status === 2 ? (
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 whitespace-nowrap inline-block">Đã hủy</span>
                  ) : r.status === "Draft" || r.status === 0 && isOrder ? (
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 whitespace-nowrap inline-block">Bản nháp</span>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 whitespace-nowrap inline-block">Đã ghi sổ</span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={(e) => {
                      if (openDropdownId === r.id) {
                        setOpenDropdownId(null);
                      } else {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setDropdownPos({
                          top: rect.bottom + 4,
                          right: window.innerWidth - rect.right
                        });
                        setOpenDropdownId(r.id);
                      }
                    }}
                    className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  {openDropdownId === r.id && typeof document !== 'undefined' && createPortal(
                    <>
                      <div className="fixed inset-0 z-[100]" onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }}></div>
                      <div 
                        className="fixed w-48 bg-white rounded-xl shadow-lg border border-surface-container-high z-[101] overflow-hidden text-left animate-in fade-in zoom-in-95 duration-100"
                        style={{ top: dropdownPos.top, right: dropdownPos.right }}
                      >
                          <button
                            onClick={() => {
                              const isOrder = r.customer !== undefined || r.orderItems !== undefined;
                              if (isOrder) {
                                setViewReceiptDetails({
                                  id: r.id,
                                  type: 1, // Export
                                  receiptCode: r.code ? r.code : (r.id ? r.id.substring(0, 8).toUpperCase() : "N/A"),
                                  date: r.createdAt,
                                  status: r.status,
                                  delivererReceiverName: r.customer?.name || "Khách lẻ",
                                  referenceDocumentNo: r.code ? r.code : (r.id ? r.id.substring(0, 8).toUpperCase() : "N/A"),
                                  note: `Bán hàng cho ${r.customer?.name || "Khách lẻ"}`,
                                  totalAmount: r.totalAmount,
                                  totalVatAmount: r.totalVatAmount,
                                  details: r.orderItems?.map((oi:any) => ({
                                    productId: oi.productId,
                                    productName: oi.product?.name,
                                    documentQuantity: oi.quantity,
                                    quantity: oi.quantity,
                                    unitPrice: oi.unitPrice,
                                    totalPrice: oi.totalPrice,
                                    vatRate: oi.vatRate,
                                    vatAmount: oi.vatAmount
                                  })) || []
                                });
                              } else {
                                setViewReceiptDetails(r);
                              }
                              setOpenDropdownId(null);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container-low flex items-center gap-2 transition-colors"
                          >
                          <Eye className="w-4 h-4 text-primary" /> Xem chi tiết
                        </button>
                        {r.status === 0 && (
                          <button
                            onClick={() => {
                              setCancelReceiptId(r.id);
                              setCancelModalOpen(true);
                              setOpenDropdownId(null);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-error hover:bg-error/10 flex items-center gap-2 border-t border-surface-container-low transition-colors"
                          >
                            <Trash2 className="w-4 h-4" /> Hủy / Xóa phiếu
                          </button>
                        )}
                      </div>
                    </>,
                    document.body
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(receiptsData?.totalCount || 0) > 0 && (
        <Pagination
          currentPage={receiptPage}
          totalPages={receiptTotalPages}
          pageSize={10}
          totalItems={receiptsData?.totalCount || 0}
          itemName="phiếu"
          onPageChange={setReceiptPage}
        />
      )}
    </div>
  );
}
