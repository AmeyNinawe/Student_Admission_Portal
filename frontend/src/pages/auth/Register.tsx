import { Link, useNavigate} from "react-router-dom";
import { useState } from "react";
import { authApi } from "../../services/api";
import "../../styles/Register.css";

function Register() {

  const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const form = e.currentTarget;

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  if (password !== confirmPassword) {
  alert("Password and Confirm Password do not match.");
  return;
}

  const formData = new FormData(form);

  setLoading(true);
  try {
    const auth = await authApi.register({
      fullName: String(formData.get("fullName")),
      email: String(formData.get("email")),
      mobileNumber: String(formData.get("mobile")),
      password,
      confirmPassword,
    });

    alert(
      `Registration successful! Your Student ID is ${auth.student?.studentId}. ` +
      "You can login using your email or Student ID."
    );
    navigate("/login");
  } catch (error) {
    alert((error as Error).message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="register-page">

      {/* Left Section */}
      <div className="register-left">
        <div className="register-brand">
          <div className="register-icon">🎓</div>

          <h1>Student Admission Portal</h1>

          <p>
            Create your account and begin your admission journey.
          </p>

          <div className="register-steps">
            <div>✓ Create Account</div>
            <div>✓ Complete Application</div>
            <div>✓ Submit Admission Form</div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="register-right">
        <div className="register-card">

          <h2>Create Account</h2>

          <p className="register-subtitle">
            Register as a student to start your admission process.
          </p>

          <form onSubmit={handleSubmit}>

            {/* Full Name */}
            <div className="form-group">
              <label>Full Name</label>

              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Mobile */}
            <div className="form-group">
              <label>Mobile Number</label>

              <input
                type="tel"
                name="mobile"
                placeholder="Enter your mobile number"
                maxLength={10}
                pattern="[0-9]{10}"
                inputMode="numeric"
                onChange={(e) =>{
                  e.target.value =
                  e.target.value.replace(/\D/g,"")
                }}
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label>Confirm Password</label>

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

          </form>

          <p className="login-text">
            Already have an account?{" "}
            <Link to="/login">Login</Link>
          </p>

        </div>
      </div>

    </div>
  );
}

export default Register;