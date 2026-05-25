import { useState } from "react";
import { useHistory } from "react-router-dom";

import api from "../../api/axios";

import "./index.css";

const PayNow = () => {
  const history = useHistory();

  const [paymentCode, setPaymentCode] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const [successMsg, setSuccessMsg] = useState("");

  const [errorMsg, setErrorMsg] = useState("");

  const makePayment = async (e) => {
    e.preventDefault();

    try {
      await api.post("/payments/pay", {
        payment_code: paymentCode,
        payment_method: paymentMethod,
      });

      setSuccessMsg("Payment Successful");

      setErrorMsg("");

      setPaymentCode("");
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Payment Failed");
    }
  };

  return (
    <div className="pay-page">
      <div className="pay-header">
        <button className="back-btn" onClick={() => history.goBack()}>
          Back
        </button>

        <h1>Pay Now</h1>
      </div>

      <form className="pay-form" onSubmit={makePayment}>
        <input
          type="text"
          placeholder="Payment Code"
          value={paymentCode}
          onChange={(e) => setPaymentCode(e.target.value)}
          required
        />

        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="UPI">UPI</option>

          <option value="Card">Card</option>

          <option value="Cash">Cash</option>
        </select>

        <button type="submit">Pay</button>

        {successMsg && <p className="success-msg">{successMsg}</p>}

        {errorMsg && <p className="error-msg">{errorMsg}</p>}
      </form>
    </div>
  );
};

export default PayNow;
