import React from 'react';
import { PrintFooterTT88 } from './PrintHelpersTT88';
import { CashLedgerReport } from '@/hooks/useCashLedger';

interface LedgerTableBaseProps {
  data?: CashLedgerReport;
  isLoading: boolean;
  startDate: string;
  endDate: string;
  type: 's6' | 's7';
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('vi-VN').format(val || 0);
};

const formatDateDisplay = (dateString: string) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(2)}`;
};

export const LedgerTableBase: React.FC<LedgerTableBaseProps> = ({
  data,
  isLoading,
  startDate,
  endDate,
  type
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-on-surface-variant print:hidden">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-64 text-on-surface-variant print:hidden">
        Không có dữ liệu
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-surface-container-lowest">
      <div className="flex-1 overflow-auto bg-white">
        <div className="w-full bg-white print:bg-white print:w-full min-w-[800px] text-sm text-on-surface px-6 pb-6 print:p-0">
          <style>{`
            @media print {
              .page-break-before-avoid {
                page-break-before: avoid !important;
                break-before: avoid !important;
              }
              /* Fix WebKit print bug for rowSpan/colSpan borders */
              #print-area table {
                border-collapse: separate !important;
                border-spacing: 0 !important;
                border-left: 0.5pt solid black !important;
                border-top: 0.5pt solid black !important;
                border-right: none !important;
                border-bottom: none !important;
                width: 100% !important;
              }
              #print-area table th, #print-area table td {
                border-right: 0.5pt solid black !important;
                border-bottom: 0.5pt solid black !important;
                border-left: none !important;
                border-top: none !important;
                padding: 4px 6px !important;
              }
              #print-area table tr.total-row td {
                border-bottom: 0.5pt solid black !important;
                border-top: 1pt solid black !important;
                font-weight: bold !important;
              }
            }
          `}</style>
          
          <table className="w-full border-collapse border border-outline bg-white print:w-full text-black">
            <thead className="bg-surface-container-low text-on-surface font-semibold sticky top-0 print:table-header-group">
              {type === 's6' ? (
                // S6 Header
                <>
                  <tr className="print:break-inside-avoid">
                    <th rowSpan={2} className="px-2 py-2 border border-outline text-center w-24 align-middle">Ngày tháng ghi sổ</th>
                    <th rowSpan={2} className="px-2 py-2 border border-outline text-center w-24 align-middle">Ngày tháng chứng từ</th>
                    <th colSpan={2} className="px-2 py-2 border border-outline text-center">Số hiệu chứng từ</th>
                    <th rowSpan={2} className="px-4 py-2 border border-outline text-center w-auto align-middle">Diễn giải</th>
                    <th colSpan={3} className="px-2 py-2 border border-outline text-center">Số tiền</th>
                    <th rowSpan={2} className="px-2 py-2 border border-outline text-center w-20 align-middle">Ghi chú</th>
                  </tr>
                  <tr className="print:break-inside-avoid">
                    <th className="px-2 py-2 border border-outline text-center w-20">Thu</th>
                    <th className="px-2 py-2 border border-outline text-center w-20">Chi</th>
                    <th className="px-2 py-2 border border-outline text-center w-24">Thu</th>
                    <th className="px-2 py-2 border border-outline text-center w-24">Chi</th>
                    <th className="px-2 py-2 border border-outline text-center w-24">Tồn</th>
                  </tr>
                </>
              ) : (
                // S7 Header
                <>
                  <tr className="print:break-inside-avoid">
                    <th rowSpan={2} className="px-2 py-2 border border-outline text-center w-24 align-middle">Ngày, tháng ghi sổ</th>
                    <th colSpan={2} className="px-2 py-2 border border-outline text-center">Chứng từ</th>
                    <th rowSpan={2} className="px-4 py-2 border border-outline text-center w-auto align-middle">Diễn giải</th>
                    <th colSpan={3} className="px-2 py-2 border border-outline text-center">Số tiền</th>
                    <th rowSpan={2} className="px-2 py-2 border border-outline text-center w-20 align-middle">Ghi chú</th>
                  </tr>
                  <tr className="print:break-inside-avoid">
                    <th className="px-2 py-2 border border-outline text-center w-24">Số hiệu</th>
                    <th className="px-2 py-2 border border-outline text-center w-24">Ngày, tháng</th>
                    <th className="px-2 py-2 border border-outline text-center w-24">Thu (gửi vào)</th>
                    <th className="px-2 py-2 border border-outline text-center w-24">Chi (rút ra)</th>
                    <th className="px-2 py-2 border border-outline text-center w-24">Còn lại</th>
                  </tr>
                </>
              )}
            </thead>
            <tbody>
              {/* Opening Balance Row */}
              <tr className="border border-outline bg-surface-container-lowest font-medium">
                <td colSpan={type === 's6' ? 4 : 3} className="px-4 py-2 border border-outline text-center"></td>
                <td className="px-4 py-2 border border-outline text-left">Số dư đầu kỳ</td>
                <td className="px-4 py-2 border border-outline text-right"></td>
                <td className="px-4 py-2 border border-outline text-right"></td>
                <td className="px-4 py-2 border border-outline text-right tabular-nums text-primary">{formatCurrency(data.openingBalance)}</td>
                <td className="border border-outline"></td>
              </tr>
              
              {/* Transactions */}
              {data.transactions.items.length === 0 ? (
                <tr>
                  <td colSpan={type === 's6' ? 9 : 8} className="px-4 py-8 text-center italic text-on-surface-variant border border-outline">
                    Không có phát sinh trong kỳ
                  </td>
                </tr>
              ) : (
                data.transactions.items.map((row) => (
                  <tr key={row.id} className="border border-outline even:bg-slate-50 odd:bg-white hover:bg-surface-container-low transition-colors print:break-inside-avoid">
                    <td className="px-2 py-2 border border-outline text-center">{formatDateDisplay(row.transactionDate)}</td>
                    
                    {type === 's6' ? (
                      <>
                        <td className="px-2 py-2 border border-outline text-center">{formatDateDisplay(row.documentDate)}</td>
                        <td className="px-2 py-2 border border-outline text-center">{row.receiptAmount > 0 ? row.documentCode : ''}</td>
                        <td className="px-2 py-2 border border-outline text-center">{row.paymentAmount > 0 ? row.documentCode : ''}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-2 py-2 border border-outline text-center">{row.documentCode}</td>
                        <td className="px-2 py-2 border border-outline text-center">{formatDateDisplay(row.documentDate)}</td>
                      </>
                    )}
                    
                    <td className="px-4 py-2 border border-outline text-left whitespace-pre-wrap">{row.description}</td>
                    <td className="px-4 py-2 border border-outline text-right tabular-nums">{row.receiptAmount > 0 ? formatCurrency(row.receiptAmount) : ''}</td>
                    <td className="px-4 py-2 border border-outline text-right tabular-nums">{row.paymentAmount > 0 ? formatCurrency(row.paymentAmount) : ''}</td>
                    <td className="px-4 py-2 border border-outline text-right tabular-nums font-medium">{formatCurrency(row.runningBalance)}</td>
                    <td className="px-2 py-2 border border-outline text-center"></td>
                  </tr>
                ))
              )}
            </tbody>
            <tbody className="break-inside-avoid print:break-inside-avoid">
              <tr className="font-bold bg-surface-container sticky bottom-0 total-row">
                <td colSpan={type === 's6' ? 5 : 4} className="px-4 py-3 text-right pr-6 border border-outline">Cộng phát sinh trong kỳ:</td>
                <td className="px-4 py-3 border border-outline text-right tabular-nums">{formatCurrency(data.totalReceipt)}</td>
                <td className="px-4 py-3 border border-outline text-right tabular-nums">{formatCurrency(data.totalPayment)}</td>
                <td className="px-4 py-3 border border-outline text-right tabular-nums bg-surface-container-lowest"></td>
                <td className="border border-outline bg-surface-container-lowest"></td>
              </tr>
              <tr className="font-bold bg-surface-container sticky bottom-0 total-row">
                <td colSpan={type === 's6' ? 5 : 4} className="px-4 py-3 text-right pr-6 border border-outline">Số dư cuối kỳ:</td>
                <td className="px-4 py-3 border border-outline text-right tabular-nums bg-surface-container-lowest"></td>
                <td className="px-4 py-3 border border-outline text-right tabular-nums bg-surface-container-lowest"></td>
                <td className="px-4 py-3 border border-outline text-right tabular-nums text-primary">{formatCurrency(data.closingBalance)}</td>
                <td className="border border-outline bg-surface-container-lowest"></td>
              </tr>
            </tbody>
          </table>
          
          <div className="print:block break-before-avoid print:break-before-avoid page-break-before-avoid mt-4">
            <PrintFooterTT88 totalRows={data.transactions.totalCount} openDate={startDate ? new Date(startDate).toLocaleDateString('vi-VN') : ""} hideNotes={type === 's6' || type === 's7'} />
          </div>
        </div>
      </div>
    </div>
  );
};
