using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BizFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SeedSubscriptionPlans_v3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "subscription_plans",
                columns: new[] { "Id", "CreatedAt", "Description", "DurationMonths", "Features", "MaxOrdersPerMonth", "Name", "Price" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Đầy đủ các chức năng quản lý, báo cáo thuế TT88 và Trợ lý AI", 1, "[\"pos\",\"inventory\",\"reports\",\"ai\",\"tt88\",\"multi_store\"]", null, "Gói Chuyên Nghiệp", 500000.00m },
                    { 2, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Quản lý bán hàng cơ bản, tối đa 50 đơn/tháng. Không bao gồm báo cáo thuế TT88 và Trợ lý AI.", 0, "[\"pos\",\"inventory\"]", 50, "Gói Miễn Phí", 0m },
                    { 3, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Quản lý bán hàng nâng cao, tối đa 300 đơn/tháng. Bao gồm báo cáo doanh thu và theo dõi công nợ. Chưa bao gồm Trợ lý AI và báo cáo thuế TT88.", 1, "[\"pos\",\"inventory\",\"reports\",\"debt_tracking\"]", 300, "Gói Cơ Bản", 150000.00m }
                });

            // Legacy SafeSql data migrations
            migrationBuilder.Sql("UPDATE users SET \"Role\" = 'Employee' WHERE \"Role\" = 'Cashier';");
            migrationBuilder.Sql("UPDATE tenants SET \"SubscriptionPlanId\" = 2 WHERE \"SubscriptionPlanId\" IS NULL AND \"Name\" != 'BizFlow System Tenant';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_employee_profiles_users_Id",
                table: "employee_profiles");

            migrationBuilder.DeleteData(
                table: "subscription_plans",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "subscription_plans",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "subscription_plans",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "employee_profiles",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "employee_profiles",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_employee_profiles_TenantId",
                table: "employee_profiles",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_employee_profiles_UserId",
                table: "employee_profiles",
                column: "UserId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_employee_profiles_tenants_TenantId",
                table: "employee_profiles",
                column: "TenantId",
                principalTable: "tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_employee_profiles_users_UserId",
                table: "employee_profiles",
                column: "UserId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
