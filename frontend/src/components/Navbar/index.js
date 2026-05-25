import { Link, withRouter } from "react-router-dom";
import Cookies from "js-cookie";

import "./index.css";

const NavBar = (props) => {
  const token = Cookies.get("token");

  const onLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("user_id");

    props.history.replace("/login");
  };

  return (
    <nav className="navbar-container">
      <Link to="/" className="nav-link">
        <h1 className="logo">PrakinGrid Pro</h1>
      </Link>
      {token !== undefined && (
        <button type="Button" className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      )}
    </nav>
  );
};

export default withRouter(NavBar);
