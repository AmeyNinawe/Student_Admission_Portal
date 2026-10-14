var builder = WebApplication.CreateBuilder(args);

// API Gateway: the single entry point for the React app. It forwards each request to
// the owning microservice based on the "ReverseProxy" routes in appsettings.json.

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// Allow the React dev servers (CRA: 3000, Vite: 5173) to call the API
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
        policy.WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [])
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors("ReactApp");

app.MapGet("/", () => "Admission Portal API Gateway is running.");

app.MapReverseProxy();

app.Run();
