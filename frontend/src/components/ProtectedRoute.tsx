import { Navigate, Outlet } from "react-router-dom";
import { getRole, getToken, type Role } from "../services/api";

// Wraps routes that need a logged-in student or admin; anyone else is sent to the matching
// login page. An expired access token is renewed by api.ts on the first API call.
function ProtectedRoute({ role }: { role: Role }) {
  const allowed = getToken() !== null && getRole() === role;
  const loginPath = role === "Admin" ? "/admin/login" : "/login";

  return allowed ? <Outlet /> : <Navigate to={loginPath} replace />;
}

export default ProtectedRoute;
