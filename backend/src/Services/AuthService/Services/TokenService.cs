using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using AdmissionPortal.Shared;
using AuthService.Data;
using AuthService.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace AuthService.Services
{
    public record TokenPair(
        string AccessToken,
        DateTime AccessTokenExpiresAt,
        string RefreshToken,
        DateTime RefreshTokenExpiresAt);

    // Result of a refresh: the new tokens and whoever they belong to (Student or Admin is set)
    public record RefreshResult(TokenPair Tokens, Student? Student, Admin? Admin);

    public interface ITokenService
    {
        // Creates a new access + refresh token pair and stores it in the AuthTokens table
        Task<TokenPair> IssueTokensAsync(Student student, bool rememberMe);

        Task<TokenPair> IssueTokensAsync(Admin admin, bool rememberMe);

        // Exchanges a valid refresh token for a new pair (the old pair is revoked).
        // Returns null if the refresh token is unknown, expired or already used.
        Task<RefreshResult?> RefreshAsync(string refreshToken);

        // Revokes the token pair that the given access token belongs to (logout)
        Task RevokeAsync(string jti);

        Task<bool> IsAccessTokenActiveAsync(string jti);
    }

    public class TokenService : ITokenService
    {
        private readonly IConfiguration _config;
        private readonly AppDbContext _db;

        public TokenService(IConfiguration config, AppDbContext db)
        {
            _config = config;
            _db = db;
        }

        public async Task<TokenPair> IssueTokensAsync(Student student, bool rememberMe)
        {
            var (pair, _) = CreateTokenPair(student, null, rememberMe);
            await _db.SaveChangesAsync();
            return pair;
        }

        public async Task<TokenPair> IssueTokensAsync(Admin admin, bool rememberMe)
        {
            var (pair, _) = CreateTokenPair(null, admin, rememberMe);
            await _db.SaveChangesAsync();
            return pair;
        }

        public async Task<RefreshResult?> RefreshAsync(string refreshToken)
        {
            var hash = HashToken(refreshToken);
            var existing = await _db.AuthTokens
                .Include(t => t.Student)
                .Include(t => t.Admin)
                .FirstOrDefaultAsync(t => t.RefreshTokenHash == hash);

            if (existing == null)
            {
                return null;
            }

            var now = DateTime.UtcNow;

            if (existing.RevokedAt != null)
            {
                // A revoked token is being reused - it may have been stolen, so end every
                // session of this user and make them log in again
                var studentId = existing.StudentId;
                var adminId = existing.AdminId;
                await _db.AuthTokens
                    .Where(t => t.RevokedAt == null && t.StudentId == studentId && t.AdminId == adminId)
                    .ExecuteUpdateAsync(s => s.SetProperty(t => t.RevokedAt, now));
                return null;
            }

            if (existing.RefreshTokenExpiresAt <= now)
            {
                return null;
            }

            // Rotation: each refresh token can be used only once
            var (pair, newToken) = CreateTokenPair(existing.Student, existing.Admin, existing.RememberMe);
            existing.RevokedAt = now;
            existing.ReplacedByTokenHash = newToken.RefreshTokenHash;

            await _db.SaveChangesAsync();
            return new RefreshResult(pair, existing.Student, existing.Admin);
        }

        public async Task RevokeAsync(string jti)
        {
            await _db.AuthTokens
                .Where(t => t.Jti == jti && t.RevokedAt == null)
                .ExecuteUpdateAsync(s => s.SetProperty(t => t.RevokedAt, DateTime.UtcNow));
        }

        public Task<bool> IsAccessTokenActiveAsync(string jti) =>
            _db.AuthTokens.AnyAsync(t => t.Jti == jti && t.RevokedAt == null);

        // Builds both tokens for a student or an admin and adds the row to the DbContext; the caller saves
        private (TokenPair Pair, AuthToken Entity) CreateTokenPair(Student? student, Admin? admin, bool rememberMe)
        {
            var now = DateTime.UtcNow;

            var jti = Guid.NewGuid().ToString();
            var accessExpiresAt = now.AddMinutes(double.Parse(_config["Jwt:AccessTokenMinutes"] ?? "15"));
            var claims = student != null ? StudentClaims(student, jti) : AdminClaims(admin!, jti);
            var jwt = CreateJwt(claims, accessExpiresAt);

            // "Remember me" keeps the user signed in for longer by extending the refresh token
            var refreshDays = rememberMe
                ? double.Parse(_config["Jwt:RefreshTokenRememberMeDays"] ?? "7")
                : double.Parse(_config["Jwt:RefreshTokenDays"] ?? "1");
            var refreshExpiresAt = now.AddDays(refreshDays);
            var rawRefreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

            var entity = new AuthToken
            {
                StudentId = student?.Id,
                AdminId = admin?.Id,
                Jti = jti,
                AccessToken = jwt,
                AccessTokenExpiresAt = accessExpiresAt,
                RefreshTokenHash = HashToken(rawRefreshToken),
                RefreshTokenExpiresAt = refreshExpiresAt,
                RememberMe = rememberMe,
                CreatedAt = now,
            };

            _db.AuthTokens.Add(entity);

            return (new TokenPair(jwt, accessExpiresAt, rawRefreshToken, refreshExpiresAt), entity);
        }

        private static Claim[] StudentClaims(Student student, string jti) => new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, student.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, student.Email),
            new Claim(JwtRegisteredClaimNames.Jti, jti),
            new Claim("studentId", student.StudentId),
            new Claim(ClaimTypes.Name, student.FullName),
            new Claim(ClaimTypes.Role, Roles.Student),
        };

        private static Claim[] AdminClaims(Admin admin, string jti) => new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, admin.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, admin.Email),
            new Claim(JwtRegisteredClaimNames.Jti, jti),
            new Claim("username", admin.Username),
            new Claim(ClaimTypes.Name, admin.FullName),
            new Claim(ClaimTypes.Role, Roles.Admin),
        };

        private string CreateJwt(IEnumerable<Claim> claims, DateTime expiresAt)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: expiresAt,
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string HashToken(string token) =>
            Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
    }
}
