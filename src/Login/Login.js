import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './Login.css';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const handleChange = (e) => { 
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    document.body.classList.add('login-page');
    return () => document.body.classList.remove('login-page');
  }, []);

  const handleSubmit = async () => {
    setError('');
    if (!formData.email || !formData.password) {
      setError('Please fill all fields.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('https://fifa-coins-backend.onrender.com/api/user/login', formData);
      const token = response.data.access_token;
      const decoded = jwtDecode(token);
      localStorage.setItem('token', token);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('isAdmin', decoded.role === 'admin' ? 'true' : 'false');
      localStorage.setItem('userId', decoded.user_id);
      const redirectTo = location.state?.from || '/CalculateHome';
      navigate(redirectTo);
    } catch (error) {
      if (error.response) {
        setError('Authentication failed. Please try again.');
      } else if (error.request) {
        setError('Server error. Please try again later.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef) {
        nextRef.current.focus();
      } else {
        handleSubmit();
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>
        <div className="input-box-login">
          <div className="input-field">
            <EmailIcon className="input-icon" />
            <input
              ref={emailRef}
              name="email"
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, passwordRef)}
            />
          </div>
          <div className="input-field">
            <LockIcon className="input-icon" />
            <input
              ref={passwordRef}
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, null)}
            />
            {showPassword ? (
              <VisibilityOffIcon className="eye-icon" onClick={() => setShowPassword(false)} />
            ) : (
              <VisibilityIcon className="eye-icon" onClick={() => setShowPassword(true)} />
            )}
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Loading...' : 'Login'}
        </button>
        <div className="register-link">
          Don’t have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
