using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BizFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptionPlanFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MaxOrdersPerMonth",
                table: "subscription_plans",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Features",
                table: "subscription_plans",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaxOrdersPerMonth",
                table: "subscription_plans");

            migrationBuilder.DropColumn(
                name: "Features",
                table: "subscription_plans");
        }
    }
}
