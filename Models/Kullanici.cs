using System.Text.Json.Serialization;

namespace UniCareer.SimpleAPI.Models
{
    public sealed class Kullanici
    {
        public int Id { get; set; }

        public string Ad { get; set; } = string.Empty;
        public string Soyad { get; set; } = string.Empty;

        // Login için kullanılacak e-posta. Kayıt sırasında benzersiz olmalı.
        public string Email { get; set; } = string.Empty;

        // BCrypt ile hash'lenmiş şifre. Düz metin şifre ASLA buraya yazılmaz.
        [JsonIgnore]
        public string PasswordHash { get; set; } = string.Empty;

        public string Rol { get; set; } = "User";

        public DateTime KayitTarihi { get; set; } = DateTime.UtcNow;

        [JsonIgnore]
        public List<CvEntity> Cvler { get; set; } = new();
    }
}
