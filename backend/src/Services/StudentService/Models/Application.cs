namespace StudentService.Models
{
    // A student's submitted admission application; one per student
    public class Application
    {
        public int Id { get; set; }

        // Account Id issued by the Auth service (JWT "sub" claim)
        public int UserId { get; set; }

        // Human-friendly ID from the Auth service, e.g. "STU2026000001"
        public string StudentId { get; set; } = string.Empty;

        // e.g. "APP2026000001"
        public string ApplicationNumber { get; set; } = string.Empty;

        // One of ApplicationStatus
        public string Status { get; set; } = ApplicationStatus.Pending;

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        // Set when an admin approves or rejects the application
        public DateTime? ReviewedAt { get; set; }

        public string? ReviewedBy { get; set; }

        // Admin's note to the student, e.g. the reason for rejection
        public string? Remarks { get; set; }
    }

    public static class ApplicationStatus
    {
        public const string Pending = "Pending";
        public const string Approved = "Approved";
        public const string Rejected = "Rejected";

        public static readonly string[] All = { Pending, Approved, Rejected };
    }
}
