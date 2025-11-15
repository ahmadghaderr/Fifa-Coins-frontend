import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PhoneIcon from '@mui/icons-material/Phone';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Refs for Enter key navigation
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    document.body.classList.add('login-page');
    return () => document.body.classList.remove('login-page');
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\d{8}$/.test(phone);

  const handleSubmit = async () => {
    setError('');
    if (
      !formData.email ||
      !formData.password ||
      !formData.username ||
      !formData.confirmPassword ||
      !formData.phone
    ) {
      setError('Please fill all fields.');
      return;
    }
    if (!validateEmail(formData.email)) {
      setError('Invalid email address.');
      return;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!validatePhone(formData.phone)) {
      setError('Phone number must be 8 digits.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('https://fifa-coins-backend.onrender.com/api/user/signup', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'buyer',
      });
      const token = response.data.access_token;
      const decoded = jwtDecode(token);
      localStorage.setItem('token', token);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('isAdmin', decoded.role === 'admin' ? 'true' : 'false');
      localStorage.setItem('userId', decoded.user_id);
      navigate('/CalculateHome');
    } catch {
      setError('Signup failed. Please try again.');
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
        <h2>Signup</h2>
        <div className="input-box-login">
          <div className="input-field">
            <AccountCircleIcon className="input-icon" />
            <input
              ref={usernameRef}
              name="username"
              type="text"
              placeholder="User name"
              value={formData.username}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, emailRef)}
            />
          </div>
          <div className="input-field">
            <EmailIcon className="input-icon" />
            <input
              ref={emailRef}
              name="email"
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, phoneRef)}
            />
          </div>
          <div className="input-field">
            <PhoneIcon className="input-icon" />
            <input
              ref={phoneRef}
              name="phone"
              type="text"
              placeholder="Phone number"
              value={formData.phone}
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
              onKeyDown={(e) => handleKeyDown(e, confirmPasswordRef)}
            />
            {showPassword ? (
              <VisibilityOffIcon className="eye-icon" onClick={() => setShowPassword(false)} />
            ) : (
              <VisibilityIcon className="eye-icon" onClick={() => setShowPassword(true)} />
            )}
          </div>
          <div className="input-field">
            <LockIcon className="input-icon" />
            <input
              ref={confirmPasswordRef}
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, null)}
            />
            {showConfirmPassword ? (
              <VisibilityOffIcon className="eye-icon" onClick={() => setShowConfirmPassword(false)} />
            ) : (
              <VisibilityIcon className="eye-icon" onClick={() => setShowConfirmPassword(true)} />
            )}
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Loading...' : 'Signup'}
        </button>
        <div className="register-link">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
  