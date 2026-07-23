import React, { useState } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { useDashboardContext } from './DashboardContext';
import { RefreshCw, Calendar, Settings } from 'lucide-react';

export const DashboardControls: React.FC = () => {
  const { setDateRange } = useDashboardContext();
  const { refetch, isFetching } = useDashboard();
  const [presetValue, setPresetValue] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedConfigStr = localStorage.getItem("bizflow_dashboard_config");
      if (savedConfigStr) {
        try {
          const config = JSON.parse(savedConfigStr);
          if (config.defaultRange) return config.defaultRange;
        } catch (e) {}
      }
    }
    return 'thisMonth';
  });
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const handlePresetChange = (preset: string) => {
    setPresetValue(preset);
    const now = new Date();
    let start, end;

    if (preset === 'customMonth') {
      return; // Do nothing, wait for user to pick a month from input
    }

    switch (preset) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'yesterday':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
        break;
      case 'thisWeek':
        const day = now.getDay() || 7;
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 7, 23, 59, 59);
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;
      default:
        return;
    }
    setSelectedMonth('');
    setDateRange(start.toISOString(), end.toISOString());
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedMonth(val);
    if (!val) return;
    const [year, month] = val.split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    setDateRange(start.toISOString(), end.toISOString());
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 flex-wrap">
        <Calendar className="w-5 h-5 text-gray-500" />
        <select
          className="border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary px-3 py-1.5 outline-none"
          value={presetValue}
          onChange={(e) => handlePresetChange(e.target.value)}
        >
          <option value="today">Hôm nay</option>
          <option value="yesterday">Hôm qua</option>
          <option value="thisWeek">Tuần này</option>
          <option value="thisMonth">Tháng này</option>
          <option value="lastMonth">Tháng trước</option>
          <option value="thisYear">Năm nay</option>
          <option value="customMonth">Tùy chọn tháng...</option>
        </select>

        {presetValue === 'customMonth' && (
          <input
            type="month"
            className="border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary px-3 py-1.5 outline-none"
            value={selectedMonth}
            onChange={handleMonthChange}
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            localStorage.setItem("bizflow_active_tab", "settings");
            localStorage.setItem("jumpToSettingsTab", "dashboard");
            window.location.reload();
          }}
          className="flex items-center justify-center p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Tùy chỉnh Dashboard"
        >
          <Settings className="w-5 h-5" />
        </button>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          Làm mới toàn bộ
        </button>
      </div>
    </div>
  );
};
