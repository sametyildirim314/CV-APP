using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;//IOptions<JwtSettings> jwtOptions
using Microsoft.IdentityModel.Tokens;
using UniCareer.SimpleAPI.Configuration;
using UniCareer.SimpleAPI.Data;
using UniCareer.SimpleAPI.DTOs.Auth;
using UniCareer.SimpleAPI.Models;

namespace UniCareer.SimpleAPI.Services
{
    /// Kimlik doğrulama iş mantığı: kayıt, giriş, şifre hash ve JWT üretimi.
    /// Controller ince kalır; asıl iş burada yapılır.
    /// Program.cs'te kayıt: builder.Services.AddScoped;AuthService>();
    public class AuthService
    {
        private readonly CvContext _context;
        private readonly JwtSettings _jwt;

        public AuthService(CvContext context, IOptions<JwtSettings> jwtOptions)
        {
            _context = context; //CvContext ile veritabanına erişim
            _jwt = jwtOptions.Value; //JwtSettings ile JWT ayarları

            // Uygulama ayağa kalkarken SecretKey yoksa veya kısaysa erken hata ver (sessizce patlamasın).
            if (!_jwt.GecerliMi())
            {
                throw new InvalidOperationException(
                    "JwtSettings geçersiz. User Secrets'ta SecretKey tanımlı mı? " +
                    "Komut: dotnet user-secrets set \"JwtSettings:SecretKey\" \"EnAz32KarakterlikGizliAnahtar\"");
            }
        }
        
        // KAYIT (REGISTER)
        /// Yeni kullanıcı oluşturur ve otomatik giriş yaparak token döner.
        
        public async Task<(GirisYanitDto? Yanit, string? Hata)> KayitOlAsync(KayitDto istek)
        {
            // Temel doğrulama
            if (string.IsNullOrWhiteSpace(istek.Email) || string.IsNullOrWhiteSpace(istek.Sifre))
                return (null, "E-posta ve şifre zorunludur.");

            if (istek.Sifre.Length < 6)
                return (null, "Şifre en az 6 karakter olmalıdır.");

            var email = istek.Email.Trim().ToLowerInvariant();//email küçük harf olarak kaydedilir

            // Aynı e-posta ile kayıt var mı?
            var emailVarMi = await _context.Kullanicilar.AnyAsync(k => k.Email.ToLower() == email);
            if (emailVarMi)
                return (null, "Bu e-posta adresi zaten kayıtlı.");

            // Düz şifreyi hash'le → veritabanına sadece hash gider
            var yeniKullanici = new Kullanici
            {
                Ad = istek.Ad.Trim(),
                Soyad = istek.Soyad.Trim(),
                Email = email,
                PasswordHash = SifreHashle(istek.Sifre),
                Rol = "User",
                KayitTarihi = DateTime.UtcNow
            };

            _context.Kullanicilar.Add(yeniKullanici);
            await _context.SaveChangesAsync();

            // Kayıt sonrası kullanıcıyı tekrar login ekranına yönlendirmemek için token da döner
            return (GirisYanitiOlustur(yeniKullanici), null);
        }

        // GİRİŞ (LOGIN)
        /// E-posta + şifre ile giriş. Başarılıysa JWT token döner.

        public async Task<(GirisYanitDto? Yanit, string? Hata)> GirisYapAsync(GirisDto istek)
        {
            if (string.IsNullOrWhiteSpace(istek.Email) || string.IsNullOrWhiteSpace(istek.Sifre))
                return (null, "E-posta ve şifre zorunludur.");

            var email = istek.Email.Trim().ToLowerInvariant();

            var kullanici = await _context.Kullanicilar
                .FirstOrDefaultAsync(k => k.Email.ToLower() == email);

            // Güvenlik: "email yok" ve "şifre yanlış" için aynı mesaj (hangisinin hatalı olduğu söylenmez)
            if (kullanici == null || !SifreDogrula(istek.Sifre, kullanici.PasswordHash))
                return (null, "E-posta veya şifre hatalı.");

            return (GirisYanitiOlustur(kullanici), null);
        }

        // ŞİFRE İŞLEMLERİ (BCrypt)
        /// Düz metin şifreyi BCrypt hash'ine çevirir.
        /// BCrypt her seferinde farklı salt üretir; hash içinde saklar.
        /// Örnek çıktı: $2a$11$xK8vN2... (60 karakter civarı)
        private static string SifreHashle(string duzSifre)
        {
            return BCrypt.Net.BCrypt.HashPassword(duzSifre);
        }

        
        /// Giriş sırasında: kullanıcının girdiği düz şifre ile DB'deki hash karşılaştırılır.
       
        private static bool SifreDogrula(string duzSifre, string passwordHash)
        {
            // Eski kayıtlarda PasswordHash boş olabilir (migration öncesi kullanıcılar)
            if (string.IsNullOrEmpty(passwordHash))
                return false;

            return BCrypt.Net.BCrypt.Verify(duzSifre, passwordHash);
        }
        
        // JWT TOKEN ÜRETİMİ
        /// Kullanıcı bilgisinden GirisYanitDto oluşturur (token dahil).
        private GirisYanitDto GirisYanitiOlustur(Kullanici kullanici)
        {
            return new GirisYanitDto
            {
                Id = kullanici.Id,
                Ad = kullanici.Ad,
                Soyad = kullanici.Soyad,
                Email = kullanici.Email,
                Rol = kullanici.Rol,
                Token = TokenOlustur(kullanici)
            };
        }
        /// JWT token üretir. Token içinde kullanıcı Id, e-posta ve rol bilgisi taşınır.
        /// SecretKey ile imzalanır; sonraki isteklerde backend aynı key ile doğrular.
        private string TokenOlustur(Kullanici kullanici)
        {
            // Claim = token içindeki "iddia" / bilgi parçası
            var claims = new List<Claim>
            {
                // sub (subject) → kullanıcı Id'si. Controller'da User.FindFirst(ClaimTypes.NameIdentifier) ile okunur
                new(JwtRegisteredClaimNames.Sub, kullanici.Id.ToString()),

                new(JwtRegisteredClaimNames.Email, kullanici.Email),

                // Rol → [Authorize(Roles = "Admin")] için
                new(ClaimTypes.Role, kullanici.Rol),

                // jti → her token'a benzersiz id (opsiyonel, token iptali senaryolarında kullanılır)
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            // SecretKey UTF-8 byte dizisine çevrilir → simetrik imzalama anahtarı
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.SecretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwt.Issuer,           // iss claim
                audience: _jwt.Audience,     // aud claim
                claims: claims,
                expires: DateTime.Now.AddMinutes(_jwt.ExpireMinutes),
                signingCredentials: credentials
            );

            // Token string'e serialize edilir → "eyJhbGciOiJIUzI1NiIs..."
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
