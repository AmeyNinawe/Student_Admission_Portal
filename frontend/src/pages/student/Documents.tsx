import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ApiError,
  MAX_FILE_SIZE,
  REQUIRED_DOCUMENTS,
  studentApi,
  type DocumentType,
  type StudentDocument,
} from "../../services/api";
import "../../styles/Documents.css";

type DocumentKey = Exclude<DocumentType, "photo" | "signature">;

type DocumentFiles = Record<DocumentKey, StudentDocument | null>;

const DOCUMENT_TYPES = ["image/jpeg", "image/png", "application/pdf"];

const DOCUMENT_LABELS: Record<DocumentKey, string> = {
  tenthMarksheet: "10th marksheet",
  twelfthMarksheet: "12th marksheet",
  idProof: "ID proof",
  transferCertificate: "Transfer Certificate",
  otherCertificate: "other certificate",
};

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.ceil(bytes / 1024)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Documents() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<DocumentFiles>({
    tenthMarksheet: null,
    twelfthMarksheet: null,
    idProof: null,
    transferCertificate: null,
    otherCertificate: null,
  });
  const [busy, setBusy] = useState<DocumentKey | null>(null);

  const handleError = (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      navigate("/login");
      return;
    }
    alert((error as Error).message);
  };

  // Show the documents uploaded earlier
  useEffect(() => {
    studentApi
      .getDocuments()
      .then((uploaded) => {
        setDocuments((current) => {
          const next = { ...current };
          for (const document of uploaded) {
            if (document.documentType in next) {
              next[document.documentType as DocumentKey] = document;
            }
          }
          return next;
        });
      })
      .catch((error: Error) => {
        if (error instanceof ApiError && error.status === 401) {
          navigate("/login");
          return;
        }
        alert(error.message);
      });
  }, [navigate]);

  // Uploads straight away so the file is saved even if the student leaves the page
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    documentName: DocumentKey
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    if (!DOCUMENT_TYPES.includes(file.type)) {
      alert("Only PDF, JPG and PNG files are accepted.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("File size must be 2 MB or less.");
      return;
    }

    setBusy(documentName);
    try {
      const uploaded = await studentApi.uploadDocument(documentName, file);
      setDocuments((current) => ({ ...current, [documentName]: uploaded }));
    } catch (error) {
      handleError(error);
    } finally {
      setBusy(null);
    }
  };

  const removeFile = async (documentName: DocumentKey) => {
    setBusy(documentName);
    try {
      await studentApi.deleteDocument(documentName);
      setDocuments((current) => ({ ...current, [documentName]: null }));
    } catch (error) {
      handleError(error);
    } finally {
      setBusy(null);
    }
  };

  const viewFile = async (documentName: DocumentKey) => {
    // Open the tab first - browsers block pop-ups opened after an await
    const tab = window.open("", "_blank");
    try {
      const file = await studentApi.getDocumentFile(documentName);
      const url = URL.createObjectURL(file);
      if (tab) {
        tab.location.href = url;
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      tab?.close();
      handleError(error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const missing = REQUIRED_DOCUMENTS.filter(
      (type) => !documents[type as DocumentKey]
    );
    if (missing.length > 0) {
      alert(`Please upload your ${DOCUMENT_LABELS[missing[0] as DocumentKey]}.`);
      return;
    }

    navigate("/student/admission-form");
  };

  const renderDocumentCard = (
    title: string,
    description: string,
    documentName: DocumentKey,
    required: boolean = false
  ) => {
    const file = documents[documentName];

    return (
      <div className="document-card">
        <div className="document-icon">
          📄
        </div>

        <div className="document-content">
          <h3>
            {title}{" "}
            {required && <span className="required">*</span>}
          </h3>

          <p>{description}</p>

          {file ? (
            <div className="selected-file">
              <span className="file-name">
                {file.fileName} ({formatSize(file.size)})
              </span>

              <button
                type="button"
                className="remove-file"
                onClick={() => viewFile(documentName)}
              >
                View
              </button>

              <button
                type="button"
                className="remove-file"
                onClick={() => removeFile(documentName)}
                disabled={busy !== null}
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="choose-file-button">
              {busy === documentName ? "Uploading..." : "Choose File"}

              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) =>
                  handleFileChange(e, documentName)
                }
                disabled={busy !== null}
                hidden
              />
            </label>
          )}

          <small>
            PDF, JPG, JPEG or PNG • Maximum 2 MB
          </small>
        </div>
      </div>
    );
  };

  return (
    <div className="documents-page">
      <div className="documents-container">

        <div className="page-header">
          <h1>Document Upload</h1>

          <p>
            Upload the required documents for your admission
            application.
          </p>
        </div>

        <div className="document-note">
          <strong>Important:</strong> Make sure all uploaded
          documents are clear and readable.
        </div>

        <form onSubmit={handleSubmit}>

          <div className="documents-list">

            {renderDocumentCard(
              "10th Marksheet",
              "Upload your 10th standard marksheet.",
              "tenthMarksheet",
              true
            )}

            {renderDocumentCard(
              "12th Marksheet",
              "Upload your 12th standard marksheet.",
              "twelfthMarksheet"
            )}

            {renderDocumentCard(
              "Identity Proof",
              "Upload Aadhaar Card, PAN Card or other valid ID proof.",
              "idProof",
              true
            )}

            {renderDocumentCard(
              "Transfer Certificate",
              "Upload your Transfer Certificate (TC).",
              "transferCertificate"
            )}

            {renderDocumentCard(
              "Other Certificate",
              "Upload any additional certificate if required.",
              "otherCertificate"
            )}

          </div>

          <div className="document-guidelines">
            <h2>Document Guidelines</h2>

            <ul>
              <li>Documents must be clear and readable.</li>
              <li>Accepted formats: PDF, JPG, JPEG and PNG.</li>
              <li>Maximum file size is 2 MB per document.</li>
              <li>Make sure the complete document is visible.</li>
              <li>Do not upload password-protected files.</li>
            </ul>
          </div>

          <div className="documents-actions">
            <button type="submit" disabled={busy !== null}>
              Save & Continue
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Documents;
