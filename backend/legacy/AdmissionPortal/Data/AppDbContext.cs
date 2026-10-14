using AdmissionPortal.Models;
using Microsoft.EntityFrameworkCore;

namespace AdmissionPortal.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Student> Students => Set<Student>();

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
        }
    }
}
