using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BizFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddUserHRFields_Migration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IdentityCard",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "JoinDate",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: new Guid("aaaabbbb-cccc-dddd-eeee-111122223333"),
                columns: new[] { "DateOfBirth", "IdentityCard", "JoinDate", "Phone" },
                values: new object[] { null, null, null, null });

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: new Guid("aaaabbbb-cccc-dddd-eeee-444455556666"),
                columns: new[] { "DateOfBirth", "IdentityCard", "JoinDate", "Phone" },
                values: new object[] { null, null, null, null });

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: new Guid("aaaabbbb-cccc-dddd-eeee-777788889999"),
                columns: new[] { "DateOfBirth", "IdentityCard", "JoinDate", "Phone" },
                values: new object[] { null, null, null, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "users");

            migrationBuilder.DropColumn(
                name: "IdentityCard",
                table: "users");

            migrationBuilder.DropColumn(
                name: "JoinDate",
                table: "users");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "users");
        }
    }
}
