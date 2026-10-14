using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace AdmissionPortal.Shared
{
    public static class DatabaseExtensions
    {
        // Creates / upgrades the service's own database by applying its EF Core migrations
        public static WebApplication MigrateDatabase<TContext>(this WebApplication app) where TContext : DbContext
        {
            using var scope = app.Services.CreateScope();
            scope.ServiceProvider.GetRequiredService<TContext>().Database.Migrate();
            return app;
        }
    }
}
