using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BizFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RepairMissingIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"CREATE INDEX IF NOT EXISTS ""IX_stores_TenantId"" ON public.stores USING btree (""TenantId"");");
            migrationBuilder.Sql(@"CREATE INDEX IF NOT EXISTS ""IX_inventory_receipts_TenantId"" ON public.inventory_receipts USING btree (""TenantId"");");
            migrationBuilder.Sql(@"CREATE INDEX IF NOT EXISTS ""IX_cash_transactions_TenantId"" ON public.cash_transactions USING btree (""TenantId"");");
            migrationBuilder.Sql(@"CREATE INDEX IF NOT EXISTS ""IX_accounting_ledger_s2_TenantId_ProductId_Date"" ON public.accounting_ledger_s2 USING btree (""TenantId"", ""ProductId"", ""Date"" DESC);");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS ""IX_stores_TenantId"";");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS ""IX_inventory_receipts_TenantId"";");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS ""IX_cash_transactions_TenantId"";");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS ""IX_accounting_ledger_s2_TenantId_ProductId_Date"";");
        }
    }
}
