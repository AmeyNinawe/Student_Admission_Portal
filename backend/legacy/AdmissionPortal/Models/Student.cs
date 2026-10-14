namespace AdmissionPortal.Models
{
    public class Student
    {
        public int Id { get; set; }

        // Human-friendly ID the student can log in with, e.g. "STU2026000001"
        public string StudentId { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string MobileNumber { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastLoginAt { get; set; }
    }
}
