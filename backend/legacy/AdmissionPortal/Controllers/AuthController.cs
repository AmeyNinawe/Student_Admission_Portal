using System.Security.Claims;
using AdmissionPortal.Data;
using AdmissionPortal.DTOs;
using AdmissionPortal.Models;
using AdmissionPortal.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AdmissionPortal.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly ITokenService _tokenService;
        private readonly IPasswordHasher<Student> _passwordHasher;

        public AuthController(AppDbContext db, ITokenService tokenService, IPasswordHasher<Student> passwordHasher)
        {
            _db = db;
            _tokenService = tokenService;
            _passwordHasher = passwordHasher;
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            var email = request.Email.Trim().ToLowerInvariant();

            if (await _db.Students.AnyAsync(s => s.Email == email))
            {
                return Conflict(new { message = "An account with this email already exists." });
            }

            var student = new Student
            {
                FullName = request.FullName.Trim(),
                Email = email,
                MobileNumber = request.MobileNumber.Trim(),
                // Temporary unique value; replaced below once the identity Id is known
                StudentId = Guid.NewGuid().ToString("N")[..20],
            };
            student.PasswordHash = _passwordHasher.HashPassword(student, request.Password);

            _db.Students.Add(student);
            await _db.SaveChangesAsync();

            student.StudentId = $"STU{student.CreatedAt.Year}{student.Id:D6}";
            await _db.SaveChangesAsync();

            var (token, expiresAt) = _tokenService.CreateToken(student, rememberMe: false);

            return Ok(new AuthResponse
            {
                Token = token,
                ExpiresAt = expiresAt,
                Student = ToDto(student),
            });
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            var identifier = request.EmailOrStudentId.Trim();
            var email = identifier.ToLowerInvariant();

            var student = await _db.Students
                .FirstOrDefaultAsync(s => s.Email == email || s.StudentId == identifier.ToUpper());

            if (student == null)
            {
                return Unauthorized(new { message = "Invalid Email/Student ID or password." });
            }

            var result = _passwordHasher.VerifyHashedPassword(student, student.PasswordHash, request.Password);
            if (result == PasswordVerificationResult.Failed)
            {
                return Unauthorized(new { message = "Invalid Email/Student ID or password." });
            }

            if (result == PasswordVerificationResult.SuccessRehashNeeded)
            {
                student.PasswordHash = _passwordHasher.HashPassword(student, request.Password);
            }

            student.LastLoginAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            var (token, expiresAt) = _tokenService.CreateToken(student, request.RememberMe);

            return Ok(new AuthResponse
            {
                Token = token,
                ExpiresAt = expiresAt,
                Student = ToDto(student),
            });
        }

        // GET: api/auth/me  (requires "Authorization: Bearer <token>")
        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<StudentDto>> Me()
        {
            var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(id, out var studentId))
            {
                return Unauthorized();
            }

            var student = await _db.Students.FindAsync(studentId);
            if (student == null)
            {
                return NotFound();
            }

            return Ok(ToDto(student));
        }

        private static StudentDto ToDto(Student s) => new()
        {
            Id = s.Id,
            StudentId = s.StudentId,
            FullName = s.FullName,
            Email = s.Email,
            MobileNumber = s.MobileNumber,
        };
    }
}
