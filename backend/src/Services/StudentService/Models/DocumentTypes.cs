namespace StudentService.Models
{
    // The files a student can upload and the formats accepted for each
    public static class DocumentTypes
    {
        public const int MaxFileSize = 2 * 1024 * 1024;

        public const string Jpeg = "image/jpeg";
        public const string Png = "image/png";
        public const string Pdf = "application/pdf";

        private static readonly string[] Images = { Jpeg, Png };
        private static readonly string[] ImagesAndPdf = { Jpeg, Png, Pdf };

        public static readonly IReadOnlyDictionary<string, string[]> All = new Dictionary<string, string[]>
        {
            ["photo"] = Images,
            ["signature"] = Images,
            ["tenthMarksheet"] = ImagesAndPdf,
            ["twelfthMarksheet"] = ImagesAndPdf,
            ["idProof"] = ImagesAndPdf,
            ["transferCertificate"] = ImagesAndPdf,
            ["otherCertificate"] = ImagesAndPdf,
        };

        // Files that must be uploaded before the application can be submitted
        public static readonly string[] Required = { "photo", "signature", "tenthMarksheet", "idProof" };

        // Works out the real format from the file's first bytes, so a renamed file
        // (e.g. "virus.exe" -> "photo.jpg") is rejected. Returns null if not JPG/PNG/PDF.
        public static string? DetectContentType(ReadOnlySpan<byte> content)
        {
            if (content.StartsWith(new byte[] { 0xFF, 0xD8, 0xFF }))
            {
                return Jpeg;
            }

            if (content.StartsWith(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }))
            {
                return Png;
            }

            if (content.StartsWith("%PDF-"u8))
            {
                return Pdf;
            }

            return null;
        }
    }
}
