using AdmissionPortal.Shared;
using StudentService.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Student microservice: owns the student's general and academic information and uploaded
// files (photo, signature, documents). It does not issue
// tokens - it only validates the JWTs issued by the Auth service (same Jwt settings).

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddJwtAuthentication(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddSwaggerWithJwt("Student Service");

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    // Create / upgrade this service's database automatically during development
    app.MigrateDatabase<AppDbContext>();

    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
