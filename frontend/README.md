# Admission Portal – Frontend

React 19 + TypeScript + Vite.

## Folder structure

```
frontend/
├── .env                      VITE_API_BASE_URL – address of the API Gateway
├── public/
└── src/
    ├── main.tsx              App entry point
    ├── App.tsx               Routes
    ├── assets/               Images / icons
    ├── services/
    │   └── api.ts            API client (auth + student microservices via the gateway), session helpers
    ├── pages/
    │   ├── auth/             Login, Register, Forgot / Reset password, OTP
    │   ├── student/          Dashboard, General / Academic info, Photo & Signature, Documents, Admission form
    │   └── admin/            Admin login, dashboard, applications, student details
    └── styles/               One stylesheet per page
```

## Scripts

```
npm install
npm run dev       # http://localhost:5173
npm run build
npm run lint
```

The backend (gateway on http://localhost:5000) must be running – see `../backend/README.md`.
