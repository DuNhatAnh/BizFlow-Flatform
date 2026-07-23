import React, { useEffect } from 'react';
import { DashboardWidgetDto } from '../../../types/dashboard';

export const UnknownWidget: React.FC<{ widget: DashboardWidgetDto }> = ({ widget }) => {
  useEffect(() => {
    console.warn(`[Dashboard] Rendered UnknownWidget for unsupported type: ${widget.type}`, widget);
  }, [widget]);

  return (
    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 h-full min-h-[150px]">
      <span className="font-semibold mb-1">Unknown Widget Type</span>
      <span className="text-sm">Type: {widget.type}</span>
    </div>
  );
};
