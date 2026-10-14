import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ApiError,
  studentApi,
  type AcademicInformation as AcademicInformationData,
} from "../../services/api";
import "../../styles/AcademicInformation.css";

// The inputs work with strings; the API uses numbers and null for empty optional fields
type AcademicForm = Record<keyof AcademicInformationData, string>;

const emptyForm: AcademicForm = {
  tenthBoard: "",
  tenthSchool: "",
  tenthYear: "",
  tenthPercentage: "",

  twelfthBoard: "",
  twelfthCollege: "",
  twelfthYear: "",
  twelfthPercentage: "",

  diplomaCollege: "",
  diplomaBranch: "",
  diplomaYear: "",
  diplomaPercentage: "",
};

function toForm(data: AcademicInformationData): AcademicForm {
  const form = { ...emptyForm };
  for (const key of Object.keys(emptyForm) as (keyof AcademicForm)[]) {
    form[key] = data[key]?.toString() ?? "";
  }
  return form;
}

const text = (value: string) => value.trim() || null;
const number = (value: string) => (value.trim() === "" ? null : Number(value));

function toRequest(form: AcademicForm): AcademicInformationData {
  return {
    tenthBoard: form.tenthBoard.trim(),
    tenthSchool: form.tenthSchool.trim(),
    tenthYear: Number(form.tenthYear),
    tenthPercentage: Number(form.tenthPercentage),

    twelfthBoard: text(form.twelfthBoard),
    twelfthCollege: text(form.twelfthCollege),
    twelfthYear: number(form.twelfthYear),
    twelfthPercentage: number(form.twelfthPercentage),

    diplomaCollege: text(form.diplomaCollege),
    diplomaBranch: text(form.diplomaBranch),
    diplomaYear: number(form.diplomaYear),
    diplomaPercentage: number(form.diplomaPercentage),
  };
}

function AcademicInformation() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<AcademicForm>(emptyForm);

  // Load previously saved details
  useEffect(() => {
    studentApi
      .getAcademicInformation()
      .then((saved) => {
        if (saved) setFormData(toForm(saved));
      })
      .catch((error: Error) => {
        if (error instanceof ApiError && error.status === 401) {
          navigate("/login");
          return;
        }
        alert(error.message);
      });
  }, [navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    try {
      await studentApi.saveAcademicInformation(toRequest(formData));
      alert("Academic information saved successfully!");
      navigate("/student/photo-signature");
    } catch (error) {
      alert((error as Error).message);
      if (error instanceof ApiError && error.status === 401) {
        navigate("/login");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="academic-information-page">
      <div className="academic-information-container">

        <div className="page-header">
          <h1>Academic Information</h1>
          <p>
            Enter your educational qualifications and academic details.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* 10th Information */}
          <div className="academic-section">
            <h2>10th / Secondary Education</h2>

            <div className="academic-grid">

              <div className="academic-group">
                <label>Board</label>
                <input
                  type="text"
                  name="tenthBoard"
                  placeholder="e.g. CBSE / State Board"
                  value={formData.tenthBoard}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="academic-group">
                <label>School Name</label>
                <input
                  type="text"
                  name="tenthSchool"
                  placeholder="Enter school name"
                  value={formData.tenthSchool}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="academic-group">
                <label>Passing Year</label>
                <input
                  type="number"
                  name="tenthYear"
                  placeholder="e.g. 2022"
                  value={formData.tenthYear}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="academic-group">
                <label>Percentage</label>
                <input
                  type="number"
                  name="tenthPercentage"
                  placeholder="e.g. 85.50"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.tenthPercentage}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>
          </div>

          {/* 12th Information */}
          <div className="academic-section">
            <h2>12th / Higher Secondary Education</h2>

            <div className="academic-grid">

              <div className="academic-group">
                <label>Board</label>
                <input
                  type="text"
                  name="twelfthBoard"
                  placeholder="e.g. CBSE / State Board"
                  value={formData.twelfthBoard}
                  onChange={handleChange}
                />
              </div>

              <div className="academic-group">
                <label>College / School Name</label>
                <input
                  type="text"
                  name="twelfthCollege"
                  placeholder="Enter college/school name"
                  value={formData.twelfthCollege}
                  onChange={handleChange}
                />
              </div>

              <div className="academic-group">
                <label>Passing Year</label>
                <input
                  type="number"
                  name="twelfthYear"
                  placeholder="e.g. 2024"
                  value={formData.twelfthYear}
                  onChange={handleChange}
                />
              </div>

              <div className="academic-group">
                <label>Percentage</label>
                <input
                  type="number"
                  name="twelfthPercentage"
                  placeholder="e.g. 80.50"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.twelfthPercentage}
                  onChange={handleChange}
                />
              </div>

            </div>
          </div>

          {/* Diploma Information */}
          <div className="academic-section">
            <h2>Diploma Information</h2>

            <p className="optional-text">
              Fill this section only if applicable.
            </p>

            <div className="academic-grid">

              <div className="academic-group">
                <label>College Name</label>
                <input
                  type="text"
                  name="diplomaCollege"
                  placeholder="Enter diploma college name"
                  value={formData.diplomaCollege}
                  onChange={handleChange}
                />
              </div>

              <div className="academic-group">
                <label>Branch</label>
                <input
                  type="text"
                  name="diplomaBranch"
                  placeholder="e.g. Computer Engineering"
                  value={formData.diplomaBranch}
                  onChange={handleChange}
                />
              </div>

              <div className="academic-group">
                <label>Passing Year</label>
                <input
                  type="number"
                  name="diplomaYear"
                  placeholder="e.g. 2024"
                  value={formData.diplomaYear}
                  onChange={handleChange}
                />
              </div>

              <div className="academic-group">
                <label>Percentage</label>
                <input
                  type="number"
                  name="diplomaPercentage"
                  placeholder="e.g. 75.50"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.diplomaPercentage}
                  onChange={handleChange}
                />
              </div>

            </div>
          </div>

          <div className="academic-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save & Continue"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AcademicInformation;