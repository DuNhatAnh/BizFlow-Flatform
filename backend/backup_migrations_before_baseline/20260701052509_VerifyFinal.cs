using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BizFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class VerifyFinal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "stores",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"));

            migrationBuilder.DeleteData(
                table: "users",
                keyColumn: "Id",
                keyValue: new Guid("aaaabbbb-cccc-dddd-eeee-111122223333"));

            migrationBuilder.DeleteData(
                table: "users",
                keyColumn: "Id",
                keyValue: new Guid("aaaabbbb-cccc-dddd-eeee-444455556666"));

            migrationBuilder.DeleteData(
                table: "users",
                keyColumn: "Id",
                keyValue: new Guid("aaaabbbb-cccc-dddd-eeee-777788889999"));

            migrationBuilder.DeleteData(
                table: "tenants",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "tenants",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"));

            migrationBuilder.DeleteData(
                table: "subscription_plans",
                keyColumn: "Id",
                keyValue: 1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "subscription_plans",
                columns: new[] { "Id", "CreatedAt", "Description", "DurationMonths", "Name", "Price" },
                values: new object[] { 1, new DateTime(2026, 6, 11, 0, 0, 0, 0, DateTimeKind.Utc), "Đầy đủ các chức năng quản lý, báo cáo thuế TT88 và Trợ lý AI", 12, "Gói Chuyên Nghiệp", 500000.00m });

            migrationBuilder.InsertData(
                table: "tenants",
                columns: new[] { "Id", "Address", "CreatedAt", "IsActive", "Name", "OwnerName", "Phone", "SubscriptionPlanId", "TaxCode" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000001"), null, new DateTime(2026, 6, 11, 0, 0, 0, 0, DateTimeKind.Utc), true, "BizFlow System Tenant", "System Admin", null, null, null },
                    { new Guid("11111111-1111-1111-1111-111111111111"), null, new DateTime(2026, 6, 11, 0, 0, 0, 0, DateTimeKind.Utc), true, "Cửa Hàng Tạp Hóa Bình Minh", "Nguyễn Văn A", null, 1, null }
                });

            migrationBuilder.InsertData(
                table: "users",
                columns: new[] { "Id", "AvatarUrl", "BankAccountNumber", "BankName", "BasicSalary", "CreatedAt", "DateOfBirth", "Fullname", "HealthInsuranceNo", "IdentityCard", "IsActive", "JoinDate", "NumberOfDependents", "PasswordHash", "PersonalTaxCode", "Phone", "Role", "SocialInsuranceNo", "TenantId", "Username" },
                values: new object[] { new Guid("aaaabbbb-cccc-dddd-eeee-111122223333"), null, null, null, null, new DateTime(2026, 6, 11, 0, 0, 0, 0, DateTimeKind.Utc), null, "Quản Trị Viên Hệ Thống", null, null, true, null, null, "admin123", null, null, "Admin", null, new Guid("00000000-0000-0000-0000-000000000001"), "admin@bizflow.com" });

            migrationBuilder.InsertData(
                table: "stores",
                columns: new[] { "Id", "Address", "AvailableVatRates", "CreatedAt", "DefaultVatRate", "Email", "IsActive", "LogoUrl", "Name", "Phone", "TaxCode", "TenantId" },
                values: new object[] { new Guid("22222222-2222-2222-2222-222222222222"), "123 Đường Số 1, Quận 1, TP.HCM", "0,5,8,8.5,10,KCT", new DateTime(2026, 6, 11, 0, 0, 0, 0, DateTimeKind.Utc), "10", null, true, null, "Cửa Hàng Tạp Hóa Bình Minh (CN1)", "0901234567", null, new Guid("11111111-1111-1111-1111-111111111111") });

            migrationBuilder.InsertData(
                table: "users",
                columns: new[] { "Id", "AvatarUrl", "BankAccountNumber", "BankName", "BasicSalary", "CreatedAt", "DateOfBirth", "Fullname", "HealthInsuranceNo", "IdentityCard", "IsActive", "JoinDate", "NumberOfDependents", "PasswordHash", "PersonalTaxCode", "Phone", "Role", "SocialInsuranceNo", "TenantId", "Username" },
                values: new object[,]
                {
                    { new Guid("aaaabbbb-cccc-dddd-eeee-444455556666"), null, null, null, null, new DateTime(2026, 6, 11, 0, 0, 0, 0, DateTimeKind.Utc), null, "Nguyễn Văn A", null, null, true, null, null, "owner123", null, null, "Owner", null, new Guid("11111111-1111-1111-1111-111111111111"), "owner@bizflow.com" },
                    { new Guid("aaaabbbb-cccc-dddd-eeee-777788889999"), null, null, null, null, new DateTime(2026, 6, 11, 0, 0, 0, 0, DateTimeKind.Utc), null, "Trần Thị B", null, null, true, null, null, "employee123", null, null, "Employee", null, new Guid("11111111-1111-1111-1111-111111111111"), "employee@bizflow.com" }
                });
        }
    }
}
