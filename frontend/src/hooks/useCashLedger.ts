import { useQuery } from '@tanstack/react-query';

export interface CashLedgerRow {
  id: string;
  transactionDate: string;
  documentDate: string;
  documentCode: string;
  description: string;
  receiptAmount: number;
  paymentAmount: number;
  runningBalance: number;
}

export interface CashLedgerReport {
  openingBalance: number;
  closingBalance: number;
  totalReceipt: number;
  totalPayment: number;
  bankName?: string;
  branchName?: string;
  accountNumber?: string;
  transactions: {
    items: CashLedgerRow[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  };
}

const getAuthInfo = () => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("bizflow_user");
    if (stored) {
      const user = JSON.parse(stored);
      return { tenantId: user.tenantId || "11111111-1111-1111-1111-111111111111", token: user.token };
    }
  }
  return { tenantId: "11111111-1111-1111-1111-111111111111", token: "" };
};

export const useCashLedger = (
  type: 's6' | 's7',
  startDate: string,
  endDate: string,
  bankAccountId?: string,
  page: number = 1,
  pageSize: number = 20
) => {
  return useQuery<CashLedgerReport, Error>({
    queryKey: ['cash-ledger', type, startDate, endDate, bankAccountId, page, pageSize],
    queryFn: async () => {
      const auth = getAuthInfo();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5178/api';
      
      let url = `${apiUrl}/reports/${type}-hkd?startDate=${startDate}&endDate=${endDate}&page=${page}&pageSize=${pageSize}`;
      if (type === 's7' && bankAccountId) {
        url += `&bankAccountId=${bankAccountId}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "X-Tenant-Id": auth.tenantId
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch ${type.toUpperCase()} ledger`);
      }

      return res.json();
    },
    // For S7, if we require a bankAccountId but it's not provided, we can disable the query
    // However, if bankAccountId is null it means "All accounts" or we let the backend handle it.
    // The plan said: "Nếu chưa chọn TK nào ở Dropdown, yêu cầu user chọn 1 TK để hiển thị bảng (hoặc tự động load TK mặc định)".
    // Let's make it fetch anyway if bankAccountId is absent, unless we explicitly disable it from component.
    staleTime: 60000,
  });
};
