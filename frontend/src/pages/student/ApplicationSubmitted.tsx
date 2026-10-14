import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, studentApi, type Application } from "../../services/api";
import { formatLongDate } from "../../utils/format";
import "../../styles/ApplicationSubmitted.css";

function ApplicationSubmitted() {
  const navigate = useNavigate();

  const [application, setApplication] = useState<Application | null>(null);

  useEffect(() => {
    studentApi
      .getApplication()
      .then((submitted) => {
        // Nothing submitted yet - send the student back to the review page
        if (!submitted) {
          navigate("/student/admission-form", { replace: true });
          return;
        }
        setApplication(submitted);
      })
      .catch((error: Error) => {
        if (error instanceof ApiError && error.status === 401) {
          navigate("/login");
          return;
        }
        alert(error.message);
      });
  }, [navigate]);

  return (
    <div className="application-submitted-page">
      <div className="success-card">

        {/* Success Icon */}
        <div className="success-icon">
          ✓
        </div>

        {/* Heading */}
        <h1>Application Submitted Successfully!</h1>

        <p className="success-message">
          Your admission application has been submitted successfully.
          Please keep your application ID for future reference.
        </p>

        {/* Application Details */}
        <div className="application-details">

          <div className="detail-item">
            <span>Application ID</span>
            <strong>{application?.applicationNumber ?? "-"}</strong>
          </div>

          <div className="detail-item">
            <span>Student ID</span>
            <strong>{application?.studentId ?? "-"}</strong>
          </div>

          <div className="detail-item">
            <span>Submitted Date</span>
            <strong>{application ? formatLongDate(application.submittedAt) : "-"}</strong>
          </div>

          <div className="detail-item">
            <span>Status</span>
            <strong className="status-pending">
              {application?.status ?? "-"}
            </strong>
          </div>

        </div>

        {/* Information */}
        <div className="next-step-box">
          <h2>What's Next?</h2>

          <p>
            Your application is now under review by the college
            administration. You can check the application status
            from your student dashboard.
          </p>
        </div>

        {/* Buttons */}
        <div className="success-actions">

          <button
            className="dashboard-button"
            onClick={() => navigate("/student/dashboard")}
          >
            Go to Dashboard
          </button>

        </div>

      </div>
    </div>
  );
}

export default ApplicationSubmitted;
