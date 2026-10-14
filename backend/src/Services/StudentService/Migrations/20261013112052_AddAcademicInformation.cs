using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentService.Migrations
{
    /// <inheritdoc />
    public partial class AddAcademicInformation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AcademicInformation",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    StudentId = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TenthBoard = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TenthSchool = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TenthYear = table.Column<int>(type: "int", nullable: false),
                    TenthPercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    TwelfthBoard = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TwelfthCollege = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    TwelfthYear = table.Column<int>(type: "int", nullable: true),
                    TwelfthPercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    DiplomaCollege = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DiplomaBranch = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DiplomaYear = table.Column<int>(type: "int", nullable: true),
                    DiplomaPercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AcademicInformation", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AcademicInformation_StudentId",
                table: "AcademicInformation",
                column: "StudentId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AcademicInformation_UserId",
                table: "AcademicInformation",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AcademicInformation");
        }
    }
}
