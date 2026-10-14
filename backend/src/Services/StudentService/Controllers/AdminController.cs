using AdmissionPortal.Shared;
using StudentService.Data;
using StudentService.DTOs;
using StudentService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace StudentService.Controllers
{
    // Review of submitted applications. Only admins (JWT role "Admin") can call these.
    [Authorize(Roles = Roles.Admin)]
    [Route("api/admin")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AdminController(AppDbContext db)
        {
            _db = db;
        }

        // GET: api/admin/dashboard  - application counts by status
        [HttpGet("dashboard")]
        public async Task<ActionResult<AdminDashboardDto>> Dashboard()
        {
            var counts = await _db.Applications
                .GroupBy(a => a.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            int CountOf(string status) => counts.FirstOrDefault(c => c.Status == status)?.Count ?? 0;

            return Ok(new AdminDashboardDto
            {
                Total = counts.Sum(c => c.Count),
                Pending = CountOf(ApplicationStatus.Pending),
                Approved = CountOf(ApplicationStatus.Approved),
                Rejected = CountOf(ApplicationStatus.Rejected),
            });
        }

        // GET: api/admin/applications?search=rahul&status=Pending  - newest first
        [HttpGet("applications")]
        public async Task<ActionResult<List<ApplicationListItemDto>>> Applications(string? search, string? status)
        {
            var query =
                from a in _db.Applications.AsNoTracking()
                join g in _db.GeneralInformation.AsNoTracking() on a.UserId equals g.UserId into info
                from g in info.DefaultIfEmpty()
                select new { Application = a, Info = g };

            if (!string.IsNullOrWhiteSpace(status) && ApplicationStatus.All.Contains(status))
            {
                query = query.Where(x => x.Application.Status == status);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(x =>
                    x.Application.ApplicationNumber.Contains(term) ||
                    x.Application.StudentId.Contains(term) ||
                    (x.Info != null && x.Info.FullName.Contains(term)));
            }

            var applications = await query
                .OrderByDescending(x => x.Application.SubmittedAt)
                .Select(x => new ApplicationListItemDto
                {
                    ApplicationNumber = x.Application.ApplicationNumber,
                    StudentId = x.Application.StudentId,
                    FullName = x.Info != null ? x.Info.FullName : string.Empty,
                    Email = x.Info != null ? x.Info.Email : string.Empty,
                    Category = x.Info != null ? x.Info.Category : string.Empty,
                    SubmittedAt = x.Application.SubmittedAt,
                    Status = x.Application.Status,
                })
                .ToListAsync();

            return Ok(applications);
        }

        // GET: api/admin/applications/APP2026000001  - everything the student submitted
        [HttpGet("applications/{applicationNumber}")]
        public async Task<ActionResult<ApplicationDetailsDto>> Details(string applicationNumber)
        {
            var application = await _db.Applications.AsNoTracking()
                .FirstOrDefaultAsync(a => a.ApplicationNumber == applicationNumber);

            if (application == null)
            {
                return NotFound(new { message = "Application not found." });
            }

            var general = await _db.GeneralInformation.AsNoTracking()
                .FirstOrDefaultAsync(g => g.UserId == application.UserId);
            var academic = await _db.AcademicInformation.AsNoTracking()
                .FirstOrDefaultAsync(a => a.UserId == application.UserId);
            var documents = await _db.StudentDocuments.AsNoTracking()
                .Where(d => d.UserId == application.UserId)
                .OrderBy(d => d.Id)
                .Select(d => new StudentDocumentDto
                {
                    DocumentType = d.DocumentType,
                    FileName = d.FileName,
                    ContentType = d.ContentType,
                    Size = d.Size,
                    UploadedAt = d.UploadedAt,
                })
                .ToListAsync();

            return Ok(new ApplicationDetailsDto
            {
                Application = ApplicationController.ToDto(application),
                GeneralInformation = general == null ? null : GeneralInformationController.ToDto(general),
                AcademicInformation = academic == null ? null : AcademicInformationController.ToDto(academic),
                Documents = documents,
            });
        }

        // GET: api/admin/applications/APP2026000001/documents/photo  - one of the student's files
        [HttpGet("applications/{applicationNumber}/documents/{documentType}")]
        public async Task<IActionResult> Document(string applicationNumber, string documentType)
        {
            var userId = await _db.Applications
                .Where(a => a.ApplicationNumber == applicationNumber)
                .Select(a => (int?)a.UserId)
                .FirstOrDefaultAsync();

            if (userId == null)
            {
                return NotFound(new { message = "Application not found." });
            }

            var document = await _db.StudentDocuments.AsNoTracking()
                .FirstOrDefaultAsync(d => d.UserId == userId && d.DocumentType == documentType);

            if (document == null)
            {
                return NotFound(new { message = "This file has not been uploaded." });
            }

            Response.Headers.XContentTypeOptions = "nosniff";
            return File(document.Content, document.ContentType);
        }

        // PUT: api/admin/applications/APP2026000001/status  - approve, reject or reset to pending
        [HttpPut("applications/{applicationNumber}/status")]
        public async Task<ActionResult<ApplicationDto>> UpdateStatus(
            string applicationNumber, UpdateApplicationStatusRequest request)
        {
            var application = await _db.Applications
                .FirstOrDefaultAsync(a => a.ApplicationNumber == applicationNumber);

            if (application == null)
            {
                return NotFound(new { message = "Application not found." });
            }

            application.Status = request.Status;
            application.Remarks = string.IsNullOrWhiteSpace(request.Remarks) ? null : request.Remarks.Trim();

            if (request.Status == ApplicationStatus.Pending)
            {
                application.ReviewedAt = null;
                application.ReviewedBy = null;
            }
            else
            {
                application.ReviewedAt = DateTime.UtcNow;
                application.ReviewedBy = User.FindFirst("username")?.Value ?? User.Identity?.Name;
            }

            await _db.SaveChangesAsync();

            return Ok(ApplicationController.ToDto(application));
        }
    }
}
