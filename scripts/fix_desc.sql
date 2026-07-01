-- Fix description bị mất dấu
UPDATE subscription_plans 
SET "Description" = 'Đầy đủ các chức năng quản lý, báo cáo thuế TT88 và Trợ lý AI'
WHERE "Id" = 1;

SELECT "Id", "Name", "Price", "MaxOrdersPerMonth", "DurationMonths", "Description" FROM subscription_plans ORDER BY "Id";
