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
    // Every endpoint works on the logged-in student's own record, identified by the
    // JWT issued by the Auth service ("Authorization: Bearer <token>").
    [Authorize(Roles = Roles.Student)]
    [Route("api/students/academic-information")]
    [ApiController]
    public class AcademicInformationController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AcademicInformationController(AppDbContext db)
        {
            _db = db;
        }

        // GET: api/students/academic-information
        [HttpGet]
        public async Task<ActionResult<AcademicInformationDto>> Get()
        {
            if (!TryGetUserId(out var userId))
            {
                return Unauthorized();
            }

            var info = await _db.AcademicInformation.AsNoTracking()
                .FirstOrDefaultAsync(a => a.UserId == userId);

            if (info == null)
            {
                return NotFound(new { message = "Academic information has not been filled yet." });
            }

            return Ok(ToDto(info));
        }

        // PUT: api/students/academic-information  (creates the record on first save)
        [HttpPut]
        public async Task<ActionResult<AcademicInformationDto>> Save(AcademicInformationRequest request)
        {
            if (!TryGetUserId(out var userId))
            {
                return Unauthorized();
            }

            if (await _db.IsApplicationLockedAsync(userId))
            {
                return Conflict(new { message = "Your application has been submitted, so your details can no longer be changed." });
            }

            var info = await _db.AcademicInformation.FirstOrDefaultAsync(a => a.UserId == userId);
            if (info == null)
            {
                info = new AcademicInformation
                {
                    UserId = userId,
                    StudentId = User.FindFirstValue("studentId") ?? string.Empty,
                };
                _db.AcademicInformation.Add(info);
            }

            info.TenthBoard = request.TenthBoard.Trim();
            info.TenthSchool = request.TenthSchool.Trim();
            info.TenthYear = request.TenthYear!.Value;
            info.TenthPercentage = request.TenthPercentage!.Value;

            // Optional sections are validated as all-or-nothing, so checking one field is enough
            var hasTwelfth = !string.IsNullOrWhiteSpace(request.TwelfthBoard);
            info.TwelfthBoard = hasTwelfth ? request.TwelfthBoard!.Trim() : null;
            info.TwelfthCollege = hasTwelfth ? request.TwelfthCollege!.Trim() : null;
            info.TwelfthYear = hasTwelfth ? request.TwelfthYear : null;
            info.TwelfthPercentage = hasTwelfth ? request.TwelfthPercentage : null;

            var hasDiploma = !string.IsNullOrWhiteSpace(request.DiplomaCollege);
            info.DiplomaCollege = hasDiploma ? request.DiplomaCollege!.Trim() : null;
            info.DiplomaBranch = hasDiploma ? request.DiplomaBranch!.Trim() : null;
            info.DiplomaYear = hasDiploma ? request.DiplomaYear : null;
            info.DiplomaPercentage = hasDiploma ? request.DiplomaPercentage : null;

            info.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Ok(ToDto(info));
        }

        private bool TryGetUserId(out int userId) =>
            int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out userId);

        internal static AcademicInformationDto ToDto(AcademicInformation a) => new()
        {
            StudentId = a.StudentId,
            TenthBoard = a.TenthBoard,
            TenthSchool = a.TenthSchool,
            TenthYear = a.TenthYear,
            TenthPercentage = a.TenthPercentage,
            TwelfthBoard = a.TwelfthBoard,
            TwelfthCollege = a.TwelfthCollege,
            TwelfthYear = a.TwelfthYear,
            TwelfthPercentage = a.TwelfthPercentage,
            DiplomaCollege = a.DiplomaCollege,
            DiplomaBranch = a.DiplomaBranch,
            DiplomaYear = a.DiplomaYear,
            DiplomaPercentage = a.DiplomaPercentage,
            UpdatedAt = a.UpdatedAt,
        };
    }
}
