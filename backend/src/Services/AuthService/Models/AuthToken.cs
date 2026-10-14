namespace AuthService.Models
{
    // One row per issued token pair: the access token (JWT) and the refresh token that renews it.
    // Revoking the row (logout / refresh) invalidates both tokens.
    public class AuthToken
    {
        public int Id { get; set; }

        // Owner of the tokens: exactly one of StudentId / AdminId is set.
        // StudentId is the FK to Students.Id (not the "STU..." Student ID string).
        public int? StudentId { get; set; }

        public Student? Student { get; set; }

        public int? AdminId { get; set; }

        public Admin? Admin { get; set; }

        // The JWT "jti" claim; used to look the access token up when a request comes in
        public string Jti { get; set; } = string.Empty;

        public string AccessToken { get; set; } = string.Empty;

        public DateTime AccessTokenExpiresAt { get; set; }

        // Only a SHA-256 hash is stored, so a leaked database can't be used to refresh sessions
        public string RefreshTokenHash { get; set; } = string.Empty;

        public DateTime RefreshTokenExpiresAt { get; set; }

        // Kept so a rotated token gets the same lifetime as the original login
        public bool RememberMe { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? RevokedAt { get; set; }

        // Hash of the refresh token that replaced this one when it was rotated
        public string? ReplacedByTokenHash { get; set; }
    }
}
