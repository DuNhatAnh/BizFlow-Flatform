using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BizFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingTenantIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_users_TenantId_Username",
                table: "users");

            migrationBuilder.DropIndex(
                name: "IX_accounting_ledger_s2_TenantId",
                table: "accounting_ledger_s2");

            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankAccountNumber",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankName",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "BasicSalary",
                table: "users",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HealthInsuranceNo",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NumberOfDependents",
                table: "users",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PersonalTaxCode",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SocialInsuranceNo",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "PriceIncludesVat",
                table: "products",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "VatRate",
                table: "products",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CustomerName",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RawTranscript",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalVatAmount",
                table: "orders",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "VatAmount",
                table: "order_items",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "VatRate",
                table: "order_items",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalVatAmount",
                table: "inventory_receipts",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "VatAmount",
                table: "inventory_receipt_details",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "VatRate",
                table: "inventory_receipt_details",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "cash_transactions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AttachedDocuments",
                table: "cash_transactions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TransactionCode",
                table: "cash_transactions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "stores",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Address = table.Column<string>(type: "text", nullable: true),
                    Phone = table.Column<string>(type: "text", nullable: true),
                    TaxCode = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    LogoUrl = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EnableVat = table.Column<bool>(type: "boolean", nullable: false),
                    DefaultVatRate = table.Column<string>(type: "text", nullable: false),
                    AvailableVatRates = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_stores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_stores_tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "stores",
                columns: new[] { "Id", "Address", "AvailableVatRates", "CreatedAt", "DefaultVatRate", "Email", "EnableVat", "IsActive", "LogoUrl", "Name", "Phone", "TaxCode", "TenantId" },
                values: new object[] { new Guid("22222222-2222-2222-2222-222222222222"), "123 Đường Số 1, Quận 1, TP.HCM", "0,5,8,8.5,10,KCT", new DateTime(2026, 6, 11, 0, 0, 0, 0, DateTimeKind.Utc), "10", null, false, true, null, "Cửa Hàng Tạp Hóa Bình Minh (CN1)", "0901234567", null, new Guid("11111111-1111-1111-1111-111111111111") });

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: new Guid("aaaabbbb-cccc-dddd-eeee-111122223333"),
                columns: new[] { "AvatarUrl", "BankAccountNumber", "BankName", "BasicSalary", "HealthInsuranceNo", "NumberOfDependents", "PersonalTaxCode", "SocialInsuranceNo" },
                values: new object[] { null, null, null, null, null, null, null, null });

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: new Guid("aaaabbbb-cccc-dddd-eeee-444455556666"),
                columns: new[] { "AvatarUrl", "BankAccountNumber", "BankName", "BasicSalary", "HealthInsuranceNo", "NumberOfDependents", "PersonalTaxCode", "SocialInsuranceNo" },
                values: new object[] { null, null, null, null, null, null, null, null });

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: new Guid("aaaabbbb-cccc-dddd-eeee-777788889999"),
                columns: new[] { "AvatarUrl", "BankAccountNumber", "BankName", "BasicSalary", "HealthInsuranceNo", "NumberOfDependents", "PersonalTaxCode", "SocialInsuranceNo" },
                values: new object[] { null, null, null, null, null, null, null, null });

            migrationBuilder.CreateIndex(
                name: "IX_users_TenantId",
                table: "users",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_users_Username",
                table: "users",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_accounting_ledger_s2_TenantId_ProductId_Date",
                table: "accounting_ledger_s2",
                columns: new[] { "TenantId", "ProductId", "Date" },
                descending: new[] { false, false, true });

            migrationBuilder.CreateIndex(
                name: "IX_stores_TenantId",
                table: "stores",
                column: "TenantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "stores");

            migrationBuilder.DropIndex(
                name: "IX_users_TenantId",
                table: "users");

            migrationBuilder.DropIndex(
                name: "IX_users_Username",
                table: "users");

            migrationBuilder.DropIndex(
                name: "IX_accounting_ledger_s2_TenantId_ProductId_Date",
                table: "accounting_ledger_s2");

            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "users");

            migrationBuilder.DropColumn(
                name: "BankAccountNumber",
                table: "users");

            migrationBuilder.DropColumn(
                name: "BankName",
                table: "users");

            migrationBuilder.DropColumn(
                name: "BasicSalary",
                table: "users");

            migrationBuilder.DropColumn(
                name: "HealthInsuranceNo",
                table: "users");

            migrationBuilder.DropColumn(
                name: "NumberOfDependents",
                table: "users");

            migrationBuilder.DropColumn(
                name: "PersonalTaxCode",
                table: "users");

            migrationBuilder.DropColumn(
                name: "SocialInsuranceNo",
                table: "users");

            migrationBuilder.DropColumn(
                name: "PriceIncludesVat",
                table: "products");

            migrationBuilder.DropColumn(
                name: "VatRate",
                table: "products");

            migrationBuilder.DropColumn(
                name: "CustomerName",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "RawTranscript",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "TotalVatAmount",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "VatAmount",
                table: "order_items");

            migrationBuilder.DropColumn(
                name: "VatRate",
                table: "order_items");

            migrationBuilder.DropColumn(
                name: "TotalVatAmount",
                table: "inventory_receipts");

            migrationBuilder.DropColumn(
                name: "VatAmount",
                table: "inventory_receipt_details");

            migrationBuilder.DropColumn(
                name: "VatRate",
                table: "inventory_receipt_details");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "cash_transactions");

            migrationBuilder.DropColumn(
                name: "AttachedDocuments",
                table: "cash_transactions");

            migrationBuilder.DropColumn(
                name: "TransactionCode",
                table: "cash_transactions");

            migrationBuilder.CreateIndex(
                name: "IX_users_TenantId_Username",
                table: "users",
                columns: new[] { "TenantId", "Username" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_accounting_ledger_s2_TenantId",
                table: "accounting_ledger_s2",
                column: "TenantId");
        }
    }
}
