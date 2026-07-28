import { useState, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5178/api';

export interface TaxObligation {
  id: string;
  taxType: number;
  taxTypeName: string;
  year: number;
  month: number;
  amountDue: number;
  amountPaid: number;
  remainingAmount: number;
  dueDate: string | null;
  note: string | null;
  createdAt: string;
}

export function useTaxes() {
  const [taxes, setTaxes] = useState<TaxObligation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getHeaders = () => {
    const user = JSON.parse(localStorage.getItem('bizflow_user') || '{}');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}`,
      'X-Tenant-Id': user.tenantId
    };
  };

  const fetchTaxes = useCallback(async (year?: number, month?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      let url = `${API_URL}/Taxes`;
      const params = new URLSearchParams();
      if (year) params.append('year', year.toString());
      if (month) params.append('month', month.toString());
      
      const query = params.toString();
      if (query) url += `?${query}`;

      const res = await fetch(url, { headers: getHeaders() });
      if (!res.ok) throw new Error('Không thể tải dữ liệu thuế');
      
      const data = await res.json();
      setTaxes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTax = async (taxData: any) => {
    try {
      const res = await fetch(`${API_URL}/Taxes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(taxData)
      });
      if (!res.ok) throw new Error('Lỗi khi tạo nghĩa vụ thuế');
      await fetchTaxes();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const payTax = async (id: string, paymentData: any) => {
    try {
      const res = await fetch(`${API_URL}/Taxes/${id}/pay`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(paymentData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Lỗi khi thanh toán thuế');
      }
      fetchTaxes(); // Reload
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const calculateMonthlyTax = async (year: number, month: number) => {
    try {
      const res = await fetch(`${API_URL}/Taxes/calculate`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ year, month })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Lỗi khi tính thuế tự động');
      }
      fetchTaxes(year, month); // Reload
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  return {
    taxes,
    isLoading,
    error,
    fetchTaxes,
    createTax,
    payTax,
    calculateMonthlyTax
  };
}
