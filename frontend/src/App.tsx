import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyOTP from "./pages/auth/VerifyOTP";
import ResetPassword from "./pages/auth/ResetPassword";
import ResetSuccess from "./pages/auth/ResetSuccess";
import Dashboard from "./pages/student/Dashboard";
import GeneralInformation from "./pages/student/GeneralInformation";
import AcademicInformation from "./pages/student/AcademicInformation";
import PhotoSignature from "./pages/student/PhotoSignature";
import Documents from "./pages/student/Documents";
import AdmissionForm from "./pages/student/AdmissionForm";
import ApplicationSubmitted from "./pages/student/ApplicationSubmitted";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentApplications from "./pages/admin/StudentApplications";
import StudentDetails from "./pages/admin/StudentDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-success" element={<ResetSuccess />} />

        {/* Student pages require login */}
        <Route element={<ProtectedRoute role="Student" />}>
          <Route path="/student/dashboard" element={<Dashboard />} />
          <Route
            path="/student/general-information"
            element={<GeneralInformation />}
          />

          <Route
            path="/student/academic-information"
            element={<AcademicInformation />}
          />

          <Route
            path="/student/photo-signature"
            element={<PhotoSignature />}
          />

          <Route
            path="/student/documents"
            element={<Documents />}
          />

          <Route
            path="/student/admission-form"
            element={<AdmissionForm />}
          />

          <Route
            path="/student/application-submitted"
            element={<ApplicationSubmitted />}
          />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />}
        />

        {/* Admin pages require an admin login */}
        <Route element={<ProtectedRoute role="Admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route
            path="/admin/applications"
            element={<StudentApplications />}
          />

          <Route
            path="/admin/student/:applicationId"
            element={<StudentDetails />}
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;