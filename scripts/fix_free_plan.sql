-- Fix: Update Gói Miễn Phí (Id=2) với dữ liệu đầy đủ
UPDATE subscription_plans 
SET "MaxOrdersPerMonth" = 50,
    "Features" = '["pos","inventory"]',
    "Name" = 'Gói Miễn Phí',
    "Description" = 'Quản lý bán hàng cơ bản, tối đa 50 đơn/tháng. Không bao gồm báo cáo thuế TT88 và Trợ lý AI.'
WHERE "Id" = 2;

-- Gán gói Miễn Phí cho tất cả tenant chưa có gói (ngoại trừ System Tenant)
UPDATE tenants
SET "SubscriptionPlanId" = 2
WHERE "SubscriptionPlanId" IS NULL
  AND "Name" != 'BizFlow System Tenant';

-- Kiểm tra tất cả gói dịch vụ
SELECT "Id", "Name", "Price", "MaxOrdersPerMonth", "Features" FROM subscription_plans ORDER BY "Id";

-- Kiểm tra tenant và gói được gán
SELECT t."Id", t."Name", t."SubscriptionPlanId", sp."Name" AS plan_name
FROM tenants t
LEFT JOIN subscription_plans sp ON sp."Id" = t."SubscriptionPlanId"
ORDER BY t."CreatedAt";
