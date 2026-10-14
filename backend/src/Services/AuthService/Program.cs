using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using AdmissionPortal.Shared;
using AuthService.Data;
using AuthService.Models;
using AuthService.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Auth microservice: owns student and admin accounts (register / login) and issues JWTs
// (with a "Student" or "Admin" role) that the other microservices validate with the same Jwt settings.

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IPasswordHasher<Student>, PasswordHasher<Student>>();
builder.Services.AddScoped<IPasswordHasher<Admin>, PasswordHasher<Admin>>();

builder.Services.AddJwtAuthentication(builder.Configuration);

// Access tokens are stored in the AuthTokens table; reject ones revoked by logout / refresh
// even though their signature and lifetime are still valid
builder.Services.Configure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
{
    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = async context =>
        {
            var jti = context.Principal?.FindFirstValue(JwtRegisteredClaimNames.Jti);
            var tokenService = context.HttpContext.RequestServices.GetRequiredService<ITokenService>();

            if (jti == null || !await tokenService.IsAccessTokenActiveAsync(jti))
            {
                context.Fail("This token has been revoked.");
            }
        },
    };
});

builder.Services.AddControllers();
builder.Services.AddSwaggerWithJwt("Auth Service");

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    // Create / upgrade this service's database automatically during development
    app.MigrateDatabase<AppDbContext>();

    app.UseSwagger();
    app.UseSwaggerUI();
}

await AdminSeeder.SeedAsync(app);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
