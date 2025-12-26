import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // STATES
  const [view, setView] = useState('login');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [resetData, setResetData] = useState({ email: '', otp: '', newPassword: '' });
  const [error, setError] = useState('');

  // 1. ADD LOADING STATE
  const [isLoading, setIsLoading] = useState(false);

  // --- HANDLERS ---
  /* src/pages/Login.js */

  const handleChange = (e) => {
    // 1. Update the email/password as usual
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // 2. Clear the error message immediately when typing starts
    if (error) {
      setError('');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    try {
      const response = await fetch('https://cozy-kitchen-api.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        login(data.user, data.token);
        navigate('/');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); // 2. Start loading (Button says "Sending...")

    try {
      const response = await fetch('https://cozy-kitchen-api.onrender.com/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetData.email }),
      });
      if (response.ok) {
        toast.success("Code sent to your email!"); // <--- Beautiful popup
        setView('forgot-reset');
      } else {
        toast.error("User not found!"); // <--- Beautiful popup
      }
    } catch (err) {
      setError("Error sending code.");
    } finally {
      setIsLoading(false); // 3. Stop loading
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); // Start loading

    try {
      const response = await fetch('https://cozy-kitchen-api.onrender.com/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetData),
      });
      if (response.ok) {
        toast.success("Password Changed! Please Login."); 
        setView('login');
      } else {
        setError("Invalid Code or Error.");
      }
    } catch (err) {
      setError("Reset failed.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div className="split-screen-container">
      {/* LEFT SIDE (Image) */}
      <div className="left-pane">
        <div className="image-overlay">
          <h1>Cozy Kitchen</h1>
          <p>Discover recipes, share your favorites, and enjoy every meal.</p>
        </div>
      </div>

      {/* RIGHT SIDE (Forms) */}
      <div className="right-pane">

        {/* VIEW 1: LOGIN FORM */}
        {view === 'login' && (
          <div className="login-box-clean">
            <h2>Welcome Back! 👋</h2>
            <p className="sub-text">Please enter your details to sign in.</p>

            {error && <p className="error-msg">{error}</p>}

            <form onSubmit={handleLoginSubmit}>
              <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required />
              <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

              <div className="forgot-password-container">
                <span className="forgot-password-link" onClick={() => { setError(''); setView('forgot-email'); }}>
                  Forgot Password?
                </span>
              </div>

              <button type="submit" className="login-btn-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Log In"}
              </button>

              <button type="button" className="secondary-btn" onClick={() => navigate('/')}>
                Back to Home
              </button>
            </form>

            <p className="bottom-text">
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
          </div>
        )}

        {/* VIEW 2: ENTER EMAIL */}
        {view === 'forgot-email' && (
          <div className="login-box-clean">
            <h2>Recover Account 🔒</h2>
            <p className="sub-text">Enter your email and we'll send you a code.</p>

            {error && (
              <div className="error-banner">
                {error}
              </div>
            )}

            <form onSubmit={handleSendOtp}>

              <input
                type="email"
                placeholder="Enter your Email"
                value={resetData.email}
                onChange={(e) => setResetData({ ...resetData, email: e.target.value })}
                required
              />
              <button type="submit" className="login-btn-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Verification Code"}
              </button>
              <button type="button" className="secondary-btn" onClick={() => setView('login')}>
                Back to Login
              </button>
            </form>
          </div>
        )}

        {/* VIEW 3: RESET PASSWORD */}
        {view === 'forgot-reset' && (
          <div className="login-box-clean">
            <h2>Set New Password 🔑</h2>
            <p className="sub-text">Create a strong password for your account.</p>

            {error && <p className="error-msg">{error}</p>}

            <form onSubmit={handleResetSubmit}>
              <input
                type="text"
                placeholder="6-Digit Code"
                value={resetData.otp}
                onChange={(e) => setResetData({ ...resetData, otp: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="New Password"
                value={resetData.newPassword}
                onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                required
              />
              <button type="submit" className="login-btn-full" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Password"}
              </button>
              <button type="button" className="secondary-btn" onClick={() => setView('login')}>
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
};

export default Login;