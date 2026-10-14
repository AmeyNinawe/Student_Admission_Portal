using System.ComponentModel.DataAnnotations;

namespace StudentService.DTOs
{
    public class GeneralInformationRequest
    {
        [Required, StringLength(100, MinimumLength = 2)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public DateOnly? DateOfBirth { get; set; }

        [Required, RegularExpression("^(male|female|other)$", ErrorMessage = "Select a valid gender.")]
        public string Gender { get; set; } = string.Empty;

        [Required, RegularExpression("^(open|obc|sc|st|ews)$", ErrorMessage = "Select a valid category.")]
        public string Category { get; set; } = string.Empty;

        [StringLength(100)]
        public string? FatherName { get; set; }

        [StringLength(100)]
        public string? MotherName { get; set; }

        [StringLength(100)]
        public string? GuardianName { get; set; }

        [Required, RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Enter a valid 10-digit mobile number.")]
        public string MobileNumber { get; set; } = string.Empty;

        [Required, EmailAddress, StringLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required, StringLength(500)]
        public string Address { get; set; } = string.Empty;

        [Required, StringLength(100)]
        public string City { get; set; } = string.Empty;

        [Required, StringLength(100)]
        public string State { get; set; } = string.Empty;

        [Required, RegularExpression(@"^\d{6}$", ErrorMessage = "Enter a valid 6-digit pincode.")]
        public string Pincode { get; set; } = string.Empty;
    }

    public class GeneralInformationDto
    {
        public string StudentId { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public DateOnly DateOfBirth { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? FatherName { get; set; }
        public string? MotherName { get; set; }
        public string? GuardianName { get; set; }
        public string MobileNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string Pincode { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
    }
}
