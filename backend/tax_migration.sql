START TRANSACTION;

ALTER TABLE users DROP COLUMN "RefreshToken";

ALTER TABLE users DROP COLUMN "RefreshTokenExpiryTime";

ALTER TABLE cash_transactions ALTER COLUMN "PaymentMethod" DROP DEFAULT;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260728054649_AddTaxObligations', '8.0.6');

COMMIT;

