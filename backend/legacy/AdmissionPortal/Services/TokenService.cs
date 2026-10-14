using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AdmissionPortal.Models;
using Microsoft.IdentityModel.Tokens;

namespace AdmissionPortal.Services
{
    public interface ITokenService
    {
        (string Token, DateTime ExpiresAt) CreateToken(Student student, bool rememberMe);
    }

    public class TokenService : ITokenService
    {
        private readonly IConfiguration _config;

        public TokenService(IConfiguration config)
        {
            _config = config;
        }

        public (string Token, DateTime ExpiresAt) CreateToken(Student student, bool rememberMe)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Jwt:Duration is in hours; "Remember me" extends the session to 7 days
            var expiresAt = rememberMe
                ? DateTime.UtcNow.AddDays(7)
                : DateTime.UtcNow.AddHours(double.Parse(_config["Jwt:Duration"] ?? "1"));

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, student.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, student.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("studentId", student.StudentId),
                new Claim(ClaimTypes.Name, student.FullName),
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: expiresAt,
                signingCredentials: credentials);

            return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
        }
    }
}
