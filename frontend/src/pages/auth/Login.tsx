import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import PasswordInput from "../../components/PasswordInput";
import { authApi, saveSession } from "../../services/api";
import "../../styles/Login.css";

function Login() {
  const [emailOrStudentId, setEmailOrStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    try {
      const auth = await authApi.login({ emailOrStudentId, password, rememberMe });
      saveSession(auth, rememberMe);
      navigate("/student/dashboard");
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Left Section */}
      <div className="login-left">
        <div className="brand-content">
          <h1>Student Admission Portal</h1>
          <p>
            Your journey towards a better future starts here.
          </p>

          <div className="education-icon">🎓</div>
        </div>
      </div>

      {/* Right Section */}
      <div className="login-right">
        <div className="login-card">

          <h2>Welcome Back!</h2>
          <p className="login-subtitle">
            Login to continue your admission process
          </p>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Email / Student ID</label>
              <input
                type="text"
                placeholder="Enter Email or Student ID"
                value={emailOrStudentId}
                onChange={(e) => setEmailOrStudentId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <PasswordInput
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="login-options">
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>

              <Link to="/forgot-password">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          <p className="register-text">
            Don't have an account?{" "}
            <Link to="/register">Register</Link>
          </p>

          <p className="register-text">
            College staff?{" "}
            <Link to="/admin/login">Admin login</Link>
          </p>

        </div>
      </div>

    </div>
  );
}

export default Login;