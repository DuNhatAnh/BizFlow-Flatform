using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BizFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_inventory_receipts_users_CreatorId",
                table: "inventory_receipts");

            migrationBuilder.DropIndex(
                name: "IX_inventory_receipts_CreatorId",
                table: "inventory_receipts");

            migrationBuilder.RenameColumn(
                name: "CreatorId",
                table: "inventory_receipts",
                newName: "CancelledBy");

            migrationBuilder.AddColumn<string>(
                name: "CancelReason",
                table: "inventory_receipts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CancelledAt",
                table: "inventory_receipts",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "inventory_receipts",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "audit_logs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    EntityName = table.Column<string>(type: "text", nullable: false),
                    EntityId = table.Column<string>(type: "text", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Details = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_audit_logs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_audit_logs_tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_audit_logs_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "categories",
                columns: new[] { "Id", "CreatedAt", "Name", "TenantId" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 6, 11, 0, 0, 0, 0, DateTimeKind.Utc), "Vật liệu xây dựng", new Guid("11111111-1111-1111-1111-111111111111") },
                    { 2, new DateTime(2026, 6, 11, 0, 0, 0, 0, DateTimeKind.Utc), "Thiết bị điện", new Guid("11111111-1111-1111-1111-111111111111") },
                    { 3, new DateTime(2026, 6, 11, 0, 0, 0, 0, DateTimeKind.Utc), "Nước giải khát", new Guid("11111111-1111-1111-1111-111111111111") },
                    { 4, new DateTime(2026, 6, 11, 0, 0, 0, 0, DateTimeKind.Utc), "Hàng tạp hóa", new Guid("11111111-1111-1111-1111-111111111111") }
                });

            migrationBuilder.InsertData(
                table: "products",
                columns: new[] { "Id", "BaseUnit", "CategoryId", "Code", "CreatedAt", "Description", "IsActive", "IsDeleted", "Name", "StockQuantity", "TenantId" },
                values: new object[,]
                {
                    { new Guid("6bb75e2c-b549-4434-b843-7d9cb89bb2a3"), "viên", 1, "GA-T4L", new DateTime(2026, 6, 19, 5, 59, 12, 924, DateTimeKind.Utc).AddTicks(2140), "", true, false, "Gạch ống Tuynel Đồng Nai 4 lỗ", 0m, new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("78f0cad1-8792-40e0-a79c-f55c9e990c66"), "Bao", 1, "XM-HT1", new DateTime(2026, 6, 19, 5, 19, 5, 430, DateTimeKind.Utc).AddTicks(8510), "Xi măng poóc lăng hỗn hợp, chuyên dùng cho xây tô và đổ bê tông.", true, false, "Xi măng Hà Tiên 1 Đa Dụng (Bao 50kg)", 0m, new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("a67eb1b6-3a63-46d4-96db-5a283026eab2"), "cây", 1, "SAT-P16-01", new DateTime(2026, 6, 19, 10, 15, 44, 91, DateTimeKind.Utc).AddTicks(2260), "", true, false, "Sắt thép phi 16", 0m, new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f1ac0cbc-ef2a-428f-810e-0cc86d5b435f"), "khối", 1, "CAT-XT", new DateTime(2026, 6, 19, 5, 41, 6, 467, DateTimeKind.Utc).AddTicks(3860), "Cát mịn, sạch không lẫn tạp chất, chuyên dùng để trát tường.", true, false, "Cát xây tô (Cát đen hạt nhỏ)", 0m, new Guid("11111111-1111-1111-1111-111111111111") }
                });

            migrationBuilder.InsertData(
                table: "product_units",
                columns: new[] { "Id", "ConversionRate", "IsDefault", "Price", "ProductId", "UnitName" },
                values: new object[,]
                {
                    { 1, 1.0000m, true, 85000.00m, new Guid("78f0cad1-8792-40e0-a79c-f55c9e990c66"), "bao" },
                    { 2, 20.0000m, false, 16500000.00m, new Guid("78f0cad1-8792-40e0-a79c-f55c9e990c66"), "tấn" },
                    { 3, 1.0000m, true, 320000.00m, new Guid("f1ac0cbc-ef2a-428f-810e-0cc86d5b435f"), "khối" },
                    { 4, 1.0000m, true, 1500.00m, new Guid("6bb75e2c-b549-4434-b843-7d9cb89bb2a3"), "viên" },
                    { 5, 1000.0000m, false, 1450000.00m, new Guid("6bb75e2c-b549-4434-b843-7d9cb89bb2a3"), "thiên" },
                    { 7, 1.0000m, true, 2450000.00m, new Guid("a67eb1b6-3a63-46d4-96db-5a283026eab2"), "cây" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_inventory_receipts_CreatedBy",
                table: "inventory_receipts",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_TenantId",
                table: "audit_logs",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_UserId",
                table: "audit_logs",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_inventory_receipts_users_CreatedBy",
                table: "inventory_receipts",
                column: "CreatedBy",
                principalTable: "users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_inventory_receipts_users_CreatedBy",
                table: "inventory_receipts");

            migrationBuilder.DropTable(
                name: "audit_logs");

            migrationBuilder.DropIndex(
                name: "IX_inventory_receipts_CreatedBy",
                table: "inventory_receipts");

            migrationBuilder.DeleteData(
                table: "categories",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "categories",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "categories",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "product_units",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "product_units",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "product_units",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "product_units",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "product_units",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "product_units",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "products",
                keyColumn: "Id",
                keyValue: new Guid("6bb75e2c-b549-4434-b843-7d9cb89bb2a3"));

            migrationBuilder.DeleteData(
                table: "products",
                keyColumn: "Id",
                keyValue: new Guid("78f0cad1-8792-40e0-a79c-f55c9e990c66"));

            migrationBuilder.DeleteData(
                table: "products",
                keyColumn: "Id",
                keyValue: new Guid("a67eb1b6-3a63-46d4-96db-5a283026eab2"));

            migrationBuilder.DeleteData(
                table: "products",
                keyColumn: "Id",
                keyValue: new Guid("f1ac0cbc-ef2a-428f-810e-0cc86d5b435f"));

            migrationBuilder.DeleteData(
                table: "categories",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DropColumn(
                name: "CancelReason",
                table: "inventory_receipts");

            migrationBuilder.DropColumn(
                name: "CancelledAt",
                table: "inventory_receipts");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "inventory_receipts");

            migrationBuilder.RenameColumn(
                name: "CancelledBy",
                table: "inventory_receipts",
                newName: "CreatorId");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_receipts_CreatorId",
                table: "inventory_receipts",
                column: "CreatorId");

            migrationBuilder.AddForeignKey(
                name: "FK_inventory_receipts_users_CreatorId",
                table: "inventory_receipts",
                column: "CreatorId",
                principalTable: "users",
                principalColumn: "Id");
        }
    }
}
