"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Info, AlertCircle, CheckCircle2 } from "lucide-react";
import DebtCustomerList from "./Debts/DebtCustomerList";
import DebtCustomerDetail from "./Debts/DebtCustomerDetail";
import DebtHistory from "./Debts/DebtHistory";
import CollectDebtModal from "./Debts/CollectDebtModal";
import DebtCustomerModal from "./Debts/DebtCustomerModal";
import DebtInvoiceModal from "./Debts/DebtInvoiceModal";
import BankConfigModal from "./Debts/BankConfigModal";

interface DebtTransaction {
  id: string;
  type: "Increase" | "Decrease";
  amount: number;
  createdAt: string;
  orderId: string | null;
  orderCode: string | null;
}

interface Customer {
  id: string;
  fullname: string;
  phone: string | null;
  totalDebt: number;
  debtLimit: number;
}

interface DebtManagementProps {
  isReadOnly?: boolean;
  user?: any;
  onDebtChange?: () => void;
}

const DEFAULT_BANK_BIN = "970415"; // VietinBank
const DEFAULT_ACCOUNT_NUMBER = "109876543210";
const DEFAULT_ACCOUNT_NAME = "BIZFLOW PLATFORM";

export default function DebtManagement({
  isReadOnly = false,
  user,
  onDebtChange
}: DebtManagementProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "indebted" | "overlimit">("all");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<DebtTransaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  // Bank settings state
  const [bankBin, setBankBin] = useState(DEFAULT_BANK_BIN);
  const [accountNo, setAccountNo] = useState(DEFAULT_ACCOUNT_NUMBER);
  const [accountName, setAccountName] = useState(DEFAULT_ACCOUNT_NAME);
  const [isConfiguringBank, setIsConfiguringBank] = useState(false);

  // Modals state
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [collectAmount, setCollectAmount] = useState("");
  const [collectMethod, setCollectMethod] = useState<"VietQR" | "Cash">("VietQR");
  const [isCollectSubmitting, setIsCollectSubmitting] = useState(false);

  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [custForm, setCustForm] = useState({
    fullname: "",
    phone: "",
    debtLimit: "10000000"
  });

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const tenantId = user?.tenantId || "11111111-1111-1111-1111-111111111111";
  const authHeader = user?.token ? `Bearer ${user.token}` : "";

  const getHeaders = () => ({
    "X-Tenant-Id": tenantId,
    "Authorization": authHeader,
    "Content-Type": "application/json"
  });

  // Load bank settings
  useEffect(() => {
    const savedBin = localStorage.getItem(`bizflow_bank_bin_${tenantId}`);
    const savedNo = localStorage.getItem(`bizflow_bank_no_${tenantId}`);
    const savedName = localStorage.getItem(`bizflow_bank_name_${tenantId}`);
    if (savedBin) setBankBin(savedBin);
    if (savedNo) setAccountNo(savedNo);
    if (savedName) setAccountName(savedName);
  }, [tenantId]);

  const saveBankSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(`bizflow_bank_bin_${tenantId}`, bankBin);
    localStorage.setItem(`bizflow_bank_no_${tenantId}`, accountNo);
    localStorage.setItem(`bizflow_bank_name_${tenantId}`, accountName);
    showToast("Đã lưu thông tin tài khoản ngân hàng", "success");
    setIsConfiguringBank(false);
  };

  // Fetch customers list
  const fetchCustomersList = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5178/api/customers?tenantId=${tenantId}`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
        // Refresh selected customer state if any
        if (selectedCustomer) {
          const updated = data.find((c: any) => c.id === selectedCustomer.id);
          if (updated) setSelectedCustomer(updated);
        }
      } else {
        showToast("Lỗi khi tải danh sách khách hàng", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Lỗi kết nối máy chủ", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomersList();
  }, [tenantId]);

  // Fetch transactions for selected customer
  useEffect(() => {
    if (!selectedCustomer) return;
    const fetchTransactions = async () => {
      setLoadingTx(true);
      try {
        const res = await fetch(`http://localhost:5178/api/customers/${selectedCustomer.id}/debt-history?tenantId=${tenantId}`, {
          headers: getHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          setTransactions(data);
        } else {
          showToast("Lỗi khi tải lịch sử công nợ", "error");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingTx(false);
      }
    };
    fetchTransactions();
  }, [selectedCustomer?.id]);

  // Vietnamese Diacritics Removal for VietQR
  const removeVietnameseTones = (str: string) => {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|E|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); 
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); 
    return str;
  };

  // Submit debt collection payment
  const handleCollectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const amountVal = parseFloat(collectAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      showToast("Vui lòng nhập số tiền thu nợ hợp lệ lớn hơn 0", "error");
      return;
    }

    setIsCollectSubmitting(true);
    try {
      const res = await fetch("http://localhost:5178/api/customers/debt-pay", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          tenantId,
          customerId: selectedCustomer.id,
          amount: amountVal,
          paymentMethod: collectMethod === "Cash" ? "Cash" : "Transfer"
        })
      });

      if (res.ok) {
        showToast(`Thu nợ thành công số tiền ${amountVal.toLocaleString()} đ!`, "success");
        setIsCollectModalOpen(false);
        setCollectAmount("");
        
        // Optimistic / Fast reload
        fetchCustomersList();
        if (onDebtChange) onDebtChange();
      } else {
        const err = await res.json();
        showToast(err.message || "Thu nợ không thành công", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Lỗi mạng khi ghi nhận phiếu thu nợ", "error");
    } finally {
      setIsCollectSubmitting(false);
    }
  };

  // Open Edit Customer Modal
  const openEditModal = (c: Customer) => {
    if (isReadOnly) return;
    setModalMode("edit");
    setCustForm({
      fullname: c.fullname,
      phone: c.phone || "",
      debtLimit: c.debtLimit.toString()
    });
    setIsAddEditModalOpen(true);
  };

  // Open Add Customer Modal
  const openAddModal = () => {
    if (isReadOnly) return;
    setModalMode("add");
    setCustForm({
      fullname: "",
      phone: "",
      debtLimit: "10000000"
    });
    setIsAddEditModalOpen(true);
  };

  // Submit Add / Edit customer
  const handleAddEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custForm.fullname.trim()) {
      showToast("Tên khách hàng là bắt buộc", "error");
      return;
    }
    const limitVal = parseFloat(custForm.debtLimit);
    if (isNaN(limitVal) || limitVal < 0) {
      showToast("Hạn mức nợ không hợp lệ", "error");
      return;
    }

    const payload = {
      tenantId,
      fullname: custForm.fullname,
      phone: custForm.phone || null,
      debtLimit: limitVal
    };

    try {
      let res;
      if (modalMode === "add") {
        res = await fetch("http://localhost:5178/api/customers", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`http://localhost:5178/api/customers/${selectedCustomer?.id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        const savedCustomer = await res.json();
        showToast(
          modalMode === "add" ? "Đã thêm khách hàng mới thành công!" : "Đã cập nhật thông tin khách hàng!", 
          "success"
        );
        setIsAddEditModalOpen(false);
        fetchCustomersList();
        if (modalMode === "edit") {
          setSelectedCustomer(savedCustomer);
        }
      } else {
        const err = await res.json();
        showToast(err.message || "Không thể lưu thông tin khách hàng", "error");
      }
    } catch (e) {
      showToast("Lỗi kết nối khi lưu khách hàng", "error");
    }
  };

  // Load order details
  const viewOrderDetails = async (orderId: string) => {
    setLoadingOrder(true);
    setIsOrderModalOpen(true);
    try {
      const res = await fetch(`http://localhost:5178/api/orders/${orderId}?tenantId=${tenantId}`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data);
      } else {
        showToast("Không thể tải chi tiết hóa đơn", "error");
        setIsOrderModalOpen(false);
      }
    } catch (e) {
      showToast("Lỗi kết nối khi tải đơn hàng", "error");
      setIsOrderModalOpen(false);
    } finally {
      setLoadingOrder(false);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)] min-h-[500px]">
      
      {/* 1. CUSTOMERS LIST COLUMN */}
      <DebtCustomerList
        customers={customers}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={setSelectedCustomer}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterType={filterType}
        setFilterType={setFilterType}
        isReadOnly={isReadOnly}
        onAddCustomer={openAddModal}
        loading={loading}
      />

      {/* 2. DETAIL PANEL COLUMN */}
      <div className="w-[70%] h-full flex flex-col">
        {!selectedCustomer ? (
          <div className="flex-1 bg-white rounded-xl border border-surface-container-high flex flex-col items-center justify-center text-center p-8 shadow-sm">
            <div className="p-4 bg-primary-container/25 rounded-full mb-4 text-primary">
              <CreditCard className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-on-surface text-lg">Quản lý Công nợ Khách hàng</h3>
            <p className="text-sm text-on-surface-variant max-w-md mt-2">
              Vui lòng chọn một khách hàng từ danh sách bên trái để xem lịch sử mua nợ, số dư công nợ chi tiết và thực hiện thu nợ nhanh.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full space-y-4 overflow-hidden">
            {/* Customer Detail Header & Card indicators */}
            <DebtCustomerDetail
              customer={selectedCustomer}
              isReadOnly={isReadOnly}
              onOpenEditModal={openEditModal}
              onOpenBankConfig={() => setIsConfiguringBank(true)}
              onOpenCollectModal={() => {
                setCollectAmount(selectedCustomer.totalDebt.toString());
                setIsCollectModalOpen(true);
              }}
            />

            {/* Timeline history */}
            <DebtHistory
              transactions={transactions}
              loading={loadingTx}
              onViewOrder={viewOrderDetails}
            />
          </div>
        )}
      </div>

      {/* 3. DIALOGS & MODALS */}
      {selectedCustomer && (
        <CollectDebtModal
          isOpen={isCollectModalOpen}
          onClose={() => {
            setIsCollectModalOpen(false);
            setCollectAmount("");
          }}
          customer={selectedCustomer}
          bankBin={bankBin}
          accountNo={accountNo}
          accountName={accountName}
          onSubmit={handleCollectSubmit}
          collectAmount={collectAmount}
          setCollectAmount={setCollectAmount}
          collectMethod={collectMethod}
          setCollectMethod={setCollectMethod}
          isSubmitting={isCollectSubmitting}
          removeVietnameseTones={removeVietnameseTones}
        />
      )}

      <BankConfigModal
        isOpen={isConfiguringBank}
        onClose={() => setIsConfiguringBank(false)}
        bankBin={bankBin}
        setBankBin={setBankBin}
        accountNo={accountNo}
        setAccountNo={setAccountNo}
        accountName={accountName}
        setAccountName={setAccountName}
        onSubmit={saveBankSettings}
      />

      <DebtCustomerModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        mode={modalMode}
        formState={custForm}
        setFormState={setCustForm}
        onSubmit={handleAddEditSubmit}
        isReadOnly={isReadOnly}
      />

      <DebtInvoiceModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        loading={loadingOrder}
      />

      {/* TOAST NOTIFICATION CONTAINER */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[99] animate-in slide-in-from-bottom-5 duration-200">
          <div className={`px-4 py-3 rounded-xl shadow-lg text-white text-xs font-semibold flex items-center gap-2 ${
            toast.type === "success" 
              ? "bg-status-success" 
              : toast.type === "error" 
                ? "bg-error" 
                : "bg-primary"
          }`}>
            {toast.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {toast.type === "error" && <AlertCircle className="w-4 h-4 shrink-0" />}
            {toast.type === "info" && <Info className="w-4 h-4 shrink-0" />}
            <span className="whitespace-pre-line">{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}
