import { useNavigate } from "react-router-dom";
import "../../styles/ResetPassword.css";

function ResetPassword() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Later this will call your backend API
    navigate("/reset-success");
  };

  return (
    <div className="reset-page">

      <div className="reset-card">

        <div className="reset-icon">🔑</div>

        <h2>Reset Password</h2>

        <p className="reset-subtitle">
          Create a new password for your student account.
        </p>

        <form onSubmit={handleSubmit}>

          {/* New Password */}
          <div className="form-group">
            <label>New Password</label>

            <input
              type="password"
              placeholder="Enter new password"
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label>Confirm Password</label>

            <input
              type="password"
              placeholder="Confirm new password"
              required
            />
          </div>

          <button
            type="submit"
            className="reset-button"
          >
            Reset Password
          </button>

        </form>

      </div>

    </div>
  );
}

export default ResetPassword;