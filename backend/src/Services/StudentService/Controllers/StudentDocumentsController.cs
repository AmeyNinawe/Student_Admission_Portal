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
    // Photo, signature and document uploads. Every endpoint works on the logged-in
    // student's own files, identified by the JWT issued by the Auth service.
    [Authorize(Roles = Roles.Student)]
    [Route("api/students/documents")]
    [ApiController]
    public class StudentDocumentsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public StudentDocumentsController(AppDbContext db)
        {
            _db = db;
        }

        // GET: api/students/documents  - details of every uploaded file (no content)
        [HttpGet]
        public async Task<ActionResult<List<StudentDocumentDto>>> List()
        {
            if (!TryGetUserId(out var userId))
            {
                return Unauthorized();
            }

            var documents = await _db.StudentDocuments.AsNoTracking()
                .Where(d => d.UserId == userId)
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

            return Ok(documents);
        }

        // GET: api/students/documents/photo  - the file itself (for preview / download)
        [HttpGet("{documentType}")]
        public async Task<IActionResult> Download(string documentType)
        {
            if (!TryGetUserId(out var userId))
            {
                return Unauthorized();
            }

            if (!DocumentTypes.All.ContainsKey(documentType))
            {
                return BadRequest(new { message = "Unknown document type." });
            }

            var document = await _db.StudentDocuments.AsNoTracking()
                .FirstOrDefaultAsync(d => d.UserId == userId && d.DocumentType == documentType);

            if (document == null)
            {
                return NotFound(new { message = "This file has not been uploaded yet." });
            }

            Response.Headers.XContentTypeOptions = "nosniff";
            return File(document.Content, document.ContentType);
        }

        // PUT: api/students/documents/photo  (multipart/form-data with a "file" field)
        // Uploads the file, replacing any earlier upload of the same type
        [HttpPut("{documentType}")]
        [RequestSizeLimit(DocumentTypes.MaxFileSize + 64 * 1024)]
        public async Task<ActionResult<StudentDocumentDto>> Upload(string documentType, IFormFile? file)
        {
            if (!TryGetUserId(out var userId))
            {
                return Unauthorized();
            }

            if (!DocumentTypes.All.TryGetValue(documentType, out var allowedTypes))
            {
                return BadRequest(new { message = "Unknown document type." });
            }

            if (await _db.IsApplicationLockedAsync(userId))
            {
                return Conflict(new { message = "Your application has been submitted, so your files can no longer be changed." });
            }

            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "Please choose a file to upload." });
            }

            if (file.Length > DocumentTypes.MaxFileSize)
            {
                return BadRequest(new { message = "File size must be 2 MB or less." });
            }

            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            var content = stream.ToArray();

            var contentType = DocumentTypes.DetectContentType(content);
            if (contentType == null || !allowedTypes.Contains(contentType))
            {
                var formats = allowedTypes.Contains(DocumentTypes.Pdf) ? "PDF, JPG or PNG" : "JPG or PNG";
                return BadRequest(new { message = $"Only {formats} files are accepted." });
            }

            var document = await _db.StudentDocuments
                .FirstOrDefaultAsync(d => d.UserId == userId && d.DocumentType == documentType);
            if (document == null)
            {
                document = new StudentDocument
                {
                    UserId = userId,
                    StudentId = User.FindFirstValue("studentId") ?? string.Empty,
                    DocumentType = documentType,
                };
                _db.StudentDocuments.Add(document);
            }

            document.FileName = CleanFileName(file.FileName);
            document.ContentType = contentType;
            document.Size = content.Length;
            document.Content = content;
            document.UploadedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Ok(ToDto(document));
        }

        // DELETE: api/students/documents/photo
        [HttpDelete("{documentType}")]
        public async Task<IActionResult> Delete(string documentType)
        {
            if (!TryGetUserId(out var userId))
            {
                return Unauthorized();
            }

            if (!DocumentTypes.All.ContainsKey(documentType))
            {
                return BadRequest(new { message = "Unknown document type." });
            }

            if (await _db.IsApplicationLockedAsync(userId))
            {
                return Conflict(new { message = "Your application has been submitted, so your files can no longer be changed." });
            }

            await _db.StudentDocuments
                .Where(d => d.UserId == userId && d.DocumentType == documentType)
                .ExecuteDeleteAsync();

            return NoContent();
        }

        private bool TryGetUserId(out int userId) =>
            int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out userId);

        // Keeps only the name part (no client folder path) and limits its length
        private static string CleanFileName(string fileName)
        {
            var name = Path.GetFileName(fileName.Replace('\\', '/')).Trim();
            if (name.Length == 0)
            {
                name = "file";
            }
            return name.Length > 255 ? name[^255..] : name;
        }

        internal static StudentDocumentDto ToDto(StudentDocument d) => new()
        {
            DocumentType = d.DocumentType,
            FileName = d.FileName,
            ContentType = d.ContentType,
            Size = d.Size,
            UploadedAt = d.UploadedAt,
        };
    }
}
