namespace StudentService.Models
{
    public class AcademicInformation
    {
        public int Id { get; set; }

        // Account Id issued by the Auth service (JWT "sub" claim) - one record per student
        public int UserId { get; set; }

        // Human-friendly ID from the Auth service, e.g. "STU2026000001"
        public string StudentId { get; set; } = string.Empty;

        // 10th / Secondary education (required)
        public string TenthBoard { get; set; } = string.Empty;
        public string TenthSchool { get; set; } = string.Empty;
        public int TenthYear { get; set; }
        public decimal TenthPercentage { get; set; }

        // 12th / Higher secondary education (optional)
        public string? TwelfthBoard { get; set; }
        public string? TwelfthCollege { get; set; }
        public int? TwelfthYear { get; set; }
        public decimal? TwelfthPercentage { get; set; }

        // Diploma (optional)
        public string? DiplomaCollege { get; set; }
        public string? DiplomaBranch { get; set; }
        public int? DiplomaYear { get; set; }
        public decimal? DiplomaPercentage { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
