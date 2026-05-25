import { Link } from "react-router-dom";

import "./index.css";

const AdminDashboard = () => {
  return (
    <div className="admin-dashborad-container">
      <h1>Admin Dashboard</h1>
      <div className="admin-links-container">
        <Link to="/admin/users" className="admin-dashboard-nav-links">
          Get Users
        </Link>
        <Link to="/admin/analytics" className="admin-dashboard-nav-links">
          Get Revenue Analytics
        </Link>
      </div>
    </div>
  );
};
export default AdminDashboard;
