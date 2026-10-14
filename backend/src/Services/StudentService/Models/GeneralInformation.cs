namespace StudentService.Models
{
    public class GeneralInformation
    {
        public int Id { get; set; }

        // Account Id issued by the Auth service (JWT "sub" claim) - one record per student
        public int UserId { get; set; }

        // Human-friendly ID from the Auth service, e.g. "STU2026000001"
        public string StudentId { get; set; } = string.Empty;

        // Personal information
        public string FullName { get; set; } = string.Empty;
        public DateOnly DateOfBirth { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;

        // Parent / guardian information
        public string? FatherName { get; set; }
        public string? MotherName { get; set; }
        public string? GuardianName { get; set; }

        // Contact information
        public string MobileNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        // Address information
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string Pincode { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
