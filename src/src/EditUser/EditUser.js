import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import "./EditUser.css";

const EditUser = () => {
  const navigate = useNavigate();

  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);

    if (!storedUserId) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/user/get/${storedUserId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUsername(data.username || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");
          setMessage("");
        } else {
          setMessage("Could not load your info");
          if (response.status === 401 || response.status === 403) {
            navigate("/login");
          }
        }
      } catch {
        setMessage("Failed fetching user info");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const storedUserId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!storedUserId || !token) {
      setMessage("You must be logged in to update info.");
      navigate("/login");
      return;
    }

    const updateData = {
      username,
      email: email.toLowerCase(),
      phone,
    };

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/user/edit/${storedUserId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message || "Your info was updated.");
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || "Update failed.");
      }
    } catch {
      setMessage("Something went wrong.");
    }
  };

  if (!userId) return null;

  return (
    <>
      <Navbar />
      <div className="edit-user-page">
        <div className="edit-user-container">
          <h2>Edit Your Info</h2>
          <form className="edit-user-form" onSubmit={handleSubmit}>
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label>Phone:</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button type="submit">Save Changes</button>
          </form>
          {message && <p className="edit-user-message">{message}</p>}
        </div>
      </div>
    </>
  );
};

export default EditUser;
