import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "attendee",
    organization: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", form);
      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>

      <div style={{ ...styles.orb, width: 380, height: 380, background: "rgba(0,180,255,0.07)", top: -80, right: -80 }} />
      <div style={{ ...styles.orb, width: 280, height: 280, background: "rgba(0,80,200,0.05)", bottom: -60, left: -60 }} />

      <div style={styles.card}>

        {/* LOGO */}
        <div style={{ textAlign: "center", marginBottom: "1.4rem" }}>
          <svg viewBox="0 0 80 80" width="56" height="56" xmlns="http://www.w3.org/2000/svg">
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
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: 1, margin: "6px 0 2px" }}>
            Event<span style={{ color: "#00c8f0" }}>Sphere</span>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", letterSpacing: 2, textTransform: "uppercase" }}>
            Event Management Platform
          </div>
        </div>

        <div style={styles.divider} />

        <div style={{ marginBottom: "1.2rem" }}>
          <h2 style={styles.heading}>Create account</h2>
          <p style={styles.subheading}>Join the EventSphere ecosystem</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Field label="Full Name" icon="ti-user" type="text" name="name" placeholder="Enter your name" onChange={handleChange} />
          <Field label="Email" icon="ti-mail" type="email" name="email" placeholder="name@company.com" onChange={handleChange} />
          <Field label="Password" icon="ti-lock" type="password" name="password" placeholder="••••••••" onChange={handleChange} />

          {/* ROLE SELECTOR */}
          <div style={{ marginBottom: "0.85rem" }}>
            <div style={styles.fieldLabel}>Select Role</div>
            <div style={styles.roleRow}>
              <RoleBox
                icon="ti-ticket"
                title="Attendee"
                desc="Join events & explore"
                active={form.role === "attendee"}
                onClick={() => setForm({ ...form, role: "attendee", organization: "" })}
              />
              <RoleBox
                icon="ti-building-store"
                title="Exhibitor"
                desc="Host & manage events"
                active={form.role === "exhibitor"}
                onClick={() => setForm({ ...form, role: "exhibitor" })}
              />
            </div>
          </div>

          {/* ORGANIZATION — only for exhibitor */}
          {form.role === "exhibitor" && (
            <Field label="Organization / Company" icon="ti-building" type="text" name="organization" placeholder="Company name" onChange={handleChange} />
          )}

          <button
            type="submit"
            disabled={loading}
            style={styles.btn}
            onMouseEnter={e => { e.target.style.background = "rgba(0,180,255,0.2)"; e.target.style.borderColor = "rgba(0,180,255,0.6)"; }}
            onMouseLeave={e => { e.target.style.background = "rgba(0,180,255,0.12)"; e.target.style.borderColor = "rgba(0,180,255,0.4)"; }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.28)", marginTop: "1.2rem" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "#00c8f0", textDecoration: "none", fontWeight: 500 }}>Login here</a>
        </p>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}

function Field({ label, icon, type, name, placeholder, onChange }) {
  return (
    <div style={{ marginBottom: "0.85rem" }}>
      <label style={styles.fieldLabel}>{label}</label>
      <div style={{ position: "relative" }}>
        <i className={`ti ${icon}`} aria-hidden="true" style={styles.fieldIcon} />
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          onChange={onChange}
          style={styles.input}
          onFocus={e => { e.target.style.borderColor = "rgba(0,200,240,0.5)"; e.target.style.background = "rgba(0,200,240,0.04)"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(0,180,255,0.2)"; e.target.style.background = "rgba(255,255,255,0.04)"; }}
        />
      </div>
    </div>
  );
}

function RoleBox({ icon, title, desc, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        ...styles.roleBox,
        opacity: active ? 1 : 0.4,
        background: active ? "rgba(0,180,255,0.1)" : "rgba(255,255,255,0.03)",
        borderColor: active ? "rgba(0,200,240,0.55)" : "rgba(0,180,255,0.15)",
      }}
    >
      <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: 28, color: "#00c8f0", display: "block", marginBottom: 8 }} />
      <h4 style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: "#fff", margin: "0 0 2px" }}>{title}</h4>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0 }}>{desc}</p>
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
    maxWidth: 420,
    background: "rgba(255,255,255,0.03)",
    border: "0.5px solid rgba(0,180,255,0.18)",
    borderRadius: 20,
    padding: "2.5rem 2rem",
    position: "relative",
    zIndex: 1,
  },
  divider: { height: 0.5, background: "rgba(0,180,255,0.12)", margin: "1.2rem 0" },
  heading: { fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, color: "#fff", margin: "0 0 3px" },
  subheading: { fontSize: 12, color: "rgba(255,255,255,0.3)", margin: 0 },
  fieldLabel: {
    display: "block",
    fontSize: 10, fontWeight: 500,
    letterSpacing: "1.5px", textTransform: "uppercase",
    color: "rgba(0,200,240,0.65)", marginBottom: 5,
  },
  fieldIcon: {
    position: "absolute", left: 11, top: "50%",
    transform: "translateY(-50%)",
    fontSize: 15, color: "rgba(0,200,240,0.4)", pointerEvents: "none",
  },
  input: {
    width: "100%", boxSizing: "border-box",
    background: "rgba(255,255,255,0.04)",
    border: "0.5px solid rgba(0,180,255,0.2)",
    borderRadius: 9,
    padding: "9px 12px 9px 34px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13, color: "#fff", outline: "none",
    transition: "border-color 0.2s, background 0.2s",
  },
  roleRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  roleBox: {
    border: "0.5px solid",
    borderRadius: 12,
    padding: "14px 12px",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.2s",
  },
  btn: {
    width: "100%", padding: "11px",
    background: "rgba(0,180,255,0.12)",
    border: "0.5px solid rgba(0,180,255,0.4)",
    borderRadius: 10, color: "#fff",
    fontFamily: "'Syne', sans-serif",
    fontSize: 13, fontWeight: 700, letterSpacing: 1,
    cursor: "pointer", marginTop: "0.4rem",
    transition: "background 0.2s, border-color 0.2s, transform 0.1s",
  },
};