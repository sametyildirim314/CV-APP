using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CVGenius_AI.Migrations
{
    /// <inheritdoc />
    public partial class InitialSqlServer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Kullanicilar",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Ad = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Soyad = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Rol = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    KayitTarihi = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Kullanicilar", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Cvler",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    KullaniciId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AdSoyad = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Unvan = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Telefon = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Adres = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Özet = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Yetenekler = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OlusturulmaTarihi = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cvler", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Cvler_Kullanicilar_KullaniciId",
                        column: x => x.KullaniciId,
                        principalTable: "Kullanicilar",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Deneyimler",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Pozisyon = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Sirket = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BaslangicTarihi = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BitisTarihi = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Aciklama = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CvEntityId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Deneyimler", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Deneyimler_Cvler_CvEntityId",
                        column: x => x.CvEntityId,
                        principalTable: "Cvler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Eğitimler",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OkulAdi = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Bolum = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BaşlangıcTarihi = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BitisTarihi = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Ortlama = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CvEntityId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Eğitimler", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Eğitimler_Cvler_CvEntityId",
                        column: x => x.CvEntityId,
                        principalTable: "Cvler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Projeler",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjeAdi = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Aciklama = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CvEntityId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projeler", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Projeler_Cvler_CvEntityId",
                        column: x => x.CvEntityId,
                        principalTable: "Cvler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Sertifikalar",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SertifikaAdi = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    VerenKurum = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AlisTarihi = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BitisTarihi = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Aciklama = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CvEntityId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sertifikalar", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Sertifikalar_Cvler_CvEntityId",
                        column: x => x.CvEntityId,
                        principalTable: "Cvler",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cvler_KullaniciId",
                table: "Cvler",
                column: "KullaniciId");

            migrationBuilder.CreateIndex(
                name: "IX_Deneyimler_CvEntityId",
                table: "Deneyimler",
                column: "CvEntityId");

            migrationBuilder.CreateIndex(
                name: "IX_Eğitimler_CvEntityId",
                table: "Eğitimler",
                column: "CvEntityId");

            migrationBuilder.CreateIndex(
                name: "IX_Projeler_CvEntityId",
                table: "Projeler",
                column: "CvEntityId");

            migrationBuilder.CreateIndex(
                name: "IX_Sertifikalar_CvEntityId",
                table: "Sertifikalar",
                column: "CvEntityId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Deneyimler");
            migrationBuilder.DropTable(name: "Eğitimler");
            migrationBuilder.DropTable(name: "Projeler");
            migrationBuilder.DropTable(name: "Sertifikalar");
            migrationBuilder.DropTable(name: "Cvler");
            migrationBuilder.DropTable(name: "Kullanicilar");
        }
    }
}
