import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import { jwtDecode } from 'jwt-decode';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      setIsAdmin(false);
      if (location.pathname !== '/') navigate('/');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const isTokenExpired = decoded.exp * 1000 < Date.now();
      if (isTokenExpired) {
        localStorage.clear();
        setIsAuthenticated(false);
        setIsAdmin(false);
        navigate('/');
        return;
      }
      setIsAuthenticated(true);

      const localAdmin = localStorage.getItem('isAdmin');
      if (localAdmin !== null) {
        setIsAdmin(localAdmin === 'true');
      } else {
        setIsAdmin(decoded.role === 'admin');
      }
    } catch {
      localStorage.clear();
      setIsAuthenticated(false);
      setIsAdmin(false);
      navigate('/');
    }
  }, [location, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setIsAdmin(false);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigateTo = (path) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    if (path === '/admin' && !isAdmin) {
      alert('Access denied: Admins only');
      return;
    }
    navigate(path);
    setIsMenuOpen(false);
  };

  const menuItems = [
    { label: 'Calculate Home', path: '/calculateHome' },
    { label: 'History', path: '/history' },
    { label: 'Chatbot', path: '/chatbot' },
    ...(isAdmin ? [{ label: 'Admin', path: '/admin' }] : []),
  ];

  if (!isAuthenticated && location.pathname === '/') {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigateTo('/calculateHome')}>
        FifaCoins
      </div>

      <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <ul className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
        <div className="navbar-links-center">
          {menuItems
            .filter(item => item.path !== location.pathname)
            .map(item => (
              <li
                key={item.path}
                onClick={() => navigateTo(item.path)}
                className="nav-link"
              >
                {item.label}
              </li>
            ))}
        </div>

        <li onClick={handleLogout} className="logout-button">
          Logout
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
