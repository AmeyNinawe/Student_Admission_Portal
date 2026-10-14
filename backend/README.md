# Admission Portal – Backend (Microservices)

```
React app (Vite, :5173)
        │
        ▼
ApiGateway (YARP, http://localhost:5000)
   ├── /api/auth/*      ──► AuthService    (http://localhost:5001)  ─► AdmissionPortal_DB
   └── /api/students/*  ──► StudentService (http://localhost:5002)  ─► AdmissionPortal_StudentDB
```

## Folder structure

```
backend/
├── AdmissionPortal.sln                   Solution for all microservices
├── .config/dotnet-tools.json             dotnet-ef local tool (dotnet tool restore)
├── src/
│   ├── ApiGateway/                       YARP reverse proxy – single entry point, CORS
│   ├── BuildingBlocks/
│   │   └── AdmissionPortal.Shared/       Shared setup: JWT validation, Swagger, DB migration
│   └── Services/
│       ├── AuthService/                  Register / login, issues JWTs
│       │   ├── Controllers/ DTOs/ Data/ Migrations/ Models/ Services/
│       └── StudentService/               Student general information
│           ├── Controllers/ DTOs/ Data/ Migrations/ Models/
└── legacy/
    └── AdmissionPortal/                  Old monolithic API (superseded, kept for reference)
```

| Service        | Responsibility                                   | Endpoints |
|----------------|--------------------------------------------------|-----------|
| ApiGateway     | Single entry point for the frontend, CORS        | routes only |
| AuthService    | Student accounts, password hashing, JWT issuing  | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| StudentService | Student general information (own database)       | `GET /api/students/general-information`, `PUT /api/students/general-information` |

Each service owns its own database. StudentService does not call AuthService – it trusts the
JWT issued by AuthService because both share the same `Jwt` settings (Key / Issuer / Audience)
in `appsettings.json`. Keep those values identical in both services.

## Running

1. Make sure your SQL Server login can create databases (or create `AdmissionPortal_DB` and
   `AdmissionPortal_StudentDB` up front). In Development each service applies its EF Core
   migrations automatically on startup.
2. Start the three services (separate terminals from `backend/`, or open `AdmissionPortal.sln`
   in Visual Studio and set multiple startup projects):

   ```
   dotnet run --project src/Services/AuthService
   dotnet run --project src/Services/StudentService
   dotnet run --project src/ApiGateway
   ```

Swagger UI: http://localhost:5001/swagger (Auth) and http://localhost:5002/swagger (Student).

## Adding a migration

```
dotnet tool restore
cd src/Services/StudentService
dotnet ef migrations add <Name>
```
