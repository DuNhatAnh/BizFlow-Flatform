import React from "react";
import { Printer } from "lucide-react";
import { Skeleton } from "../../ui/Skeleton";
import { Pagination } from "../../ui/Pagination";
import { FadeIn } from "../../ui/FadeIn";

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
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 print:hidden">
        <div>
          <h3 className="text-lg font-bold text-on-surface">Sổ Chi Tiết Vật Liệu, Dụng Cụ, Sản Phẩm, Hàng Hóa</h3>
          <p className="text-sm text-on-surface-variant mt-1">Mẫu số S2-HKD (Ban hành kèm theo Thông tư số 88/2021/TT-BTC)</p>
        </div>
        <div className="flex flex-wrap gap-3">
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

          <button onClick={() => window.print()} className="px-4 py-2 bg-white border border-outline-variant text-on-surface rounded-lg text-sm font-bold hover:bg-surface-container-low transition-colors flex items-center gap-2">
            <Printer className="w-4 h-4" /> In Sổ S2
          </button>
          <button onClick={handleExportExcel} className="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-bold hover:bg-secondary/90 transition-colors">
            Xuất Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-surface-container-high overflow-hidden print:hidden">
        {!ledger ? (
          <div className="p-8 text-center text-on-surface-variant">Đang tải dữ liệu...</div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest text-xs uppercase tracking-wider text-on-surface-variant">
                <th className="p-2 border-b border-surface-container-high text-center border-r" colSpan={2}>Chứng từ</th>
                <th className="p-3 border-b border-surface-container-high text-center border-r" rowSpan={2}>Diễn giải</th>
                <th className="p-3 border-b border-surface-container-high text-center border-r" rowSpan={2}>Đơn vị tính</th>
                <th className="p-3 border-b border-surface-container-high text-center border-r" rowSpan={2}>Đơn giá</th>
                <th className="p-2 border-b border-surface-container-high text-center border-r bg-emerald-50/50" colSpan={2}>Nhập</th>
                <th className="p-2 border-b border-surface-container-high text-center border-r bg-amber-50/50" colSpan={2}>Xuất</th>
                <th className="p-2 border-b border-surface-container-high text-center bg-blue-50/50" colSpan={2}>Tồn</th>
              </tr>
              <tr className="bg-surface-container-lowest text-xs uppercase tracking-wider text-on-surface-variant border-b border-surface-container-high">
                <th className="p-2 border-r border-surface-container-high w-24">Số hiệu</th>
                <th className="p-2 border-r border-surface-container-high w-24">Ngày, tháng</th>
                <th className="p-2 border-r border-surface-container-high bg-emerald-50/50">Số lượng</th>
                <th className="p-2 border-r border-surface-container-high bg-emerald-50/50">Thành tiền</th>
                <th className="p-2 border-r border-surface-container-high bg-amber-50/50">Số lượng</th>
                <th className="p-2 border-r border-surface-container-high bg-amber-50/50">Thành tiền</th>
                <th className="p-2 border-r border-surface-container-high bg-blue-50/50">Số lượng</th>
                <th className="p-2 bg-blue-50/50">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {isLedgerLoading ? (
                Array.from({ length: 5 }).map((s: any, idx: number) => (
                  <tr key={`skeleton-${idx}`}>
                    <td colSpan={11} className="p-3"><Skeleton className="h-6 w-full" /></td>
                  </tr>
                ))
              ) : (
                <>
                  {/* Số dư đầu kỳ */}
                  <tr className="bg-surface-container-low/30 font-semibold text-right">
                    <td colSpan={5} className="p-3 text-center border-r border-surface-container-high text-on-surface-variant">SỐ DƯ ĐẦU KỲ</td>
                    <td className="p-3 border-r border-surface-container-high">-</td>
                    <td className="p-3 border-r border-surface-container-high">-</td>
                    <td className="p-3 border-r border-surface-container-high">-</td>
                    <td className="p-3 border-r border-surface-container-high">-</td>
                    <td className="p-3 border-r border-surface-container-high text-primary">{ledger.openingQuantity}</td>
                    <td className="p-3 text-primary">{ledger.openingValue?.toLocaleString()}</td>
                  </tr>

                  {ledger.records.items.length === 0 ? (
                    <tr><td colSpan={11} className="p-8 text-center text-on-surface-variant">Không có phát sinh trong kỳ</td></tr>
                  ) : ledger.records.items.map((l: any, i: number) => {
                    const isCancel = (l.type === 0 && l.quantityOut > 0) || (l.type === 1 && l.quantityIn > 0);
                    const unitPrice = (l.quantityIn > 0 && l.valueIn > 0) ? (l.valueIn / l.quantityIn) : ((l.quantityOut > 0 && l.valueOut > 0) ? (l.valueOut / l.quantityOut) : 0);
                    const productUnit = products.find((p: any) => p.id === selectedLedgerProduct)?.baseUnit || "Cái";
                    return (
                      <FadeIn as="tr" delay={i * 50} key={i} className={`even:bg-slate-50 odd:bg-white hover:bg-surface-container-low/80 transition-colors text-right ${isCancel ? 'bg-red-50/50' : ''}`}>
                        <td className="p-3 text-center border-r border-surface-container-high font-semibold">{l.documentRef || "N/A"}</td>
                        <td className="p-3 text-center border-r border-surface-container-high text-on-surface-variant">{new Date(l.date).toLocaleDateString('vi-VN')}</td>
                        <td className="p-3 text-left border-r border-surface-container-high text-on-surface-variant">
                          {l.type === 0
                            ? (isCancel ? <span className="text-red-600 font-bold italic">Hủy phiếu nhập</span> : "Nhập kho")
                            : (isCancel ? <span className="text-red-600 font-bold italic">Hủy phiếu xuất</span> : "Xuất kho")}
                        </td>
                        <td className="p-3 text-center border-r border-surface-container-high text-on-surface-variant">{productUnit}</td>
                        <td className="p-3 border-r border-surface-container-high text-on-surface-variant">{unitPrice > 0 ? unitPrice.toLocaleString() : "-"}</td>

                        {/* Nhập */}
                        <td className="p-3 border-r border-surface-container-high text-emerald-700">{l.quantityIn > 0 ? l.quantityIn : "-"}</td>
                        <td className="p-3 border-r border-surface-container-high text-emerald-700">{l.valueIn > 0 ? l.valueIn.toLocaleString() : "-"}</td>

                        {/* Xuất */}
                        <td className="p-3 border-r border-surface-container-high text-amber-700">{l.quantityOut > 0 ? l.quantityOut : "-"}</td>
                        <td className="p-3 border-r border-surface-container-high text-amber-700">{l.valueOut > 0 ? l.valueOut.toLocaleString() : "-"}</td>

                        {/* Tồn */}
                        <td className="p-3 border-r border-surface-container-high font-bold text-primary">{l.quantityBalance}</td>
                        <td className="p-3 font-bold text-primary">{l.valueBalance?.toLocaleString() || "0"}</td>
                      </FadeIn>
                    );
                  })}
                </>
              )}
            </tbody>
            <tfoot className="bg-surface-container-lowest font-bold text-right border-t-2 border-surface-container-high">
              {/* Cộng phát sinh trong kỳ */}
              <tr className="border-b border-surface-container-high">
                <td colSpan={5} className="p-3 text-center border-r border-surface-container-high text-on-surface-variant">CỘNG PHÁT SINH TRONG KỲ</td>
                <td className="p-3 border-r border-surface-container-high text-emerald-700">{ledger.totalQuantityIn}</td>
                <td className="p-3 border-r border-surface-container-high text-emerald-700">{ledger.totalValueIn.toLocaleString()}</td>
                <td className="p-3 border-r border-surface-container-high text-amber-700">{ledger.totalQuantityOut}</td>
                <td className="p-3 border-r border-surface-container-high text-amber-700">{ledger.totalValueOut.toLocaleString()}</td>
                <td className="p-3 border-r border-surface-container-high text-on-surface-variant">x</td>
                <td className="p-3 text-on-surface-variant">x</td>
              </tr>
              {/* Số dư cuối kỳ */}
              <tr>
                <td colSpan={5} className="p-3 text-center border-r border-surface-container-high text-on-surface-variant">SỐ DƯ CUỐI KỲ</td>
                <td className="p-3 border-r border-surface-container-high">-</td>
                <td className="p-3 border-r border-surface-container-high">-</td>
                <td className="p-3 border-r border-surface-container-high">-</td>
                <td className="p-3 border-r border-surface-container-high">-</td>
                <td className="p-3 border-r border-surface-container-high text-primary">{ledger.closingQuantity}</td>
                <td className="p-3 text-primary">{ledger.closingValue.toLocaleString()}</td>
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
          <style type="text/css" media="print">
            {`
              @page { size: landscape; margin: 10mm; }
              body { -webkit-print-color-adjust: exact; }
              body * { visibility: hidden; }
              #print-area, #print-area * { visibility: visible; }
              #print-area { position: absolute; left: 0; top: 0; width: 277mm !important; margin: 0 auto; }
              table { width: 100%; table-layout: fixed; page-break-inside: auto; border-collapse: collapse; }
              tr { page-break-inside: avoid; page-break-after: auto; }
              th, td { word-wrap: break-word; overflow: hidden; padding: 4px; }
            `}
          </style>
          <div className="w-full mx-auto p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="font-bold text-sm">HỘ, CÁ NHÂN KINH DOANH: .......................................</div>
                <div className="font-bold text-sm">Địa chỉ: ....................................................................</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-sm">Mẫu số S2-HKD</div>
                <div className="text-[11px] italic">(Ban hành kèm theo Thông tư số 88/2021/TT-BTC<br />ngày 11 tháng 10 năm 2021 của Bộ trưởng Bộ Tài chính)</div>
              </div>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-xl font-bold uppercase mb-1">SỔ CHI TIẾT VẬT LIỆU, DỤNG CỤ, SẢN PHẨM, HÀNG HÓA</h1>
              <div className="italic mb-1 text-sm">Năm {selectedYear}</div>
            </div>

            <div className="mb-4 space-y-1.5 text-[13px]">
              <div>Tên vật liệu, dụng cụ, sản phẩm, hàng hóa: <div className="font-bold text-on-surface">{products.find((p: any) => p.id === selectedLedgerProduct)?.name}</div></div>
              <div>Đơn vị tính: <span className="font-bold text-secondary text-right">{products.find((p: any) => p.id === selectedLedgerProduct)?.baseUnit}</span></div>
            </div>

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
                <tr>
                  <th className="border border-black p-1 font-normal italic">A</th>
                  <th className="border border-black p-1 font-normal italic">B</th>
                  <th className="border border-black p-1 font-normal italic">C</th>
                  <th className="border border-black p-1 font-normal italic">D</th>
                  <th className="border border-black p-1 font-normal italic">1</th>
                  <th className="border border-black p-1 font-normal italic">2</th>
                  <th className="border border-black p-1 font-normal italic">3</th>
                  <th className="border border-black p-1 font-normal italic">4</th>
                  <th className="border border-black p-1 font-normal italic">5</th>
                  <th className="border border-black p-1 font-normal italic">6</th>
                </tr>
              </thead>
              <tbody className="text-right">
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

            <div className="mt-4 text-[13px] space-y-1">
              <div>- Sổ này có ... trang, đánh số từ trang 01 đến trang ...</div>
              <div>- Ngày mở sổ: ..............................</div>
            </div>

            <div className="flex justify-between items-end mt-16 text-center">
              <div className="w-1/3">
                <div className="font-bold">NGƯỜI GHI SỔ</div>
                <div className="italic mb-16">(Ký, họ tên)</div>
              </div>
              <div className="w-1/3">
                <div className="italic mb-1">Ngày ..... tháng ..... năm .....</div>
                <div className="font-bold">ĐẠI DIỆN HỘ KINH DOANH</div>
                <div className="italic mb-16">(Ký, họ tên)</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
