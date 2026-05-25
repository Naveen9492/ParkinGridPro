import { useEffect, useState } from "react";

import Cookies from "js-cookie";

import { useHistory } from "react-router-dom";

import api from "../../api/axios";

import "./index.css";

const UsersList = () => {
  const [usersList, setUsersList] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState(null);

  const token = Cookies.get("token");

  const history = useHistory();

  const getUsers = async () => {
    try {
      const response = await api.get("/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsersList(response.data.users);

      setLoading(false);
    } catch (error) {
      console.log(error);

      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();

    // eslint-disable-next-line
  }, []);

  const onDeleteUser = (id) => {
    setSelectedUserId(id);

    setShowDeletePopup(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await api.delete(`/users/${selectedUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const filteredUsers = usersList.filter(
        (each) => each.id !== selectedUserId,
      );

      setUsersList(filteredUsers);

      setShowDeletePopup(false);

      setSelectedUserId(null);
    } catch (error) {
      console.log(error);

      alert("Failed to delete user");
    }
  };

  const onClickBack = () => {
    history.push("/admin/dashboard");
  };

  if (loading) {
    return (
      <div className="users-main-container">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="users-main-container">
      <div className="users-top-section">
        <h1 className="users-heading">Users List</h1>
        <button type="button" className="back-btn" onClick={onClickBack}>
          Back to Dashboard
        </button>
      </div>

      <div className="users-grid">
        {usersList.map((eachUser) => (
          <div className="user-card" key={eachUser.id}>
            <h2>{eachUser.full_name}</h2>

            <p>
              <span>Email:</span> {eachUser.email}
            </p>

            <p>
              <span>Phone:</span> {eachUser.phone}
            </p>

            <p>
              <span>Role:</span> {eachUser.role}
            </p>

            <p>
              <span>Status:</span> {eachUser.status}
            </p>

            <button
              type="button"
              className="delete-btn"
              onClick={() => onDeleteUser(eachUser.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {showDeletePopup && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h2>Confirmation</h2>

            <p>Are you sure you want to delete this user?</p>

            <div className="popup-btn-container">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowDeletePopup(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-delete-btn"
                onClick={confirmDeleteUser}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
