namespace UniCareer.SimpleAPI.DTOs.Auth
{
    
    public class KayitDto
    {
        public string Ad { get; set; } = string.Empty;
        public string Soyad { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        // Düz metin şifre. Sadece istek anında bellekte tutulur, veritabanına yazılmaz.
        public string Sifre { get; set; } = string.Empty;
    }
}
