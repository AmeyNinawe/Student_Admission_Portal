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
    [Route("api/students/general-information")]
    [ApiController]
    public class GeneralInformationController : ControllerBase
    {
        private readonly AppDbContext _db;

        public GeneralInformationController(AppDbContext db)
        {
            _db = db;
        }

        // GET: api/students/general-information
        [HttpGet]
        public async Task<ActionResult<GeneralInformationDto>> Get()
        {
            if (!TryGetUserId(out var userId))
            {
                return Unauthorized();
            }

            var info = await _db.GeneralInformation.AsNoTracking()
                .FirstOrDefaultAsync(g => g.UserId == userId);

            if (info == null)
            {
                return NotFound(new { message = "General information has not been filled yet." });
            }

            return Ok(ToDto(info));
        }

        // PUT: api/students/general-information  (creates the record on first save)
        [HttpPut]
        public async Task<ActionResult<GeneralInformationDto>> Save(GeneralInformationRequest request)
        {
            if (!TryGetUserId(out var userId))
            {
                return Unauthorized();
            }

            if (await _db.IsApplicationLockedAsync(userId))
            {
                return Conflict(new { message = "Your application has been submitted, so your details can no longer be changed." });
            }

            var info = await _db.GeneralInformation.FirstOrDefaultAsync(g => g.UserId == userId);
            if (info == null)
            {
                info = new GeneralInformation
                {
                    UserId = userId,
                    StudentId = User.FindFirstValue("studentId") ?? string.Empty,
                };
                _db.GeneralInformation.Add(info);
            }

            info.FullName = request.FullName.Trim();
            info.DateOfBirth = request.DateOfBirth!.Value;
            info.Gender = request.Gender;
            info.Category = request.Category;
            info.FatherName = Clean(request.FatherName);
            info.MotherName = Clean(request.MotherName);
            info.GuardianName = Clean(request.GuardianName);
            info.MobileNumber = request.MobileNumber.Trim();
            info.Email = request.Email.Trim().ToLowerInvariant();
            info.Address = request.Address.Trim();
            info.City = request.City.Trim();
            info.State = request.State.Trim();
            info.Pincode = request.Pincode.Trim();
            info.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Ok(ToDto(info));
        }

        private bool TryGetUserId(out int userId) =>
            int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out userId);

        private static string? Clean(string? value) =>
            string.IsNullOrWhiteSpace(value) ? null : value.Trim();

        internal static GeneralInformationDto ToDto(GeneralInformation g) => new()
        {
            StudentId = g.StudentId,
            FullName = g.FullName,
            DateOfBirth = g.DateOfBirth,
            Gender = g.Gender,
            Category = g.Category,
            FatherName = g.FatherName,
            MotherName = g.MotherName,
            GuardianName = g.GuardianName,
            MobileNumber = g.MobileNumber,
            Email = g.Email,
            Address = g.Address,
            City = g.City,
            State = g.State,
            Pincode = g.Pincode,
            UpdatedAt = g.UpdatedAt,
        };
    }
}
