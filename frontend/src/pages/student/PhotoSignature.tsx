import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, MAX_FILE_SIZE, studentApi } from "../../services/api";
import "../../styles/PhotoSignature.css";

type Slot = "photo" | "signature";

type UploadedImage = {
  fileName: string;
  preview: string; // object URL of the image
};

const IMAGE_TYPES = ["image/jpeg", "image/png"];

function PhotoSignature() {
  const navigate = useNavigate();

  const [images, setImages] = useState<Record<Slot, UploadedImage | null>>({
    photo: null,
    signature: null,
  });
  const [busy, setBusy] = useState<Slot | null>(null);

  // Object URLs created for previews, released when the page is closed
  const previewUrls = useRef<string[]>([]);
  const createPreview = (file: Blob) => {
    const url = URL.createObjectURL(file);
    previewUrls.current.push(url);
    return url;
  };

  useEffect(() => {
    const urls = previewUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const handleError = (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      navigate("/login");
      return;
    }
    alert((error as Error).message);
  };

  // Show the photo and signature uploaded earlier
  useEffect(() => {
    const load = async () => {
      const documents = await studentApi.getDocuments();

      for (const slot of ["photo", "signature"] as Slot[]) {
        const document = documents.find((d) => d.documentType === slot);
        if (!document) continue;

        const preview = URL.createObjectURL(await studentApi.getDocumentFile(slot));
        previewUrls.current.push(preview);
        setImages((current) => ({
          ...current,
          [slot]: { fileName: document.fileName, preview },
        }));
      }
    };

    load().catch((error: Error) => {
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
    slot: Slot
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    if (!IMAGE_TYPES.includes(file.type)) {
      alert("Only JPG and PNG files are accepted.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("File size must be 2 MB or less.");
      return;
    }

    setBusy(slot);
    try {
      const uploaded = await studentApi.uploadDocument(slot, file);
      setImages((current) => ({
        ...current,
        [slot]: { fileName: uploaded.fileName, preview: createPreview(file) },
      }));
    } catch (error) {
      handleError(error);
    } finally {
      setBusy(null);
    }
  };

  const removeImage = async (slot: Slot) => {
    setBusy(slot);
    try {
      await studentApi.deleteDocument(slot);
      setImages((current) => ({ ...current, [slot]: null }));
    } catch (error) {
      handleError(error);
    } finally {
      setBusy(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!images.photo || !images.signature) {
      alert("Please upload both photo and signature.");
      return;
    }

    navigate("/student/documents");
  };

  const renderUploadCard = (
    slot: Slot,
    title: string,
    info: string,
    label: string
  ) => {
    const image = images[slot];

    return (
      <div className="upload-card">
        <h2>{title}</h2>

        <p className="upload-info">{info}</p>

        <div className={`preview-box ${slot}-preview`}>
          {image ? (
            <img src={image.preview} alt={`${label} preview`} />
          ) : (
            <div className="preview-placeholder">
              <span>{label}</span>
              <small>Preview</small>
            </div>
          )}
        </div>

        <label className="upload-button">
          {busy === slot
            ? "Uploading..."
            : image
              ? `Change ${label}`
              : `Choose ${label}`}

          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={(e) => handleFileChange(e, slot)}
            disabled={busy !== null}
            hidden
          />
        </label>

        {image && (
          <div className="file-details">
            <p>{image.fileName}</p>

            <button
              type="button"
              className="remove-button"
              onClick={() => removeImage(slot)}
              disabled={busy !== null}
            >
              Remove
            </button>
          </div>
        )}

        <p className="file-hint">
          JPG or PNG • Maximum 2 MB
        </p>
      </div>
    );
  };

  return (
    <div className="photo-signature-page">
      <div className="photo-signature-container">

        <div className="page-header">
          <h1>Photo & Signature</h1>
          <p>
            Upload your recent photograph and signature for your admission
            application.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="upload-section">

            {renderUploadCard(
              "photo",
              "Student Photograph",
              "Upload a recent passport-size photograph.",
              "Photo"
            )}

            {renderUploadCard(
              "signature",
              "Student Signature",
              "Upload a clear scanned signature.",
              "Signature"
            )}

          </div>

          {/* Instructions */}
          <div className="upload-instructions">
            <h2>Upload Guidelines</h2>

            <ul>
              <li>Use a recent and clear photograph.</li>
              <li>Photo should have a plain background.</li>
              <li>Signature should be clearly visible.</li>
              <li>Only JPG and PNG files are accepted.</li>
              <li>Maximum file size should be 2 MB.</li>
            </ul>
          </div>

          <div className="photo-actions">
            <button type="submit" disabled={busy !== null}>
              Save & Continue
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default PhotoSignature;
