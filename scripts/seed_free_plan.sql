-- 1. Kiểm tra gói hiện tại
SELECT * FROM subscription_plans ORDER BY "Id";

-- 2. Tạo gói Free nếu chưa tồn tại (Id = 2)
INSERT INTO subscription_plans ("Id", "Name", "Price", "DurationMonths", "Description", "CreatedAt")
SELECT 2, 'Gói Miễn Phí', 0, 0, 'Gói miễn phí mặc định: quản lý bán hàng cơ bản, tối đa 50 đơn/tháng, không có báo cáo thuế TT88 và Trợ lý AI', NOW()
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE "Id" = 2);

-- 3. Gán gói Free cho tất cả tenant chưa có gói (SubscriptionPlanId IS NULL)
--    Ngoại trừ System Tenant (BizFlow System Tenant)
UPDATE tenants
SET "SubscriptionPlanId" = 2
WHERE "SubscriptionPlanId" IS NULL
  AND "Name" != 'BizFlow System Tenant';

-- 4. Kiểm tra kết quả
SELECT t."Id", t."Name", t."SubscriptionPlanId", sp."Name" AS "PlanName"
FROM tenants t
LEFT JOIN subscription_plans sp ON sp."Id" = t."SubscriptionPlanId"
ORDER BY t."CreatedAt";
