namespace AdmissionPortal.Shared
{
    // Values of the JWT role claim issued by the Auth service. Use with [Authorize(Roles = ...)].
    public static class Roles
    {
        public const string Student = "Student";
        public const string Admin = "Admin";
    }
}
