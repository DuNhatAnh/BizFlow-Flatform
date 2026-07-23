import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DashboardContextType {
  fromDate: string;
  toDate: string;
  timezoneOffsetMinutes: number;
  setDateRange: (from: string, to: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [timezoneOffsetMinutes, setTimezoneOffsetMinutes] = useState<number>(0);

  useEffect(() => {
    const now = new Date();
    setTimezoneOffsetMinutes(now.getTimezoneOffset());
    
    let range = 'thisMonth';
    const savedConfigStr = localStorage.getItem("bizflow_dashboard_config");
    if (savedConfigStr) {
      try {
        const config = JSON.parse(savedConfigStr);
        if (config.defaultRange) {
          range = config.defaultRange;
        }
      } catch (e) {}
    }
    
    let start = new Date(now.getFullYear(), now.getMonth(), 1);
    let end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    switch (range) {
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
        // already set
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;
    }

    setFromDate(start.toISOString());
    setToDate(end.toISOString());
  }, []);

  const setDateRange = (from: string, to: string) => {
    setFromDate(from);
    setToDate(to);
  };

  return (
    <DashboardContext.Provider value={{ fromDate, toDate, timezoneOffsetMinutes, setDateRange }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
};
