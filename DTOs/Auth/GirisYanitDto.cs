namespace UniCareer.SimpleAPI.DTOs.Auth
{
   
    /// Başarılı giriş yanıtı. Frontend Token'ı localStorage'a kaydeder.
    /// Hassas alanlar (PasswordHash vb.) burada yer almaz.
    public class GirisYanitDto
    {
        public Guid Id { get; set; }
        public string Ad { get; set; } = string.Empty;
        public string Soyad { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Rol { get; set; } = string.Empty;

        // JWT → sonraki isteklerde: Authorization: Bearer {Token}
        public string Token { get; set; } = string.Empty;
    }
}
