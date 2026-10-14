using AuthService.Models;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Student> Students => Set<Student>();
        public DbSet<AuthToken> AuthTokens => Set<AuthToken>();
        public DbSet<Admin> Admins => Set<Admin>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Student>(entity =>
            {
                entity.ToTable("Students");

                entity.Property(s => s.StudentId).HasMaxLength(20).IsRequired();
                entity.Property(s => s.FullName).HasMaxLength(100).IsRequired();
                entity.Property(s => s.Email).HasMaxLength(150).IsRequired();
                entity.Property(s => s.MobileNumber).HasMaxLength(15).IsRequired();
                entity.Property(s => s.PasswordHash).IsRequired();

                entity.HasIndex(s => s.StudentId).IsUnique();
                entity.HasIndex(s => s.Email).IsUnique();
            });

            modelBuilder.Entity<AuthToken>(entity =>
            {
                entity.ToTable("AuthTokens");

                entity.Property(t => t.Jti).HasMaxLength(36).IsRequired();
                entity.Property(t => t.AccessToken).IsRequired();
                entity.Property(t => t.RefreshTokenHash).HasMaxLength(64).IsRequired();
                entity.Property(t => t.ReplacedByTokenHash).HasMaxLength(64);

                entity.HasIndex(t => t.Jti).IsUnique();
                entity.HasIndex(t => t.RefreshTokenHash).IsUnique();

                entity.HasOne(t => t.Student)
                    .WithMany()
                    .HasForeignKey(t => t.StudentId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(t => t.Admin)
                    .WithMany()
                    .HasForeignKey(t => t.AdminId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Every token pair belongs to exactly one student or one admin
                entity.ToTable(t => t.HasCheckConstraint(
                    "CK_AuthTokens_Owner",
                    "([StudentId] IS NULL AND [AdminId] IS NOT NULL) OR ([StudentId] IS NOT NULL AND [AdminId] IS NULL)"));
            });

            modelBuilder.Entity<Admin>(entity =>
            {
                entity.ToTable("Admins");

                entity.Property(a => a.Username).HasMaxLength(50).IsRequired();
                entity.Property(a => a.FullName).HasMaxLength(100).IsRequired();
                entity.Property(a => a.Email).HasMaxLength(150).IsRequired();
                entity.Property(a => a.PasswordHash).IsRequired();

                entity.HasIndex(a => a.Username).IsUnique();
                entity.HasIndex(a => a.Email).IsUnique();
            });
        }
    }
}
