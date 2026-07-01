# AGENTS.md — BizFlow Platform

Context đặc thù cho AI coding agent (Claude, Copilot...) khi làm việc trên repo này. File này KHÔNG thay thế các skill review chung (VD `senior-code-reviewer`) — nó bổ sung rule nghiệp vụ mà skill generic không thể tự biết.

---

## 1. Tổng quan dự án

BizFlow Platform là SaaS quản lý bán hàng cho hộ kinh doanh cá thể/cửa hàng bán lẻ VN, tích hợp Trợ lý AI (giọng nói → đơn hàng nháp) và tự động hạch toán sổ sách theo **Thông tư 88/2021/TT-BTC**.

## 2. Cấu trúc Monorepo — detect theo từng service

```
BizFlow-Flatform/
├── docker-compose.yml    # PostgreSQL, Redis, Adminer
├── frontend/             # Next.js 14 App Router — Web quản trị & POS
├── backend/               # .NET 8 Clean Architecture — API core
├── ai-service/            # FastAPI Python — Whisper + Gemini
└── mobile/                # Flutter — app nhân viên bán hàng
```

Khi review/sửa code: xác định đang làm việc trong service nào trước, áp đúng convention của service đó (xem `references/stack-notes.md` trong skill `senior-code-reviewer`). Nếu thay đổi xuyên nhiều service (VD luồng AI: `mobile/` hoặc voice input → `ai-service/` → `backend/` → DB), kiểm tra kỹ **API contract** giữa các service — đây là nơi dễ thiếu validate nhất.

## 3. Kiến trúc đa tenant & phân quyền

Mô hình: **Isolated DB Connection** — mỗi hộ kinh doanh (tenant) có kết nối CSDL biệt lập, không dùng chung 1 DB với cột `TenantId`.

3 role cố định, mỗi role có workspace riêng:

| Role | Phạm vi truy cập |
|---|---|
| **Admin** (Platform Administrator) | Quản lý danh sách tenant, kết nối DB biệt lập, cấu hình gói thuê bao. Truy cập chéo tenant hợp lệ theo thiết kế — nhưng PHẢI đi qua endpoint/quyền riêng, có audit log, không dùng chung code path với API của Owner/Employee. |
| **Owner** (Chủ doanh nghiệp) | Toàn quyền trong phạm vi tenant của mình: báo cáo doanh thu, TT88, kho, công nợ. |
| **Employee** (Nhân viên bán hàng) | POS bán hàng, ghi nợ nhanh, duyệt đơn nháp từ AI. KHÔNG được truy cập báo cáo tài chính tổng hợp/cấu hình hệ thống. |

**Khi review code liên quan phân quyền**: luôn kiểm tra middleware resolve tenant + role có chạy trên MỌI request không (kể cả job nền/script), và endpoint không bị lộ dữ liệu của role cao hơn cho role thấp (VD Employee gọi nhầm API dành cho Owner). Xem thêm `references/data-leak-prevention.md` phần Layer 7 (Multi-Tenant Isolation) trong skill review.

## 4. Rule bắt buộc: Tuân thủ Thông tư 88/2021/TT-BTC

Áp dụng từ 01/01/2022, cho hộ kinh doanh/cá nhân kinh doanh nộp thuế theo phương pháp kê khai. Mọi nghiệp vụ ghi sổ tự động PHẢI map đúng vào 1 trong 7 loại sổ kế toán sau — đây là ràng buộc nghiệp vụ cứng, không được tự ý đổi cấu trúc cột hay gộp sổ:

| Sổ | Mã mẫu | Mục đích | Nguồn dữ liệu trong hệ thống |
|---|---|---|---|
| Sổ chi tiết doanh thu bán hàng hóa, dịch vụ | S1-HKD | Căn cứ xác định nghĩa vụ thuế GTGT, TNCN — mở theo nhóm ngành nghề có cùng mức thuế suất | Đơn hàng đã duyệt (bán thủ công + bán qua AI) |
| Sổ chi tiết vật liệu, dụng cụ, sản phẩm, hàng hóa | S2-HKD | Theo dõi nhập/xuất/tồn kho, đối chiếu với kiểm kê thực tế | Phiếu nhập kho, phiếu xuất kho, đơn hàng trừ kho |
| Sổ chi phí sản xuất, kinh doanh | S3-HKD | Tập hợp chi phí theo địa điểm kinh doanh: nhân công, điện nước, viễn thông, thuê mặt bằng, quản lý... | Phiếu chi, chi phí vận hành |
| Sổ theo dõi tình hình thực hiện nghĩa vụ thuế với NSNN | S4-HKD | Theo dõi thuế phải nộp/đã nộp/còn phải nộp — mở chi tiết theo từng sắc thuế (GTGT, TNCN...) | Tính toán tự động từ doanh thu + quy định thuế hiện hành |
| Sổ theo dõi tình hình thanh toán tiền lương | — | Thanh toán lương, phụ cấp, thưởng cho người lao động | Module nhân sự (nếu có) |
| Sổ quỹ tiền mặt | — | Theo dõi thu/chi tiền mặt thực tế | Thanh toán tiền mặt |
| Sổ tiền gửi ngân hàng | — | Theo dõi thu/chi qua chuyển khoản | Thanh toán chuyển khoản |

*(Nguồn: Điều 5 Thông tư 88/2021/TT-BTC. Việc xác định doanh thu/chi phí cụ thể theo ngành nghề còn tham chiếu thêm Thông tư 40/2021/TT-BTC — cần xác nhận với kế toán/chuyên gia thuế cho từng loại hình kinh doanh cụ thể, AI không tự suy diễn mức thuế suất.)*

### Ràng buộc kỹ thuật quan trọng khi code phần hạch toán:

- **Không tẩy xóa dữ liệu sổ kế toán đã ghi.** Luật Kế toán chỉ cho phép sửa bằng 1 trong 3 cách: ghi cải chính (có traceability), ghi số âm, hoặc ghi điều chỉnh bằng chứng từ mới. → Về mặt hệ thống: bảng lưu bút toán kế toán nên là **append-only / immutable**, sửa sai phải tạo bản ghi điều chỉnh mới kèm tham chiếu tới bản ghi gốc, KHÔNG được `UPDATE`/`DELETE` trực tiếp lên bút toán đã chốt sổ.
- Sổ kế toán mở đầu kỳ năm, khóa sổ cuối kỳ trước khi lập báo cáo — cần cơ chế "khóa kỳ" (period lock), sau khi khóa không cho phát sinh bút toán mới vào kỳ đó (chỉ tạo bút toán điều chỉnh ở kỳ hiện tại).
- Hộ kinh doanh có nhiều địa điểm kinh doanh phải tách sổ theo từng địa điểm — nếu tenant có multi-location, kiểm tra dữ liệu có được phân tách đúng theo địa điểm trong các sổ trên không.
- Không lập, không ghi sổ hoặc ghi sai có thể bị xử phạt hành chính (Nghị định 125/2020/NĐ-CP) — vì vậy lỗi ở luồng hạch toán tự động nên được xếp **Critical** khi review, không phải Medium.

## 5. Rule đặc thù cho luồng AI (Whisper + Gemini)

- Output trích xuất thực thể từ giọng nói (số lượng, đơn giá, tên khách hàng, hình thức thanh toán) chỉ tạo **Đơn hàng nháp**, KHÔNG được tự động ghi thẳng vào sổ kế toán hay trừ kho — phải qua bước duyệt của Employee/Owner trước.
- Số lượng/giá tiền do AI trích xuất phải được validate lại theo danh mục sản phẩm thực tế trong hệ thống (không tin tưởng tuyệt đối con số LLM trả về) trước khi hiển thị cho người duyệt.

## 6. Tài khoản test (chỉ dùng ở môi trường dev/seed, KHÔNG deploy kèm production)

Repo có seed 3 tài khoản test mặc định cho 3 role (xem README). Khi review, đảm bảo đoạn seed data này chỉ chạy ở môi trường development (không nằm trong migration chạy tự động ở production), và không sử dụng chung pattern mật khẩu yếu cho môi trường thật.

## 7. Database Schema Rules (MANDATORY)

- EF Core migrations là single source of truth cho schema.
- Nghiêm cấm CREATE / ALTER / DROP TABLE trong Program.cs hoặc runtime startup code.
- Raw SQL chỉ được dùng cho:
  - DML (INSERT / UPDATE / DELETE)
  - data repair scripts
  - index hotfix khẩn cấp (có approval)
- Mọi schema change bắt buộc theo flow:

Entity change
-> Update Fluent API
-> dotnet ef migrations add <MigrationName>
-> Review migration manually
-> dotnet ef database update

Trước khi merge PR:
- Generate temporary migration SmokeTest
- Nếu migration chứa schema change ngoài dự kiến => STOP