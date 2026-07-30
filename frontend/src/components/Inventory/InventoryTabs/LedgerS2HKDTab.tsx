import React, { useState } from "react";
import { Printer, HelpCircle } from "lucide-react";
import ExportDropdown from "@/components/ui/ExportDropdown";
import { Skeleton } from "../../ui/Skeleton";
import { Pagination } from "../../ui/Pagination";
import { FadeIn } from "../../ui/FadeIn";
import { TT88HelpModal } from "../../Reports/TT88/TT88HelpModal";
import { PrintHeaderTT88, PrintFooterTT88 } from "../../Reports/TT88/PrintHelpersTT88";

interface LedgerS2HKDTabProps {
  selectedLedgerProduct: string;
  setSelectedLedgerProduct: (val: string) => void;
  selectedMonth: number;
  setSelectedMonth: (val: number) => void;
  selectedYear: number;
  setSelectedYear: (val: number) => void;
  products: any[];
  handleExportExcel: () => void;
  ledger: any;
  isLedgerLoading: boolean;
  ledgerPage: number;
  setLedgerPage: (val: number) => void;
}

export default function LedgerS2HKDTab({
  selectedLedgerProduct,
  setSelectedLedgerProduct,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  products,
  handleExportExcel,
  ledger,
  isLedgerLoading,
  ledgerPage,
  setLedgerPage
}: LedgerS2HKDTabProps) {
  const [showHelpModal, setShowHelpModal] = useState(false);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Title S2 */}
      <div className="px-6 py-4 border-b border-surface-container bg-surface-container-lowest shrink-0 print:hidden flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-on-surface">Sổ Chi Tiết Vật Liệu, Dụng Cụ, Sản Phẩm, Hàng Hóa</h3>
            <button 
              onClick={() => setShowHelpModal(true)}
              className="text-primary hover:bg-primary/10 p-1.5 rounded-full transition-colors flex items-center justify-center"
              title="Hướng dẫn điền sổ TT88"
            >
              <HelpCircle size={18} />
            </button>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">Mẫu số S2-HKD (Ban hành kèm theo Thông tư số 88/2021/TT-BTC)</p>
        </div>
      </div>

      {/* Controls S2 */}
      <div className="px-6 py-4 border-b border-surface-container bg-surface-container-lowest flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 print:hidden">
        {/* Left: Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedLedgerProduct}
            onChange={(e: any) => setSelectedLedgerProduct(e.target.value)}
            className="px-4 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low text-on-surface focus:outline-none focus:border-primary max-w-[200px]"
          >
            {products.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e: any) => setSelectedMonth(Number(e.target.value))}
            className="px-4 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low text-on-surface focus:outline-none focus:border-primary"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>Tháng {m}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e: any) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low text-on-surface focus:outline-none focus:border-primary"
          >
            {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => (
              <option key={y} value={y}>Năm {y}</option>
            ))}
          </select>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <ExportDropdown 
            onExportExcel={handleExportExcel}
            onPrintTT88={() => window.print()}
          />
        </div>
      </div>

      <div className="bg-white overflow-x-auto print:hidden">
        {!ledger ? (
          <div className="p-8 text-center text-on-surface-variant">Đang tải dữ liệu...</div>
        ) : (
          <table className="w-full text-left border-collapse border border-outline">
            <thead className="bg-surface-container sticky top-0 z-10">
              <tr className="text-xs uppercase tracking-wider text-on-surface font-semibold">
                <th className="p-3 border-t border-b border-outline text-center border-r" colSpan={2}>Chứng từ</th>
                <th className="p-3 border-t border-b border-outline text-center border-r" rowSpan={2}>Diễn giải</th>
                <th className="p-3 border-t border-b border-outline text-center border-r" rowSpan={2}>Đơn vị tính</th>
                <th className="p-3 border-t border-b border-outline text-center border-r" rowSpan={2}>Đơn giá</th>
                <th className="p-3 border-t border-b border-outline text-center border-r" colSpan={2}>Nhập</th>
                <th className="p-3 border-t border-b border-outline text-center border-r" colSpan={2}>Xuất</th>
                <th className="p-3 border-t border-b border-outline text-center border-r" colSpan={2}>Tồn</th>
              </tr>
              <tr className="text-xs uppercase tracking-wider text-on-surface font-semibold">
                <th className="p-2 border-r border-b border-outline w-24 text-center">Số hiệu</th>
                <th className="p-2 border-r border-b border-outline w-24 text-center">Ngày, tháng</th>
                <th className="p-2 border-r border-b border-outline text-center">Số lượng</th>
                <th className="p-2 border-r border-b border-outline text-center">Thành tiền</th>
                <th className="p-2 border-r border-b border-outline text-center">Số lượng</th>
                <th className="p-2 border-r border-b border-outline text-center">Thành tiền</th>
                <th className="p-2 border-r border-b border-outline text-center">Số lượng</th>
                <th className="p-2 border-r border-b border-outline text-center">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {isLedgerLoading ? (
                Array.from({ length: 5 }).map((s: any, idx: number) => (
                  <tr key={`skeleton-${idx}`}>
                    <td colSpan={11} className="p-3"><Skeleton className="h-6 w-full" /></td>
                  </tr>
                ))
              ) : (
                <>
                  {/* Số dư đầu kỳ */}
                  <tr className="font-semibold text-center bg-surface-container-low/30">
                    <td className="p-3 border-t border-r border-b border-outline text-center"></td>
                    <td className="p-3 border-t border-r border-b border-outline text-center"></td>
                    <td className="p-3 text-center border-t border-r border-b border-outline text-on-surface-variant">SỐ DƯ ĐẦU KỲ</td>
                    <td className="p-3 border-t border-r border-b border-outline text-center"></td>
                    <td className="p-3 border-t border-r border-b border-outline text-center"></td>
                    <td className="p-3 border-t border-r border-b border-outline text-center">-</td>
                    <td className="p-3 border-t border-r border-b border-outline text-center">-</td>
                    <td className="p-3 border-t border-r border-b border-outline text-center">-</td>
                    <td className="p-3 border-t border-r border-b border-outline text-center">-</td>
                    <td className="p-3 border-t border-r border-b border-outline text-right tabular-nums text-primary">{ledger.openingQuantity}</td>
                    <td className="p-3 text-right tabular-nums border-t border-r border-b border-outline text-primary">{ledger.openingValue?.toLocaleString()}</td>
                  </tr>

                  {ledger.records.items.length === 0 ? (
                    <tr><td colSpan={11} className="p-8 text-center text-on-surface-variant">Không có phát sinh trong kỳ</td></tr>
                  ) : ledger.records.items.map((l: any, i: number) => {
                    const isCancel = (l.type === 0 && l.quantityOut > 0) || (l.type === 1 && l.quantityIn > 0);
                    const unitPrice = (l.quantityIn > 0 && l.valueIn > 0) ? (l.valueIn / l.quantityIn) : ((l.quantityOut > 0 && l.valueOut > 0) ? (l.valueOut / l.quantityOut) : 0);
                    const productUnit = products.find((p: any) => p.id === selectedLedgerProduct)?.baseUnit || "Cái";
                    return (
                      <FadeIn as="tr" delay={i * 50} key={i} className={`even:bg-slate-50 odd:bg-white hover:bg-surface-container-low/80 transition-colors text-right`}>
                        <td className="p-3 text-center border-r border-b border-outline font-semibold">{l.documentRef || "N/A"}</td>
                        <td className="p-3 text-center border-r border-b border-outline text-on-surface-variant">{new Date(l.date).toLocaleDateString('vi-VN')}</td>
                        <td className="p-3 text-left pl-4 border-r border-b border-outline text-on-surface-variant">
                          {l.type === 0
                            ? (isCancel ? <span>Hủy phiếu nhập</span> : "Nhập kho")
                            : (isCancel ? <span>Hủy phiếu xuất</span> : "Xuất kho")}
                        </td>
                        <td className="p-3 text-center border-r border-b border-outline text-on-surface-variant">{productUnit}</td>
                        <td className="p-3 text-right tabular-nums border-r border-b border-outline text-on-surface-variant">{unitPrice > 0 ? unitPrice.toLocaleString() : "-"}</td>

                        {/* Nhập */}
                        <td className="p-3 text-right tabular-nums border-r border-b border-outline font-medium text-primary">{l.quantityIn > 0 ? l.quantityIn : "-"}</td>
                        <td className="p-3 text-right tabular-nums border-r border-b border-outline font-medium text-primary">{l.valueIn > 0 ? l.valueIn.toLocaleString() : "-"}</td>

                        {/* Xuất */}
                        <td className="p-3 text-right tabular-nums border-r border-b border-outline font-medium text-primary">{l.quantityOut > 0 ? l.quantityOut : "-"}</td>
                        <td className="p-3 text-right tabular-nums border-r border-b border-outline font-medium text-primary">{l.valueOut > 0 ? l.valueOut.toLocaleString() : "-"}</td>

                        {/* Tồn */}
                        <td className="p-3 text-right tabular-nums border-r border-b border-outline font-bold text-primary">{l.quantityBalance}</td>
                        <td className="p-3 text-right tabular-nums border-r border-b border-outline font-bold text-primary">{l.valueBalance?.toLocaleString() || "0"}</td>
                      </FadeIn>
                    );
                  })}
                </>
              )}
            </tbody>
            <tfoot className="bg-surface-container-lowest font-bold text-right border-t-2 border-outline">
              {/* Cộng phát sinh trong kỳ */}
              <tr className="border-b border-outline bg-surface-container text-center">
                <td className="p-3 border-r border-b border-outline text-center"></td>
                <td className="p-3 border-r border-b border-outline text-center"></td>
                <td className="p-3 text-center border-r border-b border-outline font-bold">CỘNG PHÁT SINH TRONG KỲ</td>
                <td className="p-3 border-r border-b border-outline text-center"></td>
                <td className="p-3 border-r border-b border-outline text-center"></td>
                <td className="p-3 text-right tabular-nums border-r border-b border-outline font-bold text-primary">{ledger.totalQuantityIn}</td>
                <td className="p-3 text-right tabular-nums border-r border-b border-outline font-bold text-primary">{ledger.totalValueIn.toLocaleString()}</td>
                <td className="p-3 text-right tabular-nums border-r border-b border-outline font-bold text-primary">{ledger.totalQuantityOut}</td>
                <td className="p-3 text-right tabular-nums border-r border-b border-outline font-bold text-primary">{ledger.totalValueOut.toLocaleString()}</td>
                <td className="p-3 text-center border-r border-b border-outline font-bold">x</td>
                <td className="p-3 text-center border-r border-b border-outline font-bold">x</td>
              </tr>
              {/* Số dư cuối kỳ */}
              <tr className="bg-surface-container text-center">
                <td className="p-3 border-r border-b border-outline text-center"></td>
                <td className="p-3 border-r border-b border-outline text-center"></td>
                <td className="p-3 text-center border-r border-b border-outline font-bold">SỐ DƯ CUỐI KỲ</td>
                <td className="p-3 border-r border-b border-outline text-center"></td>
                <td className="p-3 border-r border-b border-outline text-center"></td>
                <td className="p-3 text-center border-r border-b border-outline">-</td>
                <td className="p-3 text-center border-r border-b border-outline">-</td>
                <td className="p-3 text-center border-r border-b border-outline">-</td>
                <td className="p-3 text-center border-r border-b border-outline">-</td>
                <td className="p-3 text-right tabular-nums border-r border-b border-outline font-bold text-primary">{ledger.closingQuantity}</td>
                <td className="p-3 text-right tabular-nums border-r border-b border-outline font-bold text-primary">{ledger.closingValue.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {ledger && ledger.records.totalCount > 0 && (
        <Pagination
          currentPage={ledgerPage}
          totalPages={ledger.records.totalPages}
          pageSize={10}
          totalItems={ledger.records.totalCount}
          itemName="giao dịch"
          onPageChange={setLedgerPage}
        />
      )}

      {/* PRINT S2 LAYOUT */}
      {ledger && (
        <div id="print-area" className="hidden print:block absolute top-0 left-0 bg-white text-black text-[11px] leading-relaxed z-[9999]" style={{ width: '277mm' }}>
          <PrintHeaderTT88 formId="S2-HKD" title="SỔ CHI TIẾT VẬT LIỆU, DỤNG CỤ, SẢN PHẨM, HÀNG HÓA" showTaxCode={false}>
            <div className="font-bold mb-1 text-sm">Tên vật liệu, dụng cụ, sản phẩm, hàng hóa: <span className="font-normal">{products.find((p: any) => p.id === selectedLedgerProduct)?.name}</span></div>
            <div className="font-bold mb-1 text-sm">Đơn vị tính: <span className="font-normal">{products.find((p: any) => p.id === selectedLedgerProduct)?.baseUnit}</span></div>
          </PrintHeaderTT88>

            <table className="w-full border-collapse border border-black mb-4 text-center text-[10px]">
              <thead>
                <tr>
                  <th className="border border-black p-1 align-middle w-[10%]" colSpan={2}>Chứng từ</th>
                  <th className="border border-black p-1 align-middle w-[25%]" rowSpan={2}>Diễn giải</th>
                  <th className="border border-black p-1 align-middle w-[9%]" rowSpan={2}>Đơn giá</th>
                  <th className="border border-black p-1 align-middle w-[18%]" colSpan={2}>Nhập</th>
                  <th className="border border-black p-1 align-middle w-[18%]" colSpan={2}>Xuất</th>
                  <th className="border border-black p-1 align-middle w-[20%]" colSpan={2}>Tồn</th>
                </tr>
                <tr>
                  <th className="border border-black p-1 w-[5%]">Số hiệu</th>
                  <th className="border border-black p-1 w-[5%]">Ngày</th>
                  <th className="border border-black p-1 w-[7%]">Số lượng</th>
                  <th className="border border-black p-1 w-[11%]">Thành tiền</th>
                  <th className="border border-black p-1 w-[7%]">Số lượng</th>
                  <th className="border border-black p-1 w-[11%]">Thành tiền</th>
                  <th className="border border-black p-1 w-[7%]">Số lượng</th>
                  <th className="border border-black p-1 w-[13%]">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="text-center">
                <tr className="font-semibold">
                  <td className="border border-black p-1.5" colSpan={2}></td>
                  <td className="border border-black p-1.5 text-left">Số dư đầu kỳ</td>
                  <td className="border border-black p-1.5">x</td>
                  <td className="border border-black p-1.5">x</td>
                  <td className="border border-black p-1.5">x</td>
                  <td className="border border-black p-1.5">x</td>
                  <td className="border border-black p-1.5">x</td>
                  <td className="border border-black p-1.5">{ledger.openingQuantity}</td>
                  <td className="border border-black p-1.5">{ledger.openingValue.toLocaleString()}</td>
                </tr>
                {ledger.records.items.map((l: any, i: number) => {
                  const isCancel = (l.type === 0 && l.quantityOut > 0) || (l.type === 1 && l.quantityIn > 0);
                  const dienGiai = l.type === 0 ? (isCancel ? "Hủy phiếu nhập" : "Nhập kho") : (isCancel ? "Hủy phiếu xuất" : "Xuất kho");
                  return (
                    <tr key={i}>
                      <td className="border border-black p-1.5 text-center">{l.documentRef || "N/A"}</td>
                      <td className="border border-black p-1.5 text-center">{new Date(l.date).toLocaleDateString('vi-VN')}</td>
                      <td className="border border-black p-1.5 text-left">{dienGiai}</td>
                      <td className="border border-black p-1.5">-</td>
                      <td className="border border-black p-1.5">{l.quantityIn > 0 ? l.quantityIn : "-"}</td>
                      <td className="border border-black p-1.5">{l.valueIn > 0 ? l.valueIn.toLocaleString() : "-"}</td>
                      <td className="border border-black p-1.5">{l.quantityOut > 0 ? l.quantityOut : "-"}</td>
                      <td className="border border-black p-1.5">{l.valueOut > 0 ? l.valueOut.toLocaleString() : "-"}</td>
                      <td className="border border-black p-1.5">{l.quantityBalance}</td>
                      <td className="border border-black p-1.5">{l.valueBalance?.toLocaleString() || "0"}</td>
                    </tr>
                  );
                })}
                <tr className="font-semibold">
                  <td className="border border-black p-1.5" colSpan={2}></td>
                  <td className="border border-black p-1.5 text-left">Cộng phát sinh trong kỳ</td>
                  <td className="border border-black p-1.5">x</td>
                  <td className="border border-black p-1.5">{ledger.totalQuantityIn}</td>
                  <td className="border border-black p-1.5">{ledger.totalValueIn.toLocaleString()}</td>
                  <td className="border border-black p-1.5">{ledger.totalQuantityOut}</td>
                  <td className="border border-black p-1.5">{ledger.totalValueOut.toLocaleString()}</td>
                  <td className="border border-black p-1.5">x</td>
                  <td className="border border-black p-1.5">x</td>
                </tr>
                <tr className="font-semibold">
                  <td className="border border-black p-1.5" colSpan={2}></td>
                  <td className="border border-black p-1.5 text-left">Số dư cuối kỳ</td>
                  <td className="border border-black p-1.5">x</td>
                  <td className="border border-black p-1.5">x</td>
                  <td className="border border-black p-1.5">x</td>
                  <td className="border border-black p-1.5">x</td>
                  <td className="border border-black p-1.5">x</td>
                  <td className="border border-black p-1.5">{ledger.closingQuantity}</td>
                  <td className="border border-black p-1.5">{ledger.closingValue.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <PrintFooterTT88 totalRows={ledger.records.totalCount} hideNotes={true} />
        </div>
      )}
    </div>
  );
}
