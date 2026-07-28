using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BizFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RefactorTaxLedger : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // migrationBuilder.DropTable(
            //     name: "tax_obligations");

            // migrationBuilder.DropColumn(
            //     name: "RefreshToken",
            //     table: "users");

            // migrationBuilder.DropColumn(
            //     name: "RefreshTokenExpiryTime",
            //     table: "users");

            migrationBuilder.AlterColumn<string>(
                name: "PaymentMethod",
                table: "cash_transactions",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text",
                oldDefaultValue: "Cash");

            migrationBuilder.CreateTable(
                name: "tax_ledger_entries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    TaxType = table.Column<string>(type: "text", nullable: false),
                    EntryType = table.Column<string>(type: "text", nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    Month = table.Column<int>(type: "integer", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(15,2)", precision: 15, scale: 2, nullable: false),
                    ReferenceTransactionId = table.Column<Guid>(type: "uuid", nullable: true),
                    LinkedEntryId = table.Column<Guid>(type: "uuid", nullable: true),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Note = table.Column<string>(type: "text", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tax_ledger_entries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tax_ledger_entries_tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_tax_ledger_entries_TenantId",
                table: "tax_ledger_entries",
                column: "TenantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tax_ledger_entries");

            migrationBuilder.AddColumn<string>(
                name: "RefreshToken",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RefreshTokenExpiryTime",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PaymentMethod",
                table: "cash_transactions",
                type: "text",
                nullable: false,
                defaultValue: "Cash",
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateTable(
                name: "tax_obligations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    AmountDue = table.Column<decimal>(type: "numeric(15,2)", precision: 15, scale: 2, nullable: false),
                    AmountPaid = table.Column<decimal>(type: "numeric(15,2)", precision: 15, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Month = table.Column<int>(type: "integer", nullable: false),
                    Note = table.Column<string>(type: "text", nullable: true),
                    TaxType = table.Column<string>(type: "text", nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tax_obligations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tax_obligations_tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_tax_obligations_TenantId",
                table: "tax_obligations",
                column: "TenantId");
        }
    }
}
