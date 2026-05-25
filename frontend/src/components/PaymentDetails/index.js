import { useState } from "react";
import { useHistory } from "react-router-dom";

import api from "../../api/axios";

import "./index.css";

const PaymentDetails = () => {
  const history = useHistory();

  const [paymentCode, setPaymentCode] = useState("");

  const [payment, setPayment] = useState(null);

  const [errorMsg, setErrorMsg] = useState("");

  const getPaymentDetails = async () => {
    try {
      const response = await api.get(`/payments/${paymentCode}`);

      setPayment(response.data.payment);

      setErrorMsg("");
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Failed to fetch payment");
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-header">
        <button className="back-btn" onClick={() => history.goBack()}>
          Back
        </button>

        <h1>Payment Details</h1>
      </div>

      <div className="payment-search-card">
        <input
          type="text"
          placeholder="Enter Payment Code"
          value={paymentCode}
          onChange={(e) => setPaymentCode(e.target.value)}
        />

        <button onClick={getPaymentDetails}>Get Details</button>
      </div>

      {payment && (
        <div className="payment-card">
          <h2>{payment.payment_code}</h2>

          <p>Amount: ₹{payment.amount}</p>

          <p>Status: {payment.payment_status}</p>

          <p>Method: {payment.payment_method || "Pending"}</p>

          <p>Transaction: {payment.transaction_id || "Not Paid Yet"}</p>
        </div>
      )}

      {errorMsg && <p className="error-msg">{errorMsg}</p>}
    </div>
  );
};

export default PaymentDetails;
