namespace AuthService.Models
{
    // Staff account that reviews applications. Created by AdminSeeder, not by self-registration.
    public class Admin
    {
        public int Id { get; set; }

        // Login name, e.g. "ADM001"
        public string Username { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastLoginAt { get; set; }
    }
}
