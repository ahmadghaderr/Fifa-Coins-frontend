import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CalculateHome.css';
import Navbar from '../Navbar/Navbar';

const CalculateHome = () => {
  const [playerName, setPlayerName] = useState('');
  const [realPrice, setRealPrice] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [currentRate, setCurrentRate] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await axios.get('https://fifa-coins-backend.onrender.com/api/rate');
        setCurrentRate(res.data.rate);
      } catch (err) {
        setError('Failed to fetch current rate. Calculations may be inaccurate.');
      }
    };

    fetchRate();
    const interval = setInterval(fetchRate, 10000);

    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);

    return () => clearInterval(interval);
  }, []);

  const handleCalculate = async (e) => {
    e.preventDefault();

    if (!playerName || !realPrice || !buyPrice) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        'https://fifa-coins-backend.onrender.com/api/calculate-profit',
        {
          player_name: playerName,
          real_price: parseFloat(realPrice),
          buy_price: parseFloat(buyPrice),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            token: token,
          },
        }
      );
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Calculation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="calculate-home">
        <div className="calculate-container">
          <h2>FIFA Coins Calculator</h2>

          {currentRate !== null ? (
            <div className="rate-notice">
              <p>The Rate for Today: {currentRate}$ For 1M</p>
            </div>
          ) : (
            <div className="rate-notice">
              <p>Loading today's rate...</p>
            </div>
          )}

          <form className="calculate-form" onSubmit={handleCalculate}>
            <div className="form-group">
              <label>Player Name:</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Buy Price (your price):</label>
              <input
                type="number"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Real Price (buyer):</label>
              <input
                type="number"
                value={realPrice}
                onChange={(e) => setRealPrice(e.target.value)}
                required
                min="0"
              />
            </div>

            <button type="submit" className="calculate-button" disabled={loading}>
              {loading ? 'Calculating...' : 'Calculate'}
            </button>
          </form>

          {error && <p className="error-message">{error}</p>}

          {result && (
            <div className="result-container">
              <h3>Calculation Result:</h3>
              <div className="result-item">
                <span className="result-label">Player Name:</span>
                <span className="result-value">{result.player_name}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Buy Price:</span>
                <span className="result-value">{result.buy_price.toLocaleString()}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Real Price:</span>
                <span className="result-value">{result.real_price.toLocaleString()}</span>
              </div>
              <div className="result-item">
                <span className="result-label">After Tax Received:</span>
                <span className="result-value">{result.after_tax_received.toLocaleString()}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Coin Profit:</span>
                <span className="result-value">{result.coin_profit.toLocaleString()}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Money Profit:</span>
                <span className="result-value">${result.money_profit.toFixed(2)}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Rate Used:</span>
                <span className="result-value">{result.rate}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Calculation Date:</span>
                <span className="result-value">{new Date(result.date).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CalculateHome;
