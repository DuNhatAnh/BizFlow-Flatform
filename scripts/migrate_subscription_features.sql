-- Migration manual: AddSubscriptionPlanFeatures
-- Thêm cột MaxOrdersPerMonth và Features vào subscription_plans
-- Thêm gói Free (Id=2) nếu chưa tồn tại

ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS "MaxOrdersPerMonth" integer;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS "Features" text;

-- Cập nhật gói Chuyên Nghiệp (Id=1) với features mới
UPDATE subscription_plans 
SET "MaxOrdersPerMonth" = NULL,
    "Features" = '["pos","inventory","reports","ai","tt88","multi_store"]'
WHERE "Id" = 1;

-- Thêm gói Miễn Phí (Id=2) nếu chưa có
INSERT INTO subscription_plans ("Id", "Name", "Price", "DurationMonths", "Description", "MaxOrdersPerMonth", "Features", "CreatedAt")
SELECT 2, 'Gói Miễn Phí', 0, 0, 
       'Quản lý bán hàng cơ bản, tối đa 50 đơn/tháng. Không bao gồm báo cáo thuế TT88 và Trợ lý AI.',
       50, '["pos","inventory"]', NOW()
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE "Id" = 2);

-- Gán gói Miễn Phí cho tất cả tenant đang pending (IsApproved = false) hoặc không có gói
-- Ngoại trừ BizFlow System Tenant
UPDATE tenants
SET "SubscriptionPlanId" = 2
WHERE "SubscriptionPlanId" IS NULL
  AND "Name" != 'BizFlow System Tenant';

-- Kiểm tra kết quả
SELECT "Id", "Name", "Price", "MaxOrdersPerMonth", "Features" FROM subscription_plans ORDER BY "Id";
SELECT t."Id", t."Name", t."SubscriptionPlanId", t."IsApproved", sp."Name" AS "PlanName"
FROM tenants t
LEFT JOIN subscription_plans sp ON sp."Id" = t."SubscriptionPlanId"
ORDER BY t."CreatedAt";
