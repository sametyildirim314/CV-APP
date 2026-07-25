namespace UniCareer.SimpleAPI.Models
{
    /// <summary>
    /// CV ana kaydı. SQL'de Cvler tablosuna karşılık gelir.
    /// Alt bilgiler (Deneyim, Eğitim vb.) ilişkili child entity'lerde tutulur.
    /// </summary>
    public class CvEntity
    {
        public int Id { get; set; }

        // Foreign Key → Kullanicilar.Id
        public Guid KullaniciId { get; set; }

        // Navigation Property → ilişkili kullanıcı nesnesi
        public Kullanici? Kullanici { get; set; }

        public string AdSoyad { get; set; } = string.Empty;
        public string Unvan { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefon { get; set; } = string.Empty;
        public string Adres { get; set; } = string.Empty;
        public string Özet { get; set; } = string.Empty;

        // Child entity koleksiyonları (EF Core owned/related tables)
        public List<Deneyim> Deneyim { get; set; } = new();
        public List<Eğitim> Eğitim { get; set; } = new();
        public List<Projeler> Projeler { get; set; } = new();
        public List<Sertifikalar> Sertifikalar { get; set; } = new();

        // Veritabanında virgülle ayrılmış string olarak saklanır (CvContext'te HasConversion)
        public List<string> Yetenekler { get; set; } = new();

        public DateTime OlusturulmaTarihi { get; set; } = DateTime.UtcNow;
    }
}
