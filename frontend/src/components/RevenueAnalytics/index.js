import { useEffect, useState } from "react";

import { useHistory } from "react-router-dom";

import Cookies from "js-cookie";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import api from "../../api/axios";

import "./index.css";

const RevenueAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);

  const [loading, setLoading] = useState(true);

  const token = Cookies.get("token");

  const history = useHistory();

  const getAnalytics = async () => {
    try {
      const response = await api.get("/dashboard/parking", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAnalyticsData(response.data.analytics);

      setLoading(false);
    } catch (error) {
      console.log(error);

      setLoading(false);
    }
  };

  useEffect(() => {
    getAnalytics();

    // eslint-disable-next-line
  }, []);

  const onClickBack = () => {
    history.push("/admin/dashboard");
  };

  if (loading) {
    return (
      <div className="analytics-main-container">
        <h1>Loading...</h1>
      </div>
    );
  }

  const {
    total_slots,
    available_slots,
    occupied_slots,
    reserved_slots,
    total_revenue,
  } = analyticsData;

  const slotData = [
    {
      name: "Available",
      value: available_slots,
    },
    {
      name: "Occupied",
      value: occupied_slots,
    },
    {
      name: "Reserved",
      value: reserved_slots,
    },
  ];

  const revenueData = [
    {
      name: "Revenue",
      amount: total_revenue,
    },
  ];

  const COLORS = ["#22c55e", "#ef4444", "#f59e0b"];

  return (
    <div className="analytics-main-container">
      <div className="analytics-top-section">
        <h1 className="analytics-heading">Revenue Analytics</h1>
        <button type="button" className="back-btn" onClick={onClickBack}>
          Back to Dashboard
        </button>
      </div>

      <div className="analytics-cards-container">
        <div className="analytics-card">
          <h2>Total Slots</h2>
          <p>{total_slots}</p>
        </div>

        <div className="analytics-card">
          <h2>Available Slots</h2>
          <p>{available_slots}</p>
        </div>

        <div className="analytics-card">
          <h2>Occupied Slots</h2>
          <p>{occupied_slots}</p>
        </div>

        <div className="analytics-card">
          <h2>Reserved Slots</h2>
          <p>{reserved_slots}</p>
        </div>

        <div className="analytics-card revenue-card">
          <h2>Total Revenue</h2>
          <p>₹ {total_revenue}</p>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-box">
          <h2>Parking Slot Status</h2>

          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie data={slotData} dataKey="value" outerRadius={120} label>
                {slotData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />

              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h2>Total Revenue</h2>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={revenueData}>
              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar dataKey="amount" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalytics;
