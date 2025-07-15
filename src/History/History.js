import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './History.css';
import Navbar from '../Navbar/Navbar';

const History = () => {
  const [history, setHistory] = useState([]);
  const [totals, setTotals] = useState({ 
    total_profit_coins: 0, 
    total_profit_money: 0,
    total_paid_money_profit: 0
  });
  const [error, setError] = useState('');
  const [acceptedIds, setAcceptedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistoryAndTotals = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const [historyRes, totalsRes] = await Promise.all([
          axios.get('https://fifa-coins-backend.onrender.com/api/history/calculation-history', {
            headers: { token },
          }),
          axios.get('https://fifa-coins-backend.onrender.com/api/history/calculation-history/total', {
            headers: { token },
          }),
        ]);
        setHistory(historyRes.data);
        setTotals(totalsRes.data);
        const paidIds = new Set(
          historyRes.data.filter(item => item.is_paid).map(item => item._id)
        );
        setAcceptedIds(paidIds);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch calculation history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistoryAndTotals();
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token') || '';
      await axios.delete(`https://fifa-coins-backend.onrender.com/api/history/delete-calculation/${id}`, {
        headers: { token },
      });
      setHistory(prev => prev.filter(item => item._id !== id));
      const totalsRes = await axios.get('https://fifa-coins-backend.onrender.com/api/history/calculation-history/total', {
        headers: { token },
      });
      setTotals(totalsRes.data);
    } catch (err) {
      setError('Failed to delete record.');
    }
  };

  const handleAccept = async (id) => {
    try {
      const token = localStorage.getItem('token') || '';
      await axios.patch(`https://fifa-coins-backend.onrender.com/api/history/mark-paid/${id}`, {}, {
        headers: { token },
      });
      setAcceptedIds(prev => new Set(prev).add(id));
      const totalsRes = await axios.get('https://fifa-coins-backend.onrender.com/api/history/calculation-history/total', {
        headers: { token },
      });
      setTotals(totalsRes.data);
    } catch (err) {
      setError('Failed to mark as paid.');
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="history-page">
        <div className="history-container">
          <h2 className="history-title">Calculation History</h2>
          {error && <div className="error-message">{error}</div>}
          <div className="totals-container">
            <div className="total-card">
              <span className="total-label">Total Coins:</span>
              <span className="total-value">{totals.total_profit_coins?.toLocaleString() ?? 0}</span>
            </div>
            <div className="total-card">
              <span className="total-label">Total Money Profit (All):</span>
              <span className="total-value">${totals.total_profit_money?.toFixed(2) ?? '0.00'}</span>
            </div>
            <div className="total-card">
              <span className="total-label">Total Paid Money Profit:</span>
              <span className="total-value">${totals.total_paid_money_profit?.toFixed(2) ?? '0.00'}</span>
            </div>
          </div>
          <div className="table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Player</th>
                  <th>Real Price</th>
                  <th>Buy Price</th>
                  <th>After Tax</th>
                  <th>Coin Profit</th>
                  <th>Money Profit</th>
                  <th>Rate</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr className="empty-row">
                    <td colSpan="10">No history available</td>
                  </tr>
                ) : (
                  history.map((item) => {
                    const accepted = acceptedIds.has(item._id);
                    return (
                      <tr key={item._id} className={accepted ? 'accepted-row' : ''}>
                        <td>{item._id}</td>
                        <td>{item.player_name}</td>
                        <td>{item.real_price.toLocaleString()}</td>
                        <td>{item.buy_price.toLocaleString()}</td>
                        <td>{item.after_tax_received.toLocaleString()}</td>
                        <td>{item.coin_profit.toLocaleString()}</td>
                        <td>${item.money_profit.toFixed(2)}</td>
                        <td>{item.rate ?? 'N/A'}</td>
                        <td>{new Date(item.date).toLocaleDateString()}</td>
                        <td className="actions-cell">
                          <button
                            onClick={() => handleAccept(item._id)}
                            disabled={accepted}
                            className={`payment-btn ${accepted ? 'paid' : ''}`}
                          >
                            {accepted ? '✓ Payment Received' : 'Mark as Paid'}
                          </button>
                          <button 
                            onClick={() => handleDelete(item._id)}
                            className="delete-btn"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default History;
