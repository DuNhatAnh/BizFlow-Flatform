using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BizFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Phase53ArchitectureCleanup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "accounting_entries");

            migrationBuilder.AddColumn<int>(
                name: "ApprovalStatus",
                table: "InventoryReceipts",
                type: "integer",
                nullable: false,
                defaultValue: 2); // Approved (2)

            migrationBuilder.AddColumn<int>(
                name: "ApprovalStatus",
                table: "CashTransactions",
                type: "integer",
                nullable: false,
                defaultValue: 2); // Approved (2)
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApprovalStatus",
                table: "InventoryReceipts");

            migrationBuilder.DropColumn(
                name: "ApprovalStatus",
                table: "CashTransactions");

            migrationBuilder.CreateTable(
                name: "accounting_entries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AccountCategory = table.Column<string>(type: "text", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(15,2)", precision: 15, scale: 2, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    DocumentRefId = table.Column<string>(type: "text", nullable: false),
                    DocumentType = table.Column<string>(type: "text", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_accounting_entries", x => x.Id);
                });
        }
    }
}
