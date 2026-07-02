using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BizFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Phase4_7_RemoveGhostColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop ghost indexes
            migrationBuilder.DropIndex(name: "IX_inventory_transactions_CreatorId", table: "inventory_transactions");
            migrationBuilder.DropIndex(name: "IX_orders_CreatorId", table: "orders");

            // Drop ghost foreign keys
            migrationBuilder.DropForeignKey(name: "FK_inventory_transactions_users_CreatorId", table: "inventory_transactions");
            migrationBuilder.DropForeignKey(name: "FK_orders_users_CreatorId", table: "orders");

            // users
            migrationBuilder.DropColumn(name: "BankAccountNumber", table: "users");
            migrationBuilder.DropColumn(name: "BankName", table: "users");
            migrationBuilder.DropColumn(name: "BasicSalary", table: "users");
            migrationBuilder.DropColumn(name: "DateOfBirth", table: "users");
            migrationBuilder.DropColumn(name: "HealthInsuranceNo", table: "users");
            migrationBuilder.DropColumn(name: "IdentityCard", table: "users");
            migrationBuilder.DropColumn(name: "JoinDate", table: "users");
            migrationBuilder.DropColumn(name: "NumberOfDependents", table: "users");
            migrationBuilder.DropColumn(name: "PersonalTaxCode", table: "users");
            migrationBuilder.DropColumn(name: "SocialInsuranceNo", table: "users");

            // inventory_transactions
            migrationBuilder.DropColumn(name: "CreatorId", table: "inventory_transactions");

            // orders
            migrationBuilder.DropColumn(name: "CreatorId", table: "orders");
            migrationBuilder.DropColumn(name: "OrderCode", table: "orders");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // users
            migrationBuilder.AddColumn<string>(name: "BankAccountNumber", table: "users", type: "text", nullable: true);
            migrationBuilder.AddColumn<string>(name: "BankName", table: "users", type: "text", nullable: true);
            migrationBuilder.AddColumn<decimal>(name: "BasicSalary", table: "users", type: "numeric(15,2)", nullable: true);
            migrationBuilder.AddColumn<DateTime>(name: "DateOfBirth", table: "users", type: "timestamp with time zone", nullable: true);
            migrationBuilder.AddColumn<string>(name: "HealthInsuranceNo", table: "users", type: "text", nullable: true);
            migrationBuilder.AddColumn<string>(name: "IdentityCard", table: "users", type: "text", nullable: true);
            migrationBuilder.AddColumn<DateTime>(name: "JoinDate", table: "users", type: "timestamp with time zone", nullable: true);
            migrationBuilder.AddColumn<int>(name: "NumberOfDependents", table: "users", type: "integer", nullable: true);
            migrationBuilder.AddColumn<string>(name: "PersonalTaxCode", table: "users", type: "text", nullable: true);
            migrationBuilder.AddColumn<string>(name: "SocialInsuranceNo", table: "users", type: "text", nullable: true);

            // inventory_transactions
            migrationBuilder.AddColumn<Guid>(name: "CreatorId", table: "inventory_transactions", type: "uuid", nullable: true);

            // orders
            migrationBuilder.AddColumn<Guid>(name: "CreatorId", table: "orders", type: "uuid", nullable: true);
            migrationBuilder.AddColumn<string>(name: "OrderCode", table: "orders", type: "text", nullable: true);

            // Restore foreign keys
            migrationBuilder.AddForeignKey(
                name: "FK_inventory_transactions_users_CreatorId",
                table: "inventory_transactions",
                column: "CreatorId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_orders_users_CreatorId",
                table: "orders",
                column: "CreatorId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);

            // Restore indexes
            migrationBuilder.CreateIndex(
                name: "IX_inventory_transactions_CreatorId",
                table: "inventory_transactions",
                column: "CreatorId");

            migrationBuilder.CreateIndex(
                name: "IX_orders_CreatorId",
                table: "orders",
                column: "CreatorId");
        }
    }
}
