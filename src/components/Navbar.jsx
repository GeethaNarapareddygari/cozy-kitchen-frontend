import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo.jpg';


const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // --- STATE ---
  const [isProfileOpen, setIsProfileOpen] = useState(false); // For User Dropdown
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // For Hamburger Menu

  // --- REFS ---
  const profileRef = useRef(null);

  // --- HANDLERS ---
  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false); // Close mobile menu too
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // --- CLICK OUTSIDE LOGIC (For Profile Dropdown) ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If profile menu is open AND click is NOT inside the profileRef box
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      {/* 1. LOGO SECTION */}
      <div className="logo-container">
        <img src={logo} alt="Cozy Kitchen Logo" className="navbar-logo" />
        <span className="logo-text">Cozy Kitchen</span>
      </div>

      {/* 2. HAMBURGER ICON (Visible only on Mobile) */}
      <div className="menu-icon" onClick={toggleMobileMenu}>
        {isMobileMenuOpen ? "✖" : "☰"}
      </div>

      {/* 3. NAVIGATION LINKS */}
      <div className={`nav-links ${isMobileMenuOpen ? "active" : ""}`}>
        <Link to="/" onClick={closeMobileMenu}>Home</Link>
        <Link to="/my-recipes" onClick={closeMobileMenu}>My Recipes</Link>
        <Link to="/favorites" onClick={closeMobileMenu}>Favorites</Link>

        {/* 4. AUTH SECTION (Login or Profile) */}
        {user ? (
          // --- LOGGED IN: PROFILE DROPDOWN ---
          <div className="profile-container" ref={profileRef} style={{ position: 'relative' }}>
            <div 
              className="profile-icon" 
              onClick={() => setIsProfileOpen(!isProfileOpen)} 
              title="Profile Menu"
            >
              {user.username ? user.username.charAt(0).toUpperCase() : 'G'}
            </div>

            {isProfileOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={handleLogout} style={{color: 'red'}}>
                  Logout
                </div>
              </div>
            )}
          </div>
        ) : (
          // --- LOGGED OUT: LOGIN BUTTON ---
          <Link to="/login" className="login-btn-container" onClick={closeMobileMenu}>
             <div className="login-icon-circle">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="20px" height="20px">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <span className="login-text">Log In</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;