import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";

import api from "../../api/axios";

import "./index.css";

const SignUp = (props) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "Customer",
    adminCode: "",
  });

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

  const onChangeInput = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrorMsg("");
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/signup", formData);

      props.history.replace("/login");
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={onSubmitForm}>
        <h1 className="auth-title">Signup</h1>

        <input
          type="text"
          placeholder="Full Name"
          name="full_name"
          value={formData.full_name}
          onChange={onChangeInput}
          required
        />

        <input
          type="email"
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={onChangeInput}
          required
        />

        <input
          type="text"
          placeholder="Phone"
          name="phone"
          value={formData.phone}
          onChange={onChangeInput}
          required
        />

        <input
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={onChangeInput}
          required
        />

        <select name="role" value={formData.role} onChange={onChangeInput}>
          <option value="Customer">Customer</option>

          <option value="Staff">Staff</option>

          <option value="Admin">Admin</option>
        </select>

        {formData.role === "Admin" && (
          <input
            type="text"
            placeholder="Admin Secret Code"
            name="adminCode"
            value={formData.adminCode}
            onChange={onChangeInput}
          />
        )}

        <button type="submit">Create Account</button>

        <p className="auth-link-text">
          Already have account? <Link to="/login">Login</Link>
        </p>

        {errorMsg && <p className="error-msg">{errorMsg}</p>}
      </form>
    </div>
  );
};

export default SignUp;
