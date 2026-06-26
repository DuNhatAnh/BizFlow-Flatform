using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BizFlow.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_inventory_transactions_users_CreatorId",
                table: "inventory_transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_orders_users_CreatorId",
                table: "orders");

            migrationBuilder.DropIndex(
                name: "IX_orders_CreatorId",
                table: "orders");

            migrationBuilder.DropIndex(
                name: "IX_inventory_transactions_CreatorId",
                table: "inventory_transactions");

            migrationBuilder.DropColumn(
                name: "CreatorId",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "CreatorId",
                table: "inventory_transactions");

            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PriceType",
                table: "inventory_transactions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "UnitPrice",
                table: "inventory_transactions",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "DebtLimit",
                table: "customers",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Color",
                table: "categories",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ParentId",
                table: "categories",
                type: "integer",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "categories",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Color", "ParentId" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "categories",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Color", "ParentId" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "categories",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Color", "ParentId" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "categories",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Color", "ParentId" },
                values: new object[] { null, null });

            migrationBuilder.CreateIndex(
                name: "IX_orders_CreatedBy",
                table: "orders",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_transactions_CreatedBy",
                table: "inventory_transactions",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_categories_ParentId",
                table: "categories",
                column: "ParentId");

            migrationBuilder.AddForeignKey(
                name: "FK_categories_categories_ParentId",
                table: "categories",
                column: "ParentId",
                principalTable: "categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_inventory_transactions_users_CreatedBy",
                table: "inventory_transactions",
                column: "CreatedBy",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_orders_users_CreatedBy",
                table: "orders",
                column: "CreatedBy",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_categories_categories_ParentId",
                table: "categories");

            migrationBuilder.DropForeignKey(
                name: "FK_inventory_transactions_users_CreatedBy",
                table: "inventory_transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_orders_users_CreatedBy",
                table: "orders");

            migrationBuilder.DropIndex(
                name: "IX_orders_CreatedBy",
                table: "orders");

            migrationBuilder.DropIndex(
                name: "IX_inventory_transactions_CreatedBy",
                table: "inventory_transactions");

            migrationBuilder.DropIndex(
                name: "IX_categories_ParentId",
                table: "categories");

            migrationBuilder.DropColumn(
                name: "Code",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "PriceType",
                table: "inventory_transactions");

            migrationBuilder.DropColumn(
                name: "UnitPrice",
                table: "inventory_transactions");

            migrationBuilder.DropColumn(
                name: "DebtLimit",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "Color",
                table: "categories");

            migrationBuilder.DropColumn(
                name: "ParentId",
                table: "categories");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatorId",
                table: "orders",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatorId",
                table: "inventory_transactions",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_orders_CreatorId",
                table: "orders",
                column: "CreatorId");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_transactions_CreatorId",
                table: "inventory_transactions",
                column: "CreatorId");

            migrationBuilder.AddForeignKey(
                name: "FK_inventory_transactions_users_CreatorId",
                table: "inventory_transactions",
                column: "CreatorId",
                principalTable: "users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_orders_users_CreatorId",
                table: "orders",
                column: "CreatorId",
                principalTable: "users",
                principalColumn: "Id");
        }
    }
}
