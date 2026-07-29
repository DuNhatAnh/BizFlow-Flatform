using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BizFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRowVersionToProduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "accounting_entries");

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "products",
                type: "bytea",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "orders",
                type: "bytea",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "InventoryReceiptId",
                table: "inventory_transactions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OrderId",
                table: "inventory_transactions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "inventory_transactions",
                type: "bytea",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ApprovalStatus",
                table: "inventory_receipts",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "inventory_receipts",
                type: "bytea",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "InventoryReceiptId",
                table: "debt_transactions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "debt_transactions",
                type: "bytea",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "customers",
                type: "bytea",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ApprovalStatus",
                table: "cash_transactions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "InventoryReceiptId",
                table: "cash_transactions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OrderId",
                table: "cash_transactions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "cash_transactions",
                type: "bytea",
                rowVersion: true,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "IdempotentRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IdempotencyKey = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IdempotentRequests", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NumberSequences",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Prefix = table.Column<string>(type: "text", nullable: false),
                    LastNumber = table.Column<int>(type: "integer", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "bytea", rowVersion: true, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NumberSequences", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_inventory_transactions_InventoryReceiptId",
                table: "inventory_transactions",
                column: "InventoryReceiptId");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_transactions_OrderId",
                table: "inventory_transactions",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_debt_transactions_InventoryReceiptId",
                table: "debt_transactions",
                column: "InventoryReceiptId");

            migrationBuilder.CreateIndex(
                name: "IX_cash_transactions_InventoryReceiptId",
                table: "cash_transactions",
                column: "InventoryReceiptId");

            migrationBuilder.CreateIndex(
                name: "IX_cash_transactions_OrderId",
                table: "cash_transactions",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_IdempotentRequests_IdempotencyKey",
                table: "IdempotentRequests",
                column: "IdempotencyKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NumberSequences_TenantId_Prefix",
                table: "NumberSequences",
                columns: new[] { "TenantId", "Prefix" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_cash_transactions_inventory_receipts_InventoryReceiptId",
                table: "cash_transactions",
                column: "InventoryReceiptId",
                principalTable: "inventory_receipts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_cash_transactions_orders_OrderId",
                table: "cash_transactions",
                column: "OrderId",
                principalTable: "orders",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_debt_transactions_inventory_receipts_InventoryReceiptId",
                table: "debt_transactions",
                column: "InventoryReceiptId",
                principalTable: "inventory_receipts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_inventory_transactions_inventory_receipts_InventoryReceiptId",
                table: "inventory_transactions",
                column: "InventoryReceiptId",
                principalTable: "inventory_receipts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_inventory_transactions_orders_OrderId",
                table: "inventory_transactions",
                column: "OrderId",
                principalTable: "orders",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_cash_transactions_inventory_receipts_InventoryReceiptId",
                table: "cash_transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_cash_transactions_orders_OrderId",
                table: "cash_transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_debt_transactions_inventory_receipts_InventoryReceiptId",
                table: "debt_transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_inventory_transactions_inventory_receipts_InventoryReceiptId",
                table: "inventory_transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_inventory_transactions_orders_OrderId",
                table: "inventory_transactions");

            migrationBuilder.DropTable(
                name: "IdempotentRequests");

            migrationBuilder.DropTable(
                name: "NumberSequences");

            migrationBuilder.DropIndex(
                name: "IX_inventory_transactions_InventoryReceiptId",
                table: "inventory_transactions");

            migrationBuilder.DropIndex(
                name: "IX_inventory_transactions_OrderId",
                table: "inventory_transactions");

            migrationBuilder.DropIndex(
                name: "IX_debt_transactions_InventoryReceiptId",
                table: "debt_transactions");

            migrationBuilder.DropIndex(
                name: "IX_cash_transactions_InventoryReceiptId",
                table: "cash_transactions");

            migrationBuilder.DropIndex(
                name: "IX_cash_transactions_OrderId",
                table: "cash_transactions");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "products");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "InventoryReceiptId",
                table: "inventory_transactions");

            migrationBuilder.DropColumn(
                name: "OrderId",
                table: "inventory_transactions");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "inventory_transactions");

            migrationBuilder.DropColumn(
                name: "ApprovalStatus",
                table: "inventory_receipts");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "inventory_receipts");

            migrationBuilder.DropColumn(
                name: "InventoryReceiptId",
                table: "debt_transactions");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "debt_transactions");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "ApprovalStatus",
                table: "cash_transactions");

            migrationBuilder.DropColumn(
                name: "InventoryReceiptId",
                table: "cash_transactions");

            migrationBuilder.DropColumn(
                name: "OrderId",
                table: "cash_transactions");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "cash_transactions");

            migrationBuilder.CreateTable(
                name: "accounting_entries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    AccountCategory = table.Column<string>(type: "text", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(15,2)", precision: 15, scale: 2, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    DocumentRefId = table.Column<string>(type: "text", nullable: true),
                    DocumentType = table.Column<string>(type: "text", nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_accounting_entries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_accounting_entries_tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_accounting_entries_TenantId",
                table: "accounting_entries",
                column: "TenantId");
        }
    }
}
