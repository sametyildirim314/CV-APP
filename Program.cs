

using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using UniCareer.SimpleAPI.Configuration;
using UniCareer.SimpleAPI.Data;
using UniCareer.SimpleAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// ─────────────────────────────────────────────────────────────
// 1. CONTROLLER & JSON AYARLARI
// ─────────────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });

builder.Services.AddDbContext<CvContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// ─────────────────────────────────────────────────────────────
// 2. JWT AYARLARI (appsettings + User Secrets birleşimi)
// ─────────────────────────────────────────────────────────────
// appsettings.json → Issuer, Audience, ExpireMinutes
// User Secrets     → SecretKey (Development)
var jwtSection = builder.Configuration.GetSection(JwtSettings.SectionName);
builder.Services.Configure<JwtSettings>(jwtSection);

// Token doğrulama parametrelerini kurmak için ayarları şimdi oku
var jwtSettings = jwtSection.Get<JwtSettings>() ?? new JwtSettings();
if (!jwtSettings.GecerliMi())
{
    throw new InvalidOperationException(
        "JwtSettings geçersiz veya SecretKey eksik. " +
        "dotnet user-secrets set \"JwtSettings:SecretKey\" \"EnAz32KarakterlikGizliAnahtar\"");
}

// ─────────────────────────────────────────────────────────────
// 3. JWT AUTHENTICATION MIDDLEWARE
// ─────────────────────────────────────────────────────────────
// Her istekte Authorization: Bearer {token} header'ını okur ve doğrular.
// Geçerli token → HttpContext.User doldurulur → [Authorize] geçer.
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,           // iss claim kontrolü
        ValidateAudience = true,         // aud claim kontrolü
        ValidateLifetime = true,         // exp (süre dolmuş mu?) kontrolü
        ValidateIssuerSigningKey = true, // imza doğrulama
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
        ClockSkew = TimeSpan.Zero        // süre toleransı yok (tam ExpireMinutes)
    };
});

// ─────────────────────────────────────────────────────────────
// 4. SERVİSLER (Dependency Injection)
// ─────────────────────────────────────────────────────────────
builder.Services.AddScoped<PdfService>();
builder.Services.AddScoped<AuthService>(); // AuthController constructor'ına enjekte edilir

// ─────────────────────────────────────────────────────────────
// 5. CORS (React frontend → farklı porttan istek)
// ─────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactIzin", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader(); // Authorization header'ına izin verir
    });
});

var app = builder.Build();

// ─────────────────────────────────────────────────────────────
// MIDDLEWARE PIPELINE (sıra önemli!)
// ─────────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();
app.UseCors("ReactIzin");

// Authentication → Authorization sırası DEĞİŞTİRİLEMEZ
app.UseAuthentication(); // Token'ı oku, User'ı oluştur
app.UseAuthorization();  // [Authorize] attribute'unu uygula

app.MapControllers();

app.Run();
