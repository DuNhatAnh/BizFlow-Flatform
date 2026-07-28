import React, { useEffect, useState } from 'react';
import { Plus, Search, FileText, Calculator } from 'lucide-react';
import { useTaxes } from '../../hooks/useTaxes';
import { CreateTaxModal } from './CreateTaxModal';
import { PayTaxModal } from './PayTaxModal';
import { AutoCalculateTaxModal } from './AutoCalculateTaxModal';

export const LedgerS4HKDTab: React.FC = () => {
  const { taxes, isLoading, error, fetchTaxes, createTax, payTax, calculateMonthlyTax } = useTaxes();
  
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = All year
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAutoCalcModal, setShowAutoCalcModal] = useState(false);
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Sổ S4-ĐH
          </h2>
          <p className="text-sm text-on-surface-variant">
            Sổ chi tiết thực hiện nghĩa vụ thuế với ngân sách nhà nước theo Thông tư 88.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
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
          <button
            onClick={() => setShowAutoCalcModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-on-secondary rounded-xl font-medium hover:bg-secondary/90 transition-colors shadow-sm"
          >
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">Tự động tính thuế</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ghi nhận thuế thủ công</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-error/10 text-error rounded-xl text-sm border border-error/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface p-4 rounded-2xl shadow-sm border border-outline-variant flex flex-col justify-center">
          <span className="text-sm font-medium text-on-surface-variant">Tổng Thuế Phát Sinh</span>
          <span className="text-2xl font-bold text-on-surface mt-1">{totalDue.toLocaleString()} đ</span>
        </div>
        <div className="bg-surface p-4 rounded-2xl shadow-sm border border-outline-variant flex flex-col justify-center">
          <span className="text-sm font-medium text-on-surface-variant">Tổng Thuế Đã Nộp</span>
          <span className="text-2xl font-bold text-primary mt-1">{totalPaid.toLocaleString()} đ</span>
        </div>
        <div className="bg-primary/5 p-4 rounded-2xl shadow-sm border border-primary/20 flex flex-col justify-center">
          <span className="text-sm font-medium text-primary">Tổng Thuế Còn Nợ</span>
          <span className="text-2xl font-bold text-error mt-1">{totalRemaining.toLocaleString()} đ</span>
        </div>
      </div>

      <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-lowest">
                <th className="p-4 font-semibold text-sm text-on-surface-variant">Loại thuế</th>
                <th className="p-4 font-semibold text-sm text-on-surface-variant text-center">Kỳ tính thuế</th>
                <th className="p-4 font-semibold text-sm text-on-surface-variant text-right">Phải nộp</th>
                <th className="p-4 font-semibold text-sm text-on-surface-variant text-right">Đã nộp</th>
                <th className="p-4 font-semibold text-sm text-on-surface-variant text-right">Còn nợ</th>
                <th className="p-4 font-semibold text-sm text-on-surface-variant text-center">Trạng thái</th>
                <th className="p-4 font-semibold text-sm text-on-surface-variant text-right">Thao tác</th>
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
                  <tr key={t.id} className="hover:bg-surface-container-lowest transition-colors group">
                    <td className="p-4 text-sm font-medium">
                      {t.taxTypeName}
                      {t.note && <div className="text-xs text-on-surface-variant font-normal mt-0.5">{t.note}</div>}
                    </td>
                    <td className="p-4 text-sm text-center">
                      {t.month > 0 ? `${t.month}/${t.year}` : `Năm ${t.year}`}
                    </td>
                    <td className="p-4 text-sm text-right font-medium">{t.amountDue.toLocaleString()} đ</td>
                    <td className="p-4 text-sm text-right text-primary font-medium">{t.amountPaid.toLocaleString()} đ</td>
                    <td className="p-4 text-sm text-right font-bold text-error">{t.remainingAmount.toLocaleString()} đ</td>
                    <td className="p-4 text-center">
                      {t.remainingAmount <= 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                          Đã hoàn thành
                        </span>
                      ) : t.amountPaid > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-600">
                          Đóng một phần
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-error/10 text-error">
                          Chưa đóng
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {t.remainingAmount > 0 && (
                        <button
                          onClick={() => setTaxToPay(t)}
                          className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
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
    </div>
  );
};
