import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useHistory } from "react-router-dom";

import { FaCarSide } from "react-icons/fa";
import { MdTwoWheeler } from "react-icons/md";

import api from "../../api/axios";

import "./index.css";

const MyVehicles = () => {
  const history = useHistory();

  const userId = Cookies.get("user_id");

  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await api.get(`/vehicles/user/${userId}`);

      setVehicles(response.data.vehicles);
    } catch (error) {
      console.log(error.message);
    }
  };

  const renderVehicleIcon = (type) => {
    switch (type) {
      case "Bike":
        return <MdTwoWheeler className="vehicle-icon" />;

      case "Car":
        return <FaCarSide className="vehicle-icon" />;

      default:
        return <FaCarSide className="vehicle-icon" />;
    }
  };

  return (
    <div className="vehicles-container">
      <div className="vehicles-header">
        <button className="back-btn" onClick={() => history.goBack()}>
          Back
        </button>

        <h1>My Vehicles</h1>
      </div>

      <div className="vehicles-grid">
        {vehicles.map((vehicle) => (
          <div
            className={`vehicle-card ${
              vehicle.vehicle_type === "Bike" ? "bike-card" : "car-card"
            }`}
            key={vehicle.id}
          >
            <div className="vehicle-top">
              <h2>{vehicle.vehicle_number}</h2>

              {renderVehicleIcon(vehicle.vehicle_type)}
            </div>

            <p>
              <strong>Type:</strong> {vehicle.vehicle_type}
            </p>

            <p>
              <strong>Brand:</strong> {vehicle.vehicle_brand}
            </p>

            <p>
              <strong>Model:</strong> {vehicle.vehicle_model}
            </p>

            <p>
              <strong>Color:</strong> {vehicle.vehicle_color}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyVehicles;
