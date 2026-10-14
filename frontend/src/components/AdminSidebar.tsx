import { useNavigate } from "react-router-dom";
import { authApi } from "../services/api";

// Navigation shared by every admin page
function AdminSidebar({ active }: { active: "dashboard" | "applications" }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authApi.logout();
    navigate("/admin/login");
  };

  return (
    <aside className="admin-sidebar">

      <div className="admin-sidebar-header">
        <h2>Admin Panel</h2>
        <p>Admission Portal</p>
      </div>

      <nav className="admin-nav">

        <button
          className={`admin-nav-item${active === "dashboard" ? " active" : ""}`}
          onClick={() => navigate("/admin/dashboard")}
        >
          Dashboard
        </button>

        <button
          className={`admin-nav-item${active === "applications" ? " active" : ""}`}
          onClick={() => navigate("/admin/applications")}
        >
          Student Applications
        </button>

      </nav>

      <button
        className="admin-logout-button"
        onClick={handleLogout}
      >
        Logout
      </button>

    </aside>
  );
}

export default AdminSidebar;
