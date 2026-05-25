import { Link } from "react-router-dom";

import "./index.css";

const CustomerDashboard = () => {
  return (
    <div className="customer-dashboard-container">
      <div className="customer-dashboard-header">
        <h1>Customer Dashboard</h1>

        <p>Manage vehicles, reservations, payments and parking history</p>
      </div>

      <div className="customer-dashboard-grid">
        <Link to="/customer/add-vehicle" className="customer-dashboard-card">
          <h2>Add Vehicle</h2>

          <p>Register a new vehicle</p>
        </Link>

        <Link to="/customer/vehicles" className="customer-dashboard-card">
          <h2>My Vehicles</h2>

          <p>View all registered vehicles</p>
        </Link>

        <Link to="/customer/parking-slots" className="customer-dashboard-card">
          <h2>Parking Slots</h2>

          <p>Check available parking slots</p>
        </Link>

        <Link
          to="/customer/create-reservation"
          className="customer-dashboard-card"
        >
          <h2>Create Reservation</h2>

          <p>Reserve your parking slot</p>
        </Link>

        <Link to="/customer/reservations" className="customer-dashboard-card">
          <h2>Reservation History</h2>

          <p>View all reservations</p>
        </Link>

        <Link
          to="/customer/payment-details"
          className="customer-dashboard-card"
        >
          <h2>Payment Details</h2>

          <p>Get payment information</p>
        </Link>

        <Link to="/customer/pay-now" className="customer-dashboard-card">
          <h2>Pay Now</h2>

          <p>Complete pending payments</p>
        </Link>

        <Link
          to="/customer/payment-history"
          className="customer-dashboard-card"
        >
          <h2>Payment History</h2>

          <p>View all completed payments</p>
        </Link>

        <Link
          to="/customer/parking-history"
          className="customer-dashboard-card"
        >
          <h2>Parking History</h2>

          <p>View previous parking sessions</p>
        </Link>

        <Link to="/customer/notifications" className="customer-dashboard-card">
          <h2>Notifications</h2>

          <p>Check alerts and updates</p>
        </Link>
      </div>
    </div>
  );
};

export default CustomerDashboard;
