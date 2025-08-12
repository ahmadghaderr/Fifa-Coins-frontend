import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PhoneIcon from '@mui/icons-material/Phone';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';  

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const phoneRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('login-page');
    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\d{8}$/.test(phone);

  const handleSubmit = async () => {
    setShowErrors(true);
    setError('');
    setEmailError('');
    setUsernameError('');
    setPhoneError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (!email || !password || (!isLogin && (!username || !confirmPassword || !phone))) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    if (!isLogin && username.length < 3) {
      setUsernameError('Username must be at least 3 characters long.');
      return;
    }

    if (!isLogin && !validatePhone(phone)) {
      setPhoneError('Please enter a valid phone number (8 digits).');
      return;
    }

    if (!isLogin && !confirmPassword) {
      setConfirmPasswordError('Please confirm your password.');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const response = await axios.post(`https://fifa-coins-backend.onrender.com/api/login`, { email, password });
        const token = response.data.access_token || response.data.accessToken || response.data.token;
        const decoded = jwtDecode(token);
        const roleFromToken = decoded.role;
        const userId = decoded.user_id;

        localStorage.setItem('token', token);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('isAdmin', roleFromToken === 'admin' ? 'true' : 'false');
        localStorage.setItem('userId', userId);  

        const redirectTo = location.state?.from || '/CalculateHome';
        navigate(redirectTo);
      } else {
        const signupResponse = await axios.post('https://fifa-coins-backend.onrender.com/api/user/signup', {
          username,
          email,
          password,
          phone,
          role: 'buyer'
        });
        const token = signupResponse.data.access_token || signupResponse.data.accessToken || signupResponse.data.token;
        const decoded = jwtDecode(token);
        const roleFromToken = decoded.role;
        const userId = decoded.user_id;

        localStorage.setItem('token', token);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('isAdmin', roleFromToken === 'admin' ? 'true' : 'false');
        localStorage.setItem('userId', userId); 

        navigate('/CalculateHome');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isLogin ? 'Login' : 'Signup'}</h2>
        <div className="input-box">
          {!isLogin && (
            <>
              <div className="input-field">
                <AccountCircleIcon className="input-icon" />
                <input
                  type="text"
                  placeholder="User name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && phoneRef.current?.focus()}
                />
              </div>
              {showErrors && usernameError && <div className="error-message">{usernameError}</div>}

              <div className="input-field">
                <PhoneIcon className="input-icon" />
                <input
                  ref={phoneRef}
                  type="text"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && emailRef.current?.focus()}
                />
              </div>
              {showErrors && phoneError && <div className="error-message">{phoneError}</div>}
            </>
          )}

          <div className="input-field">
            <EmailIcon className="input-icon" />
            <input
              ref={emailRef}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && passwordRef.current?.focus()}
            />
          </div>
          {showErrors && emailError && <div className="error-message">{emailError}</div>}

          <div className="input-field">
            <LockIcon className="input-icon" />
            <input
              ref={passwordRef}
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (!isLogin && e.key === 'Enter') confirmPasswordRef.current?.focus();
                else if (e.key === 'Enter') handleSubmit();
              }}
            />
            {showPassword ? (
              <VisibilityOffIcon className="eye-icon" onClick={() => setShowPassword(false)} />
            ) : (
              <VisibilityIcon className="eye-icon" onClick={() => setShowPassword(true)} />
            )}
          </div>
          {showErrors && passwordError && <div className="error-message">{passwordError}</div>}

          {!isLogin && (
            <div className="input-field">
              <LockIcon className="input-icon" />
              <input
                ref={confirmPasswordRef}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              {showConfirmPassword ? (
                <VisibilityOffIcon className="eye-icon" onClick={() => setShowConfirmPassword(false)} />
              ) : (
                <VisibilityIcon className="eye-icon" onClick={() => setShowConfirmPassword(true)} />
              )}
            </div>
          )}
          {showErrors && confirmPasswordError && <div className="error-message">{confirmPasswordError}</div>}
        </div>

        {error && <div className="error-message">{error}</div>}

        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Loading...' : isLogin ? 'Login' : 'Signup'}
        </button>

        <p className="toggle-text">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span
            onClick={() => {
              setIsLogin(!isLogin);
              setShowErrors(false);
              setError('');
              setEmailError('');
              setUsernameError('');
              setPhoneError('');
              setPasswordError('');
              setConfirmPasswordError('');
            }}
          >
            {isLogin ? 'Signup' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginSignup;
