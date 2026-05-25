import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Cookies from "js-cookie";

import api from "../../api/axios";

import "./index.css";

const Login = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token = Cookies.get("token");
    const role = Cookies.get("role");

    if (token) {
      if (role === "Admin") {
        props.history.replace("/admin/dashboard");
      } else if (role === "Staff") {
        props.history.replace("/staff/dashboard");
      } else if (role === "Customer") {
        props.history.replace("/customer/dashboard");
      }
    }
  }, [props.history]);

  const onSubmitForm = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      Cookies.set("token", token, { expires: 7 });
      Cookies.set("role", user.role, { expires: 7 });
      Cookies.set("user_id", user.id, { expires: 7 });

      if (user.role === "Admin") {
        props.history.replace("/admin/dashboard");
      } else if (user.role === "Staff") {
        props.history.replace("/staff/dashboard");
      } else if (user.role === "Customer") {
        props.history.replace("/customer/dashboard");
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={onSubmitForm}>
        <h1 className="auth-title">Login</h1>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrorMsg("");
          }}
          required
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrorMsg("");
          }}
          required
        />

        <button type="submit">Login</button>

        <p className="auth-link-text">
          Don't have account? <Link to="/signup">Signup</Link>
        </p>
        {errorMsg && <p className="error-msg">{errorMsg}</p>}
      </form>
    </div>
  );
};

export default Login;
