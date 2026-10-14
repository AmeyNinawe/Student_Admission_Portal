using System.ComponentModel.DataAnnotations;

namespace StudentService.DTOs
{
    public class AcademicInformationRequest : IValidatableObject
    {
        // 10th / Secondary education (required)
        [Required, StringLength(100)]
        [Display(Name = "10th Board")]
        public string TenthBoard { get; set; } = string.Empty;

        [Required, StringLength(200)]
        [Display(Name = "10th School Name")]
        public string TenthSchool { get; set; } = string.Empty;

        [Required]
        [Display(Name = "10th Passing Year")]
        public int? TenthYear { get; set; }

        [Required, Range(0, 100)]
        [Display(Name = "10th Percentage")]
        public decimal? TenthPercentage { get; set; }

        // 12th / Higher secondary education (optional - all fields or none)
        [StringLength(100)]
        [Display(Name = "12th Board")]
        public string? TwelfthBoard { get; set; }

        [StringLength(200)]
        [Display(Name = "12th College / School Name")]
        public string? TwelfthCollege { get; set; }

        [Display(Name = "12th Passing Year")]
        public int? TwelfthYear { get; set; }

        [Range(0, 100)]
        [Display(Name = "12th Percentage")]
        public decimal? TwelfthPercentage { get; set; }

        // Diploma (optional - all fields or none)
        [StringLength(200)]
        [Display(Name = "Diploma College Name")]
        public string? DiplomaCollege { get; set; }

        [StringLength(100)]
        [Display(Name = "Diploma Branch")]
        public string? DiplomaBranch { get; set; }

        [Display(Name = "Diploma Passing Year")]
        public int? DiplomaYear { get; set; }

        [Range(0, 100)]
        [Display(Name = "Diploma Percentage")]
        public decimal? DiplomaPercentage { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            var maxYear = DateTime.UtcNow.Year + 1;

            foreach (var (name, year) in new[]
            {
                (nameof(TenthYear), TenthYear),
                (nameof(TwelfthYear), TwelfthYear),
                (nameof(DiplomaYear), DiplomaYear),
            })
            {
                if (year != null && (year < 1950 || year > maxYear))
                {
                    yield return new ValidationResult($"Passing year must be between 1950 and {maxYear}.", new[] { name });
                }
            }

            if (IsPartiallyFilled(TwelfthBoard, TwelfthCollege, TwelfthYear, TwelfthPercentage))
            {
                yield return new ValidationResult("Fill all 12th details, or leave the section empty.", new[] { "Twelfth" });
            }

            if (IsPartiallyFilled(DiplomaCollege, DiplomaBranch, DiplomaYear, DiplomaPercentage))
            {
                yield return new ValidationResult("Fill all Diploma details, or leave the section empty.", new[] { "Diploma" });
            }
        }

        private static bool IsPartiallyFilled(string? text1, string? text2, int? year, decimal? percentage)
        {
            var filled = new[]
            {
                !string.IsNullOrWhiteSpace(text1),
                !string.IsNullOrWhiteSpace(text2),
                year != null,
                percentage != null,
            };
            return filled.Any(f => f) && !filled.All(f => f);
        }
    }

    public class AcademicInformationDto
    {
        public string StudentId { get; set; } = string.Empty;

        public string TenthBoard { get; set; } = string.Empty;
        public string TenthSchool { get; set; } = string.Empty;
        public int TenthYear { get; set; }
        public decimal TenthPercentage { get; set; }

        public string? TwelfthBoard { get; set; }
        public string? TwelfthCollege { get; set; }
        public int? TwelfthYear { get; set; }
        public decimal? TwelfthPercentage { get; set; }

        public string? DiplomaCollege { get; set; }
        public string? DiplomaBranch { get; set; }
        public int? DiplomaYear { get; set; }
        public decimal? DiplomaPercentage { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}
