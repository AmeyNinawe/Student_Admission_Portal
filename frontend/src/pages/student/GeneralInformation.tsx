import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ApiError,
  getCurrentStudent,
  getToken,
  studentApi,
  type GeneralInformation as GeneralInformationData,
} from "../../services/api";
import "../../styles/GeneralInformation.css";

function GeneralInformation() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<GeneralInformationData>({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    category: "",
    fatherName: "",
    motherName: "",
    guardianName: "",
    mobileNumber: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Load previously saved details, or pre-fill from the registered account
  useEffect(() => {
    if (!getToken()) {
      navigate("/login");
      return;
    }

    studentApi
      .getGeneralInformation()
      .then((saved) => {
        if (saved) {
          setFormData({
            ...saved,
            fatherName: saved.fatherName ?? "",
            motherName: saved.motherName ?? "",
            guardianName: saved.guardianName ?? "",
          });
          return;
        }

        const student = getCurrentStudent();
        if (student) {
          setFormData((current) => ({
            ...current,
            fullName: student.fullName,
            mobileNumber: student.mobileNumber,
            email: student.email,
          }));
        }
      })
      .catch((error: Error) => {
        alert(error.message);
        if (error instanceof ApiError && error.status === 401) {
          navigate("/login");
        }
      });
  }, [navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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
      await studentApi.saveGeneralInformation(formData);
      alert("General information saved successfully!");
      navigate("/student/academic-information");
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
    <div className="general-information-page">
      <div className="general-information-container">

        <div className="page-header">
          <h1>General Information</h1>
          <p>Please provide your personal and contact information.</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Personal Information */}
          <div className="form-section">
            <h2>Personal Information</h2>

            <div className="form-grid">

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="open">Open</option>
                  <option value="obc">OBC</option>
                  <option value="sc">SC</option>
                  <option value="st">ST</option>
                  <option value="ews">EWS</option>
                </select>
              </div>

            </div>
          </div>

          {/* Parent / Guardian Information */}
          <div className="form-section">
            <h2>Parent / Guardian Information</h2>

            <div className="form-grid">

              <div className="form-group">
                <label>Father's Name</label>
                <input
                  type="text"
                  name="fatherName"
                  placeholder="Enter father's name"
                  value={formData.fatherName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Mother's Name</label>
                <input
                  type="text"
                  name="motherName"
                  placeholder="Enter mother's name"
                  value={formData.motherName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Guardian Name</label>
                <input
                  type="text"
                  name="guardianName"
                  placeholder="Enter guardian name"
                  value={formData.guardianName}
                  onChange={handleChange}
                />
              </div>

            </div>
          </div>

          {/* Contact Information */}
          <div className="form-section">
            <h2>Contact Information</h2>

            <div className="form-grid">

              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  name="mobileNumber"
                  placeholder="Enter mobile number"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>
          </div>

          {/* Address Information */}
          <div className="form-section">
            <h2>Address Information</h2>

            <div className="form-grid">

              <div className="form-group full-width">
                <label>Address</label>
                <textarea
                  name="address"
                  placeholder="Enter your complete address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  placeholder="Enter state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  placeholder="Enter pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save & Continue"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default GeneralInformation;