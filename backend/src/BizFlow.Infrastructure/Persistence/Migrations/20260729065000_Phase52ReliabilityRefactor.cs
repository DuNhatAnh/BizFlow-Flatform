using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BizFlow.Infrastructure.Persistence.Migrations
{
    public partial class Phase52ReliabilityRefactor : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // IdempotentRequests
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
            migrationBuilder.CreateIndex(
                name: "IX_IdempotentRequests_IdempotencyKey",
                table: "IdempotentRequests",
                column: "IdempotencyKey",
                unique: true);

            // NumberSequences
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
                name: "IX_NumberSequences_TenantId_Prefix",
                table: "NumberSequences",
                columns: new[] { "TenantId", "Prefix" },
                unique: true);

            // Add RowVersions
            migrationBuilder.AddColumn<byte[]>(name: "RowVersion", table: "CashTransactions", type: "bytea", rowVersion: true, nullable: true);
            migrationBuilder.AddColumn<byte[]>(name: "RowVersion", table: "DebtTransactions", type: "bytea", rowVersion: true, nullable: true);
            migrationBuilder.AddColumn<byte[]>(name: "RowVersion", table: "InventoryTransactions", type: "bytea", rowVersion: true, nullable: true);
            migrationBuilder.AddColumn<byte[]>(name: "RowVersion", table: "InventoryReceipts", type: "bytea", rowVersion: true, nullable: true);
            migrationBuilder.AddColumn<byte[]>(name: "RowVersion", table: "Orders", type: "bytea", rowVersion: true, nullable: true);
            migrationBuilder.AddColumn<byte[]>(name: "RowVersion", table: "Products", type: "bytea", rowVersion: true, nullable: true);
            migrationBuilder.AddColumn<byte[]>(name: "RowVersion", table: "Customers", type: "bytea", rowVersion: true, nullable: true);

            // Add Traceability FKs
            migrationBuilder.AddColumn<Guid>(name: "OrderId", table: "CashTransactions", type: "uuid", nullable: true);
            migrationBuilder.AddColumn<Guid>(name: "InventoryReceiptId", table: "CashTransactions", type: "uuid", nullable: true);
            migrationBuilder.AddColumn<Guid>(name: "InventoryReceiptId", table: "DebtTransactions", type: "uuid", nullable: true);
            migrationBuilder.AddColumn<Guid>(name: "OrderId", table: "InventoryTransactions", type: "uuid", nullable: true);
            migrationBuilder.AddColumn<Guid>(name: "InventoryReceiptId", table: "InventoryTransactions", type: "uuid", nullable: true);
            
            // FK Constraints
            migrationBuilder.AddForeignKey(
                name: "FK_CashTransactions_Orders_OrderId",
                table: "CashTransactions",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "Id");
            migrationBuilder.AddForeignKey(
                name: "FK_CashTransactions_InventoryReceipts_InventoryReceiptId",
                table: "CashTransactions",
                column: "InventoryReceiptId",
                principalTable: "InventoryReceipts",
                principalColumn: "Id");
            migrationBuilder.AddForeignKey(
                name: "FK_DebtTransactions_InventoryReceipts_InventoryReceiptId",
                table: "DebtTransactions",
                column: "InventoryReceiptId",
                principalTable: "InventoryReceipts",
                principalColumn: "Id");
            migrationBuilder.AddForeignKey(
                name: "FK_InventoryTransactions_Orders_OrderId",
                table: "InventoryTransactions",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "Id");
            migrationBuilder.AddForeignKey(
                name: "FK_InventoryTransactions_InventoryReceipts_InventoryReceiptId",
                table: "InventoryTransactions",
                column: "InventoryReceiptId",
                principalTable: "InventoryReceipts",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "IdempotentRequests");
            migrationBuilder.DropTable(name: "NumberSequences");

            migrationBuilder.DropForeignKey(name: "FK_CashTransactions_Orders_OrderId", table: "CashTransactions");
            migrationBuilder.DropForeignKey(name: "FK_CashTransactions_InventoryReceipts_InventoryReceiptId", table: "CashTransactions");
            migrationBuilder.DropForeignKey(name: "FK_DebtTransactions_InventoryReceipts_InventoryReceiptId", table: "DebtTransactions");
            migrationBuilder.DropForeignKey(name: "FK_InventoryTransactions_Orders_OrderId", table: "InventoryTransactions");
            migrationBuilder.DropForeignKey(name: "FK_InventoryTransactions_InventoryReceipts_InventoryReceiptId", table: "InventoryTransactions");

            migrationBuilder.DropColumn(name: "OrderId", table: "CashTransactions");
            migrationBuilder.DropColumn(name: "InventoryReceiptId", table: "CashTransactions");
            migrationBuilder.DropColumn(name: "InventoryReceiptId", table: "DebtTransactions");
            migrationBuilder.DropColumn(name: "OrderId", table: "InventoryTransactions");
            migrationBuilder.DropColumn(name: "InventoryReceiptId", table: "InventoryTransactions");

            migrationBuilder.DropColumn(name: "RowVersion", table: "CashTransactions");
            migrationBuilder.DropColumn(name: "RowVersion", table: "DebtTransactions");
            migrationBuilder.DropColumn(name: "RowVersion", table: "InventoryTransactions");
            migrationBuilder.DropColumn(name: "RowVersion", table: "InventoryReceipts");
            migrationBuilder.DropColumn(name: "RowVersion", table: "Orders");
            migrationBuilder.DropColumn(name: "RowVersion", table: "Products");
            migrationBuilder.DropColumn(name: "RowVersion", table: "Customers");
        }
    }
}
