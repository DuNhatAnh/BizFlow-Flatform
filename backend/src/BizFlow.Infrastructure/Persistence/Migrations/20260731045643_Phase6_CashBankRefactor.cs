using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BizFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Phase6_CashBankRefactor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PaymentMethod",
                table: "payroll_records",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PaymentMethod",
                table: "expense_records",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "BankAccountId",
                table: "cash_transactions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ExpenseRecordId",
                table: "cash_transactions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "PayrollRecordId",
                table: "cash_transactions",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BankAccounts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    BankName = table.Column<string>(type: "text", nullable: false),
                    BranchName = table.Column<string>(type: "text", nullable: false),
                    AccountNumber = table.Column<string>(type: "text", nullable: false),
                    AccountHolder = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "bytea", rowVersion: true, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BankAccounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BankAccounts_tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_cash_transactions_BankAccountId",
                table: "cash_transactions",
                column: "BankAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_cash_transactions_ExpenseRecordId",
                table: "cash_transactions",
                column: "ExpenseRecordId");

            migrationBuilder.CreateIndex(
                name: "IX_cash_transactions_PayrollRecordId",
                table: "cash_transactions",
                column: "PayrollRecordId");

            migrationBuilder.CreateIndex(
                name: "IX_BankAccounts_TenantId",
                table: "BankAccounts",
                column: "TenantId");

            migrationBuilder.AddForeignKey(
                name: "FK_cash_transactions_BankAccounts_BankAccountId",
                table: "cash_transactions",
                column: "BankAccountId",
                principalTable: "BankAccounts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_cash_transactions_expense_records_ExpenseRecordId",
                table: "cash_transactions",
                column: "ExpenseRecordId",
                principalTable: "expense_records",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_cash_transactions_payroll_records_PayrollRecordId",
                table: "cash_transactions",
                column: "PayrollRecordId",
                principalTable: "payroll_records",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_cash_transactions_BankAccounts_BankAccountId",
                table: "cash_transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_cash_transactions_expense_records_ExpenseRecordId",
                table: "cash_transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_cash_transactions_payroll_records_PayrollRecordId",
                table: "cash_transactions");

            migrationBuilder.DropTable(
                name: "BankAccounts");

            migrationBuilder.DropIndex(
                name: "IX_cash_transactions_BankAccountId",
                table: "cash_transactions");

            migrationBuilder.DropIndex(
                name: "IX_cash_transactions_ExpenseRecordId",
                table: "cash_transactions");

            migrationBuilder.DropIndex(
                name: "IX_cash_transactions_PayrollRecordId",
                table: "cash_transactions");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "payroll_records");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "expense_records");

            migrationBuilder.DropColumn(
                name: "BankAccountId",
                table: "cash_transactions");

            migrationBuilder.DropColumn(
                name: "ExpenseRecordId",
                table: "cash_transactions");

            migrationBuilder.DropColumn(
                name: "PayrollRecordId",
                table: "cash_transactions");
        }
    }
}
