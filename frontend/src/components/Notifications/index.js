import { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { useHistory } from "react-router-dom";

import api from "../../api/axios";
import "./index.css";

const Notifications = () => {
  const history = useHistory();
  const userId = Cookies.get("user_id");

  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get(`/notifications/${userId}`);
      setNotifications(response.data.notifications);
    } catch (error) {
      console.log(error.message);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="notification-page">
      <div className="notification-header">
        <button className="back-btn" onClick={() => history.goBack()}>
          Back
        </button>
        <h1>Notifications</h1>
      </div>

      <div className="notification-grid">
        {notifications.map((item) => (
          <div className="notification-card" key={item.id}>
            <h2>{item.title}</h2>
            <p>{item.message}</p>
            <span>{item.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
