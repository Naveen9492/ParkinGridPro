import { useEffect, useState } from "react";

import Cookies from "js-cookie";

import { useHistory } from "react-router-dom";

import api from "../../api/axios";

import "./index.css";

const ReservationHistory = () => {
  const history = useHistory();

  const userId = Cookies.get("user_id");

  const [reservations, setReservations] = useState([]);

  const [loading, setLoading] = useState(false);

  const [popupData, setPopupData] = useState({
    show: false,
    reservationId: null,
  });

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/reservations/history/${userId}`);

        setReservations(response.data.reservations);
        setLoading(false);
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchReservations();
  }, [userId]);

  const openPopup = (reservationId) => {
    setPopupData({
      show: true,
      reservationId,
    });
  };

  const closePopup = () => {
    setPopupData({
      show: false,
      reservationId: null,
    });
  };

  const cancelReservation = async () => {
    try {
      await api.put(`/reservations/cancel/${popupData.reservationId}`);

      closePopup();

      this.fetchReservations();
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="reservation-container">
      <div className="reservation-header">
        <button className="back-btn" onClick={() => history.goBack()}>
          Back
        </button>

        <h1>Reservation History</h1>
      </div>

      {loading ? (
        <div className="loading-container">
          <p>Loading reservations...</p>
        </div>
      ) : (
        <div className="reservation-grid">
          {reservations.map((item) => (
            <div className="reservation-card" key={item.id}>
              <div className="card-top">
                <h2>{item.reservation_code}</h2>

                <span className={`status-badge ${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </div>

              <div className="reservation-details">
                <p>
                  <strong>Vehicle:</strong> {item.vehicle_number}
                </p>

                <p>
                  <strong>Vehicle Type:</strong> {item.vehicle_type}
                </p>

                <p>
                  <strong>Slot:</strong> {item.slot_number}
                </p>

                <p>
                  <strong>Floor:</strong> {item.floor_number}
                </p>

                <p>
                  <strong>Date:</strong> {item.reservation_date}
                </p>

                <p>
                  <strong>Start:</strong> {item.start_time}
                </p>

                <p>
                  <strong>End:</strong> {item.expected_end_time}
                </p>
              </div>

              {item.qr_code && (
                <div className="qr-container">
                  <img src={item.qr_code} alt="QR Code" className="qr-image" />

                  <p className="qr-text">Scan for Check-In</p>
                </div>
              )}

              {item.status === "Reserved" && (
                <button
                  className="cancel-btn"
                  onClick={() => openPopup(item.id)}
                >
                  Cancel Reservation
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {popupData.show && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h3>Cancel Reservation</h3>

            <p>Are you sure you want to cancel this reservation?</p>

            <div className="popup-buttons">
              <button className="popup-cancel-btn" onClick={closePopup}>
                No
              </button>

              <button className="popup-delete-btn" onClick={cancelReservation}>
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationHistory;
