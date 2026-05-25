import { Link } from "react-router-dom";

import "./index.css";

const NotFound = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-card">
        <h1 className="notfound-title">404</h1>

        <p className="notfound-text">Page Not Found</p>

        <p className="notfound-description">
          The page you are looking for does not exist.
        </p>

        <Link to="/" className="home-btn">
          Go To Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
