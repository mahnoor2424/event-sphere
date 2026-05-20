import React, { useState } from "react";
import "../App.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    email: "",
    newPassword: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // STEP 1 → verify email
  const handleVerify = async (e) => {
    e.preventDefault();

    try {
     await axios.post("http://localhost:5000/api/auth/forgot-password", {
  email: form.email.trim().toLowerCase()
});

      setStep(2);

    } catch (err) {
      alert(err.response?.data?.message || "Email not found");
    }
  };

  // STEP 2 → reset password
  const handleReset = async (e) => {
    e.preventDefault();

    try {
     await axios.post("http://localhost:5000/api/auth/reset-password", {
  email: form.email.trim().toLowerCase(),
  newPassword: form.newPassword
});

      alert("Password updated successfully");
      navigate("/login");

    } catch (err) {
      alert("Reset failed");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-glow"></div>

      <div className="login-card">
        <div className="login-content">

         {/* LOGO */}
<div style={{ textAlign: "center", marginBottom: "1.4rem" }}>
  <svg viewBox="0 0 80 80" width="56" height="56" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="28" fill="none" stroke="#00c8f0" strokeWidth="1" opacity="0.5"/>
    <ellipse cx="40" cy="40" rx="10" ry="28" fill="none" stroke="#00c8f0" strokeWidth="0.8" opacity="0.5"/>
    <ellipse cx="40" cy="40" rx="20" ry="28" fill="none" stroke="#00c8f0" strokeWidth="0.5" opacity="0.3"/>
    <line x1="12" y1="40" x2="68" y2="40" stroke="#00c8f0" strokeWidth="0.8" opacity="0.4"/>
    <circle cx="54" cy="28" r="3.5" fill="#00c8f0">
      <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="54" cy="28" r="7" fill="none" stroke="#00c8f0" strokeWidth="0.7" opacity="0.3"/>
    <path d="M66 18 L67.5 22 L72 22 L68.5 24.5 L70 29 L66 26.5 L62 29 L63.5 24.5 L60 22 L64.5 22 Z" fill="#00c8f0" opacity="0.85"/>
  </svg>
  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: 1, margin: "6px 0 2px" }}>
    Event<span style={{ color: "#00c8f0" }}>Sphere</span>
  </div>
  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", letterSpacing: 2, textTransform: "uppercase" }}>
    Account Recovery
  </div>
</div>

          {/* HEADING */}
          <div className="login-heading">
            <h1>Reset Access</h1>
            <p>Recover your account securely</p>
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <form className="login-form" onSubmit={handleVerify}>

              <div className="input-group">
                <label>Email Terminal</label>
                <input
                  type="email"
                  name="email"
                  onChange={handleChange}
                  placeholder="name@company.com"
                  required
                />
              </div>

              <button className="login-btn">
                Verify Email
              </button>
            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form className="login-form" onSubmit={handleReset}>

              <div className="input-group">
                <label>New Keyphrase</label>
                <input
                  type="password"
                  name="newPassword"
                  onChange={handleChange}
                  placeholder="Enter new password"
                  required
                />
              </div>

              <button className="login-btn">
                Reset Password
              </button>
            </form>
          )}

          <div className="divider">
            <span>Secure Recovery</span>
          </div>

          <p className="register-text">
            Back to login? <a href="/login">Login Here</a>
          </p>

        </div>
      </div>
    </div>
  );
}