using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BizFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Phase3_RefactorHRFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.CreateTable(
                name: "employee_profiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IdentityCard = table.Column<string>(type: "text", nullable: true),
                    DateOfBirth = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    JoinDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SocialInsuranceNo = table.Column<string>(type: "text", nullable: true),
                    HealthInsuranceNo = table.Column<string>(type: "text", nullable: true),
                    PersonalTaxCode = table.Column<string>(type: "text", nullable: true),
                    BasicSalary = table.Column<decimal>(type: "numeric(15,2)", precision: 15, scale: 2, nullable: true),
                    BankAccountNumber = table.Column<string>(type: "text", nullable: true),
                    BankName = table.Column<string>(type: "text", nullable: true),
                    NumberOfDependents = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employee_profiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_employee_profiles_users_Id",
                        column: x => x.Id,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.Sql(@"
    -- Bước 1: Migrate ALL data & Tôn trọng Historical Audit (CreatedAt)
    INSERT INTO employee_profiles (
        ""Id"", ""IdentityCard"", ""DateOfBirth"", ""JoinDate"",
        ""SocialInsuranceNo"", ""HealthInsuranceNo"", ""PersonalTaxCode"", ""BasicSalary"",
        ""BankAccountNumber"", ""BankName"", ""NumberOfDependents"", ""CreatedAt""
    )
    SELECT 
        ""Id"", ""IdentityCard"", ""DateOfBirth"", ""JoinDate"",
        ""SocialInsuranceNo"", ""HealthInsuranceNo"", ""PersonalTaxCode"", ""BasicSalary"",
        ""BankAccountNumber"", ""BankName"", ""NumberOfDependents"", ""CreatedAt""
    FROM users
    ON CONFLICT (""Id"") DO NOTHING;

    -- Bước 2: PK-Level Verification bằng PL/pgSQL
    DO $$
    DECLARE
        missing_count INT;
        mismatch_salary_count INT;
        mismatch_idcard_count INT;
        mismatch_taxcode_count INT;
    BEGIN
        SELECT COUNT(*)
        INTO missing_count
        FROM users u
        LEFT JOIN employee_profiles ep ON ep.""Id"" = u.""Id""
        WHERE ep.""Id"" IS NULL;

        IF missing_count > 0 THEN
            RAISE EXCEPTION
            'MIGRATION FAILED: % users missing employee profile rows',
            missing_count;
        END IF;

        SELECT COUNT(*)
        INTO mismatch_salary_count
        FROM users u
        JOIN employee_profiles ep ON ep.""Id"" = u.""Id""
        WHERE u.""BasicSalary"" IS DISTINCT FROM ep.""BasicSalary"";

        IF mismatch_salary_count > 0 THEN
            RAISE EXCEPTION
            'MIGRATION FAILED: % users have mismatched BasicSalary',
            mismatch_salary_count;
        END IF;

        SELECT COUNT(*)
        INTO mismatch_idcard_count
        FROM users u
        JOIN employee_profiles ep ON ep.""Id"" = u.""Id""
        WHERE u.""IdentityCard"" IS DISTINCT FROM ep.""IdentityCard"";

        IF mismatch_idcard_count > 0 THEN
            RAISE EXCEPTION
            'MIGRATION FAILED: % users have mismatched IdentityCard',
            mismatch_idcard_count;
        END IF;

        SELECT COUNT(*)
        INTO mismatch_taxcode_count
        FROM users u
        JOIN employee_profiles ep ON ep.""Id"" = u.""Id""
        WHERE u.""PersonalTaxCode"" IS DISTINCT FROM ep.""PersonalTaxCode"";

        IF mismatch_taxcode_count > 0 THEN
            RAISE EXCEPTION
            'MIGRATION FAILED: % users have mismatched PersonalTaxCode',
            mismatch_taxcode_count;
        END IF;
    END $$;
");

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
                name: "DateOfBirth",
                table: "users");

            migrationBuilder.DropColumn(
                name: "HealthInsuranceNo",
                table: "users");

            migrationBuilder.DropColumn(
                name: "IdentityCard",
                table: "users");

            migrationBuilder.DropColumn(
                name: "JoinDate",
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
                type: "numeric(15,2)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HealthInsuranceNo",
                table: "users",
                type: "text",
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

            migrationBuilder.Sql(@"
                UPDATE users u
                SET 
                    ""IdentityCard"" = p.""IdentityCard"",
                    ""DateOfBirth"" = p.""DateOfBirth"",
                    ""JoinDate"" = p.""JoinDate"",
                    ""SocialInsuranceNo"" = p.""SocialInsuranceNo"",
                    ""HealthInsuranceNo"" = p.""HealthInsuranceNo"",
                    ""PersonalTaxCode"" = p.""PersonalTaxCode"",
                    ""BasicSalary"" = p.""BasicSalary"",
                    ""BankAccountNumber"" = p.""BankAccountNumber"",
                    ""BankName"" = p.""BankName"",
                    ""NumberOfDependents"" = p.""NumberOfDependents""
                FROM employee_profiles p
                WHERE u.""Id"" = p.""Id"";
            ");

            migrationBuilder.DropTable(
                name: "employee_profiles");
        }
    }
}
