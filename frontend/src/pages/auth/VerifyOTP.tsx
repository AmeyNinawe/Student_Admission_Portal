import { Link, useNavigate } from "react-router-dom";
import "../../styles/VerifyOTP.css";

function VerifyOTP() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Later we will verify OTP through backend
    navigate("/reset-password");
  };

  return (
    <div className="otp-page">

      <div className="otp-card">

        <div className="otp-icon">✉️</div>

        <h2>Verify OTP</h2>

        <p className="otp-subtitle">
          We've sent a 6-digit OTP to your registered email address.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Enter OTP</label>

            <input
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              required
            />
          </div>

          <button
            type="submit"
            className="otp-button"
          >
            Verify OTP
          </button>

        </form>

        <p className="resend-text">
          Didn't receive the OTP?{" "}
          <button type="button" className="resend-button">
            Resend OTP
          </button>
        </p>

        <Link to="/forgot-password" className="back-link">
          ← Change Email
        </Link>

      </div>

    </div>
  );
}

export default VerifyOTP;