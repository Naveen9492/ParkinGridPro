import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useHistory } from "react-router-dom";

import api from "../../api/axios";

import "./index.css";

const PaymentHistory = () => {
  const history = useHistory();

  const userId = Cookies.get("user_id");

  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get(`/payments/history/${userId}`);

        setPayments(response.data.payments);
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchPayments();
  }, [userId]);

  return (
    <div className="history-page">
      <div className="history-header">
        <button className="back-btn" onClick={() => history.goBack()}>
          Back
        </button>

        <h1>Payment History</h1>
      </div>

      <div className="history-grid">
        {payments.map((payment) => (
          <div className="history-card" key={payment.id}>
            <h2>{payment.payment_code}</h2>

            <p>Amount: ₹{payment.amount}</p>

            <p>Status: {payment.payment_status}</p>

            <p>Method: {payment.payment_method}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentHistory;
