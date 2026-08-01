import React, { useState, useEffect } from "react";

const getAuthInfo = () => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("bizflow_user");
    if (stored) {
      const user = stored === "undefined" ? null : JSON.parse(stored);
      return { tenantId: user.tenantId || "11111111-1111-1111-1111-111111111111", token: user.token };
    }
  }
  return { tenantId: "11111111-1111-1111-1111-111111111111", token: "" };
};

export const PrintHeaderTT88 = ({ formId, title, showTaxCode = true, showStoreNameInTitle = false, children }: { formId: string; title: string, showTaxCode?: boolean, showStoreNameInTitle?: boolean, children?: React.ReactNode }) => {
  const [storeInfo, setStoreInfo] = useState({
    name: ".......................................",
    taxCode: ".......................................",
    address: "......................................................................."
  });
  
  const [ownerName, setOwnerName] = useState(".......................................");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bizflow_user");
      if (stored) {
        try {
          const user = stored === "undefined" ? null : JSON.parse(stored);
          setOwnerName(user.fullname || user.name || ".......................................");
          if (user.address) {
            setStoreInfo(prev => ({...prev, address: user.address}));
          }
        } catch(e) {}
      }
    }
  }, []);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const auth = getAuthInfo();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5178/api';
        const res = await fetch(`${apiUrl}/stores`, {
          headers: {
            "Authorization": `Bearer ${auth.token}`,
            "X-Tenant-Id": auth.tenantId
          }
        });
        if (res.ok) {
          const json = await res.json();
          // API returns either array directly or object with items
          const store = Array.isArray(json) ? json[0] : (json.items ? json.items[0] : null);
          if (store) {
            setStoreInfo(prev => ({
              name: store.name || prev.name || ".......................................",
              taxCode: store.taxCode || prev.taxCode || ".......................................",
              address: store.address || prev.address || "......................................................................."
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load store info for printing", err);
      }
    };
    fetchStore();
  }, []);

  return (
    <div className="hidden print:block font-serif text-black p-0 bg-white w-full">
      <div className="flex justify-between items-start mb-6 w-full">
        <div>
          <div className="font-bold text-lg uppercase">HỘ, CÁ NHÂN KINH DOANH: {ownerName}</div>
          {showTaxCode && <div>Mã số thuế: {storeInfo.taxCode}</div>}
          <div>Địa chỉ: {storeInfo.address}</div>
        </div>
        <div className="text-right text-sm">
          <div className="font-bold text-base">Mẫu số {formId}</div>
          <div className="italic">(Ban hành kèm theo Thông tư số 88/2021/TT-BTC<br/>ngày 11 tháng 10 năm 2021 của Bộ trưởng<br/>Bộ Tài chính)</div>
        </div>
      </div>

      <div className="text-center mb-8 w-full">
        <h1 className="text-xl font-bold uppercase mb-2">{title}</h1>
        {showStoreNameInTitle && <div className="italic mt-1">Địa điểm kinh doanh: {storeInfo.name}</div>}
        {children}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4 landscape; margin: 15mm 10mm; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; padding: 0 !important; margin: 0 !important; }
          #print-area { overflow: visible !important; height: auto !important; position: static !important; width: 100% !important; padding: 0 !important; margin: 0 !important; }
          #print-area table { width: 100% !important; border-collapse: collapse !important; color: black !important; }
          #print-area table th, #print-area table td:not(.no-print-border) { 
            border: 1pt solid #000000 !important; 
            border-color: #000000 !important;
            border-width: 1pt !important;
            border-style: solid !important;
            padding: 6px !important; 
            color: black !important;
            background-color: transparent !important;
          }
          #print-area table tr {
            border: 1pt solid #000000 !important;
            background-color: transparent !important;
          }
          #print-area thead { display: table-header-group !important; }
          #print-area tr { page-break-inside: avoid !important; }
          #print-area { color: black !important; }
          .no-print { display: none !important; }
        }
      `}} />
    </div>
  );
};

export const PrintFooterTT88 = ({ totalRows = 0, openDate = "", hideNotes = false }: { totalRows?: number, openDate?: string, hideNotes?: boolean }) => {
  const estimatedPages = Math.max(1, Math.ceil(totalRows / 25));
  const currentDate = new Date();
  
  const [userName, setUserName] = useState("..............................");
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bizflow_user");
      if (stored) {
        try {
          const user = stored === "undefined" ? null : JSON.parse(stored);
          if (user.fullname) setUserName(user.fullname);
          else if (user.name) setUserName(user.name);
        } catch(e) {}
      }
    }
  }, []);

  return (
    <div className="print-only font-serif text-black p-0 pt-2 bg-transparent w-full">
      {!hideNotes && (
        <div className="mb-4 text-[10px] italic">
          * Ghi chú doanh thu:<br/>
          (1) Phân phối, cung cấp hàng hóa<br/>
          (2) Dịch vụ, xây dựng không bao thầu nguyên vật liệu<br/>
          (3) Sản xuất, vận tải, dịch vụ có gắn với hàng hóa, xây dựng có bao thầu NVL<br/>
          (4) Hoạt động kinh doanh khác
        </div>
      )}
      <div className="mb-4">
        - Sổ này có {estimatedPages} trang, đánh số từ trang 01 đến trang {estimatedPages.toString().padStart(2, '0')}<br/>
        - Ngày mở sổ: {openDate || `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`}
      </div>
      <div className="flex justify-between px-16 pb-40">
        <div className="text-center w-1/3 pt-6">
          <div className="font-bold">Người lập sổ</div>
          <div className="italic">(Ký, họ tên)</div>
        </div>
        <div className="text-center w-1/3">
          <div className="italic mb-1">Ngày {currentDate.getDate().toString().padStart(2, '0')} tháng {(currentDate.getMonth() + 1).toString().padStart(2, '0')} năm {currentDate.getFullYear()}</div>
          <div className="font-bold">Đại diện hộ kinh doanh</div>
          <div className="italic leading-tight">(Ký, họ tên, đóng dấu)</div>
        </div>
      </div>
    </div>
  );
};
