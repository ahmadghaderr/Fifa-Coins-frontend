import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Admin.css';
import Navbar from '../Navbar/Navbar';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [rate, setRate] = useState(0);
  const [newRate, setNewRate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    fetchUsers();
    fetchRate();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`https://fifa-coins-backend.onrender.com/api/user/all?token=${token}`);
      setUsers(res.data.users);
    } catch {
      setError('Failed to fetch users.');
    }
  };

  const fetchRate = async () => {
    try {
      const res = await axios.get('https://fifa-coins-backend.onrender.com/api/rate', {
        headers: { token },
      });
      setRate(res.data.rate);
    } catch {
      setError('Failed to fetch rate.');
    }
  };

  const handleRateChange = async () => {
    const parsedRate = parseFloat(newRate);
    if (isNaN(parsedRate) || parsedRate <= 0) {
      setError('Rate must be a positive number.');
      setSuccess('');
      return;
    }
    try {
      await axios.put(`https://fifa-coins-backend.onrender.com/api/update-rate?rate=${parsedRate}`, null, {
        headers: { token },
      });
      setSuccess('Rate updated successfully');
      setError('');
      setRate(parsedRate);
      setNewRate('');
    } catch {
      setError('Failed to update rate.');
      setSuccess('');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`https://fifa-coins-backend.onrender.com/api/user/delete/${userId}?token=${token}`);
      setUsers(prev => prev.filter(user => user.id !== userId));
      setSuccess('User deleted successfully');
      setError('');
    } catch {
      setError('Failed to delete user.');
      setSuccess('');
    }
  };

  return (
    <>
      <Navbar />
      <div className="admin-page">
        <div className="admin-container">
          <h2>Admin Dashboard</h2>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="rate-section">
            <h3>Coin Rate</h3>
            <p>Current Rate: <strong>{rate}</strong></p>
            <input
              type="number"
              step="0.01"
              placeholder="Enter new rate"
              value={newRate}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || parseFloat(val) >= 0) {
                  setNewRate(val);
                  setError('');
                }
              }}
            />
            <button onClick={handleRateChange}>Update Rate</button>
          </div>

          <div className="users-section">
            <h3>All Users</h3>
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6">No users found</td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.phone || '-'}</td>
                      <td>{user.role || 'N/A'}</td>
                      <td>
                        <button onClick={() => handleDeleteUser(user.id)} className="delete-btn">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;
