namespace UniCareer.SimpleAPI.Configuration
{
    /// appsettings.json içindeki "JwtSettings" bölümünün C# karşılığı.
    ///
    /// Nasıl dolar?
    ///   1. appsettings.json     → Issuer, Audience, ExpireMinutes
    ///   2. User Secrets (dev)   → SecretKey  (GitHub'a gitmez)
    ///   3. Ortam değişkeni      → JwtSettings__SecretKey (production)
    ///
    /// Program.cs'te şu şekilde bağlanır:
    ///   builder.Services.Configure;JwtSettings;(builder.Configuration.GetSection("JwtSettings"));
    ///
    /// AuthService içinde şu şekilde kullanılır:
    ///   public AuthService(IOptions;JwtSettings; jwtOptions) { _jwt = jwtOptions.Value; }
    public class JwtSettings
    {
       
        /// Configuration section adı. appsettings.json'daki JSON key ile aynı olmalı.
       
        public const string SectionName = "JwtSettings";
        /// JWT imzalama anahtarı. En az 32 karakter olmalı.
        // User Secrets veya ortam değişkeninden gelir; appsettings.json'da tutulmaz.
       
        public string SecretKey { get; set; } = string.Empty;

        /// Token'ı kim üretti? → JWT "iss" (issuer) claim'ine yazılır.
        public string Issuer { get; set; } = string.Empty;
        /// Token kime yönelik? → JWT "aud" (audience) claim'ine yazılır.
       
        public string Audience { get; set; } = string.Empty;
        /// Token geçerlilik süresi (dakika). Süre dolunca kullanıcı tekrar giriş yapmalı.
       
        public int ExpireMinutes { get; set; } = 60;       
        /// SecretKey'in yapılandırılıp yapılandırılmadığını kontrol eder.
        /// Uygulama başlarken veya token üretmeden önce çağrılabilir.
        
        public bool GecerliMi()
        {
            return !string.IsNullOrWhiteSpace(SecretKey)
                && SecretKey.Length >= 32
                && !string.IsNullOrWhiteSpace(Issuer)
                && !string.IsNullOrWhiteSpace(Audience)
                && ExpireMinutes > 0;
        }
    }
}
