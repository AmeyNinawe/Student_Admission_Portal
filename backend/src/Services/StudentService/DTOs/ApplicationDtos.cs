using System.ComponentModel.DataAnnotations;

namespace StudentService.DTOs
{
    public class ApplicationDto
    {
        public string ApplicationNumber { get; set; } = string.Empty;
        public string StudentId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewedBy { get; set; }
        public string? Remarks { get; set; }
    }

    // ---------- Admin ----------

    public class AdminDashboardDto
    {
        public int Total { get; set; }
        public int Pending { get; set; }
        public int Approved { get; set; }
        public int Rejected { get; set; }
    }

    public class ApplicationListItemDto
    {
        public string ApplicationNumber { get; set; } = string.Empty;
        public string StudentId { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    // Everything an admin needs to review one application
    public class ApplicationDetailsDto
    {
        public ApplicationDto Application { get; set; } = new();
        public GeneralInformationDto? GeneralInformation { get; set; }
        public AcademicInformationDto? AcademicInformation { get; set; }
        public List<StudentDocumentDto> Documents { get; set; } = new();
    }

    public class UpdateApplicationStatusRequest
    {
        [Required, RegularExpression("^(Pending|Approved|Rejected)$", ErrorMessage = "Status must be Pending, Approved or Rejected.")]
        public string Status { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Remarks { get; set; }
    }
}
