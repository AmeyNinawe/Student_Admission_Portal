import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "../../components/PasswordInput";
import { authApi, saveSession } from "../../services/api";
import "../../styles/AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);
    try {
      const auth = await authApi.adminLogin(adminId, password);
      saveSession(auth, false);
      navigate("/admin/dashboard");
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">

        <div className="admin-login-header">
          <h1>Admin Login</h1>
          <p>Student Admission Portal</p>
        </div>

        <form onSubmit={handleLogin}>

          <div className="admin-form-group">
            <label htmlFor="adminId">Admin ID / Email</label>

            <input
              type="text"
              id="adminId"
              placeholder="Enter Admin ID"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">Password</label>

            <PasswordInput
              id="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="admin-login-error">
              {error}
            </p>
          )}

          <button type="submit" className="admin-login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="admin-login-note">
          Admin access only
        </p>

        <p className="admin-login-back">
          <Link to="/login">← Back to Student Login</Link>
        </p>

      </div>
    </div>
  );
}

export default AdminLogin;
