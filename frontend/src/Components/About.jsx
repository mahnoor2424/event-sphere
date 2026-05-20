import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AboutEvent() {
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();

  const handleGetPass = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowAlert(true);
    } else {
      navigate("/attendee/explore");
    }
  };

  return (
    <section className="ab-root" id="about">

      {showAlert && (
        <div className="ab-overlay" onClick={() => setShowAlert(false)}>
          <div className="ab-alert" onClick={e => e.stopPropagation()}>
            <div className="ab-alert-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            </div>
            <h3>Login Required</h3>
            <p>Apna pass hasil karne ke liye pehle login karo aur EventSphere ka hissa bano.</p>
            <div className="ab-alert-btns">
              <button className="ab-cancel" onClick={() => setShowAlert(false)}>Cancel</button>
              <button className="ab-login-btn" onClick={() => { setShowAlert(false); navigate("/login"); }}>
                Login Now
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="ab-grid-bg" />

      <div className="ab-container">

        {/* LEFT */}
        <div className="ab-left">

          <div className="ab-eyebrow">
            <span className="ab-pulse" />
            WORLD-CLASS EXPO PLATFORM
          </div>

          <h2 className="ab-heading">
            The Biggest<br />
            <em>Event & Expo</em><br />
            Experience
          </h2>

          <p className="ab-body">
            We design and manage world-class exhibitions, corporate events, and tech
            conferences — seamless planning, creativity, and flawless execution under one roof.
          </p>

          <div className="ab-stats">
            {[
              { val: "500+", label: "Expos Hosted" },
              { val: "12K+", label: "Exhibitors" },
              { val: "48",   label: "Countries" },
              { val: "1.2M+", label: "Attendees" },
            ].map(s => (
              <div key={s.label} className="ab-stat">
                <div className="ab-stat-val">{s.val}</div>
                <div className="ab-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <button className="ab-cta" onClick={handleGetPass}>
            Get Your Pass
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        {/* RIGHT */}
        <div className="ab-right">
          <div className="ab-img-stack">
            <div className="ab-img-main">
              <img src="/assets/about1.png" alt="Event background" />
              <div className="ab-img-overlay" />
            </div>
            <div className="ab-img-front">
              <img src="/assets/abouts.jpg" alt="Event stage" />
            </div>
            <div className="ab-float-tag">
              <div className="ab-float-dot" />
              <div>
                <div className="ab-float-title">Live Now</div>
                <div className="ab-float-sub">Registrations Open</div>
              </div>
            </div>
            <div className="ab-ring" />
          </div>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Space+Grotesk:wght@300;400;500;600&family=Space+Mono&display=swap');

        .ab-root {
          background: #05070a; color: #f0ede8;
          font-family: 'Space Grotesk', sans-serif;
          padding: 110px 5% 120px;
          position: relative; overflow: hidden;
        }
        .ab-grid-bg {
          position: absolute; inset: 0; pointer-events: none;
          background-image: linear-gradient(rgba(0,212,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.035) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
        }
        .ab-overlay {
          position: fixed; inset: 0; z-index: 999;
          background: rgba(3,5,10,0.88); backdrop-filter: blur(18px);
          display: flex; align-items: center; justify-content: center; padding: 20px;
          animation: abFadeIn 0.2s ease;
        }
        @keyframes abFadeIn { from{opacity:0} to{opacity:1} }
        .ab-alert {
          background: #0b1120; border: 1px solid rgba(0,212,255,0.25);
          border-radius: 28px; padding: 48px 40px;
          max-width: 420px; width: 100%; text-align: center;
          animation: abSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes abSlideUp { from{transform:translateY(24px);opacity:0} to{transform:translateY(0);opacity:1} }
        .ab-alert-icon {
          width: 72px; height: 72px; border-radius: 50%;
          background: rgba(0,212,255,0.07); border: 1px solid rgba(0,212,255,0.2);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 24px; color: #00d4ff;
        }
        .ab-alert-icon svg { width: 30px; height: 30px; }
        .ab-alert h3 { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 800; margin-bottom: 10px; letter-spacing: -0.5px; }
        .ab-alert p { color: #6b7280; font-size: 0.95rem; line-height: 1.7; margin-bottom: 30px; }
        .ab-alert-btns { display: flex; gap: 12px; }
        .ab-cancel { flex: 1; padding: 14px; border-radius: 14px; background: transparent; border: 1px solid rgba(255,255,255,0.07); color: #6b7280; font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .ab-cancel:hover { color: #f0ede8; border-color: rgba(255,255,255,0.15); }
        .ab-login-btn { flex: 1; padding: 14px; border-radius: 14px; background: #00d4ff; border: none; color: #05070a; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 800; letter-spacing: 0.5px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; }
        .ab-login-btn:hover { background: #33ddff; transform: translateY(-1px); }

        .ab-container {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 80px; align-items: center; position: relative; z-index: 2;
        }
        .ab-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'Space Mono', monospace; font-size: 10px;
          letter-spacing: 2.5px; color: #00d4ff;
          background: rgba(0,212,255,0.06); border: 1px solid rgba(0,212,255,0.15);
          padding: 6px 16px; border-radius: 100px; margin-bottom: 36px;
        }
        .ab-pulse { width: 6px; height: 6px; background: #00d4ff; border-radius: 50%; animation: abBlink 2s infinite; }
        @keyframes abBlink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        .ab-heading {
          font-family: 'Syne', sans-serif; font-size: clamp(2.2rem, 4vw, 3.5rem);
          font-weight: 800; line-height: 1.1; letter-spacing: -1.5px; margin-bottom: 24px;
        }
        .ab-heading em { font-style: normal; color: #00d4ff; }
        .ab-body { color: #8a95a8; font-size: 1rem; line-height: 1.85; max-width: 480px; margin-bottom: 36px; }

        .ab-stats {
          display: flex; gap: 0; margin-bottom: 40px;
          border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; overflow: hidden;
        }
        .ab-stat { flex: 1; padding: 20px 16px; text-align: center; border-right: 1px solid rgba(255,255,255,0.06); }
        .ab-stat:last-child { border-right: none; }
        .ab-stat-val { font-family: 'Syne', sans-serif; font-size: 1.5rem; font-weight: 800; color: #00d4ff; line-height: 1; }
        .ab-stat-label { font-family: 'Space Mono', monospace; font-size: 8px; letter-spacing: 1.5px; color: #4b5563; margin-top: 6px; }

        .ab-cta {
          display: inline-flex; align-items: center; gap: 12px;
          background: #00d4ff; color: #05070a; border: none; border-radius: 18px;
          padding: 18px 36px; font-family: 'Syne', sans-serif; font-size: 13px;
          font-weight: 800; letter-spacing: 1px; cursor: pointer; transition: 0.25s;
        }
        .ab-cta:hover { background: #33ddff; transform: translateY(-3px); box-shadow: 0 16px 48px rgba(0,212,255,0.25); }
        .ab-cta svg { transition: transform 0.2s; }
        .ab-cta:hover svg { transform: translateX(4px); }

        .ab-right { display: flex; align-items: center; justify-content: center; }
        .ab-img-stack { position: relative; width: 100%; max-width: 480px; }
        .ab-img-main { position: relative; border-radius: 28px; overflow: hidden; height: 540px; }
        .ab-img-main img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .ab-img-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(5,7,10,0.8) 100%); }
        .ab-img-front { position: absolute; bottom: -30px; left: -36px; width: 48%; border-radius: 20px; overflow: hidden; border: 3px solid #05070a; box-shadow: 0 20px 50px rgba(0,0,0,0.6); }
        .ab-img-front img { width: 100%; height: 180px; object-fit: cover; display: block; }
        .ab-float-tag { position: absolute; top: 30px; right: -20px; display: flex; align-items: center; gap: 12px; background: rgba(11,17,32,0.95); border: 1px solid rgba(0,212,255,0.25); border-radius: 16px; padding: 14px 20px; backdrop-filter: blur(12px); }
        .ab-float-dot { width: 8px; height: 8px; border-radius: 50%; background: #00d4ff; flex-shrink: 0; animation: abBlink 2s infinite; }
        .ab-float-title { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; color: #fff; }
        .ab-float-sub { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 1px; color: #4b5563; }
        .ab-ring { position: absolute; top: -40px; right: -40px; width: 200px; height: 200px; border-radius: 50%; border: 1px solid rgba(0,212,255,0.08); pointer-events: none; }
        .ab-ring::after { content:''; position: absolute; inset: 20px; border-radius: 50%; border: 1px solid rgba(0,212,255,0.05); }

        @media (max-width: 960px) {
          .ab-container { grid-template-columns: 1fr; gap: 60px; }
          .ab-right { display: none; }
        }
        @media (max-width: 540px) {
          .ab-root { padding: 80px 5%; }
          .ab-stats { flex-wrap: wrap; }
          .ab-stat { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); min-width: 50%; }
          .ab-stat:last-child { border-bottom: none; }
        }
      `}</style>
    </section>
  );
}