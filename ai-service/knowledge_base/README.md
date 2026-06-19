# Kiến thức Nghiệp vụ cho AI Chatbot (BizFlow)

Thư mục này dùng để chứa các "Trace" (dấu vết) và tài liệu nghiệp vụ sau mỗi phiên làm việc. 
Mục đích là để sau này khi bạn xây dựng tính năng **AI Trợ lý ảo** (AI Chatbot) nhúng trực tiếp vào phần mềm BizFlow, bạn sẽ nạp toàn bộ thư mục này vào hệ thống RAG (Retrieval-Augmented Generation) của con AI đó.

Khi đó, AI của BizFlow sẽ hiểu sâu sắc hệ thống của bạn và có thể trả lời khách hàng/nhân viên như sau:

- **Nhân viên gõ:** *"Hàng nào đã hết?"*
- **AI hiểu được từ khóa "hết hàng":** AI sẽ đọc tài liệu trong này, biết được cần gọi API nào hoặc truy vấn vào bảng `Products` có `Stock <= 0` (hoặc tính toán từ bảng InventoryTransaction) và trả về danh sách chính xác.

## Cách sử dụng:
1. Sau mỗi phiên code xong một tính năng (VD: Quản lý Kho, Bán hàng POS, Khách hàng nợ...), bạn tạo 1 file `.md` mới trong thư mục này.
2. Ghi chép lại luồng nghiệp vụ (Flow) bằng văn bản đơn giản.
3. Ghi lại các cấu trúc bảng DB (Database Schema) liên quan đến nghiệp vụ đó.
