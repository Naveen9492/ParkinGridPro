import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import api from "../../api/axios";

import "./index.css";

const ParkingSlots = () => {
  const history = useHistory();

  const [slots, setSlots] = useState([]);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await api.get("/parking/slots");

      setSlots(response.data.slots);
    } catch (error) {
      console.log(error.message);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Available":
        return "available";

      case "Reserved":
        return "reserved";

      case "Occupied":
        return "occupied";

      case "Expired":
        return "expired";

      case "Cancelled":
        return "cancelled";

      default:
        return "";
    }
  };

  return (
    <div className="slots-container">
      <div className="slots-header">
        <button className="back-btn" onClick={() => history.goBack()}>
          Back
        </button>

        <h1>Parking Slots</h1>
      </div>

      <div className="slots-grid">
        {slots.map((slot) => (
          <div
            className={`slot-card ${getStatusClass(slot.status)}`}
            key={slot.id}
          >
            <h2>{slot.slot_number}</h2>

            <p>
              <strong>Floor:</strong> {slot.floor_number}
            </p>

            <p>
              <strong>Vehicle Type:</strong> {slot.vehicle_type}
            </p>

            <p>
              <strong>Status:</strong> {slot.status}
            </p>

            <p>
              <strong>Rate:</strong> ₹{slot.hourly_rate}/hour
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParkingSlots;
