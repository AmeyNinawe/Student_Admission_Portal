import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ApiError,
  authApi,
  getCurrentStudent,
  REQUIRED_DOCUMENTS,
  studentApi,
  type Application,
  type Student,
} from "../../services/api";
import "../../styles/Dashboard.css";

// Number of application steps shown as cards below
const TOTAL_STEPS = 5;

function Dashboard() {
  const navigate = useNavigate();

  // Show the cached student straight away, then refresh it from the API
  const [student, setStudent] = useState<Student | null>(getCurrentStudent());
  const [generalInfoCompleted, setGeneralInfoCompleted] = useState(false);
  const [academicInfoCompleted, setAcademicInfoCompleted] = useState(false);
  const [photoSignatureCompleted, setPhotoSignatureCompleted] = useState(false);
  const [documentsCompleted, setDocumentsCompleted] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);

  useEffect(() => {
    Promise.all([
      authApi.me(),
      studentApi.getGeneralInformation(),
      studentApi.getAcademicInformation(),
      studentApi.getDocuments(),
      studentApi.getApplication(),
    ])
      .then(([me, generalInfo, academicInfo, documents, submitted]) => {
        const uploaded = new Set(documents.map((d) => d.documentType));

        setStudent(me);
        setGeneralInfoCompleted(generalInfo !== null);
        setAcademicInfoCompleted(academicInfo !== null);
        setPhotoSignatureCompleted(uploaded.has("photo") && uploaded.has("signature"));
        setDocumentsCompleted(REQUIRED_DOCUMENTS.every((type) => uploaded.has(type)));
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

  const handleLogout = async () => {
    await authApi.logout();
    navigate("/login");
  };

  // A rejected application has to be corrected and submitted again
  const submitted = application !== null && application.status !== "Rejected";

  const completedSteps = [
    generalInfoCompleted,
    academicInfoCompleted,
    photoSignatureCompleted,
    documentsCompleted,
    submitted,
  ].filter(Boolean).length;

  const statusMessage = !application
    ? "Your admission application is currently in progress."
    : application.status === "Pending"
      ? `Application ${application.applicationNumber} is under review by the college administration.`
      : application.status === "Approved"
        ? `Congratulations! Application ${application.applicationNumber} has been approved.`
        : `Application ${application.applicationNumber} was rejected. Please correct your details and submit again.`;

  return (
    <div className="dashboard-page">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          🎓
          <h2>Admission Portal</h2>
        </div>

        <nav className="sidebar-menu">
          <Link to="/student/dashboard" className="active">
            🏠 Dashboard
          </Link>

          <Link to="/student/general-information">
            👤 General Information
          </Link>

          <Link to="/student/academic-information">
            📚 Academic Information
          </Link>

          <Link to="/student/photo-signature">
            🖼️ Photo & Signature
          </Link>

          <Link to="/student/documents">
            📄 Documents
          </Link>

          <Link to="/student/admission-form">
            📝 Final Admission Form
          </Link>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">

        <header className="dashboard-header">
          <div>
            <h1>Welcome, {student?.fullName ?? "Student"}! 👋</h1>
            <p>Complete your admission application step by step.</p>
          </div>

          <div className="student-info">
            <span>Student ID</span>
            <strong>{student?.studentId ?? "-"}</strong>
          </div>
        </header>

        {/* Application Status */}
        <section className="status-card">
          <div>
            <h3>Application Status</h3>
            <p>{statusMessage}</p>
            {application?.remarks && <p>Remarks: {application.remarks}</p>}
          </div>

          <span className={`status-badge${application ? ` ${application.status.toLowerCase()}` : ""}`}>
            {application?.status ?? "Draft"}
          </span>
        </section>

        {/* Progress */}
        <section className="progress-section">
          <div className="section-heading">
            <h2>Application Progress</h2>
            <span>{completedSteps} / {TOTAL_STEPS} Completed</span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(completedSteps / TOTAL_STEPS) * 100}%` }}
            ></div>
          </div>
        </section>

        {/* Application Steps */}
        <section className="application-grid">

          <div className={`application-card${generalInfoCompleted ? " completed" : ""}`}>
            <div className="card-icon">👤</div>
            <h3>General Information</h3>
            <p>Personal and contact details</p>
            {generalInfoCompleted ? (
              <span>✓ Completed</span>
            ) : (
              <Link to="/student/general-information">
                Fill Details →
              </Link>
            )}
          </div>

          <div className={`application-card${academicInfoCompleted ? " completed" : ""}`}>
            <div className="card-icon">📚</div>
            <h3>Academic Information</h3>
            <p>Enter your academic details</p>
            {academicInfoCompleted ? (
              <span>✓ Completed</span>
            ) : (
              <Link to="/student/academic-information">
                Continue →
              </Link>
            )}
          </div>

          <div className={`application-card${photoSignatureCompleted ? " completed" : ""}`}>
            <div className="card-icon">🖼️</div>
            <h3>Photo & Signature</h3>
            <p>Upload photo and signature</p>
            {photoSignatureCompleted ? (
              <span>✓ Completed</span>
            ) : (
              <Link to="/student/photo-signature">
                Upload →
              </Link>
            )}
          </div>

          <div className={`application-card${documentsCompleted ? " completed" : ""}`}>
            <div className="card-icon">📄</div>
            <h3>Documents</h3>
            <p>Upload required documents</p>
            {documentsCompleted ? (
              <span>✓ Completed</span>
            ) : (
              <Link to="/student/documents">
                Upload →
              </Link>
            )}
          </div>

          <div className={`application-card${submitted ? " completed" : ""}`}>
            <div className="card-icon">📝</div>
            <h3>Final Admission Form</h3>
            <p>Review and submit your application</p>
            {submitted ? (
              <span>✓ Submitted</span>
            ) : (
              <Link to="/student/admission-form">
                View Form →
              </Link>
            )}
          </div>

        </section>

      </main>
    </div>
  );
}

export default Dashboard;