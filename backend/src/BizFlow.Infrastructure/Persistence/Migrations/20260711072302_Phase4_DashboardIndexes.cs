using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BizFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Phase4_DashboardIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_orders_TenantId",
                table: "orders");

            migrationBuilder.CreateIndex(
                name: "IX_orders_TenantId_CreatedAt",
                table: "orders",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_cash_transactions_TenantId_TransactionDate",
                table: "cash_transactions",
                columns: new[] { "TenantId", "TransactionDate" });

            migrationBuilder.CreateIndex(
                name: "IX_accounting_ledger_s2_TenantId_Type_Date",
                table: "accounting_ledger_s2",
                columns: new[] { "TenantId", "Type", "Date" },
                descending: new[] { false, false, true });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_orders_TenantId_CreatedAt",
                table: "orders");

            migrationBuilder.DropIndex(
                name: "IX_cash_transactions_TenantId_TransactionDate",
                table: "cash_transactions");

            migrationBuilder.DropIndex(
                name: "IX_accounting_ledger_s2_TenantId_Type_Date",
                table: "accounting_ledger_s2");

            migrationBuilder.CreateIndex(
                name: "IX_orders_TenantId",
                table: "orders",
                column: "TenantId");
        }
    }
}
