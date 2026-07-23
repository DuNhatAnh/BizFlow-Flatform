import React from 'react';
import { useWidget } from '../../../hooks/useDashboard';
import { DashboardWidgetDto, DashboardListDataDto } from '../../../types/dashboard';
import { WidgetHeader } from './WidgetHeader';

export const ListWidget: React.FC<{ widget: DashboardWidgetDto }> = ({ widget }) => {
  const [limit, setLimit] = React.useState(5);
  const { data: updatedWidget, refetch, isFetching, dataUpdatedAt } = useWidget(widget, limit);
  const data = updatedWidget?.data as DashboardListDataDto | undefined;

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    setTimeout(() => refetch(), 0);
  };

  if (!data) return null;

  if (!data.items || data.items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col h-full border border-gray-100 min-h-[300px]">
        <WidgetHeader 
          title={updatedWidget?.title || widget.title} 
          onRefresh={() => refetch()} 
          isFetching={isFetching}
          updatedAt={dataUpdatedAt}
        />
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
          </div>
          Chưa có dữ liệu
        </div>
      </div>
    );
  }

  const formatValue = (val: number, format: string) => {
    if (format === 'currency') return `${val.toLocaleString('vi-VN')} đ`;
    if (format === 'percentage') return `${val}%`;
    return val.toLocaleString('vi-VN');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col h-full border border-gray-100 min-h-[350px]">
      <WidgetHeader 
        title={updatedWidget?.title || widget.title} 
        onRefresh={() => refetch()} 
        isFetching={isFetching}
        updatedAt={dataUpdatedAt}
      />
      <div className="flex justify-end mb-2">
        <select 
          className="text-xs border-gray-200 rounded-md py-1 px-2 text-gray-500 focus:border-primary focus:ring-primary outline-none"
          value={limit}
          onChange={handleLimitChange}
        >
          <option value={5}>Top 5</option>
          <option value={10}>Top 10</option>
          <option value={20}>Top 20</option>
        </select>
      </div>
      <div className="flex-1 overflow-auto pr-2 mt-2 space-y-4">
        {data.items.map((item, idx) => (
          <div key={item.id || idx} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 shrink-0 rounded-full bg-gray-50 flex items-center justify-center text-sm font-semibold text-gray-500 group-hover:bg-primary group-hover:text-white transition-colors">
                {idx + 1}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800 line-clamp-1">{item.title}</div>
                <div className="text-xs text-gray-500 line-clamp-1">{item.subtitle}</div>
              </div>
            </div>
            <div className="text-sm font-bold text-gray-800 whitespace-nowrap ml-2">
              {formatValue(item.value, item.format)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
