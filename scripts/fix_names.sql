-- Fix tên bị mất dấu trong database
UPDATE subscription_plans SET "Name" = 'Gói Chuyên Nghiệp' WHERE "Id" = 1;
UPDATE tenants SET "Name" = 'Cửa Hàng Tạp Hóa Bình Minh', "OwnerName" = 'Nguyễn Văn A' WHERE "Id" = '11111111-1111-1111-1111-111111111111';

-- Kiểm tra kết quả sau fix
SELECT "Id", "Name", "Price", "MaxOrdersPerMonth", "DurationMonths", "Description" FROM subscription_plans ORDER BY "Id";
SELECT t."Id", t."Name", t."SubscriptionPlanId", sp."Name" AS plan_name
FROM tenants t
LEFT JOIN subscription_plans sp ON sp."Id" = t."SubscriptionPlanId"
ORDER BY t."CreatedAt";
