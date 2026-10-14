// All requests go through the API Gateway, which routes them to the microservices:
//   /api/auth/*     -> AuthService    (student / admin login, register)
//   /api/students/* -> StudentService (the student's own application)
//   /api/admin/*    -> StudentService (application review, admins only)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

const TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const ROLE_KEY = "role";
const STUDENT_KEY = "student";
const ADMIN_KEY = "admin";

export type Role = "Student" | "Admin";

export interface Student {
  id: number;
  studentId: string;
  fullName: string;
  email: string;
  mobileNumber: string;
}

export interface Admin {
  id: number;
  username: string;
  fullName: string;
  email: string;
}

// Only the object matching "role" is set
export interface AuthResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  role: Role;
  student: Student | null;
  admin: Admin | null;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  emailOrStudentId: string;
  password: string;
  rememberMe: boolean;
}

export interface GeneralInformation {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  category: string;
  fatherName: string;
  motherName: string;
  guardianName: string;
  mobileNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

// 12th and Diploma are optional: send null for every field of a section that is left empty
export interface AcademicInformation {
  tenthBoard: string;
  tenthSchool: string;
  tenthYear: number;
  tenthPercentage: number;

  twelfthBoard: string | null;
  twelfthCollege: string | null;
  twelfthYear: number | null;
  twelfthPercentage: number | null;

  diplomaCollege: string | null;
  diplomaBranch: string | null;
  diplomaYear: number | null;
  diplomaPercentage: number | null;
}

export type DocumentType =
  | "photo"
  | "signature"
  | "tenthMarksheet"
  | "twelfthMarksheet"
  | "idProof"
  | "transferCertificate"
  | "otherCertificate";

// Details of an uploaded file (the file itself is fetched with studentApi.getDocumentFile)
export interface StudentDocument {
  documentType: DocumentType;
  fileName: string;
  contentType: string;
  size: number;
  uploadedAt: string;
}

// Uploads the application can't be submitted without
export const REQUIRED_DOCUMENTS: DocumentType[] = ["tenthMarksheet", "idProof"];

export const MAX_FILE_SIZE = 2 * 1024 * 1024;

export type ApplicationStatus = "Pending" | "Approved" | "Rejected";

export interface Application {
  applicationNumber: string;
  studentId: string;
  status: ApplicationStatus;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  remarks: string | null;
}

export interface AdminDashboard {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface ApplicationListItem {
  applicationNumber: string;
  studentId: string;
  fullName: string;
  email: string;
  category: string;
  submittedAt: string;
  status: ApplicationStatus;
}

export interface ApplicationDetails {
  application: Application;
  generalInformation: GeneralInformation | null;
  academicInformation: AcademicInformation | null;
  documents: StudentDocument[];
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// ---------- Session (kept for 7 days with "Remember me", else for the tab) ----------
// The access token expires after 15 minutes; request() renews it with the refresh token.

// One session per browser: logging in as an admin ends a student session and vice versa
export function saveSession(auth: AuthResponse, rememberMe: boolean) {
  clearSession();
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, auth.accessToken);
  storage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
  storage.setItem(ROLE_KEY, auth.role);
  if (auth.student) storage.setItem(STUDENT_KEY, JSON.stringify(auth.student));
  if (auth.admin) storage.setItem(ADMIN_KEY, JSON.stringify(auth.admin));
}

export function clearSession() {
  [localStorage, sessionStorage].forEach((storage) => {
    [TOKEN_KEY, REFRESH_TOKEN_KEY, ROLE_KEY, STUDENT_KEY, ADMIN_KEY].forEach((key) =>
      storage.removeItem(key)
    );
  });
}

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);
}

export function getRole(): Role | null {
  return (sessionStorage.getItem(ROLE_KEY) ?? localStorage.getItem(ROLE_KEY)) as Role | null;
}

export function getCurrentAdmin(): Admin | null {
  const json = sessionStorage.getItem(ADMIN_KEY) ?? localStorage.getItem(ADMIN_KEY);
  return json ? (JSON.parse(json) as Admin) : null;
}

function getRefreshToken(): string | null {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY) ?? localStorage.getItem(REFRESH_TOKEN_KEY);
}

// Shared so that several requests failing at once trigger only one refresh
let refreshPromise: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshPromise ??= (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) return false;

      // Keep the new tokens in the same storage the session was saved in
      saveSession((await response.json()) as AuthResponse, localStorage.getItem(REFRESH_TOKEN_KEY) !== null);
      return true;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export function getCurrentStudent(): Student | null {
  const json = sessionStorage.getItem(STUDENT_KEY) ?? localStorage.getItem(STUDENT_KEY);
  return json ? (JSON.parse(json) as Student) : null;
}

// ---------- HTTP helpers ----------

// Sends an authenticated request and returns the successful response, or throws ApiError
async function send(path: string, method: string, body?: unknown, isRetry = false): Promise<Response> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Files are sent as multipart/form-data; the browser sets that Content-Type itself
  const isFormData = body instanceof FormData;
  if (isFormData) {
    delete headers["Content-Type"];
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Unable to reach the server. Please try again later.");
  }

  if (response.status === 401 && token) {
    // Access token expired or revoked - get a new one and retry once, else force a fresh login
    if (!isRetry && (await refreshSession())) {
      return send(path, method, body, true);
    }
    clearSession();
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(response.status, getErrorMessage(response.status, data));
  }

  return response;
}

async function request<T>(path: string, method: string, body?: unknown): Promise<T> {
  const response = await send(path, method, body);
  return (await response.json().catch(() => null)) as T;
}

async function requestBlob(path: string): Promise<Blob> {
  const response = await send(path, "GET");
  return response.blob();
}

// Handles both { message } from our controllers and ASP.NET validation ProblemDetails
function getErrorMessage(status: number, data: unknown): string {
  if (data && typeof data === "object") {
    const problem = data as {
      message?: string;
      title?: string;
      errors?: Record<string, string[]>;
    };
    if (problem.message) return problem.message;
    if (problem.errors) return Object.values(problem.errors).flat().join("\n");
    if (problem.title) return problem.title;
  }
  if (status === 401) return "Your session has expired. Please login again.";
  return "Something went wrong. Please try again.";
}

// ---------- Auth microservice ----------

export const authApi = {
  register: (data: RegisterRequest) =>
    request<AuthResponse>("/api/auth/register", "POST", data),

  login: (data: LoginRequest) =>
    request<AuthResponse>("/api/auth/login", "POST", data),

  adminLogin: (usernameOrEmail: string, password: string) =>
    request<AuthResponse>("/api/auth/admin/login", "POST", { usernameOrEmail, password }),

  me: () => request<Student>("/api/auth/me", "GET"),

  // Revokes the tokens on the server; the local session is cleared even if that fails
  logout: async () => {
    try {
      await request<void>("/api/auth/logout", "POST");
    } catch {
      // Ignore - the tokens will expire on their own
    } finally {
      clearSession();
    }
  },
};

// ---------- Student microservice ----------

export const studentApi = {
  // Resolves to null when the student hasn't saved general information yet
  getGeneralInformation: async (): Promise<GeneralInformation | null> => {
    try {
      return await request<GeneralInformation>("/api/students/general-information", "GET");
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  saveGeneralInformation: (data: GeneralInformation) =>
    request<GeneralInformation>("/api/students/general-information", "PUT", data),

  // Resolves to null when the student hasn't saved academic information yet
  getAcademicInformation: async (): Promise<AcademicInformation | null> => {
    try {
      return await request<AcademicInformation>("/api/students/academic-information", "GET");
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  saveAcademicInformation: (data: AcademicInformation) =>
    request<AcademicInformation>("/api/students/academic-information", "PUT", data),

  // Photo, signature and documents
  getDocuments: () => request<StudentDocument[]>("/api/students/documents", "GET"),

  getDocumentFile: (type: DocumentType) => requestBlob(`/api/students/documents/${type}`),

  uploadDocument: (type: DocumentType, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<StudentDocument>(`/api/students/documents/${type}`, "PUT", formData);
  },

  deleteDocument: (type: DocumentType) =>
    request<void>(`/api/students/documents/${type}`, "DELETE"),

  // Resolves to null when the application hasn't been submitted yet
  getApplication: async (): Promise<Application | null> => {
    try {
      return await request<Application>("/api/students/application", "GET");
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  submitApplication: () => request<Application>("/api/students/application", "POST"),
};

// ---------- Admin (application review) ----------

export const adminApi = {
  getDashboard: () => request<AdminDashboard>("/api/admin/dashboard", "GET"),

  getApplications: (search: string, status: string) => {
    const query = new URLSearchParams();
    if (search.trim()) query.set("search", search.trim());
    if (status !== "All") query.set("status", status);
    return request<ApplicationListItem[]>(`/api/admin/applications?${query}`, "GET");
  },

  getApplication: (applicationNumber: string) =>
    request<ApplicationDetails>(`/api/admin/applications/${encodeURIComponent(applicationNumber)}`, "GET"),

  getDocumentFile: (applicationNumber: string, type: DocumentType) =>
    requestBlob(`/api/admin/applications/${encodeURIComponent(applicationNumber)}/documents/${type}`),

  updateStatus: (applicationNumber: string, status: ApplicationStatus, remarks: string) =>
    request<Application>(
      `/api/admin/applications/${encodeURIComponent(applicationNumber)}/status`,
      "PUT",
      { status, remarks }
    ),
};
