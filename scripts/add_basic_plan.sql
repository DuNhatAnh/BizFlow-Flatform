-- Thêm gói Cơ Bản (Id=3) - mid-tier giữa Free và Chuyên Nghiệp
INSERT INTO subscription_plans (
    "Id", "Name", "Price", "DurationMonths", "Description",
    "MaxOrdersPerMonth", "Features", "CreatedAt"
)
SELECT 
    3,
    'Gói Cơ Bản',
    150000.00,
    1,
    'Quản lý bán hàng nâng cao, tối đa 300 đơn/tháng. Bao gồm báo cáo doanh thu và quản lý kho nâng cao. Chưa bao gồm Trợ lý AI và báo cáo thuế TT88.',
    300,
    '["pos","inventory","reports","debt_tracking"]',
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE "Id" = 3);

-- Xem kết quả tất cả gói
SELECT 
    "Id",
    "Name",
    "Price",
    "DurationMonths",
    "MaxOrdersPerMonth",
    "Features",
    "Description"
FROM subscription_plans
ORDER BY "Id";
