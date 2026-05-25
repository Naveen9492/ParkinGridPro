import { useEffect, useState } from "react";

import { useHistory } from "react-router-dom";

import api from "../../api/axios";

import "./index.css";

const ActiveSessions = () => {
  const history = useHistory();

  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get("/parking/active");

      setSessions(response.data.active_sessions);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="sessions-page">
      <div className="sessions-header">
        <button className="back-btn" onClick={() => history.goBack()}>
          Back
        </button>

        <h1>Active Parking Sessions</h1>
      </div>

      <div className="sessions-grid">
        {sessions.map((item) => (
          <div className="session-card" key={item.id}>
            <h2>{item.parking_id}</h2>

            <p>Vehicle: {item.vehicle_number}</p>

            <p>Vehicle Type: {item.vehicle_type}</p>

            <p>Slot: {item.slot_number}</p>

            <p>Floor: {item.floor_number}</p>

            <p>Status: {item.session_status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveSessions;
