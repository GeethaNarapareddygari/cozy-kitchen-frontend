import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import emailjs from '@emailjs/browser'; // 👈 Import EmailJS
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [otp, setOtp] = useState("");
  
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 👇 REPLACE THESE WITH YOUR ACTUAL KEYS FROM EMAILJS DASHBOARD
  const YOUR_SERVICE_ID = "service_fv9i37a"; 
  const YOUR_TEMPLATE_ID = "template_ms7ffk7";
  const YOUR_PUBLIC_KEY = "ZTDC3F-e5Nm9CNgAF";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. SIGNUP -> Get OTP from Backend -> Send via EmailJS
  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://cozy-kitchen-api.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      
      if (response.ok) {
        // ✅ Backend sent us the OTP in 'data.otp'
        const otpCode = data.otp;

        // 📧 Configure Email
        const emailParams = {
          to_email: formData.email,   // Must match {{to_email}} in EmailJS template
          user_name: formData.username, // Must match {{user_name}} in EmailJS template
          otp_code: otpCode           // Must match {{otp_code}} in EmailJS template
        };

        // 🚀 Send Email from Browser
        await emailjs.send(YOUR_SERVICE_ID, YOUR_TEMPLATE_ID, emailParams, YOUR_PUBLIC_KEY);

        toast.success("OTP Sent to your email!"); 
        setStep(2); // Move to verification screen
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to server.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. VERIFY SUBMIT (Unchanged)
  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('https://cozy-kitchen-api.onrender.com/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const data = await response.json();
      
      if (response.ok) {
        toast.success("Account Verified! Please Login.");
        navigate('/login');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. RESEND CODE -> Get New OTP -> Send via EmailJS
  const handleResend = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('https://cozy-kitchen-api.onrender.com/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();
      
      if (response.ok) {
        // ✅ Backend sent new OTP
        const newOtp = data.otp;

        const emailParams = {
          to_email: formData.email,
          user_name: formData.username,
          otp_code: newOtp
        };

        await emailjs.send(YOUR_SERVICE_ID, YOUR_TEMPLATE_ID, emailParams, YOUR_PUBLIC_KEY);

        toast.success("New Code Sent!"); 
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Could not resend code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="split-screen-container">
      <div className="left-pane signup-mode">
        <div className="image-overlay">
          <h1>Join the Kitchen</h1>
          <p>Save your favorite recipes forever.</p>
        </div>
      </div>

      <div className="right-pane">
        <div className="login-box-clean">
          <h2>{step === 1 ? "Create Account 🚀" : "Verify Email 📧"}</h2>
          
          {error && <p className="error-msg">{error}</p>}
          
          {step === 1 ? (
            // --- STEP 1: SIGNUP FORM ---
            <form onSubmit={handleSignup}>
              <input 
                type="text" 
                name="username" 
                placeholder="Username" 
                value={formData.username}
                onChange={handleChange} 
                required 
              />
              <input 
                type="email" 
                name="email" 
                placeholder="Email Address" 
                value={formData.email}
                onChange={handleChange} 
                required 
              />
              <input 
                type="password" 
                name="password" 
                placeholder="Password (min 6 chars)" 
                value={formData.password}
                onChange={handleChange} 
                required 
              />
              
              <button type="submit" className="login-btn-full" disabled={isLoading} style={{opacity: isLoading ? 0.7 : 1}}>
                {isLoading ? "Sending..." : "Sign Up"}
              </button>
            </form>
          ) : (
            // --- STEP 2: VERIFY FORM ---
            <form onSubmit={handleVerify}>
              <p style={{marginBottom: '10px'}}>We sent a code to <b>{formData.email}</b></p>
              
              <input 
                type="text" 
                placeholder="Enter 6-digit Code" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)} 
                required 
              />
              
              <button type="submit" className="login-btn-full" disabled={isLoading} style={{opacity: isLoading ? 0.7 : 1}}>
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>

              {/* RESEND LINK */}
              <p style={{marginTop: '15px', textAlign: 'center', fontSize: '0.9rem'}}>
                Didn't get the code? <br/>
                <button 
                  type="button"
                  onClick={handleResend} 
                  disabled={isLoading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#d84315', 
                    fontWeight: 'bold', 
                    cursor: 'pointer', 
                    textDecoration: 'underline',
                    padding: 0,
                    fontSize: 'inherit'
                  }}
                >
                  Resend Code
                </button>
              </p>
            </form>
          )}

          <p className="bottom-text">
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;