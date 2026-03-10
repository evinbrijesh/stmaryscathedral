import React, { useState, useEffect } from 'react';
import '../css/navbar.css';
import pic1 from '../assets/images/logo.jpg';
import { useNavigate, useLocation } from 'react-router-dom';
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('isAuthenticated');
      const user = localStorage.getItem('username');
      setIsAuthenticated(!!auth);
      setUsername(user || 'User');
    };

    checkAuth();
  }, [location]);

  const handleSignOut = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    navigate('/SignIn');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {location.pathname !== '/' && location.pathname !== '/SignIn' && location.pathname !== '/About' && (
          <button className="back-btn" onClick={() => navigate(-1)} title="Go Back">
            ←
          </button>
        )}
        <div className="logo-wrapper" onClick={() => navigate('About')} role="button" tabIndex="0">
          <img src={pic1} alt="Church Logo" className="logo" />
        </div>
        <h1 className="site-title" onClick={() => navigate('/')}>
          ST MARY'S JACOBITE SYRIAN CATHEDRAL, PALLIKARA
        </h1>
      </div>
      <div className="navbar-right">
        <span onClick={() => navigate('/')} className="nav-link">Home</span>
        <span onClick={() => navigate('/About')} className="nav-link">About</span>
        {isAuthenticated ? (
          <>
            <span className="nav-link" style={{ cursor: 'default' }}>{username}</span>
            <span onClick={handleSignOut} className="nav-link">Sign Out</span>
          </>
        ) : (
          <span onClick={() => navigate('/SignIn')} className="nav-link">Sign In</span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
