using AuthService.Data;
using AuthService.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services
{
    // Creates the first admin account from the "AdminSeed" settings when no admin exists yet.
    // Changing the settings later does not change an existing admin's password.
    public static class AdminSeeder
    {
        public static async Task SeedAsync(WebApplication app)
        {
            using var scope = app.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Admin>>();

            if (await db.Admins.AnyAsync())
            {
                return;
            }

            var username = config["AdminSeed:Username"];
            var password = config["AdminSeed:Password"];
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                logger.LogWarning("No admin account exists and AdminSeed settings are missing - admin login is unavailable.");
                return;
            }

            var admin = new Admin
            {
                Username = username.Trim().ToUpperInvariant(),
                FullName = config["AdminSeed:FullName"] ?? "Administrator",
                Email = (config["AdminSeed:Email"] ?? $"{username}@admissionportal.local").Trim().ToLowerInvariant(),
            };
            admin.PasswordHash = scope.ServiceProvider.GetRequiredService<IPasswordHasher<Admin>>()
                .HashPassword(admin, password);

            db.Admins.Add(admin);
            await db.SaveChangesAsync();

            logger.LogInformation("Created admin account {Username}.", admin.Username);
        }
    }
}
