# AGENTS.md — BizFlow Platform

Context đặc thù cho AI coding agent (Claude, Copilot, Cursor, GPT...) khi làm việc trên repo này.  
File này KHÔNG thay thế các skill review chung (ví dụ: senior-code-reviewer) — nó bổ sung business rules và architectural constraints mà generic coding agent không tự biết.

---

# 1. Project Overview

BizFlow Platform là SaaS quản lý bán hàng cho hộ kinh doanh cá thể / cửa hàng bán lẻ tại Việt Nam.

Core capabilities:
- Quản lý bán hàng (POS)
- Quản lý kho
- Công nợ khách hàng
- Báo cáo doanh thu
- AI Assistant (voice → draft order)
- Tự động hạch toán sổ sách theo **Thông tư 88/2021/TT-BTC**

Tech stack:
- Frontend: Next.js 14
- Backend: .NET 8 (Clean Architecture + EF Core)
- AI Service: FastAPI (Python)
- Mobile: Flutter
- Database: PostgreSQL (Supabase)
- Cache / Queue: Redis

---

# 2. Monorepo Structure

```bash
BizFlow-Flatform/
├── docker-compose.yml
├── frontend/      # Next.js 14 App Router
├── backend/       # .NET 8 Clean Architecture
├── ai-service/    # FastAPI (Whisper + Gemini)
└── mobile/        # Flutter
```

Rule cho AI agent:
1. Luôn xác định đang sửa service nào trước.
2. Áp convention đúng cho service đó.
3. Nếu thay đổi cross-service:
   - mobile → ai-service
   - frontend → backend
   - ai-service → backend
   → phải kiểm tra kỹ API contract.

Đặc biệt chú ý:
- DTO mismatch
- Enum mismatch
- JSON serialization mismatch
- Validation missing

---

# 3. Multi-Tenant Architecture & Authorization

## Current Tenant Model

**Shared Database + TenantId isolation**

Tất cả tenant dùng chung 1 PostgreSQL database.

Isolation được thực hiện bằng:
- `TenantId`
- Authorization
- Query filtering
- Service layer validation

## Critical Rules

Mọi business table PHẢI có:
- `Id`
- `TenantId`
- timestamps (nếu applicable)

Ví dụ:
- products
- orders
- customers
- inventory_receipts
- accounting_ledger_s2

## Query Safety Rules

### REQUIRED
Mọi business query cho Owner / Employee PHẢI filter theo TenantId.

Ví dụ đúng:
```csharp
context.Products
    .Where(x => x.TenantId == tenantId)
```

Ví dụ nguy hiểm:
```csharp
context.Products.FirstOrDefault(x => x.Id == id)
```

Thiếu TenantId = potential data leak.

---

## Roles

| Role | Permission Scope |
|---|---|
| Admin | Quản lý platform, tenant, subscription |
| Owner | Toàn quyền trong tenant |
| Employee | POS, bán hàng, ghi nợ, thu nợ |

---

## Authorization Rules

### Admin
Có thể cross-tenant nhưng:
- phải qua admin endpoint riêng
- phải audit log
- không dùng chung code path với Owner/Employee

### Owner
Có quyền:
- báo cáo
- kho
- TT88
- công nợ
- cấu hình tenant

### Employee
Có quyền:
- POS
- tạo đơn
- ghi nợ
- thu nợ
- AI draft approval

Không được:
- xem báo cáo tài chính tổng
- chỉnh system config
- xem tax reports

---

## Security Review Checklist

Khi review:
- middleware resolve tenant chạy chưa?
- background jobs có tenant context không?
- cron jobs có leak data không?
- endpoint role check đủ chưa?

Data leak bug = **CRITICAL**

---

# 4. Database Schema Rules (CRITICAL)

BizFlow vừa hoàn thành **EF Core Baseline Reset** sau khi loại bỏ legacy `SafeSql`.

Điều này cực kỳ quan trọng.

---

## STRICTLY FORBIDDEN

### NEVER:
- CREATE TABLE trong `Program.cs`
- ALTER TABLE trong `Program.cs`
- DROP TABLE runtime
- SafeSql schema manipulation

Ví dụ cấm:
```csharp
SafeSql("ALTER TABLE users ADD COLUMN ...");
```

Hoặc:
```csharp
db.Database.ExecuteSqlRaw("CREATE TABLE ...");
```

---

## REQUIRED

Mọi schema changes MUST đi qua:
1. Update Entity
2. Update DbContext mapping
3. Generate migration
4. Audit migration
5. Apply migration

---

## Migration Safety Checklist

Trước khi apply production:

### Step 1
Generate migration:
```bash
dotnet ef migrations add MigrationName
```

### Step 2
Audit:
- Up()
- Down()

Check:
- CreateTable?
- DropTable?
- AddColumn?
- DropColumn?
- AlterColumn?
- InsertData?

---

### Step 3
Run smoke check

Generate temp migration:
```bash
dotnet ef migrations add SmokeTest
```

Nếu:
```csharp
Up() {}
Down() {}
```

=> No schema drift.

---

### Step 4
Remove smoke migration:
```bash
dotnet ef migrations remove
```

---

## Schema Drift Policy

Nếu SmokeTest sinh ra:
- AlterColumn
- AddColumn
- CreateIndex
- DropColumn

=> Schema drift detected.

STOP deployment.

---

# 5. EF Core Rules

BizFlow backend dùng:
- EF Core 8
- Code First
- Migration-driven schema

## Rules

### Allowed
- Fluent API
- HasIndex
- HasPrecision
- HasDefaultValue

### Avoid
- Raw SQL schema modifications

### Be careful with
```csharp
.Ignore(...)
```

EF sẽ nghĩ column bị remove → generate DropColumn.

Luôn review kỹ migration nếu dùng:
- Ignore
- Rename
- Split entity
- Merge entity

---

# 6. Seed Data Rules

## Production
Production schema PHẢI sạch:
- không credential
- không dummy users
- không demo tenant

Forbidden:
- admin123
- owner123
- employee123

---

## Development Only

Test accounts chỉ tồn tại qua:

`DevelopmentDataSeeder`

Chỉ chạy khi:
```csharp
Environment == Development
&& EnableDevSeed == true
```

Không được để test seed trong:
- migrations
- DbContext HasData

---

## Reference Seed

Reference data an toàn có thể seed runtime:
- enums
- system constants
- lookup values

Không seed hardcoded credentials.

---

# 7. Accounting Rules (TT88) — HARD CONSTRAINT

BizFlow phải tuân thủ:

**Thông tư 88/2021/TT-BTC**

Không được tự ý redesign accounting flow trái TT88.

---

## 7 Accounting Books

| Sổ | Mã |
|---|---|
| Sổ doanh thu | S1-HKD |
| Sổ kho | S2-HKD |
| Sổ chi phí | S3-HKD |
| Sổ thuế | S4-HKD |
| Sổ lương | — |
| Sổ quỹ tiền mặt | — |
| Sổ ngân hàng | — |

---

## Data Sources

### S1-HKD
Nguồn:
- approved orders

### S2-HKD
Nguồn:
- receipts
- inventory transactions
- sales deductions

### S3-HKD
Nguồn:
- expenses
- operating cost

### S4-HKD
Nguồn:
- tax engine
- revenue + tax rules

---

# 8. Accounting Immutability Rules (CRITICAL)

Accounting entries sau khi post phải **immutable**.

Không được:
- UPDATE posted entries
- DELETE posted entries

Đặc biệt:

Tables:
- accounting_ledger_s2
- cash_transactions
- tax ledgers

Forbidden:
```sql
UPDATE accounting_ledger_s2 ...
DELETE FROM accounting_ledger_s2 ...
```

---

## Correction Methods

Sửa sai chỉ bằng:
1. reversal entry
2. negative entry
3. adjustment entry

Append-only only.

Accounting mutation bug = **CRITICAL**

---

# 9. Period Lock Rules

Khi kỳ kế toán đã khóa:
- không cho thêm transaction vào kỳ cũ
- không sửa bút toán cũ

Cho phép:
- adjustment entry ở kỳ hiện tại

---

# 10. Inventory Rules

Nguồn tồn kho chuẩn:
- `accounting_ledger_s2`

Legacy field:
- `products.StockQuantity`

`StockQuantity` là legacy cache field.

Không dùng làm source of truth.

Source of truth:
```text
Inventory Ledger (S2)
```

Nếu conflict:
ledger wins.

---

# 11. HR / Payroll Rules

Auth data và HR data nên tách riêng.

User table chỉ nên chứa:
- auth
- identity
- role
- tenant linkage

HR fields nên ở:
- EmployeeProfile

Ví dụ:
- IdentityCard
- BankAccountNumber
- BasicSalary
- DateOfBirth
- TaxCode

Tránh fat `users` table.

---

# 12. AI Flow Rules (Whisper + Gemini)

AI không được auto-confirm transaction.

AI chỉ được:
### voice input
↓
### entity extraction
↓
### draft order

---

## Forbidden

AI output KHÔNG được:
- trừ kho trực tiếp
- ghi accounting ledger
- tạo invoice finalized

---

## Required Validation

AI extracted:
- product name
- quantity
- price
- customer
- payment method

Phải validate với DB:
- product exists?
- quantity valid?
- price valid?

Không trust 100% LLM output.

---

# 13. Code Review Severity

| Severity | Meaning |
|---|---|
| Critical | Data loss / financial corruption / tenant leak |
| High | Security / auth bug |
| Medium | Logic bug |
| Low | Style / refactor |

---

# 14. Critical Failure Conditions

Bất kỳ lỗi nào sau đây = CRITICAL:

- Missing TenantId filter
- Cross-tenant leak
- Posted ledger mutation
- AI auto-post accounting
- Schema drift
- Raw SQL schema modification
- Production credential seed

Agent MUST flag immediately.