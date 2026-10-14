using System.Security.Claims;
using AdmissionPortal.Shared;
using StudentService.Data;
using StudentService.DTOs;
using StudentService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace StudentService.Controllers
{
    // The logged-in student's admission application (identified by the JWT from the Auth service)
    [Authorize(Roles = Roles.Student)]
    [Route("api/students/application")]
    [ApiController]
    public class ApplicationController : ControllerBase
    {
        private static readonly Dictionary<string, string> DocumentLabels = new()
        {
            ["photo"] = "Photo",
            ["signature"] = "Signature",
            ["tenthMarksheet"] = "10th Marksheet",
            ["idProof"] = "Identity Proof",
        };

        private readonly AppDbContext _db;

        public ApplicationController(AppDbContext db)
        {
            _db = db;
        }

        // GET: api/students/application
        [HttpGet]
        public async Task<ActionResult<ApplicationDto>> Get()
        {
            if (!TryGetUserId(out var userId))
            {
                return Unauthorized();
            }

            var application = await _db.Applications.AsNoTracking()
                .FirstOrDefaultAsync(a => a.UserId == userId);

            if (application == null)
            {
                return NotFound(new { message = "The application has not been submitted yet." });
            }

            return Ok(ToDto(application));
        }

        // POST: api/students/application  - submits the application once every step is complete.
        // A rejected application can be corrected and submitted again.
        [HttpPost]
        public async Task<ActionResult<ApplicationDto>> Submit()
        {
            if (!TryGetUserId(out var userId))
            {
                return Unauthorized();
            }

            var application = await _db.Applications.FirstOrDefaultAsync(a => a.UserId == userId);
            if (application != null && application.Status != ApplicationStatus.Rejected)
            {
                return Conflict(new { message = "Your application has already been submitted." });
            }

            var missing = await GetMissingStepsAsync(userId);
            if (missing.Count > 0)
            {
                return BadRequest(new { message = $"Please complete the following before submitting: {string.Join(", ", missing)}." });
            }

            var now = DateTime.UtcNow;

            if (application != null)
            {
                application.Status = ApplicationStatus.Pending;
                application.SubmittedAt = now;
                application.ReviewedAt = null;
                application.ReviewedBy = null;
                application.Remarks = null;
                await _db.SaveChangesAsync();
                return Ok(ToDto(application));
            }

            application = new Application
            {
                UserId = userId,
                StudentId = User.FindFirstValue("studentId") ?? string.Empty,
                // Temporary unique value; replaced below once the identity Id is known
                ApplicationNumber = Guid.NewGuid().ToString("N")[..20],
                Status = ApplicationStatus.Pending,
                SubmittedAt = now,
            };
            _db.Applications.Add(application);
            await _db.SaveChangesAsync();

            application.ApplicationNumber = $"APP{application.SubmittedAt.Year}{application.Id:D6}";
            await _db.SaveChangesAsync();

            return Ok(ToDto(application));
        }

        private async Task<List<string>> GetMissingStepsAsync(int userId)
        {
            var missing = new List<string>();

            if (!await _db.GeneralInformation.AnyAsync(g => g.UserId == userId))
            {
                missing.Add("General Information");
            }

            if (!await _db.AcademicInformation.AnyAsync(a => a.UserId == userId))
            {
                missing.Add("Academic Information");
            }

            var uploaded = await _db.StudentDocuments
                .Where(d => d.UserId == userId)
                .Select(d => d.DocumentType)
                .ToListAsync();

            missing.AddRange(DocumentTypes.Required
                .Where(type => !uploaded.Contains(type))
                .Select(type => DocumentLabels[type]));

            return missing;
        }

        private bool TryGetUserId(out int userId) =>
            int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out userId);

        // Also used by AdminController
        internal static ApplicationDto ToDto(Application a) => new()
        {
            ApplicationNumber = a.ApplicationNumber,
            StudentId = a.StudentId,
            Status = a.Status,
            SubmittedAt = a.SubmittedAt,
            ReviewedAt = a.ReviewedAt,
            ReviewedBy = a.ReviewedBy,
            Remarks = a.Remarks,
        };
    }
}
