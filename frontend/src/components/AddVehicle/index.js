import { useState } from "react";
import Cookies from "js-cookie";
import { useHistory } from "react-router-dom";

import api from "../../api/axios";

import "./index.css";

const AddVehicle = () => {
  const history = useHistory();

  const userId = Cookies.get("user_id");

  const [formData, setFormData] = useState({
    vehicle_number: "",
    vehicle_type: "Bike",
    vehicle_brand: "",
    vehicle_model: "",
    vehicle_color: "",
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const onChangeInput = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();

    try {
      await api.post("/vehicles", {
        user_id: userId,
        ...formData,
      });

      setSuccessMsg("Vehicle added successfully");
      setErrorMsg("");

      setFormData({
        vehicle_number: "",
        vehicle_type: "Bike",
        vehicle_brand: "",
        vehicle_model: "",
        vehicle_color: "",
      });
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Failed to add vehicle");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="back-btn" onClick={() => history.goBack()}>
          Back
        </button>

        <h1>Add Vehicle</h1>
      </div>
      <form className="vehicle-form" onSubmit={onSubmitForm}>
        <input
          type="text"
          placeholder="Vehicle Number"
          name="vehicle_number"
          value={formData.vehicle_number}
          onChange={onChangeInput}
          required
        />

        <select
          name="vehicle_type"
          value={formData.vehicle_type}
          onChange={onChangeInput}
        >
          <option value="Bike">Bike</option>
          <option value="Car">Car</option>
        </select>
        <input
          type="text"
          placeholder="Vehicle Brand"
          name="vehicle_brand"
          value={formData.vehicle_brand}
          onChange={onChangeInput}
          required
        />

        <input
          type="text"
          placeholder="Vehicle Model"
          name="vehicle_model"
          value={formData.vehicle_model}
          onChange={onChangeInput}
          required
        />
        <input
          type="text"
          placeholder="Vehicle Color"
          name="vehicle_color"
          value={formData.vehicle_color}
          onChange={onChangeInput}
          required
        />

        <button type="submit">Add Vehicle</button>

        {successMsg && <p className="success-msg">{successMsg}</p>}
        {errorMsg && <p className="error-msg">{errorMsg}</p>}
      </form>
    </div>
  );
};

export default AddVehicle;
