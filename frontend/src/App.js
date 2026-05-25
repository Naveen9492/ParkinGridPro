import { Route, Switch, Redirect } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Navbar from "./components/Navbar";

import AdminDashboard from "./components/AdminDashboard";
import StaffDashboard from "./components/StaffDashboard";
import CustomerDashboard from "./components/CustomerDashboard";
import UsersList from "./components/UsersList";
import RevenueAnalytics from "./components/RevenueAnalytics";
import AddVehicle from "./components/AddVehicle";
import MyVehicles from "./components/MyVehicles";
import ParkingSlots from "./components/ParkingSlots";
import ReservationHistory from "./components/ReservationHistory";
import CreateReservation from "./components/CreateReservation";
import PaymentHistory from "./components/PaymentHistory";
import PaymentDetails from "./components/PaymentDetails";
import PayNow from "./components/PayNow";
import ParkingHistory from "./components/ParkingHistory";
import Notifications from "./components/Notifications";
import CheckIn from "./components/CheckIn";
import ActiveSessions from "./components/ActiveSessions";
import Checkout from "./components/Checkout";
import NotFound from "./components/NotFound";

const App = () => {
  return (
    <>
      <Navbar />
      <Switch>
        {/* PUBLIC */}

        <Route exact path="/login" component={Login} />

        <Route exact path="/signup" component={SignUp} />

        {/* ROOT */}

        <ProtectedRoute exact path="/" />

        {/* ADMIN */}

        <ProtectedRoute
          exact
          path="/admin/dashboard"
          component={AdminDashboard}
          allowedRoles={["Admin"]}
        />

        {/* STAFF */}

        <ProtectedRoute
          exact
          path="/staff/dashboard"
          component={StaffDashboard}
          allowedRoles={["Staff"]}
        />

        {/* CUSTOMER */}

        <ProtectedRoute
          exact
          path="/customer/dashboard"
          component={CustomerDashboard}
          allowedRoles={["Customer"]}
        />
        <ProtectedRoute
          exact
          path="/admin/users"
          component={UsersList}
          allowedRoles={["Admin"]}
        />
        <ProtectedRoute
          exact
          path="/admin/analytics"
          component={RevenueAnalytics}
          allowedRoles={["Admin"]}
        />
        <ProtectedRoute
          exact
          path="/customer/add-vehicle"
          component={AddVehicle}
          allowedRoles={["Customer"]}
        />
        <ProtectedRoute
          exact
          path="/customer/vehicles"
          component={MyVehicles}
          allowedRoles={["Customer"]}
        />
        <ProtectedRoute
          exact
          path="/customer/parking-slots"
          component={ParkingSlots}
          allowedRoles={["Customer"]}
        />
        <ProtectedRoute
          exact
          path="/customer/create-reservation"
          component={CreateReservation}
          allowedRoles={["Customer"]}
        />
        <ProtectedRoute
          exact
          path="/customer/reservations"
          component={ReservationHistory}
          allowedRoles={["Customer"]}
        />
        <ProtectedRoute
          exact
          path="/customer/payment-details"
          component={PaymentDetails}
          allowedRoles={["Customer"]}
        />
        <ProtectedRoute
          exact
          path="/customer/pay-now"
          component={PayNow}
          allowedRoles={["Customer"]}
        />
        <ProtectedRoute
          exact
          path="/customer/payment-history"
          component={PaymentHistory}
          allowedRoles={["Customer"]}
        />
        <ProtectedRoute
          exact
          path="/customer/parking-history"
          component={ParkingHistory}
          allowedRoles={["Customer"]}
        />
        <ProtectedRoute
          exact
          path="/customer/notifications"
          component={Notifications}
          allowedRoles={["Customer"]}
        />
        <ProtectedRoute
          exact
          path="/staff/checkin"
          component={CheckIn}
          allowedRoles={["Staff"]}
        />
        <ProtectedRoute
          exact
          path="/staff/active-sessions"
          component={ActiveSessions}
          allowedRoles={["Staff"]}
        />
        <ProtectedRoute
          exact
          path="/staff/checkout"
          component={Checkout}
          allowedRoles={["Staff"]}
        />
        <Route exact path="/not-found" component={NotFound} />
        <Redirect to="/not-found" />
      </Switch>
    </>
  );
};

export default App;
