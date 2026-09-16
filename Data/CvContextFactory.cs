using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace UniCareer.SimpleAPI.Data
{
    /// <summary>
    /// dotnet ef komutlarının web host'u (JWT vs.) ayağa kaldırmadan DbContext oluşturması için.
    /// </summary>
    public class CvContextFactory : IDesignTimeDbContextFactory<CvContext>
    {
        public CvContext CreateDbContext(string[] args)
        {
            var config = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false)
                .AddJsonFile("appsettings.Development.json", optional: true)
                .Build();

            var optionsBuilder = new DbContextOptionsBuilder<CvContext>();
            optionsBuilder.UseSqlServer(config.GetConnectionString("DefaultConnection"));

            return new CvContext(optionsBuilder.Options);
        }
    }
}
