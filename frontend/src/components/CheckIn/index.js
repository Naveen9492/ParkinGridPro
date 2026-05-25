import { useState } from "react";

import { useHistory } from "react-router-dom";

import api from "../../api/axios";

import "./index.css";

const CheckIn = () => {
  const history = useHistory();

  const [reservationCode, setReservationCode] = useState("");

  const [successMsg, setSuccessMsg] = useState("");

  const [errorMsg, setErrorMsg] = useState("");

  const onSubmitCheckIn = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/parking/checkin", {
        reservation_code: reservationCode,
      });

      setSuccessMsg(response.data.message);

      setErrorMsg("");

      setReservationCode("");
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Check-in failed");
    }
  };

  return (
    <div className="checkin-page">
      <div className="checkin-header">
        <button className="back-btn" onClick={() => history.goBack()}>
          Back
        </button>

        <h1>Vehicle Check-In</h1>
      </div>

      <form className="checkin-form" onSubmit={onSubmitCheckIn}>
        <input
          type="text"
          placeholder="Enter Reservation Code"
          value={reservationCode}
          onChange={(e) => setReservationCode(e.target.value)}
          required
        />

        <button type="submit">Check-In</button>

        {successMsg && <p className="success-msg">{successMsg}</p>}

        {errorMsg && <p className="error-msg">{errorMsg}</p>}
      </form>
    </div>
  );
};

export default CheckIn;
