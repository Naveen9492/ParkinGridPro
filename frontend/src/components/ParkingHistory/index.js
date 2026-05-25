import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useHistory } from "react-router-dom";

import api from "../../api/axios";

import "./index.css";

const ParkingHistory = () => {
  const history = useHistory();

  const userId = Cookies.get("user_id");

  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get(`/parking/history/${userId}`);

      setSessions(response.data.parking_history);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="parking-page">
      <div className="parking-header">
        <button className="back-btn" onClick={() => history.goBack()}>
          Back
        </button>

        <h1>Parking History</h1>
      </div>

      <div className="parking-grid">
        {sessions.map((item) => (
          <div className="parking-card" key={item.id}>
            <h2>{item.parking_id}</h2>

            <p>Vehicle: {item.vehicle_number}</p>

            <p>Slot: {item.slot_number}</p>

            <p>Total Hours: {item.total_hours}</p>

            <p>Total Amount: ₹{item.total_amount}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParkingHistory;
