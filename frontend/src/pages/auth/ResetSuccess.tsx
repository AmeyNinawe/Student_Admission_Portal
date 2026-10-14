import { Link } from "react-router-dom";
import "../../styles/ResetSuccess.css";

function ResetSuccess() {
  return (
    <div className="success-page">

      <div className="success-card">

        <div className="success-icon">
          ✓
        </div>

        <h2>Password Reset Successfully!</h2>

        <p>
          Your password has been updated successfully.
          You can now login using your new password.
        </p>

        <Link to="/login" className="success-button">
          Go to Login
        </Link>

      </div>

    </div>
  );
}

export default ResetSuccess;