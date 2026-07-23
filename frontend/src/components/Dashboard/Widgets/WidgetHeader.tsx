import React from 'react';
import { RefreshCw, Info } from 'lucide-react';

interface WidgetHeaderProps {
  title: string;
  onRefresh?: () => void;
  isFetching: boolean;
  updatedAt: number;
  iconType?: 'refresh' | 'info';
  onAction?: () => void;
}

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({ 
  title, 
  onRefresh, 
  isFetching, 
  updatedAt,
  iconType = 'refresh',
  onAction
}) => {
  const timeString = new Date(updatedAt).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAction) {
      onAction();
    } else if (onRefresh) {
      onRefresh();
    }
  };

  const IconComponent = iconType === 'info' ? Info : RefreshCw;

  return (
    <div className="flex items-start justify-between mb-2 gap-2">
      <h3 className="text-sm font-semibold text-gray-700 leading-snug line-clamp-2 font-fira-sans">{title}</h3>
      <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
        <span className="text-[10px] font-medium text-gray-400 hidden xl:inline-block bg-gray-50 px-1.5 py-0.5 rounded">
          {timeString}
        </span>
        <button
          onClick={handleActionClick}
          disabled={isFetching && iconType === 'refresh'}
          className={`p-1 text-gray-400 transition-colors rounded-md relative z-10 ${iconType === 'info' ? 'hover:text-primary hover:bg-primary-50' : 'hover:text-primary disabled:opacity-50 hover:bg-primary/10'}`}
          title={iconType === 'info' ? 'Xem công thức / thông tin' : `Làm mới (Cập nhật lần cuối: ${timeString})`}
        >
          <IconComponent className={`w-3.5 h-3.5 ${isFetching && iconType === 'refresh' ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};
