using Microsoft.AspNetCore.Mvc;
using UniCareer.SimpleAPI.DTOs.Auth;
using UniCareer.SimpleAPI.Services;

namespace UniCareer.SimpleAPI.Controllers
{
   
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        // AuthService, Program.cs'te AddScoped ile DI container'a kayıtlı olmalıdır.
        public AuthController(AuthService authService)
        {
            _authService = authService;
        }
          
        [HttpPost("kayit")]
        public async Task<IActionResult> Kayit([FromBody] KayitDto istek)
        {
            try
            {
                // İstek gövdesi boş gelirse (null body)
                if (istek == null)
                    return BadRequest(new { mesaj = "Geçersiz istek gövdesi." });

                var (yanit, hata) = await _authService.KayitOlAsync(istek);

                if (hata != null)
                    return BadRequest(new { mesaj = hata });

                // 200 OK + kullanıcı bilgisi + JWT token
                return Ok(yanit);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mesaj = "Kayıt sırasında beklenmedik bir hata oluştu.", detay = ex.Message });
            }
        }
        
        [HttpPost("giris")]
        public async Task<IActionResult> Giris([FromBody] GirisDto istek)
        {
            try
            {
                if (istek == null)
                    return BadRequest(new { mesaj = "Geçersiz istek gövdesi." });

                var (yanit, hata) = await _authService.GirisYapAsync(istek);

                if (hata != null)
                    // 401 Unauthorized: kimlik bilgileri geçersiz
                    return Unauthorized(new { mesaj = hata });

                return Ok(yanit);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mesaj = "Giriş sırasında beklenmedik bir hata oluştu.", detay = ex.Message });
            }
        }
    }
}
