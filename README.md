# Hệ thống Quản lý Bán hàng Thông minh tích hợp Trợ lý AI và Tự động hóa Sổ sách Kế toán (BizFlow Platform)

**BizFlow Platform** là giải pháp phần mềm dạng SaaS toàn diện thiết kế riêng cho các hộ kinh doanh cá thể và cửa hàng bán lẻ truyền thống tại Việt Nam. Dự án tập trung giải quyết hai "nỗi đau" lớn nhất của tiểu thương: tối giản hóa nghiệp vụ quản lý qua Trợ lý AI (nhận diện giọng nói/văn bản) và tự động hóa hoàn toàn sổ sách kế toán theo quy chuẩn nghiêm ngặt của **Thông tư 88/2021/TT-BTC**.

---

## 1. Sứ mệnh & Tính cấp thiết
*   **Xóa bỏ ghi chép thủ công:** Thay thế sổ tay và file Excel manh mún bằng hệ quản trị bán hàng và tồn kho tập trung, loại bỏ thất thoát và sai lệch công nợ.
*   **Vượt qua rào cản công nghệ:** Giao diện tối giản tối đa, tích hợp công nghệ AI (Whisper & Gemini) để nhân viên lớn tuổi hoặc không thạo máy tính vẫn có thể lên đơn nhanh bằng giọng nói.
*   **Tuân thủ pháp lý dễ dàng:** Hạch toán tự động mọi giao dịch bán hàng, nhập kho, thu nợ trực tiếp vào biểu mẫu báo cáo thuế Thông tư 88/2021/TT-BTC, loại bỏ áp lực kế toán cuối tháng.

---

## 2. Cấu trúc Monorepo Dự án

Dự án được tổ chức dưới dạng Monorepo tiện lợi cho việc quản trị và triển khai:

```
BizFlow-Flatform/
├── docker-compose.yml            # PostgreSQL, Redis & Adminer services orchestration
├── README.md                     # Tài liệu giới thiệu tổng quan & hướng dẫn cài đặt nhanh
├── functional_specs.md           # [NEW] Bản đặc tả yêu cầu chức năng, phi chức năng và luồng nghiệp vụ
│
├── frontend/                     # Web App quản trị & POS tại quầy (Next.js 14 App Router)
├── backend/                      # API Server core (.NET 8 Clean Architecture)
├── ai-service/                   # AI Microservices (FastAPI Python - Whisper + Gemini API)
└── mobile/                       # Ứng dụng di động cho nhân viên bán hàng (Flutter)
```

---

## 3. Các Luồng Nghiệp vụ Cốt lõi (Main Workflows)

1.  **Luồng Bán hàng Thủ công:** Nhân viên chọn sản phẩm (hỗ trợ nhiều đơn vị tính như Lon/Lốc/Thùng), gán khách hàng, chọn thanh toán (Tiền mặt/Chuyển khoản/Ghi nợ) -> Hệ thống tự động trừ kho, ghi nhận công nợ và lưu bút toán kế toán -> In hóa đơn.
2.  **Luồng Bán hàng Trợ lý AI:** Người dùng nói *"Lấy cho chú Ba 5 bao xi măng Hà Tiên, ghi nợ nghen"* -> AI Service chuyển giọng nói thành chữ (Whisper) -> Trích xuất thực thể (Gemini) -> Gọi API tạo **Đơn hàng nháp** -> Đẩy thông báo thời gian thực (SignalR) lên Web/Mobile -> Thu ngân kiểm tra và bấm duyệt để in bill.
3.  **Luồng Tự động hóa Kế toán TT88:** Mọi phát sinh (Đơn hàng, Phiếu nhập kho, Thu chi) tự động hạch toán vào đúng cột của **Sổ chi tiết doanh thu**, **Sổ chi phí**, và **Sổ tồn kho** -> Xuất báo cáo PDF/Excel chuẩn hóa để nộp cơ quan thuế.

---

## 4. Hướng dẫn Thiết lập & Khởi chạy Nhanh

Hãy đảm bảo máy bạn đã cài: **Docker Desktop**, **.NET 8 SDK**, **Node.js (v18+)**, **Python (v3.10+)** và **Flutter SDK**.

### Bước 1: Khởi chạy CSDL, Cache & Frontend (Docker)
Tại thư mục gốc, mở Terminal và chạy:
```bash
docker compose up -d --build
```
*   **PostgreSQL:** Cổng `5432` (User/Pass: `postgres`/`postgres`).
*   **Redis:** Cổng `6379`.
*   **Adminer** (Quản lý DB): Truy cập [http://localhost:8080](http://localhost:8080).
*   **Next.js Frontend Web App:** Cổng `3000`. Truy cập tại [http://localhost:3000](http://localhost:3000).

### Bước 2: Khởi chạy AI Service (Python FastAPI)
```bash
cd ai-service
pip install -r requirements.txt
python main.py
```
*   Tài liệu Swagger API tại: [http://localhost:8000/docs](http://localhost:8000/docs)

### Bước 3: Khởi chạy API Server (.NET 8 Backend)
```bash
cd backend/src/BizFlow.WebApi
dotnet ef database update --project ../BizFlow.Infrastructure --startup-project .
dotnet run
```
*   Giao diện Swagger API tại: [http://localhost:5000/swagger](http://localhost:5000/swagger)

### Bước 4: Khởi chạy Web App (Next.js Frontend)
> [!NOTE]
> Nhờ cấu hình **Docker**, Next.js Web App đã được chạy tự động ở **Bước 1** tại [http://localhost:3000](http://localhost:3000).
>
> Nếu bạn muốn chạy bằng môi trường Node.js local không qua Docker, hãy thực hiện:
> 1. Copy logo của bạn vào `frontend/public/logo.png`.
> 2. Chạy lệnh:
>    ```bash
>    cd frontend
>    npm install
>    npm run dev
>    ```

### Bước 5: Khởi chạy Mobile App (Flutter)
```bash
cd mobile
flutter pub get
flutter run
```

## 5. Tài khoản kiểm thử mặc định (Default Test Accounts)

Hệ thống đã được thiết lập sẵn (Seed) dữ liệu tài khoản tương ứng với 3 nhóm phân quyền và giao diện chuyên biệt trong cơ sở dữ liệu:

| Tài khoản (Username) | Mật khẩu (Password) | Phân quyền (Role) | Chức năng & Giao diện chuyên biệt (Role-based Workspace) |
| :--- | :--- | :--- | :--- |
| `admin@bizflow.com` | `admin123` | **Admin (Platform Administrator)** | **Hệ thống điều hành SaaS:** Quản lý danh sách các doanh nghiệp đăng ký (Tenants), kết nối CSDL biệt lập (Isolated DB Connection), cấu hình gói thuê bao và cài đặt hệ thống. |
| `owner@bizflow.com` | `owner123` | **Owner (Chủ doanh nghiệp)** | **Bảng quản trị cửa hàng:** Báo cáo doanh số bán hàng tổng quan, biểu đồ trực quan doanh thu theo thời gian, quản lý danh mục, báo cáo TT88, quản lý kho hàng và giao dịch công nợ. |
| `employee@bizflow.com` | `employee123` | **Employee (Nhân viên bán hàng)** | **Quầy bán hàng POS:** Giao diện quét/chọn nhanh sản phẩm, nhập thông tin khách hàng, tích hợp hạch toán bán nợ nhanh và phân hệ phê duyệt đơn nháp AI đồng bộ thời gian thực từ Mobile. |

> [!NOTE]
> Để đăng nhập và kiểm thử các phân hệ, vui lòng điền một trong các tài khoản trên vào ô **Tên đăng nhập (Email)** trên màn hình đăng nhập. Dữ liệu này được tự động thiết lập trong cơ sở dữ liệu khi khởi động dự án.

---

## 6. Sản phẩm bàn giao đầu ra (Deliverables)
Dự án hoàn thành cung cấp:
*   **Sản phẩm:** Ứng dụng Web quản lý đa nền tảng, Ứng dụng di động Flutter, CSDL PostgreSQL, Dịch vụ AI trích xuất thực thể.
*   **Tài liệu học thuật:** Tài liệu yêu cầu người dùng, SRS, Thiết kế Kiến trúc & Thiết kế Chi tiết, Tài liệu Kiểm thử, và Hướng dẫn sử dụng.
