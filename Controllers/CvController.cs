using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UniCareer.SimpleAPI.Data;
using UniCareer.SimpleAPI.DTOs.Cv;
using UniCareer.SimpleAPI.Models;
using UniCareer.SimpleAPI.Services;

namespace UniCareer.SimpleAPI.Controllers
{
    /// <summary>
    /// CV işlemleri. Tüm endpoint'ler JWT token gerektirir ([Authorize]).
    /// Token: Authorization: Bearer {token} header'ı ile gönderilir.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Giriş yapmamış kullanıcı → 401 Unauthorized
    public class CvController : ControllerBase
    {
        private readonly CvContext _context;
        private readonly PdfService _pdfService;

        public CvController(CvContext context, PdfService pdfService)
        {
            _context = context;
            _pdfService = pdfService;
        }

        // ─────────────────────────────────────────────────────────────
        // JWT'DEN KULLANICI BİLGİSİ OKUMA
        // AuthService token üretirken Sub claim'ine kullanıcı Id'sini yazar.
        // ─────────────────────────────────────────────────────────────

        /// <summary>
        /// Token'daki kullanıcı Id'sini okur. Geçersizse null döner.
        /// </summary>
        private int? MevcutKullaniciId()
        {
            var idStr = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

            return int.TryParse(idStr, out var id) ? id : null;
        }

        /// <summary>
        /// Admin rolü tüm CV'leri görebilir/güncelleyebilir.
        /// </summary>
        private bool AdminMi() => User.IsInRole("Admin");

        // ─────────────────────────────────────────────────────────────
        // CV LİSTELEME
        // ─────────────────────────────────────────────────────────────

        /// <summary>
        /// GET /api/Cv
        /// User → sadece kendi CV'leri | Admin → tüm CV'ler
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> TumCvleriGetir()
        {
            try
            {
                var kullaniciId = MevcutKullaniciId();
                if (kullaniciId == null)
                    return Unauthorized(new { mesaj = "Geçersiz token." });

                var sorgu = _context.Cvler
                    .Include(c => c.Kullanici)
                    .AsQueryable();

                // Normal kullanıcı: yalnızca kendi CV'leri
                if (!AdminMi())
                    sorgu = sorgu.Where(c => c.KullaniciId == kullaniciId.Value);

                var cvler = await sorgu
                    .OrderByDescending(c => c.OlusturulmaTarihi)
                    .ToListAsync();

                return Ok(cvler);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mesaj = "Listeleme sırasında hata oluştu.", hata = ex.Message });
            }
        }

        // ─────────────────────────────────────────────────────────────
        // CV GÜNCELLEME
        // ─────────────────────────────────────────────────────────────

        /// <summary>
        /// PUT /api/Cv/{id}
        /// Sadece CV sahibi veya Admin güncelleyebilir.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> CvGuncelle(int id, [FromBody] CvIstekDto guncelVeri)
        {
            try
            {
                var kullaniciId = MevcutKullaniciId();
                if (kullaniciId == null)
                    return Unauthorized(new { mesaj = "Geçersiz token." });

                var mevcutCv = await _context.Cvler
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (mevcutCv == null)
                    return NotFound(new { mesaj = "Güncellenecek CV bulunamadı." });

                // Başka kullanıcının CV'sini güncelleme girişimi → 403 Forbidden
                if (!AdminMi() && mevcutCv.KullaniciId != kullaniciId.Value)
                    return Forbid();

                var guncellenmisEntity = new CvEntity
                {
                    Id = id,
                    KullaniciId = mevcutCv.KullaniciId, // Token'daki kullanıcı; URL'den değil
                    AdSoyad = guncelVeri.AdSoyad,
                    Unvan = guncelVeri.Unvan,
                    Email = guncelVeri.Email,
                    Telefon = guncelVeri.Telefon,
                    Adres = guncelVeri.Adres,
                    Özet = guncelVeri.Özet,
                    Yetenekler = guncelVeri.Yetenekler ?? new List<string>(),
                    Deneyim = guncelVeri.Deneyim ?? new List<Deneyim>(),
                    Eğitim = guncelVeri.Eğitim ?? new List<Eğitim>(),
                    Projeler = guncelVeri.Projeler ?? new List<Projeler>(),
                    Sertifikalar = guncelVeri.Sertifikalar ?? new List<Sertifikalar>()
                };

                _context.Cvler.Update(guncellenmisEntity);
                await _context.SaveChangesAsync();

                return Ok(new { mesaj = "Güncelleme başarıyla tamamlandı!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mesaj = "Hata", detay = ex.Message });
            }
        }

        // ─────────────────────────────────────────────────────────────
        // CV OLUŞTURMA + PDF İNDİRME
        // ─────────────────────────────────────────────────────────────

        /// <summary>
        /// POST /api/Cv/kullanici/{kullaniciId}/olustur-ve-indir
        /// kullaniciId URL'de kalır (frontend uyumluluğu) ama token'daki Id ile eşleşmeli.
        /// Başka birinin Id'si gönderilirse → 403 Forbidden.
        /// </summary>
        [HttpPost("kullanici/{kullaniciId}/olustur-ve-indir")]
        public async Task<IActionResult> CvOlusturVeIndir(int kullaniciId, [FromBody] CvIstekDto istek)
        {
            try
            {
                var tokenKullaniciId = MevcutKullaniciId();
                if (tokenKullaniciId == null)
                    return Unauthorized(new { mesaj = "Geçersiz token." });

                // URL manipülasyonu engeli: sadece kendi adına CV oluşturabilir (Admin hariç)
                if (!AdminMi() && kullaniciId != tokenKullaniciId.Value)
                    return Forbid();

                var kullaniciExists = await _context.Kullanicilar.AnyAsync(u => u.Id == kullaniciId);
                if (!kullaniciExists)
                    return NotFound(new { mesaj = "Belirtilen kullanıcı sistemde kayıtlı değil." });

                var yeniCv = new CvEntity
                {
                    KullaniciId = kullaniciId,
                    AdSoyad = istek.AdSoyad,
                    Unvan = istek.Unvan,
                    Email = istek.Email,
                    Telefon = istek.Telefon,
                    Adres = istek.Adres,
                    Özet = istek.Özet,
                    Yetenekler = istek.Yetenekler ?? new List<string>(),
                    Deneyim = istek.Deneyim ?? new List<Deneyim>(),
                    Eğitim = istek.Eğitim ?? new List<Eğitim>(),
                    Projeler = istek.Projeler ?? new List<Projeler>(),
                    Sertifikalar = istek.Sertifikalar ?? new List<Sertifikalar>()
                };

                _context.Cvler.Add(yeniCv);
                await _context.SaveChangesAsync();

                var pdfDosyasi = _pdfService.CvOlustur(yeniCv);

                if (pdfDosyasi == null || pdfDosyasi.Length == 0)
                    throw new Exception("PDF dosyası oluşturulurken teknik bir hata oluştu.");

                string temizDosyaAdi = $"cv-{istek.AdSoyad.Replace(" ", "_")}.pdf";
                return File(pdfDosyasi, "application/pdf", temizDosyaAdi);
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, new { mesaj = "Veritabanına kayıt sırasında bir sorun oluştu.", detay = ex.InnerException?.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mesaj = "İşlem sırasında beklenmedik bir hata oluştu.", hata = ex.Message });
            }
        }

        // NOT: Eski endpoint'ler kaldırıldı:
        //   GET  /api/Cv/kullanicigetir      → yerine POST /api/Auth/kayit (kayıt) + token'dan kullanıcı bilgisi
        //   POST /api/Cv/kullanici/olustur   → yerine POST /api/Auth/kayit
    }
}
