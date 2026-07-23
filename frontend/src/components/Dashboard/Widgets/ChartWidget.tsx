import React from 'react';
import { useWidget } from '../../../hooks/useDashboard';
import { DashboardWidgetDto, DashboardChartDataDto } from '../../../types/dashboard';
import { WidgetHeader } from './WidgetHeader';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export const ChartWidget: React.FC<{ widget: DashboardWidgetDto }> = ({ widget }) => {
  const { data: updatedWidget, refetch, isFetching, dataUpdatedAt } = useWidget(widget);
  const data = updatedWidget?.data as DashboardChartDataDto | undefined;

  if (!data) return null;

  if (!data.datasets || data.datasets.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col h-full border border-gray-100 min-h-[300px]">
        <WidgetHeader 
          title={updatedWidget?.title || widget.title} 
          onRefresh={() => refetch()} 
          isFetching={isFetching}
          updatedAt={dataUpdatedAt}
        />
        <div className="flex-1 flex items-center justify-center text-gray-400">
          No data
        </div>
      </div>
    );
  }

  // Transform data for Recharts (array of objects)
  const chartData = data.labels.map((label, index) => {
    const row: any = { name: label };
    data.datasets.forEach(dataset => {
      row[dataset.label] = dataset.data[index] || 0;
    });
    return row;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col h-full border border-gray-100 min-h-[350px]">
      <WidgetHeader 
        title={updatedWidget?.title || widget.title} 
        onRefresh={() => refetch()} 
        isFetching={isFetching}
        updatedAt={dataUpdatedAt}
      />
      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(0)}tr` : value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontSize: '13px', fontWeight: 500 }}
              labelStyle={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} iconType="circle" />
            {data.datasets.map((dataset, index) => (
              <Line 
                key={dataset.label}
                type="monotone" 
                dataKey={dataset.label} 
                stroke={dataset.color || (index === 0 ? '#0ea5e9' : '#8b5cf6')} 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
