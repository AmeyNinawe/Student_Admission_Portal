using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using AdmissionPortal.Shared;
using AuthService.Data;
using AuthService.DTOs;
using AuthService.Models;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly ITokenService _tokenService;
        private readonly IPasswordHasher<Student> _passwordHasher;
        private readonly IPasswordHasher<Admin> _adminPasswordHasher;

        public AuthController(
            AppDbContext db,
            ITokenService tokenService,
            IPasswordHasher<Student> passwordHasher,
            IPasswordHasher<Admin> adminPasswordHasher)
        {
            _db = db;
            _tokenService = tokenService;
            _passwordHasher = passwordHasher;
            _adminPasswordHasher = adminPasswordHasher;
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

            var tokens = await _tokenService.IssueTokensAsync(student, rememberMe: false);

            return Ok(ToAuthResponse(tokens, student));
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

            var tokens = await _tokenService.IssueTokensAsync(student, request.RememberMe);

            return Ok(ToAuthResponse(tokens, student));
        }

        // POST: api/auth/admin/login
        [HttpPost("admin/login")]
        public async Task<ActionResult<AuthResponse>> AdminLogin(AdminLoginRequest request)
        {
            var identifier = request.UsernameOrEmail.Trim();

            var admin = await _db.Admins.FirstOrDefaultAsync(a =>
                a.Username == identifier.ToUpper() || a.Email == identifier.ToLower());

            if (admin == null)
            {
                return Unauthorized(new { message = "Invalid Admin ID or password." });
            }

            var result = _adminPasswordHasher.VerifyHashedPassword(admin, admin.PasswordHash, request.Password);
            if (result == PasswordVerificationResult.Failed)
            {
                return Unauthorized(new { message = "Invalid Admin ID or password." });
            }

            if (result == PasswordVerificationResult.SuccessRehashNeeded)
            {
                admin.PasswordHash = _adminPasswordHasher.HashPassword(admin, request.Password);
            }

            admin.LastLoginAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            var tokens = await _tokenService.IssueTokensAsync(admin, rememberMe: false);

            return Ok(ToAuthResponse(tokens, admin));
        }

        // POST: api/auth/refresh  - swaps a refresh token (student or admin) for a new token pair
        [HttpPost("refresh")]
        public async Task<ActionResult<AuthResponse>> Refresh(RefreshTokenRequest request)
        {
            var result = await _tokenService.RefreshAsync(request.RefreshToken);
            if (result == null)
            {
                return Unauthorized(new { message = "Your session has expired. Please login again." });
            }

            return Ok(result.Student != null
                ? ToAuthResponse(result.Tokens, result.Student)
                : ToAuthResponse(result.Tokens, result.Admin!));
        }

        // POST: api/auth/logout  - revokes the current access token and its refresh token
        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var jti = User.FindFirstValue(JwtRegisteredClaimNames.Jti);
            if (jti == null)
            {
                return Unauthorized();
            }

            await _tokenService.RevokeAsync(jti);
            return NoContent();
        }

        // GET: api/auth/me  (requires a student's "Authorization: Bearer <token>")
        [Authorize(Roles = Roles.Student)]
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

        private static AuthResponse ToAuthResponse(TokenPair tokens, Student student) => new()
        {
            AccessToken = tokens.AccessToken,
            AccessTokenExpiresAt = tokens.AccessTokenExpiresAt,
            RefreshToken = tokens.RefreshToken,
            RefreshTokenExpiresAt = tokens.RefreshTokenExpiresAt,
            Role = Roles.Student,
            Student = ToDto(student),
        };

        private static AuthResponse ToAuthResponse(TokenPair tokens, Admin admin) => new()
        {
            AccessToken = tokens.AccessToken,
            AccessTokenExpiresAt = tokens.AccessTokenExpiresAt,
            RefreshToken = tokens.RefreshToken,
            RefreshTokenExpiresAt = tokens.RefreshTokenExpiresAt,
            Role = Roles.Admin,
            Admin = new AdminDto
            {
                Id = admin.Id,
                Username = admin.Username,
                FullName = admin.FullName,
                Email = admin.Email,
            },
        };

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
