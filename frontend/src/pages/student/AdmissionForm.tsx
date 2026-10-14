import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ApiError,
  getCurrentStudent,
  studentApi,
  REQUIRED_DOCUMENTS,
  type AcademicInformation,
  type Application,
  type DocumentType,
  type GeneralInformation,
} from "../../services/api";
import {
  CATEGORY_LABELS,
  GENDER_LABELS,
  formatDate,
  formatPercentage as percentage,
} from "../../utils/format";
import "../../styles/AdmissionForm.css";

function AdmissionForm() {
  const navigate = useNavigate();

  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generalInfo, setGeneralInfo] = useState<GeneralInformation | null>(null);
  const [academicInfo, setAcademicInfo] = useState<AcademicInformation | null>(null);
  const [uploaded, setUploaded] = useState<Set<DocumentType>>(new Set());
  const [application, setApplication] = useState<Application | null>(null);

  const studentId = getCurrentStudent()?.studentId ?? "-";

  useEffect(() => {
    Promise.all([
      studentApi.getGeneralInformation(),
      studentApi.getAcademicInformation(),
      studentApi.getDocuments(),
      studentApi.getApplication(),
    ])
      .then(([general, academic, documents, submitted]) => {
        setGeneralInfo(general);
        setAcademicInfo(academic);
        setUploaded(new Set(documents.map((d) => d.documentType)));
        setApplication(submitted);
      })
      .catch((error: Error) => {
        if (error instanceof ApiError && error.status === 401) {
          navigate("/login");
          return;
        }
        alert(error.message);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // Personal, parent and contact details come from the General Information API
  const personal = {
    fullName: generalInfo?.fullName ?? "-",
    dateOfBirth: generalInfo ? formatDate(generalInfo.dateOfBirth) : "-",
    gender: generalInfo ? GENDER_LABELS[generalInfo.gender] ?? generalInfo.gender : "-",
    category: generalInfo ? CATEGORY_LABELS[generalInfo.category] ?? generalInfo.category : "-",
    fatherName: generalInfo?.fatherName || "-",
    motherName: generalInfo?.motherName || "-",
    guardianName: generalInfo?.guardianName || "-",
    mobileNumber: generalInfo?.mobileNumber ?? "-",
    email: generalInfo?.email ?? "-",
    address: generalInfo?.address ?? "-",
    city: generalInfo?.city ?? "-",
    state: generalInfo?.state ?? "-",
    pincode: generalInfo?.pincode ?? "-",
  };

  const uploadStatus = (type: DocumentType) =>
    uploaded.has(type) ? "Uploaded ✓" : "Not uploaded";

  const photoSignatureUploaded = uploaded.has("photo") && uploaded.has("signature");
  const requiredDocumentsUploaded = REQUIRED_DOCUMENTS.every((type) => uploaded.has(type));
  const readyToSubmit =
    generalInfo !== null && academicInfo !== null && photoSignatureUploaded && requiredDocumentsUploaded;

  // Submitted applications can't be changed unless an admin rejects them
  const alreadySubmitted = application !== null && application.status !== "Rejected";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!readyToSubmit) {
      alert("Please complete all the steps before submitting.");
      return;
    }

    if (!agreed) {
      alert("Please confirm the declaration before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      await studentApi.submitApplication();
      navigate("/student/application-submitted");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        navigate("/login");
        return;
      }
      alert((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admission-form-page">
      <div className="admission-form-container">

        {/* Header */}
        <div className="page-header">
          <h1>Final Admission Form</h1>

          <p>
            Review your information carefully before submitting
            your admission application.
          </p>
        </div>

        {/* Student ID */}
        <div className="student-id-box">
          <div>
            <span>Student ID</span>
            <strong>{studentId}</strong>
          </div>

          <div>
            <span>Application Status</span>
            <strong className="status-draft">{application?.status ?? "Draft"}</strong>
          </div>
        </div>

        {loading && <p>Loading your details...</p>}

        {alreadySubmitted && (
          <div className="declaration-box">
            <span>
              Your application {application.applicationNumber} has been submitted and is{" "}
              {application.status.toLowerCase()}. Your details can no longer be changed.
            </span>
          </div>
        )}

        {application?.status === "Rejected" && (
          <div className="declaration-box">
            <span>
              Your application was rejected
              {application.remarks ? `: ${application.remarks}` : "."} Please correct your
              details and submit again.
            </span>
          </div>
        )}

        {!loading && !generalInfo && (
          <div className="declaration-box">
            <span>
              You haven't filled your General Information yet.{" "}
              <Link to="/student/general-information">Fill it now →</Link>
            </span>
          </div>
        )}

        {!loading && !academicInfo && (
          <div className="declaration-box">
            <span>
              You haven't filled your Academic Information yet.{" "}
              <Link to="/student/academic-information">Fill it now →</Link>
            </span>
          </div>
        )}

        {!loading && !photoSignatureUploaded && (
          <div className="declaration-box">
            <span>
              You haven't uploaded your photo and signature yet.{" "}
              <Link to="/student/photo-signature">Upload now →</Link>
            </span>
          </div>
        )}

        {!loading && !requiredDocumentsUploaded && (
          <div className="declaration-box">
            <span>
              You haven't uploaded all the required documents yet.{" "}
              <Link to="/student/documents">Upload now →</Link>
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Personal Information */}
          <div className="review-section">
            <div className="section-heading">
              <h2>Personal Information</h2>

              <button
                type="button"
                onClick={() =>
                  navigate("/student/general-information")
                }
              >
                Edit
              </button>
            </div>

            <div className="review-grid">

              <div className="review-item">
                <span>Full Name</span>
                <strong>{personal.fullName}</strong>
              </div>

              <div className="review-item">
                <span>Date of Birth</span>
                <strong>{personal.dateOfBirth}</strong>
              </div>

              <div className="review-item">
                <span>Gender</span>
                <strong>{personal.gender}</strong>
              </div>

              <div className="review-item">
                <span>Category</span>
                <strong>{personal.category}</strong>
              </div>

            </div>
          </div>

          {/* Parent Information */}
          <div className="review-section">
            <div className="section-heading">
              <h2>Parent / Guardian Information</h2>

              <button
                type="button"
                onClick={() =>
                  navigate("/student/general-information")
                }
              >
                Edit
              </button>
            </div>

            <div className="review-grid">

              <div className="review-item">
                <span>Father's Name</span>
                <strong>{personal.fatherName}</strong>
              </div>

              <div className="review-item">
                <span>Mother's Name</span>
                <strong>{personal.motherName}</strong>
              </div>

              <div className="review-item">
                <span>Guardian Name</span>
                <strong>{personal.guardianName}</strong>
              </div>

            </div>
          </div>

          {/* Contact Information */}
          <div className="review-section">
            <div className="section-heading">
              <h2>Contact Information</h2>

              <button
                type="button"
                onClick={() =>
                  navigate("/student/general-information")
                }
              >
                Edit
              </button>
            </div>

            <div className="review-grid">

              <div className="review-item">
                <span>Mobile Number</span>
                <strong>{personal.mobileNumber}</strong>
              </div>

              <div className="review-item">
                <span>Email</span>
                <strong>{personal.email}</strong>
              </div>

              <div className="review-item full-width">
                <span>Address</span>
                <strong>{personal.address}</strong>
              </div>

              <div className="review-item">
                <span>City</span>
                <strong>{personal.city}</strong>
              </div>

              <div className="review-item">
                <span>State</span>
                <strong>{personal.state}</strong>
              </div>

              <div className="review-item">
                <span>Pincode</span>
                <strong>{personal.pincode}</strong>
              </div>

            </div>
          </div>

          {/* Academic Information */}
          <div className="review-section">
            <div className="section-heading">
              <h2>Academic Information</h2>

              <button
                type="button"
                onClick={() =>
                  navigate("/student/academic-information")
                }
              >
                Edit
              </button>
            </div>

            <div className="academic-review-card">

              <h3>10th / Secondary Education</h3>

              <div className="review-grid">

                <div className="review-item">
                  <span>Board</span>
                  <strong>{academicInfo?.tenthBoard ?? "-"}</strong>
                </div>

                <div className="review-item">
                  <span>School</span>
                  <strong>{academicInfo?.tenthSchool ?? "-"}</strong>
                </div>

                <div className="review-item">
                  <span>Passing Year</span>
                  <strong>{academicInfo?.tenthYear ?? "-"}</strong>
                </div>

                <div className="review-item">
                  <span>Percentage</span>
                  <strong>{percentage(academicInfo?.tenthPercentage)}</strong>
                </div>

              </div>

            </div>

            {/* 12th and Diploma are optional, so only show what was filled */}
            {academicInfo?.twelfthBoard && (
              <div className="academic-review-card">

                <h3>12th / Higher Secondary Education</h3>

                <div className="review-grid">

                  <div className="review-item">
                    <span>Board</span>
                    <strong>{academicInfo.twelfthBoard}</strong>
                  </div>

                  <div className="review-item">
                    <span>College</span>
                    <strong>{academicInfo.twelfthCollege}</strong>
                  </div>

                  <div className="review-item">
                    <span>Passing Year</span>
                    <strong>{academicInfo.twelfthYear}</strong>
                  </div>

                  <div className="review-item">
                    <span>Percentage</span>
                    <strong>{percentage(academicInfo.twelfthPercentage)}</strong>
                  </div>

                </div>

              </div>
            )}

            {academicInfo?.diplomaCollege && (
              <div className="academic-review-card">

                <h3>Diploma</h3>

                <div className="review-grid">

                  <div className="review-item">
                    <span>College</span>
                    <strong>{academicInfo.diplomaCollege}</strong>
                  </div>

                  <div className="review-item">
                    <span>Branch</span>
                    <strong>{academicInfo.diplomaBranch}</strong>
                  </div>

                  <div className="review-item">
                    <span>Passing Year</span>
                    <strong>{academicInfo.diplomaYear}</strong>
                  </div>

                  <div className="review-item">
                    <span>Percentage</span>
                    <strong>{percentage(academicInfo.diplomaPercentage)}</strong>
                  </div>

                </div>

              </div>
            )}
          </div>

          {/* Documents */}
          <div className="review-section">

            <div className="section-heading">
              <h2>Uploaded Documents</h2>

              <button
                type="button"
                onClick={() =>
                  navigate("/student/documents")
                }
              >
                Edit
              </button>
            </div>

            <div className="document-status-list">

              <div className="document-status">
                <span>10th Marksheet *</span>
                <strong>{uploadStatus("tenthMarksheet")}</strong>
              </div>

              <div className="document-status">
                <span>12th Marksheet</span>
                <strong>{uploadStatus("twelfthMarksheet")}</strong>
              </div>

              <div className="document-status">
                <span>Identity Proof *</span>
                <strong>{uploadStatus("idProof")}</strong>
              </div>

              <div className="document-status">
                <span>Transfer Certificate</span>
                <strong>{uploadStatus("transferCertificate")}</strong>
              </div>

              <div className="document-status">
                <span>Other Certificate</span>
                <strong>{uploadStatus("otherCertificate")}</strong>
              </div>

            </div>

          </div>

          {/* Photo & Signature */}
          <div className="review-section">

            <div className="section-heading">
              <h2>Photo & Signature</h2>

              <button
                type="button"
                onClick={() =>
                  navigate("/student/photo-signature")
                }
              >
                Edit
              </button>
            </div>

            <div className="upload-status">

              <div>
                <span>Student Photograph</span>
                <strong>{uploadStatus("photo")}</strong>
              </div>

              <div>
                <span>Student Signature</span>
                <strong>{uploadStatus("signature")}</strong>
              </div>

            </div>

          </div>

          {/* Declaration */}
          <div className="declaration-box">

            <label>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) =>
                  setAgreed(e.target.checked)
                }
              />

              <span>
                I hereby declare that all the information provided
                by me is true and correct to the best of my
                knowledge. I understand that providing incorrect
                information may result in rejection of my
                application.
              </span>
            </label>

          </div>

          {/* Submit */}
          <div className="submit-section">

            {alreadySubmitted && (
              <button
                type="button"
                className="submit-button dashboard-button"
                onClick={() => navigate("/student/dashboard")}
              >
                Go to Dashboard
              </button>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={!agreed || !readyToSubmit || alreadySubmitted || submitting}
            >
              {alreadySubmitted
                ? "Application Submitted"
                : submitting
                  ? "Submitting..."
                  : application?.status === "Rejected"
                    ? "Submit Again"
                    : "Submit Application"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default AdmissionForm;