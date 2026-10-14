namespace StudentService.DTOs
{
    // File details without the content; the file itself is downloaded separately
    public class StudentDocumentDto
    {
        public string DocumentType { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public int Size { get; set; }
        public DateTime UploadedAt { get; set; }
    }
}
