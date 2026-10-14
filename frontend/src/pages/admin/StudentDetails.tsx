import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import {
  adminApi,
  ApiError,
  type ApplicationDetails,
  type ApplicationStatus,
  type DocumentType,
} from "../../services/api";
import {
  CATEGORY_LABELS,
  GENDER_LABELS,
  formatDate,
  formatLongDate,
  formatPercentage,
} from "../../utils/format";
import "../../styles/StudentDetails.css";

const DOCUMENTS: { type: DocumentType; name: string }[] = [
  { type: "tenthMarksheet", name: "10th Marksheet" },
  { type: "twelfthMarksheet", name: "12th Marksheet" },
  { type: "idProof", name: "Identity Proof" },
  { type: "transferCertificate", name: "Transfer Certificate" },
  { type: "otherCertificate", name: "Other Certificate" },
];

function StudentDetails() {
  const navigate = useNavigate();
  const { applicationId = "" } = useParams();

  const [details, setDetails] = useState<ApplicationDetails | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");

  // Object URLs created for the images, released when the page is closed
  const imageUrls = useRef<string[]>([]);
  useEffect(() => {
    const urls = imageUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const handleError = (error: unknown) => {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      navigate("/admin/login");
      return;
    }
    alert((error as Error).message);
  };

  useEffect(() => {
    const load = async () => {
      const data = await adminApi.getApplication(applicationId);
      setDetails(data);

      // Photo and signature are protected files, so they are fetched with the admin's token
      const uploaded = new Set(data.documents.map((d) => d.documentType));
      for (const [type, setUrl] of [
        ["photo", setPhotoUrl],
        ["signature", setSignatureUrl],
      ] as const) {
        if (!uploaded.has(type)) continue;
        const url = URL.createObjectURL(await adminApi.getDocumentFile(applicationId, type));
        imageUrls.current.push(url);
        setUrl(url);
      }
    };

    load().catch((error: Error) => {
      if (error instanceof ApiError && error.status === 404) {
        setNotFound(true);
        return;
      }
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate("/admin/login");
        return;
      }
      alert(error.message);
    });
  }, [applicationId, navigate]);

  const updateStatus = async (status: ApplicationStatus) => {
    if (!details) return;

    // A rejection needs a reason the student can act on; approval remarks are optional
    let remarks = "";
    if (status !== "Pending") {
      const input = window.prompt(
        status === "Rejected"
          ? "Reason for rejection (shown to the student):"
          : "Remarks for the student (optional):",
        details.application.remarks ?? ""
      );
      if (input === null) return; // cancelled
      remarks = input.trim();
      if (status === "Rejected" && !remarks) {
        alert("Please enter a reason for rejection.");
        return;
      }
    }

    setSaving(true);
    try {
      const application = await adminApi.updateStatus(applicationId, status, remarks);
      setDetails({ ...details, application });
    } catch (error) {
      handleError(error);
    } finally {
      setSaving(false);
    }
  };

  const viewDocument = async (type: DocumentType) => {
    // Open the tab first - browsers block pop-ups opened after an await
    const tab = window.open("", "_blank");
    try {
      const url = URL.createObjectURL(await adminApi.getDocumentFile(applicationId, type));
      if (tab) {
        tab.location.href = url;
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      tab?.close();
      handleError(error);
    }
  };

  if (notFound) {
    return (
      <div className="student-details-page">
        <AdminSidebar active="applications" />
        <main className="student-details-main">
          <h2>Student application not found.</h2>
          <button className="back-button" onClick={() => navigate("/admin/applications")}>
            Back to Applications
          </button>
        </main>
      </div>
    );
  }

  const application = details?.application;
  const general = details?.generalInformation;
  const academic = details?.academicInformation;
  const uploaded = new Set(details?.documents.map((d) => d.documentType));
  const status = application?.status ?? "Pending";

  return (
    <div className="student-details-page">

      <AdminSidebar active="applications" />

      {/* Main Content */}
      <main className="student-details-main">

        <div className="student-details-header">

          <div>
            <h1>Student Details</h1>
            <p>
              Application ID: {applicationId}
            </p>
          </div>

          <button
            className="back-button"
            onClick={() => navigate("/admin/applications")}
          >
            Back to Applications
          </button>

        </div>

        {!details && <p>Loading application...</p>}

        {/* Application Status */}
        <section className="details-card status-card">

          <div>
            <h2>Application Status</h2>
            <span className={`details-status status-${status.toLowerCase()}`}>
              {status}
            </span>
            {application?.remarks && (
              <p className="status-remarks">Remarks: {application.remarks}</p>
            )}
          </div>

          <div className="status-buttons">

            <button
              className="approve-button"
              onClick={() => updateStatus("Approved")}
              disabled={!details || saving}
            >
              Approve
            </button>

            <button
              className="reject-button"
              onClick={() => updateStatus("Rejected")}
              disabled={!details || saving}
            >
              Reject
            </button>

            <button
              className="pending-button"
              onClick={() => updateStatus("Pending")}
              disabled={!details || saving || status === "Pending"}
            >
              Pending
            </button>

          </div>

        </section>

        {/* Personal Information */}
        <section className="details-card">

          <h2>Personal Information</h2>

          <div className="details-grid">

            <div>
              <label>Student ID</label>
              <p>{application?.studentId ?? "-"}</p>
            </div>

            <div>
              <label>Full Name</label>
              <p>{general?.fullName ?? "-"}</p>
            </div>

            <div>
              <label>Date of Birth</label>
              <p>{general ? formatDate(general.dateOfBirth) : "-"}</p>
            </div>

            <div>
              <label>Gender</label>
              <p>{general ? GENDER_LABELS[general.gender] ?? general.gender : "-"}</p>
            </div>

            <div>
              <label>Category</label>
              <p>{general ? CATEGORY_LABELS[general.category] ?? general.category : "-"}</p>
            </div>

          </div>

        </section>

        {/* Parent / Guardian */}
        <section className="details-card">

          <h2>Parent / Guardian Information</h2>

          <div className="details-grid">

            <div>
              <label>Father's Name</label>
              <p>{general?.fatherName || "-"}</p>
            </div>

            <div>
              <label>Mother's Name</label>
              <p>{general?.motherName || "-"}</p>
            </div>

            <div>
              <label>Guardian Name</label>
              <p>{general?.guardianName || "-"}</p>
            </div>

          </div>

        </section>

        {/* Contact Information */}
        <section className="details-card">

          <h2>Contact Information</h2>

          <div className="details-grid">

            <div>
              <label>Mobile Number</label>
              <p>{general?.mobileNumber ?? "-"}</p>
            </div>

            <div>
              <label>Email</label>
              <p>{general?.email ?? "-"}</p>
            </div>

            <div className="full-width">
              <label>Address</label>
              <p>{general?.address ?? "-"}</p>
            </div>

            <div>
              <label>City</label>
              <p>{general?.city ?? "-"}</p>
            </div>

            <div>
              <label>State</label>
              <p>{general?.state ?? "-"}</p>
            </div>

            <div>
              <label>Pincode</label>
              <p>{general?.pincode ?? "-"}</p>
            </div>

          </div>

        </section>

        {/* Academic Information */}
        <section className="details-card">

          <h2>Academic Information</h2>

          <div className="details-grid">

            <div>
              <label>10th</label>
              <p>
                {academic
                  ? `${formatPercentage(academic.tenthPercentage)} - ${academic.tenthBoard}, ${academic.tenthSchool} (${academic.tenthYear})`
                  : "-"}
              </p>
            </div>

            <div>
              <label>12th</label>
              <p>
                {academic?.twelfthBoard
                  ? `${formatPercentage(academic.twelfthPercentage)} - ${academic.twelfthBoard}, ${academic.twelfthCollege} (${academic.twelfthYear})`
                  : "Not Applicable"}
              </p>
            </div>

            <div>
              <label>Diploma</label>
              <p>
                {academic?.diplomaCollege
                  ? `${formatPercentage(academic.diplomaPercentage)} - ${academic.diplomaBranch}, ${academic.diplomaCollege} (${academic.diplomaYear})`
                  : "Not Applicable"}
              </p>
            </div>

          </div>

        </section>

        {/* Photo & Signature */}
        <section className="details-card">

          <h2>Photo & Signature</h2>

          <div className="photo-signature-container">

            <div className="image-box">
              <label>Student Photo</label>

              {photoUrl ? (
                <img src={photoUrl} alt="Student" />
              ) : (
                <p>Not uploaded</p>
              )}
            </div>

            <div className="image-box">
              <label>Signature</label>

              {signatureUrl ? (
                <img src={signatureUrl} alt="Student Signature" />
              ) : (
                <p>Not uploaded</p>
              )}
            </div>

          </div>

        </section>

        {/* Documents */}
        <section className="details-card">

          <h2>Documents</h2>

          <div className="documents-list">

            {DOCUMENTS.map((document) => (
              <div
                className="document-row"
                key={document.type}
              >
                <span>{document.name}</span>

                {uploaded.has(document.type) ? (
                  <span>
                    <span className="document-uploaded">Uploaded</span>{" "}
                    <button
                      type="button"
                      className="document-view-button"
                      onClick={() => viewDocument(document.type)}
                    >
                      View
                    </button>
                  </span>
                ) : (
                  <span className="document-missing">Not Uploaded</span>
                )}
              </div>
            ))}

          </div>

        </section>

        {/* Application Information */}
        <section className="details-card">

          <h2>Application Information</h2>

          <div className="details-grid">

            <div>
              <label>Application ID</label>
              <p>{applicationId}</p>
            </div>

            <div>
              <label>Submission Date</label>
              <p>{application ? formatLongDate(application.submittedAt) : "-"}</p>
            </div>

            <div>
              <label>Current Status</label>
              <p>{status}</p>
            </div>

            <div>
              <label>Reviewed By</label>
              <p>
                {application?.reviewedBy && application.reviewedAt
                  ? `${application.reviewedBy} on ${formatLongDate(application.reviewedAt)}`
                  : "-"}
              </p>
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default StudentDetails;
