import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EventSphereLogo = () => (
  <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
    <svg viewBox="0 0 80 80" width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="28" fill="none" stroke="#00c8f0" strokeWidth="1" opacity="0.5" />
      <ellipse cx="40" cy="40" rx="10" ry="28" fill="none" stroke="#00c8f0" strokeWidth="0.8" opacity="0.5" />
      <ellipse cx="40" cy="40" rx="20" ry="28" fill="none" stroke="#00c8f0" strokeWidth="0.5" opacity="0.3" />
      <line x1="12" y1="40" x2="68" y2="40" stroke="#00c8f0" strokeWidth="0.8" opacity="0.4" />
      <circle cx="54" cy="28" r="3.5" fill="#00c8f0">
        <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="54" cy="28" r="7" fill="none" stroke="#00c8f0" strokeWidth="0.7" opacity="0.3" />
      <path d="M66 18 L67.5 22 L72 22 L68.5 24.5 L70 29 L66 26.5 L62 29 L63.5 24.5 L60 22 L64.5 22 Z" fill="#00c8f0" opacity="0.85" />
    </svg>
    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: 1 }}>
      Event<span style={{ color: "#00c8f0" }}>Sphere</span>
    </div>
    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase", marginTop: 3 }}>
      Event Management Platform
    </div>
  </div>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("user", JSON.stringify({
        _id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      }));
      if (res.data.role === "admin") navigate("/admin");
      else if (res.data.role === "exhibitor") navigate("/exhibitor");
      else if (res.data.role === "attendee") navigate("/attendee");
      else navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div style={styles.wrap}>

      {/* Background orbs */}
      <div style={{ ...styles.orb, width: 400, height: 400, background: "rgba(0,180,255,0.07)", top: -100, right: -100 }} />
      <div style={{ ...styles.orb, width: 300, height: 300, background: "rgba(0,100,200,0.05)", bottom: -80, left: -80 }} />

      <div style={styles.card}>
        <EventSphereLogo />

        <div style={styles.divider} />

        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={styles.heading}>Welcome back</h2>
          <p style={styles.subheading}>Sign in to your workspace</p>
        </div>

        <form onSubmit={handleLogin}>
          <Field label="Email" icon="✉" type="email" name="email" placeholder="name@company.com" onChange={handleChange} />
          <Field label="Password" icon="🔒" type="password" name="password" placeholder="••••••••" onChange={handleChange} />

          <div style={styles.optionsRow}>
            <label style={styles.rememberLabel}>
              <input type="checkbox" style={{ accentColor: "#00c8f0", marginRight: 6 }} />
              Remember me
            </label>
            <a href="/forgot-password" style={styles.link}>Forgot password?</a>
          </div>

          <button type="submit" style={styles.btn}>Sign In</button>
        </form>

        <div style={styles.sep}>
          <div style={styles.sepLine} />
          <span style={styles.sepText}>OR</span>
          <div style={styles.sepLine} />
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.3)", margin: 0 }}>
          Don't have an account?{" "}
          <a href="/register" style={styles.link}>Register here</a>
        </p>
      </div>

      <style>{`
        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

function Field({ label, icon, type, name, placeholder, onChange }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={styles.fieldLabel}>{label}</label>
      <div style={{ position: "relative" }}>
        <span style={styles.fieldIcon}>{icon}</span>
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          onChange={onChange}
          required
          style={styles.input}
          onFocus={e => { e.target.style.borderColor = "rgba(0,200,240,0.5)"; e.target.style.background = "rgba(0,200,240,0.05)"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(0,180,255,0.2)"; e.target.style.background = "rgba(255,255,255,0.04)"; }}
        />
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#070b14",
    padding: "2rem",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  orb: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(80px)",
    pointerEvents: "none",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    background: "rgba(255,255,255,0.03)",
    border: "0.5px solid rgba(0,180,255,0.18)",
    borderRadius: 20,
    padding: "2.5rem 2rem",
    position: "relative",
    zIndex: 1,
  },
  divider: {
    height: 0.5,
    background: "rgba(0,180,255,0.12)",
    marginBottom: "1.5rem",
  },
  heading: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 18,
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 4px",
  },
  subheading: {
    fontSize: 13,
    color: "rgba(255,255,255,0.35)",
    margin: 0,
  },
  fieldLabel: {
    display: "block",
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    color: "rgba(0,200,240,0.7)",
    marginBottom: 6,
  },
  fieldIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 13,
    opacity: 0.4,
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.04)",
    border: "0.5px solid rgba(0,180,255,0.2)",
    borderRadius: 10,
    padding: "10px 12px 10px 36px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: "#fff",
    outline: "none",
    transition: "border-color 0.2s, background 0.2s",
  },
  optionsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.4rem",
  },
  rememberLabel: {
    display: "flex",
    alignItems: "center",
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    cursor: "pointer",
  },
  link: {
    color: "#00c8f0",
    textDecoration: "none",
    fontSize: 12,
    fontWeight: 500,
  },
  btn: {
    width: "100%",
    padding: "12px",
    background: "rgba(0,180,255,0.12)",
    border: "0.5px solid rgba(0,180,255,0.4)",
    borderRadius: 10,
    color: "#fff",
    fontFamily: "'Syne', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 1,
    cursor: "pointer",
    transition: "background 0.2s, border-color 0.2s, transform 0.1s",
  },
  sep: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: "1.4rem 0",
  },
  sepLine: {
    flex: 1,
    height: 0.5,
    background: "rgba(255,255,255,0.08)",
  },
  sepText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.25)",
    letterSpacing: 1,
  },
};