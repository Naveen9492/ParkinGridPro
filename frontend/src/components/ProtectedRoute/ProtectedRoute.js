import { Route, Redirect } from "react-router-dom";
import Cookies from "js-cookie";

const ProtectedRoute = (props) => {
  const { component: Component, allowedRoles, ...rest } = props;

  const token = Cookies.get("token");
  const role = Cookies.get("role");

  // NOT LOGGED IN
  if (!token) {
    return <Redirect to="/login" />;
  }

  // ROOT ROUTE "/"
  if (rest.path === "/") {
    if (role === "Admin") {
      return <Redirect to="/admin/dashboard" />;
    }

    if (role === "Staff") {
      return <Redirect to="/staff/dashboard" />;
    }

    if (role === "Customer") {
      return <Redirect to="/customer/dashboard" />;
    }
  }

  // ROLE ACCESS CHECK
  if (allowedRoles && !allowedRoles.includes(role)) {
    // REDIRECT BASED ON ROLE

    if (role === "Admin") {
      return <Redirect to="/admin/dashboard" />;
    }

    if (role === "Staff") {
      return <Redirect to="/staff/dashboard" />;
    }

    if (role === "Customer") {
      return <Redirect to="/customer/dashboard" />;
    }
  }

  return (
    <Route {...rest} render={(routeProps) => <Component {...routeProps} />} />
  );
};

export default ProtectedRoute;
