-- =============================================================
--  BizFlow Platform — Khởi tạo toàn bộ cơ sở dữ liệu
--  Phiên bản cập nhật: Khớp 100% với ERD SP26SE030_BIZFLOW
--  Chạy file SQL này trong Database Client (VS Code) hoặc Adminer
--  Kết nối: Host=localhost | Port=5432 | DB=bizflow_db | User=postgres
-- =============================================================

-- ============================
-- 1. subscription_plans (SaaS)
-- ============================
CREATE TABLE IF NOT EXISTS subscription_plans (
    "Id"             SERIAL PRIMARY KEY,
    "Name"           VARCHAR(255) NOT NULL,
    "Price"          NUMERIC(15, 2) NOT NULL DEFAULT 0,
    "DurationMonths" INTEGER NOT NULL DEFAULT 1,
    "Description"    TEXT,
    "CreatedAt"      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================
-- 2. tenants (Hộ kinh doanh)
-- ============================
CREATE TABLE IF NOT EXISTS tenants (
    "Id"                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name"               VARCHAR(255) NOT NULL,
    "TaxCode"            VARCHAR(50),
    "OwnerName"          VARCHAR(255) NOT NULL,
    "Address"            TEXT,
    "Phone"              VARCHAR(20),
    "SubscriptionPlanId" INTEGER REFERENCES subscription_plans("Id") ON DELETE SET NULL,
    "IsActive"           BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedAt"          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================
-- 3. users (Nhân viên / Chủ cửa hàng)
-- ============================
CREATE TABLE IF NOT EXISTS users (
    "Id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "TenantId"     UUID NOT NULL REFERENCES tenants("Id") ON DELETE CASCADE,
    "Username"     VARCHAR(255) NOT NULL,
    "PasswordHash" VARCHAR(512) NOT NULL,
    "Fullname"     VARCHAR(255) NOT NULL,
    "Role"         VARCHAR(50) NOT NULL DEFAULT 'Cashier',  -- Admin | Owner | Manager | Cashier
    "IsActive"     BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedAt"    TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE ("TenantId", "Username")
);

-- ============================
-- 4. categories (Danh mục sản phẩm)
-- ============================
CREATE TABLE IF NOT EXISTS categories (
    "Id"        SERIAL PRIMARY KEY,
    "TenantId"  UUID NOT NULL REFERENCES tenants("Id") ON DELETE CASCADE,
    "Name"      VARCHAR(255) NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================
-- 5. products (Sản phẩm)
-- ============================
CREATE TABLE IF NOT EXISTS products (
    "Id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "TenantId"    UUID NOT NULL REFERENCES tenants("Id") ON DELETE CASCADE,
    "CategoryId"  INTEGER REFERENCES categories("Id") ON DELETE SET NULL,
    "Code"        VARCHAR(100),
    "Name"        VARCHAR(255) NOT NULL,
    "Description" TEXT,
    "BaseUnit"    VARCHAR(50) NOT NULL DEFAULT '',  -- Đơn vị cơ sở nhỏ nhất: Lon, Cái, Bao...
    "CreatedAt"   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================
-- 6. product_units (Đơn vị tính quy đổi)
-- [FIX] Thêm cột "IsDefault" theo ERD spec
-- ============================
CREATE TABLE IF NOT EXISTS product_units (
    "Id"             SERIAL PRIMARY KEY,
    "ProductId"      UUID NOT NULL REFERENCES products("Id") ON DELETE CASCADE,
    "UnitName"       VARCHAR(100) NOT NULL,          -- Thùng, Lốc, Cái...
    "ConversionRate" INTEGER NOT NULL DEFAULT 1,     -- 1 Thùng = 24 lon → ConversionRate=24
    "Price"          NUMERIC(15, 2) NOT NULL DEFAULT 0,
    "IsDefault"      BOOLEAN NOT NULL DEFAULT FALSE, -- Đơn vị bán mặc định
    "CreatedAt"      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================
-- 7. customers (Khách hàng)
-- ============================
CREATE TABLE IF NOT EXISTS customers (
    "Id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "TenantId"  UUID NOT NULL REFERENCES tenants("Id") ON DELETE CASCADE,
    "Fullname"  VARCHAR(255) NOT NULL,
    "Phone"     VARCHAR(20),
    "Address"   TEXT,
    "TotalDebt" NUMERIC(15, 2) NOT NULL DEFAULT 0,  -- Denormalized để truy vấn nhanh
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================
-- 8. orders (Hóa đơn / Đơn hàng)
-- ============================
CREATE TABLE IF NOT EXISTS orders (
    "Id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "TenantId"      UUID NOT NULL REFERENCES tenants("Id") ON DELETE CASCADE,
    "CustomerId"    UUID REFERENCES customers("Id") ON DELETE SET NULL,  -- Nullable: khách lẻ
    "CreatedBy"     UUID REFERENCES users("Id") ON DELETE SET NULL,
    "TotalAmount"   NUMERIC(15, 2) NOT NULL DEFAULT 0,
    "PaymentMethod" VARCHAR(50) NOT NULL DEFAULT 'Cash',    -- Cash | Transfer | Debt
    "Status"        VARCHAR(50) NOT NULL DEFAULT 'Draft',   -- Draft | Completed | Cancelled
    "OrderSource"   VARCHAR(50) NOT NULL DEFAULT 'Manual',  -- Manual | AI_Voice | AI_Text
    "CreatedAt"     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================
-- 9. order_items (Chi tiết đơn hàng)
-- [FIX] Thêm "ProductUnitId" (FK) theo ERD spec thay vì UnitName text
-- ============================
CREATE TABLE IF NOT EXISTS order_items (
    "Id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "OrderId"       UUID NOT NULL REFERENCES orders("Id") ON DELETE CASCADE,
    "ProductId"     UUID REFERENCES products("Id") ON DELETE SET NULL,
    "ProductUnitId" INTEGER REFERENCES product_units("Id") ON DELETE SET NULL,  -- Bán theo đơn vị nào
    "Quantity"      INTEGER NOT NULL DEFAULT 1,
    "UnitPrice"     NUMERIC(15, 2) NOT NULL DEFAULT 0,   -- Giá tại thời điểm bán
    "TotalPrice"    NUMERIC(15, 2) NOT NULL DEFAULT 0,
    "CreatedAt"     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================
-- 10. inventory_transactions (Lịch sử Nhập/Xuất kho)
-- [FIX] Thêm "CreatedBy" (FK → users) theo ERD spec
-- ============================
CREATE TABLE IF NOT EXISTS inventory_transactions (
    "Id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "TenantId"  UUID NOT NULL REFERENCES tenants("Id") ON DELETE CASCADE,
    "ProductId" UUID REFERENCES products("Id") ON DELETE SET NULL,
    "Type"      VARCHAR(50) NOT NULL DEFAULT 'Import',  -- Import | Export | Adjustment
    "Quantity"  INTEGER NOT NULL DEFAULT 0,              -- Số lượng theo đơn vị cơ sở
    "Note"      TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "CreatedBy" UUID REFERENCES users("Id") ON DELETE SET NULL  -- Người thực hiện
);

-- ============================
-- 11. debt_transactions (Giao dịch công nợ)
-- [FIX] Sửa Type enum: Increase | Decrease theo ERD spec
-- ============================
CREATE TABLE IF NOT EXISTS debt_transactions (
    "Id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "TenantId"   UUID NOT NULL REFERENCES tenants("Id") ON DELETE CASCADE,
    "CustomerId" UUID REFERENCES customers("Id") ON DELETE SET NULL,
    "OrderId"    UUID REFERENCES orders("Id") ON DELETE SET NULL,
    "Type"       VARCHAR(50) NOT NULL DEFAULT 'Increase',  -- Increase (mua nợ) | Decrease (trả nợ)
    "Amount"     NUMERIC(15, 2) NOT NULL DEFAULT 0,
    "Note"       TEXT,
    "CreatedAt"  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================
-- 12. accounting_entries (Sổ Kế toán TT88 - Nhật ký chung)
-- [FIX] Thêm "TransactionDate" và "DocumentRefId" theo ERD spec
-- ============================
CREATE TABLE IF NOT EXISTS accounting_entries (
    "Id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "TenantId"        UUID NOT NULL REFERENCES tenants("Id") ON DELETE CASCADE,
    "TransactionDate" TIMESTAMP NOT NULL DEFAULT NOW(),        -- Ngày phát sinh thực tế
    "DocumentType"    VARCHAR(50) NOT NULL DEFAULT 'Sales',    -- Sales | Purchase | Expense
    "DocumentRefId"   VARCHAR(255),                            -- Link tới OrderId hoặc ImportId
    "AccountCategory" VARCHAR(100) NOT NULL DEFAULT 'Revenue_Goods',
    --   Revenue_Goods | Revenue_Services | Expense_Materials | Expense_Salary | Expense_Taxes
    "Amount"          NUMERIC(15, 2) NOT NULL DEFAULT 0,
    "Description"     TEXT,   -- VD: "Bán hàng cho khách A, hóa đơn #123"
    "CreatedAt"       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================
-- EF Core Migration history
-- ============================
CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId"    VARCHAR(150) NOT NULL PRIMARY KEY,
    "ProductVersion" VARCHAR(32)  NOT NULL
);

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260611_InitialCreate_v2', '8.0.6')
ON CONFLICT DO NOTHING;

