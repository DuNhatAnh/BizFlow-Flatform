import React, { useEffect, useState } from 'react';
import { Plus, Search, FileText, Calculator, HelpCircle } from 'lucide-react';
import ExportDropdown from "@/components/ui/ExportDropdown";
import { PrintHeaderTT88, PrintFooterTT88 } from "../Reports/TT88/PrintHelpersTT88";
import { useTaxes } from '../../hooks/useTaxes';
import { CreateTaxModal } from './CreateTaxModal';
import { PayTaxModal } from './PayTaxModal';
import { AutoCalculateTaxModal } from './AutoCalculateTaxModal';

import { TT88HelpModal } from '../Reports/TT88/TT88HelpModal';

export const LedgerS4HKDTab: React.FC = () => {
  const { taxes, isLoading, error, fetchTaxes, createTax, payTax, calculateMonthlyTax } = useTaxes();
  
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = All year
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAutoCalcModal, setShowAutoCalcModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [taxToPay, setTaxToPay] = useState<any>(null);

  useEffect(() => {
    fetchTaxes(selectedYear, selectedMonth > 0 ? selectedMonth : undefined);
  }, [selectedYear, selectedMonth, fetchTaxes]);

  const handleCreateTax = async (data: any) => {
    return await createTax(data);
  };

  const handlePayTax = async (id: string, paymentData: any) => {
    return await payTax(id, paymentData);
  };

  const handleAutoCalculate = async (year: number, month: number) => {
    return await calculateMonthlyTax(year, month);
  };

  const totalDue = taxes.reduce((sum, t) => sum + t.amountDue, 0);
  const totalPaid = taxes.reduce((sum, t) => sum + t.amountPaid, 0);
  const totalRemaining = taxes.reduce((sum, t) => sum + t.remainingAmount, 0);

  return (
    <div className="flex flex-col flex-1 overflow-hidden h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Title S4 */}
      <div className="px-6 py-4 border-b border-surface-container bg-surface-container-lowest shrink-0 print:hidden flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-on-surface">Sổ Theo Dõi Tình Hình Thực Hiện Nghĩa Vụ Thuế Với NSNN</h3>
            <button 
              onClick={() => setShowHelpModal(true)}
              className="text-primary hover:bg-primary/10 p-1.5 rounded-full transition-colors flex items-center justify-center"
              title="Hướng dẫn điền sổ TT88"
            >
              <HelpCircle size={18} />
            </button>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">Mẫu số S4-HKD (Ban hành kèm theo Thông tư số 88/2021/TT-BTC)</p>
        </div>
      </div>

      {/* Controls S4 */}
      <div className="px-6 py-4 border-b border-surface-container bg-surface-container-lowest flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 print:hidden">
        {/* Left: Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-4 py-2 bg-surface border border-outline-variant rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value={0}>Cả năm</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>Tháng {m}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 bg-surface border border-outline-variant rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {[...Array(5)].map((_, i) => {
              const y = new Date().getFullYear() - i;
              return <option key={y} value={y}>Năm {y}</option>;
            })}
          </select>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => setShowAutoCalcModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-on-secondary rounded-xl font-medium hover:bg-secondary/90 transition-colors shadow-sm text-sm"
          >
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">Tự động tính thuế</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ghi nhận thủ công</span>
          </button>
          <ExportDropdown 
            onExportExcel={() => alert("Tính năng xuất excel sổ S4 đang phát triển")}
            onPrintTT88={() => window.print()}
          />
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-4 bg-error/10 text-error rounded-xl text-sm border border-error/20 print:hidden shrink-0">
          {error}
        </div>
      )}

      {/* KPI Summary S4 */}
      <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0 print:hidden">
        <div className="bg-surface p-4 rounded-xl shadow-sm border border-outline-variant flex flex-col justify-center">
          <span className="text-sm font-medium text-on-surface-variant">Tổng Thuế Phát Sinh</span>
          <span className="text-xl font-bold text-on-surface mt-1">{totalDue.toLocaleString()} đ</span>
        </div>
        <div className="bg-surface p-4 rounded-xl shadow-sm border border-outline-variant flex flex-col justify-center">
          <span className="text-sm font-medium text-on-surface-variant">Tổng Thuế Đã Nộp</span>
          <span className="text-xl font-bold text-primary mt-1">{totalPaid.toLocaleString()} đ</span>
        </div>
        <div className="bg-primary/5 p-4 rounded-xl shadow-sm border border-primary/20 flex flex-col justify-center">
          <span className="text-sm font-medium text-primary">Tổng Thuế Còn Nợ</span>
          <span className="text-xl font-bold text-error mt-1">{totalRemaining.toLocaleString()} đ</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-surface-container-lowest">
        <div id="print-area">
          <PrintHeaderTT88 formId="S4-HKD" title="SỔ THEO DÕI TÌNH HÌNH THỰC HIỆN NGHĨA VỤ THUẾ VỚI NSNN" />
          
          <div className="hidden print:flex flex-col items-center justify-center mb-6 text-black">
            <div className="flex gap-4">
              <span>Loại thuế: Tổng hợp các loại thuế</span>
            </div>
            <div className="flex gap-4">
              <span>Năm: {selectedYear}</span>
            </div>
            <div className="w-full text-right italic text-sm mb-2 mt-2">
              Đơn vị tính: Đồng
            </div>
          </div>

          <table className="w-full text-left border-collapse border border-outline-variant">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container sticky top-0 z-10">
                <th colSpan={2} className="p-4 font-semibold text-sm text-on-surface text-center border-r border-b border-outline-variant">Chứng từ</th>
                <th rowSpan={2} className="p-4 font-semibold text-sm text-on-surface text-center border-r border-b border-outline-variant min-w-[200px]">Diễn giải</th>
                <th rowSpan={2} className="p-4 font-semibold text-sm text-on-surface text-center border-r border-b border-outline-variant">Số thuế phải nộp</th>
                <th rowSpan={2} className="p-4 font-semibold text-sm text-on-surface text-center border-r border-b border-outline-variant">Số thuế đã nộp</th>
                <th rowSpan={2} className="p-4 font-semibold text-sm text-on-surface text-center border-r border-b border-outline-variant">Ghi chú</th>
                <th rowSpan={2} className="p-4 font-semibold text-sm text-on-surface text-center print:hidden border-r border-b border-outline-variant">Trạng thái</th>
                <th rowSpan={2} className="p-4 font-semibold text-sm text-on-surface text-center print:hidden">Thao tác</th>
              </tr>
              <tr className="border-b border-outline-variant bg-surface-container sticky top-[53px] z-10">
                <th className="p-4 font-semibold text-sm text-on-surface text-center border-r border-b border-outline-variant">Số hiệu</th>
                <th className="p-4 font-semibold text-sm text-on-surface text-center border-r border-b border-outline-variant w-32">Ngày, tháng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Đang tải dữ liệu Sổ S4...
                  </td>
                </tr>
              ) : taxes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                    Không có dữ liệu nghĩa vụ thuế trong kỳ này.
                  </td>
                </tr>
              ) : (
                taxes.map((t) => (
                  <tr key={t.id} className="border-b border-outline even:bg-slate-50 odd:bg-white hover:bg-surface-container-low transition-colors group">
                    <td className="p-4 text-sm text-center border-r border-b border-outline-variant text-on-surface-variant">
                      -
                    </td>
                    <td className="p-4 text-sm text-center border-r border-b border-outline-variant">
                      {t.month > 0 ? `${t.month}/${t.year}` : `Năm ${t.year}`}
                    </td>
                    <td className="p-4 text-sm font-medium border-r border-b border-outline-variant pl-4">
                      {t.taxTypeName}
                    </td>
                    <td className="p-4 text-sm text-right font-medium tabular-nums border-r border-b border-outline-variant">
                      {t.amountDue > 0 ? t.amountDue.toLocaleString() : "-"}
                    </td>
                    <td className="p-4 text-sm text-right text-primary font-medium tabular-nums border-r border-b border-outline-variant">
                      {t.amountPaid > 0 ? t.amountPaid.toLocaleString() : "-"}
                    </td>
                    <td className="p-4 text-sm border-r border-b border-outline-variant text-on-surface-variant text-xs italic text-center">
                      {t.note || ""}
                    </td>
                    <td className="p-4 text-center print:hidden border-r border-b border-outline-variant">
                      {t.remainingAmount <= 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                          Đã nộp đủ
                        </span>
                      ) : t.amountPaid > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-600">
                          Nợ {t.remainingAmount.toLocaleString()}đ
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-error/10 text-error">
                          Chưa nộp
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center print:hidden">
                      {t.remainingAmount > 0 && (
                        <button
                          onClick={() => setTaxToPay(t)}
                          className="px-3 py-1.5 text-xs font-medium bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                        >
                          Nộp thuế
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <PrintFooterTT88 />
        </div>
      </div>

      {showCreateModal && (
        <CreateTaxModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateTax}
        />
      )}

      {taxToPay && (
        <PayTaxModal
          tax={taxToPay}
          onClose={() => setTaxToPay(null)}
          onSuccess={handlePayTax}
        />
      )}

      {showAutoCalcModal && (
        <AutoCalculateTaxModal
          onClose={() => setShowAutoCalcModal(false)}
          onSuccess={handleAutoCalculate}
        />
      )}

      <TT88HelpModal 
        isOpen={showHelpModal} 
        onClose={() => setShowHelpModal(false)} 
        formId="s4" 
      />
    </div>
  );
};
