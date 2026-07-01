using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BizFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantPendingSubscription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PendingSubscriptionPlanId",
                table: "tenants",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_tenants_PendingSubscriptionPlanId",
                table: "tenants",
                column: "PendingSubscriptionPlanId");

            migrationBuilder.AddForeignKey(
                name: "FK_tenants_subscription_plans_PendingSubscriptionPlanId",
                table: "tenants",
                column: "PendingSubscriptionPlanId",
                principalTable: "subscription_plans",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tenants_subscription_plans_PendingSubscriptionPlanId",
                table: "tenants");

            migrationBuilder.DropIndex(
                name: "IX_tenants_PendingSubscriptionPlanId",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "PendingSubscriptionPlanId",
                table: "tenants");
        }
    }
}
