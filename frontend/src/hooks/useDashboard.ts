import { useQuery } from '@tanstack/react-query';
import { useDashboardContext } from '../components/Dashboard/DashboardContext';
import { DashboardHomeDto, DashboardWidgetDto } from '../types/dashboard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5178/api';

const getAuthHeaders = () => {
  const stored = localStorage.getItem("bizflow_user");
  if (!stored) throw new Error("Unauthorized");
  const userObj = JSON.parse(stored);
  return {
    "X-Tenant-Id": userObj.tenantId || "11111111-1111-1111-1111-111111111111",
    "Authorization": `Bearer ${userObj.token}`,
  };
};

export const useDashboard = () => {
  const { fromDate, toDate, timezoneOffsetMinutes } = useDashboardContext();

  return useQuery<DashboardHomeDto, Error>({
    queryKey: ['dashboard', fromDate, toDate, timezoneOffsetMinutes],
    queryFn: async ({ signal }) => {
      if (!fromDate || !toDate) return { widgets: [] };
      
      const queryParams = new URLSearchParams({
        fromDate,
        toDate,
        timezoneOffsetMinutes: timezoneOffsetMinutes.toString(),
      });

      const res = await fetch(`${API_BASE_URL}/dashboard?${queryParams}`, {
        headers: getAuthHeaders(),
        signal,
      });

      if (!res.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const raw = await res.json();
      if (raw.widgets) {
        raw.widgets = raw.widgets.map((w: any) => ({
          ...w,
          id: w.widgetId || w.id,
          data: w.kpiData || w.chartData || w.listData || w.alertData || w.data
        }));
      }
      return raw;
    },
    enabled: !!fromDate && !!toDate,
    staleTime: 60 * 1000, // 1 minute: Tránh fetch lại liên tục khi chuyển tab
    gcTime: 5 * 60 * 1000, // 5 minutes (default)
    retry: 1, // Fail fast, không retry quá nhiều lần để báo lỗi sớm
    refetchOnWindowFocus: false, // Tối ưu hóa: Dashboard không tự refresh khi chuyển đổi tab để tránh tải nặng, user có thể nhấn nút Refresh thủ công
    refetchOnReconnect: true,
    refetchOnMount: true,
  });
};

export const useWidget = (widget: DashboardWidgetDto, limit: number = 5) => {
  const { fromDate, toDate, timezoneOffsetMinutes } = useDashboardContext();

  return useQuery<DashboardWidgetDto, Error>({
    queryKey: ['widget', widget.id, fromDate, toDate, timezoneOffsetMinutes, limit],
    queryFn: async ({ signal }) => {
      const queryParams = new URLSearchParams({
        fromDate,
        toDate,
        timezoneOffsetMinutes: timezoneOffsetMinutes.toString(),
        limit: limit.toString(),
      });

      const res = await fetch(`${API_BASE_URL}/dashboard/widgets/${widget.id}/data?${queryParams}`, {
        headers: getAuthHeaders(),
        signal,
      });

      if (!res.ok) {
        throw new Error(`Failed to refresh widget ${widget.title}`);
      }

      const raw = await res.json();
      return {
        ...raw,
        id: raw.widgetId || raw.id,
        data: raw.kpiData || raw.chartData || raw.listData || raw.alertData || raw.data
      };
    },
    initialData: widget,
    enabled: false, // CRITICAL: Prevent waterfall/auto-fetching
    staleTime: 0, // Dữ liệu initial luôn có thể xem là stale, nhưng vì enabled: false nên sẽ không tự fetch. Khi gọi refetch() thủ công thì luôn lấy mới nhất.
    retry: 1,
  });
};
