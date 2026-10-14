import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import {
  adminApi,
  ApiError,
  type ApplicationListItem,
} from "../../services/api";
import { CATEGORY_LABELS } from "../../utils/format";
import "../../styles/StudentApplications.css";

function StudentApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Search and filter run on the server; wait for a pause in typing before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      adminApi
        .getApplications(searchTerm, statusFilter)
        .then(setApplications)
        .catch((error: Error) => {
          if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
            navigate("/admin/login");
            return;
          }
          alert(error.message);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, navigate]);

  const getStatusClass = (status: string) => {
    if (status === "Approved") {
      return "status-approved";
    }

    if (status === "Rejected") {
      return "status-rejected";
    }

    return "status-pending";
  };

  const formatDate = (isoDateTime: string) =>
    new Date(isoDateTime).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="student-applications-page">

      <AdminSidebar active="applications" />

      {/* Main Content */}
      <main className="applications-main-content">

        <div className="applications-header">
          <div>
            <h1>Student Applications</h1>
            <p>View and manage student admission applications.</p>
          </div>

          <div className="applications-filters">
            <input
              type="text"
              placeholder="Search by name, Student ID or Application ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="application-search"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="application-status-filter"
            >
              <option value="All">All Applications</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <button
            className="back-dashboard-button"
            onClick={() => navigate("/admin/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>

        {/* Applications Table */}
        <div className="applications-table-container">

          <table className="applications-table">

            <thead>
              <tr>
                <th>Application ID</th>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Category</th>
                <th>Submission Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {applications.map((application) => (
                <tr key={application.applicationNumber}>
                  <td>{application.applicationNumber}</td>
                  <td>{application.studentId}</td>
                  <td>{application.fullName || "-"}</td>
                  <td>{CATEGORY_LABELS[application.category] ?? (application.category || "-")}</td>
                  <td>{formatDate(application.submittedAt)}</td>

                  <td>
                    <span
                      className={`application-status ${getStatusClass(
                        application.status
                      )}`}
                    >
                      {application.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="view-application-button"
                      onClick={() =>
                        navigate(`/admin/student/${application.applicationNumber}`)
                      }
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {applications.length === 0 && (
                <tr>
                  <td colSpan={7} className="no-applications">
                    {loading ? "Loading applications..." : "No applications found."}
                  </td>
                </tr>
              )}
            </tbody>

          </table>

        </div>

      </main>

    </div>
  );
}

export default StudentApplications;
