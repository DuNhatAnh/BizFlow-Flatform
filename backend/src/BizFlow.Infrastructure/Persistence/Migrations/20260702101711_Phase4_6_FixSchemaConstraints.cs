// MANUAL DRIFT REPAIR MIGRATION
// Production schema drifted due to legacy SafeSql / manual DB changes.
// EF Core snapshot already matches source code, so EF could not auto-detect this drift.
// This migration force-syncs production constraints to match EF model.

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BizFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Phase4_6_FixSchemaConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // audit_logs
            migrationBuilder.Sql("ALTER TABLE audit_logs ALTER COLUMN \"Details\" SET NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE audit_logs ALTER COLUMN \"EntityId\" SET NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE audit_logs ALTER COLUMN \"EntityName\" SET NOT NULL;");
            
            // orders
            migrationBuilder.Sql("ALTER TABLE orders ALTER COLUMN \"TotalVatAmount\" SET NOT NULL;");
            
            // order_items
            migrationBuilder.Sql("ALTER TABLE order_items ALTER COLUMN \"VatAmount\" SET NOT NULL;");
            
            // inventory_receipts
            migrationBuilder.Sql("ALTER TABLE inventory_receipts ALTER COLUMN \"ReceiptCode\" SET NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE inventory_receipts ALTER COLUMN \"TotalVatAmount\" SET NOT NULL;");
            
            // inventory_receipt_details
            migrationBuilder.Sql("ALTER TABLE inventory_receipt_details ALTER COLUMN \"VatAmount\" SET NOT NULL;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // audit_logs
            migrationBuilder.Sql("ALTER TABLE audit_logs ALTER COLUMN \"Details\" DROP NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE audit_logs ALTER COLUMN \"EntityId\" DROP NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE audit_logs ALTER COLUMN \"EntityName\" DROP NOT NULL;");
            
            // orders
            migrationBuilder.Sql("ALTER TABLE orders ALTER COLUMN \"TotalVatAmount\" DROP NOT NULL;");
            
            // order_items
            migrationBuilder.Sql("ALTER TABLE order_items ALTER COLUMN \"VatAmount\" DROP NOT NULL;");
            
            // inventory_receipts
            migrationBuilder.Sql("ALTER TABLE inventory_receipts ALTER COLUMN \"ReceiptCode\" DROP NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE inventory_receipts ALTER COLUMN \"TotalVatAmount\" DROP NOT NULL;");
            
            // inventory_receipt_details
            migrationBuilder.Sql("ALTER TABLE inventory_receipt_details ALTER COLUMN \"VatAmount\" DROP NOT NULL;");
        }
    }
}
