import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import {
  adminApi,
  ApiError,
  getCurrentAdmin,
  type AdminDashboard as AdminDashboardData,
} from "../../services/api";
import "../../styles/AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const admin = getCurrentAdmin();

  const [counts, setCounts] = useState<AdminDashboardData | null>(null);

  useEffect(() => {
    adminApi
      .getDashboard()
      .then(setCounts)
      .catch((error: Error) => {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate("/admin/login");
          return;
        }
        alert(error.message);
      });
  }, [navigate]);

  return (
    <div className="admin-dashboard">

      <AdminSidebar active="dashboard" />

      {/* Main Content */}
      <main className="admin-main-content">

        <div className="admin-topbar">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome back, {admin?.fullName ?? "Admin"}</p>
          </div>

          <div className="admin-profile">
            <span>{admin?.username ?? "-"}</span>
          </div>
        </div>

        {/* Statistics */}
        <section className="admin-statistics">

          <div className="admin-stat-card">
            <h3>Total Applications</h3>
            <p>{counts?.total ?? "-"}</p>
          </div>

          <div className="admin-stat-card pending">
            <h3>Pending Applications</h3>
            <p>{counts?.pending ?? "-"}</p>
          </div>

          <div className="admin-stat-card approved">
            <h3>Approved Applications</h3>
            <p>{counts?.approved ?? "-"}</p>
          </div>

          <div className="admin-stat-card rejected">
            <h3>Rejected Applications</h3>
            <p>{counts?.rejected ?? "-"}</p>
          </div>

        </section>

        {/* Quick Actions */}
        <section className="admin-quick-section">

          <div className="admin-section-card">

            <h2>Student Applications</h2>

            <p>
              View and manage all student admission applications.
            </p>

            <button
              className="admin-primary-button"
              onClick={() => navigate("/admin/applications")}
            >
              View Applications
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;
