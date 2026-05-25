import { useState } from "react";

import { useHistory } from "react-router-dom";

import api from "../../api/axios";

import "./index.css";

const Checkout = () => {
  const history = useHistory();

  const [parkingId, setParkingId] = useState("");

  const [checkoutData, setCheckoutData] = useState(null);

  const [errorMsg, setErrorMsg] = useState("");

  const onCheckout = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/parking/checkout", {
        parking_id: parkingId,
      });

      setCheckoutData(response.data);

      setErrorMsg("");

      setParkingId("");
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Checkout failed");
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <button className="back-btn" onClick={() => history.goBack()}>
          Back
        </button>

        <h1>Vehicle Checkout</h1>
      </div>

      <form className="checkout-form" onSubmit={onCheckout}>
        <input
          type="text"
          placeholder="Enter Parking ID"
          value={parkingId}
          onChange={(e) => setParkingId(e.target.value)}
          required
        />

        <button type="submit">Checkout</button>
      </form>

      {checkoutData && (
        <div className="checkout-result-card">
          <h2>{checkoutData.payment_code}</h2>

          <p>Total Hours: {checkoutData.total_hours}</p>

          <p>Total Amount: ₹{checkoutData.total_amount}</p>

          <p>{checkoutData.message}</p>
        </div>
      )}

      {errorMsg && <p className="error-msg">{errorMsg}</p>}
    </div>
  );
};

export default Checkout;
