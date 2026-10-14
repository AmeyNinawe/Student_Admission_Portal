import { Link, useNavigate } from "react-router-dom";
import "../../styles/ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Later this will call your backend API
    navigate("/verify-otp");
  };

  return (
    <div className="forgot-page">

      <div className="forgot-card">

        <div className="forgot-icon">🔐</div>

        <h2>Forgot Password?</h2>

        <p className="forgot-subtitle">
          Enter your registered email address and we'll send you
          an OTP to reset your password.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your registered email"
              required
            />
          </div>

          <button
            type="submit"
            className="forgot-button"
          >
            Send OTP
          </button>

        </form>

        <Link to="/login" className="back-login">
          ← Back to Login
        </Link>

      </div>

    </div>
  );
}

export default ForgotPassword;