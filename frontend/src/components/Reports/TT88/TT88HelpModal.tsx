import React from 'react';
import { X, Info } from 'lucide-react';

interface TT88HelpModalProps {
  formId: 's1' | 's2' | 's3' | 's4' | 's6' | 's7';
  isOpen: boolean;
  onClose: () => void;
}

export const TT88HelpModal: React.FC<TT88HelpModalProps> = ({ formId, isOpen, onClose }) => {
  if (!isOpen) return null;

  const content = {
    s1: {
      title: "Hướng dẫn điền Sổ S1-HKD (Doanh Thu)",
      desc: "Sổ chi tiết doanh thu bán hàng hóa, dịch vụ dùng để theo dõi doanh thu bán hàng hóa, dịch vụ của hộ kinh doanh để làm căn cứ tính thuế.",
      columns: [
        { name: "Cột (1) - Ngày, tháng ghi sổ", detail: "Ghi ngày, tháng thực tế thực hiện ghi chép vào sổ." },
        { name: "Cột (2), (3) - Số hiệu, Ngày tháng chứng từ", detail: "Ghi số hiệu và ngày, tháng của chứng từ kế toán làm căn cứ ghi sổ (Ví dụ: Hóa đơn bán hàng)." },
        { name: "Cột (4) - Diễn giải", detail: "Ghi tóm tắt nội dung nghiệp vụ kinh tế phát sinh (Ví dụ: Bán hàng cho anh A)." },
        { name: "Cột (5) đến (8) - Doanh thu theo từng nhóm", detail: "Ghi số tiền doanh thu bán hàng hóa, dịch vụ tương ứng với từng nhóm ngành nghề chịu mức thuế khác nhau theo quy định." },
        { name: "Cột (9) - Ghi chú", detail: "Ghi các thông tin cần chú thích thêm (nếu có)." },
      ]
    },
    s2: {
      title: "Hướng dẫn điền Sổ S2-HKD (Tồn Kho)",
      desc: "Sổ chi tiết vật liệu, dụng cụ, sản phẩm, hàng hóa dùng để theo dõi số lượng, giá trị nhập, xuất, tồn kho của từng loại vật liệu, dụng cụ, sản phẩm, hàng hóa.",
      columns: [
        { name: "Cột A, B, C, D", detail: "Ghi thông tin chứng từ (Số hiệu, Ngày tháng), Diễn giải nghiệp vụ và Đơn vị tính." },
        { name: "Cột (1), (2) - Nhập kho", detail: "Ghi số lượng và giá trị (thành tiền) của vật tư, hàng hóa nhập kho." },
        { name: "Cột (3), (4) - Xuất kho", detail: "Ghi số lượng và giá trị (thành tiền) của vật tư, hàng hóa xuất kho (để bán hoặc sử dụng)." },
        { name: "Cột (5), (6) - Tồn kho", detail: "Ghi số lượng và giá trị (thành tiền) của vật tư, hàng hóa còn tồn cuối ngày/cuối kỳ." },
      ]
    },
    s3: {
      title: "Hướng dẫn điền Sổ S3-HKD (Chi Phí)",
      desc: "Sổ chi phí sản xuất, kinh doanh dùng để tập hợp các chi phí phát sinh trong quá trình sản xuất, kinh doanh.",
      columns: [
        { name: "Cột (1) - Ngày, tháng ghi sổ", detail: "Ghi ngày, tháng thực tế thực hiện ghi chép vào sổ." },
        { name: "Cột (2), (3) - Chứng từ", detail: "Ghi số hiệu và ngày, tháng của Phiếu chi, Giấy báo nợ, hoặc Hóa đơn mua hàng." },
        { name: "Cột (4) - Diễn giải", detail: "Ghi tóm tắt nội dung chi phí phát sinh (Ví dụ: Trả tiền điện tháng 10)." },
        { name: "Cột (5) đến (9) - Phân loại chi phí", detail: "Ghi số tiền chi phí vào đúng cột phân loại (Nhân công, Điện nước viễn thông, Thuê mặt bằng, Quản lý, Khác)." },
      ]
    },
    s4: {
      title: "Hướng dẫn điền Sổ S4-HKD (Thuế)",
      desc: "Sổ theo dõi tình hình thực hiện nghĩa vụ thuế với NSNN dùng để theo dõi các khoản thuế phải nộp, đã nộp và còn nợ Ngân sách Nhà nước.",
      columns: [
        { name: "Cột (1) - Loại thuế", detail: "Ghi tên loại thuế phát sinh (Thuế GTGT, Thuế TNCN, Thuế TTĐB...)." },
        { name: "Cột (2) - Kỳ tính thuế", detail: "Ghi tháng, năm hoặc năm tính thuế." },
        { name: "Cột (3) - Phải nộp", detail: "Ghi số tiền thuế phát sinh phải nộp trong kỳ (dựa trên doanh thu S1)." },
        { name: "Cột (4) - Số thuế đã nộp", detail: "Ghi số thuế thực tế đã nộp vào NSNN theo chứng từ nộp tiền (Giấy nộp tiền, Biên lai...)." },
        { name: "Cột (5) - Số thuế còn nợ/nộp thừa", detail: "Cột (5) = Cột (3) - Cột (4). Nếu âm (-) là nộp thừa, dương (+) là còn nợ." },
      ]
    },
    s6: {
      title: "Hướng dẫn điền Sổ S6-HKD (Tiền Mặt)",
      desc: "Sổ quỹ tiền mặt dùng để theo dõi tình hình thu, chi và tồn quỹ tiền mặt bằng tiền Việt Nam của hộ kinh doanh.",
      columns: [
        { name: "Cột A, B - Ngày tháng", detail: "Cột A ghi ngày tháng ghi sổ, Cột B ghi ngày tháng của Phiếu Thu/Phiếu Chi." },
        { name: "Cột C, D - Số hiệu chứng từ", detail: "Ghi số hiệu Phiếu Thu (cột C) hoặc Phiếu Chi (cột D)." },
        { name: "Cột E - Diễn giải", detail: "Ghi tóm tắt nội dung nghiệp vụ thu, chi tiền mặt." },
        { name: "Cột 1, 2 - Số tiền", detail: "Ghi số tiền thực tế nhập quỹ (Thu) vào Cột 1 hoặc xuất quỹ (Chi) vào Cột 2." },
        { name: "Cột 3 - Số dư", detail: "Số dư tồn quỹ tính lũy kế sau mỗi nghiệp vụ thu, chi." }
      ]
    },
    s7: {
      title: "Hướng dẫn điền Sổ S7-HKD (Tiền Gửi Ngân Hàng)",
      desc: "Sổ tiền gửi ngân hàng dùng để theo dõi tình hình gửi vào, rút ra và số dư tại các ngân hàng mà hộ kinh doanh mở tài khoản.",
      columns: [
        { name: "Cột A, B - Ngày tháng", detail: "Cột A ghi ngày tháng ghi sổ, Cột B ghi ngày tháng của chứng từ (Giấy báo Có, Giấy báo Nợ...)." },
        { name: "Cột C - Số hiệu chứng từ", detail: "Ghi số hiệu của chứng từ giao dịch với ngân hàng." },
        { name: "Cột D - Diễn giải", detail: "Ghi tóm tắt nội dung nghiệp vụ gửi tiền vào hoặc rút tiền ra." },
        { name: "Cột 1, 2 - Số tiền", detail: "Ghi số tiền gửi vào (Cột 1) hoặc rút ra (Cột 2)." },
        { name: "Cột 3 - Số dư", detail: "Số dư tiền gửi tính lũy kế sau mỗi nghiệp vụ gửi vào, rút ra." }
      ]
    }
  };

  const activeContent = content[formId];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-surface-container bg-primary/5">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Info size={20} />
            <span>{activeContent.title}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <p className="text-sm text-on-surface-variant mb-6 italic">
            {activeContent.desc}
          </p>
          
          <div className="space-y-4">
            {activeContent.columns.map((col, index) => (
              <div key={index} className="bg-surface-container-low rounded-xl p-4 border border-surface-container">
                <h4 className="font-semibold text-sm text-on-surface mb-1">{col.name}</h4>
                <p className="text-sm text-on-surface-variant">{col.detail}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-surface-container flex justify-end bg-surface-container-lowest">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
