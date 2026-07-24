import React from "react";
import { createPortal } from "react-dom";
import { CashTransaction } from "./types";
import { ArrowUpCircle, ArrowDownCircle, Calendar, Banknote, User, FileText, Paperclip, FileDigit, FileOutput } from "lucide-react";

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: CashTransaction | null;
  storeData: { name: string; address: string } | null;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  onClose,
  transaction,
  storeData
}) => {
  if (!isOpen || !transaction) return null;

  const numberToWords = (n: number) => {
    if (n === 0) return "Không đồng";
    const words = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    const readGroup = (group: number, isFirstGroup: boolean) => {
      const h = Math.floor(group / 100);
      const t = Math.floor((group % 100) / 10);
      const u = group % 10;
      let res = "";
      if (h > 0) res += words[h] + " trăm ";
      else if (!isFirstGroup) res += "không trăm ";
      if (t > 1) res += words[t] + " mươi ";
      else if (t === 1) res += "mười ";
      else if (t === 0 && u > 0 && (h > 0 || !isFirstGroup)) res += "lẻ ";
      if (u === 1 && t > 1) res += "mốt ";
      else if (u === 5 && t > 0) res += "lăm ";
      else if (u > 0) res += words[u] + " ";
      return res;
    };
    const units = ["", "nghìn ", "triệu ", "tỷ ", "nghìn tỷ "];
    let res = "";
    let i = 0;
    let temp = n;
    while (temp > 0) {
      const group = temp % 1000;
      temp = Math.floor(temp / 1000);
      if (group > 0 || (i === 0 && n === 0)) res = readGroup(group, temp === 0) + units[i] + res;
      i++;
    }
    res = res.replace(/không trăm lẻ $/g, "").trim();
    return res.charAt(0).toUpperCase() + res.slice(1) + " đồng";
  };

  const handlePrintReceipt = () => {
    const isReceipt = transaction.type === 'Receipt';
    const title = isReceipt ? 'PHIẾU THU' : 'PHIẾU CHI';
    const formNo = isReceipt ? '01 - TT' : '02 - TT';
    const payerLabel = isReceipt ? 'Họ và tên người nộp tiền' : 'Họ và tên người nhận tiền';
    const reasonLabel = isReceipt ? 'Lý do nộp' : 'Lý do chi';
    const signatureLabel = isReceipt ? 'NGƯỜI NỘP TIỀN' : 'NGƯỜI NHẬN TIỀN';
    const dateObj = new Date(transaction.transactionDate);
    const dateStr = `Ngày ${dateObj.getDate().toString().padStart(2, '0')} tháng ${(dateObj.getMonth() + 1).toString().padStart(2, '0')} năm ${dateObj.getFullYear()}`;
    
    const printWindow = document.createElement('iframe');
    printWindow.style.display = 'none';
    document.body.appendChild(printWindow);
    
    const html = `
      <html>
      <head>
        <title>In ${title}</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; font-size: 14pt; line-height: 1.5; padding: 20px; color: #000; }
          .flex { display: flex; justify-content: space-between; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .italic { font-style: italic; }
          .mt-4 { margin-top: 1rem; }
          .mb-4 { margin-bottom: 1rem; }
          .row { display: flex; margin-bottom: 0.5rem; }
          .label { width: 220px; }
          .value { flex: 1; border-bottom: 1px dotted #000; }
          .signatures { display: flex; justify-content: space-between; margin-top: 2rem; text-align: center; }
          .sig-col { width: 25%; }
        </style>
      </head>
      <body>
        <div class="flex">
          <div class="font-bold">
            <div>HỘ, CÁ NHÂN KINH DOANH: ${(storeData?.name || '').toUpperCase()}</div>
            <div>Địa chỉ: ${storeData?.address || '..............................................................'}</div>
          </div>
          <div class="text-center">
            <div class="font-bold">Mẫu số ${formNo}</div>
            <div class="italic">(Ban hành kèm theo Thông tư số 88/2021/TT-BTC</div>
            <div class="italic">ngày 11 tháng 10 năm 2021 của Bộ trưởng Bộ Tài chính)</div>
          </div>
        </div>
        
        <div class="text-center mt-4 mb-4">
          <h2 style="margin:0;">${title}</h2>
          <div class="italic">${dateStr}</div>
          <div>Quyển số: ............ - Số: <b>${transaction.transactionCode}</b></div>
        </div>
        
        <div class="row"><div class="label">${payerLabel}:</div><div class="value">${transaction.payerReceiverName || ''}</div></div>
        <div class="row"><div class="label">Địa chỉ:</div><div class="value">${transaction.address || ''}</div></div>
        <div class="row"><div class="label">${reasonLabel}:</div><div class="value">${transaction.reason || ''}</div></div>
        <div class="row"><div class="label">Số tiền:</div><div class="value font-bold">${new Intl.NumberFormat('vi-VN').format(transaction.amount)} đ</div></div>
        <div class="row"><div class="label">(Viết bằng chữ):</div><div class="value italic">${numberToWords(transaction.amount)}</div></div>
        <div class="row"><div class="label">Kèm theo:</div><div class="value">${transaction.referenceDocument || transaction.attachedDocuments || ''} chứng từ gốc</div></div>
        
        <div class="signatures">
          <div class="sig-col">
            <div class="font-bold">NGƯỜI ĐẠI DIỆN</div>
            <div class="font-bold">HỘ KINH DOANH</div>
            <div class="italic">(Ký, họ tên, đóng dấu)</div>
          </div>
          <div class="sig-col">
            <div class="font-bold">NGƯỜI LẬP BIỂU</div>
            <div class="italic">(Ký, họ tên)</div>
          </div>
          <div class="sig-col">
            <div class="font-bold">${signatureLabel}</div>
            <div class="italic">(Ký, họ tên)</div>
          </div>
          <div class="sig-col">
            <div class="font-bold">THỦ QUỸ</div>
            <div class="italic">(Ký, họ tên)</div>
          </div>
        </div>
        
        <div style="margin-top: 100px;">
          Đã nhận đủ số tiền (viết bằng chữ): .....................................................................................................................................
        </div>
      </body>
      </html>
    `;
    printWindow.contentWindow?.document.open();
    printWindow.contentWindow?.document.write(html);
    printWindow.contentWindow?.document.close();
    
    setTimeout(() => {
      printWindow.contentWindow?.focus();
      printWindow.contentWindow?.print();
      setTimeout(() => document.body.removeChild(printWindow), 1000);
    }, 200);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-300">
        
        <div className="p-8 pb-6 flex justify-between items-start border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${transaction.type === 'Receipt' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {transaction.type === 'Receipt' ? <ArrowUpCircle className="w-8 h-8" /> : <ArrowDownCircle className="w-8 h-8" />}
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-gray-900">
                Phiếu {transaction.type === 'Receipt' ? 'Thu' : 'Chi'} Tiền
              </h2>
              <p className="text-sm font-medium text-gray-500 mt-1">Mã phiếu: <span className="text-gray-900 font-bold">{transaction.transactionCode}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2.5 rounded-full transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-8 space-y-8 bg-white">
          <div className="flex flex-col items-center">
            <span className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-3">Số tiền giao dịch</span>
            <span className={`text-5xl font-black tracking-tight ${transaction.type === 'Receipt' ? 'text-emerald-600' : 'text-rose-600'}`} style={{ fontFamily: 'monospace' }}>
              {transaction.type === 'Receipt' ? '+' : '-'}
              {new Intl.NumberFormat('vi-VN').format(transaction.amount)}<span className="text-2xl ml-1 text-gray-400">đ</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-4 p-6 rounded-2xl bg-gray-50/50 border border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Ngày lập</p>
              <p className="font-bold text-gray-900">{new Date(transaction.transactionDate).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Banknote className="w-3.5 h-3.5" /> Phương thức</p>
              <p className="font-bold text-gray-900">{transaction.paymentMethod === 'Cash' ? 'Tiền mặt' : 'Chuyển khoản'}</p>
            </div>
            <div className="col-span-2 pt-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Người {transaction.type === 'Receipt' ? 'nộp' : 'nhận'}</p>
              <p className="font-bold text-gray-900 text-lg">{transaction.payerReceiverName || transaction.creatorName || '-'}</p>
              {transaction.address && <p className="text-sm font-medium text-gray-500 mt-1">{transaction.address}</p>}
            </div>
            
            <div className="col-span-2 pt-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Lý do / Nội dung</p>
              <div className="font-semibold text-gray-800 leading-relaxed">
                {transaction.reason || '-'}
              </div>
            </div>
          </div>

          {(transaction.referenceDocument || transaction.attachedDocuments) && (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chứng từ kèm theo</p>
              <div className="flex flex-wrap gap-3">
                {transaction.attachedDocuments && (
                  <div className="flex-1 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                      <Paperclip className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">Chứng từ gốc</p>
                      <p className="text-sm font-bold text-gray-800 leading-none">{transaction.attachedDocuments}</p>
                    </div>
                  </div>
                )}
                {transaction.referenceDocument && (
                  <div className="flex-1 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                      <FileDigit className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">Tham chiếu</p>
                      <p className="text-sm font-bold text-gray-800 leading-none">{transaction.referenceDocument}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 rounded-b-[2rem]">
          <button 
            onClick={onClose}
            className="px-6 py-3 text-gray-700 font-bold bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            Đóng
          </button>
          <button 
            onClick={handlePrintReceipt}
            className="px-6 py-3 text-white font-bold bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 flex items-center gap-2"
          >
            <FileOutput className="w-5 h-5" />
            In Phiếu (TT88)
          </button>
        </div>
      </div>
    </div>, document.body
  );
};
