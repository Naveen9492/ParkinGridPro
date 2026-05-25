import { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { useHistory } from "react-router-dom";

import api from "../../api/axios";
import "./index.css";

const CreateReservation = () => {
  const history = useHistory();
  const userId = Cookies.get("user_id");

  const [vehicles, setVehicles] = useState([]);
  const [slots, setSlots] = useState([]);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    vehicle_id: "",
    slot_id: "",
    reservation_date: "",
    start_time: "",
    expected_end_time: "",
  });

  const fetchVehicles = useCallback(async () => {
    try {
      const response = await api.get(`/vehicles/user/${userId}`);
      setVehicles(response.data.vehicles);
    } catch (error) {
      console.log(error.message);
    }
  }, [userId]);

  const fetchSlots = useCallback(async () => {
    try {
      const response = await api.get("/parking/slots");
      const availableSlots = response.data.slots.filter(
        (slot) => slot.status === "Available",
      );
      setSlots(availableSlots);
    } catch (error) {
      console.log(error.message);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
    fetchSlots();
  }, [fetchVehicles, fetchSlots]);

  const onChangeInput = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();

    try {
      await api.post("/reservations", {
        user_id: userId,
        ...formData,
      });

      setSuccessMsg("Reservation created successfully");
      setErrorMsg("");

      setFormData({
        vehicle_id: "",
        slot_id: "",
        reservation_date: "",
        start_time: "",
        expected_end_time: "",
      });
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message || "Failed to create reservation",
      );
    }
  };

  return (
    <div className="reservation-page-container">
      <div className="reservation-page-header">
        <button className="back-btn" onClick={() => history.goBack()}>
          Back
        </button>
        <h1>Create Reservation</h1>
      </div>

      <form className="reservation-form-container" onSubmit={onSubmitForm}>
        <select
          name="vehicle_id"
          value={formData.vehicle_id}
          onChange={onChangeInput}
          required
        >
          <option value="">Select Vehicle</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.vehicle_number}
            </option>
          ))}
        </select>

        <select
          name="slot_id"
          value={formData.slot_id}
          onChange={onChangeInput}
          required
        >
          <option value="">Select Slot</option>
          {slots.map((s) => (
            <option key={s.id} value={s.id}>
              {s.slot_number} - Floor {s.floor_number}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="reservation_date"
          value={formData.reservation_date}
          onChange={onChangeInput}
          required
        />
        <input
          type="time"
          name="start_time"
          value={formData.start_time}
          onChange={onChangeInput}
          required
        />
        <input
          type="time"
          name="expected_end_time"
          value={formData.expected_end_time}
          onChange={onChangeInput}
          required
        />

        <button type="submit">Reserve Slot</button>

        {successMsg && <p className="success-msg">{successMsg}</p>}
        {errorMsg && <p className="error-msg">{errorMsg}</p>}
      </form>
    </div>
  );
};

export default CreateReservation;
