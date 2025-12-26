import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // 1. Import Toast
import './Auth.css'; 

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); 
  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://cozy-kitchen-api.onrender.com/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        // --- REPLACED ALERT ---
        toast.success("Code sent to your email!");
        setStep(2); 
      } else {
        // --- REPLACED ALERT ---
        toast.error("User not found!");
      }
    } catch (error) {
      toast.error("Failed to connect to server.");
    }
  };

  // Step 2: Reset Password
  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://cozy-kitchen-api.onrender.com/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      if (response.ok) {
        // --- REPLACED ALERT ---
        toast.success("Password Changed! Please Login.");
        navigate('/login');
      } else {
        // --- REPLACED ALERT ---
        toast.error("Invalid Code or Error.");
      }
    } catch (error) {
      toast.error("Reset failed. Try again.");
    }
  };

  return (
    <div className="split-screen-container">
      <div className="left-pane" style={{backgroundImage: "url('https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2070')"}}>
        <div className="image-overlay">
          <h1>Recover Account</h1>
        </div>
      </div>

      <div className="right-pane">
        <div className="login-box-clean">
          <h2>{step === 1 ? "Forgot Password? 🔒" : "Set New Password 🔑"}</h2>
          
          {step === 1 ? (
            <form onSubmit={handleSendOtp}>
              <p className="sub-text">Enter your email to receive a code.</p>
              <input 
                type="email" 
                placeholder="Enter Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
              <button type="submit" className="login-btn-full">Send Code</button>
            </form>
          ) : (
            <form onSubmit={handleReset}>
              <p className="sub-text">Enter the code sent to <b>{email}</b></p>
              <input 
                type="text" 
                placeholder="6-Digit Code" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)} 
                required 
              />
              <input 
                type="password" 
                placeholder="New Password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
              />
              <button type="submit" className="login-btn-full">Update Password</button>
            </form>
          )}
          
          {/* Back button */}
          <p className="bottom-text" style={{cursor: 'pointer'}} onClick={() => navigate('/login')}>
            Back to Login
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;