import { Link } from "react-router-dom";

import { FaCarSide, FaParking, FaSignOutAlt } from "react-icons/fa";

import "./index.css";

const StaffDashboard = () => {
  return (
    <div className="staff-dashboard-container">
      <div className="staff-dashboard-header">
        <h1>Staff Dashboard</h1>

        <p>Manage parking check-in and checkout operations</p>
      </div>

      <div className="staff-dashboard-grid">
        <Link to="/staff/checkin" className="staff-dashboard-card">
          <FaCarSide className="staff-dashboard-icon" />

          <h2>Vehicle Check-In</h2>

          <p>Check-in reserved vehicles using reservation code</p>
        </Link>

        <Link to="/staff/active-sessions" className="staff-dashboard-card">
          <FaParking className="staff-dashboard-icon" />

          <h2>Active Sessions</h2>

          <p>View currently active parking sessions</p>
        </Link>

        <Link to="/staff/checkout" className="staff-dashboard-card">
          <FaSignOutAlt className="staff-dashboard-icon" />

          <h2>Vehicle Checkout</h2>

          <p>Complete checkout and generate payment</p>
        </Link>
      </div>
    </div>
  );
};

export default StaffDashboard;
