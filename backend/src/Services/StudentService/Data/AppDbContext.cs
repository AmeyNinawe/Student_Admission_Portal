using StudentService.Models;
using Microsoft.EntityFrameworkCore;

namespace StudentService.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<GeneralInformation> GeneralInformation => Set<GeneralInformation>();
        public DbSet<AcademicInformation> AcademicInformation => Set<AcademicInformation>();
        public DbSet<StudentDocument> StudentDocuments => Set<StudentDocument>();
        public DbSet<Application> Applications => Set<Application>();

        // A submitted application locks the student's details until an admin rejects it
        public Task<bool> IsApplicationLockedAsync(int userId) =>
            Applications.AnyAsync(a => a.UserId == userId && a.Status != ApplicationStatus.Rejected);

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<GeneralInformation>(entity =>
            {
                entity.ToTable("GeneralInformation");

                entity.Property(g => g.StudentId).HasMaxLength(20).IsRequired();
                entity.Property(g => g.FullName).HasMaxLength(100).IsRequired();
                entity.Property(g => g.Gender).HasMaxLength(10).IsRequired();
                entity.Property(g => g.Category).HasMaxLength(10).IsRequired();
                entity.Property(g => g.FatherName).HasMaxLength(100);
                entity.Property(g => g.MotherName).HasMaxLength(100);
                entity.Property(g => g.GuardianName).HasMaxLength(100);
                entity.Property(g => g.MobileNumber).HasMaxLength(15).IsRequired();
                entity.Property(g => g.Email).HasMaxLength(150).IsRequired();
                entity.Property(g => g.Address).HasMaxLength(500).IsRequired();
                entity.Property(g => g.City).HasMaxLength(100).IsRequired();
                entity.Property(g => g.State).HasMaxLength(100).IsRequired();
                entity.Property(g => g.Pincode).HasMaxLength(6).IsRequired();

                entity.HasIndex(g => g.UserId).IsUnique();
                entity.HasIndex(g => g.StudentId).IsUnique();
            });

            modelBuilder.Entity<AcademicInformation>(entity =>
            {
                entity.ToTable("AcademicInformation");

                entity.Property(a => a.StudentId).HasMaxLength(20).IsRequired();

                entity.Property(a => a.TenthBoard).HasMaxLength(100).IsRequired();
                entity.Property(a => a.TenthSchool).HasMaxLength(200).IsRequired();
                entity.Property(a => a.TenthPercentage).HasPrecision(5, 2);

                entity.Property(a => a.TwelfthBoard).HasMaxLength(100);
                entity.Property(a => a.TwelfthCollege).HasMaxLength(200);
                entity.Property(a => a.TwelfthPercentage).HasPrecision(5, 2);

                entity.Property(a => a.DiplomaCollege).HasMaxLength(200);
                entity.Property(a => a.DiplomaBranch).HasMaxLength(100);
                entity.Property(a => a.DiplomaPercentage).HasPrecision(5, 2);

                entity.HasIndex(a => a.UserId).IsUnique();
                entity.HasIndex(a => a.StudentId).IsUnique();
            });

            modelBuilder.Entity<StudentDocument>(entity =>
            {
                entity.ToTable("StudentDocuments");

                entity.Property(d => d.StudentId).HasMaxLength(20).IsRequired();
                entity.Property(d => d.DocumentType).HasMaxLength(30).IsRequired();
                entity.Property(d => d.FileName).HasMaxLength(255).IsRequired();
                entity.Property(d => d.ContentType).HasMaxLength(50).IsRequired();
                entity.Property(d => d.Content).IsRequired();

                // One file of each type per student; uploading again replaces it
                entity.HasIndex(d => new { d.UserId, d.DocumentType }).IsUnique();
            });

            modelBuilder.Entity<Application>(entity =>
            {
                entity.ToTable("Applications");

                entity.Property(a => a.StudentId).HasMaxLength(20).IsRequired();
                entity.Property(a => a.ApplicationNumber).HasMaxLength(20).IsRequired();
                entity.Property(a => a.Status).HasMaxLength(20).IsRequired();
                entity.Property(a => a.ReviewedBy).HasMaxLength(100);
                entity.Property(a => a.Remarks).HasMaxLength(500);

                entity.HasIndex(a => a.UserId).IsUnique();
                entity.HasIndex(a => a.ApplicationNumber).IsUnique();
                entity.HasIndex(a => a.Status);
            });
        }
    }
}
