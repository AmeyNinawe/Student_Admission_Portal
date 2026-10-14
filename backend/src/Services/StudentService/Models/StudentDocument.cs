namespace StudentService.Models
{
    // An uploaded file (photo, signature or document); one per document type per student
    public class StudentDocument
    {
        public int Id { get; set; }

        // Account Id issued by the Auth service (JWT "sub" claim)
        public int UserId { get; set; }

        // Human-friendly ID from the Auth service, e.g. "STU2026000001"
        public string StudentId { get; set; } = string.Empty;

        // One of DocumentTypes.All, e.g. "photo" or "tenthMarksheet"
        public string DocumentType { get; set; } = string.Empty;

        public string FileName { get; set; } = string.Empty;

        public string ContentType { get; set; } = string.Empty;

        public int Size { get; set; }

        public byte[] Content { get; set; } = Array.Empty<byte>();

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}
