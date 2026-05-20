import React, { useState, useEffect } from "react";

// Logo Component
const EventSphereLogo = () => (
  <div className="logo-wrapper">
    <svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg" className="main-logo-svg">
      <g className="globe-group">
        <circle cx="60" cy="55" r="35" fill="none" stroke="#00d4ff" strokeWidth="1.5" opacity="0.6"/>
        <ellipse cx="60" cy="55" rx="12" ry="35" fill="none" stroke="#00d4ff" strokeWidth="1.2" />
        <line x1="25" y1="55" x2="95" y2="55" stroke="#00d4ff" strokeWidth="1.2" />
        <circle cx="75" cy="40" r="4" fill="#00d4ff">
           <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
        </circle>
      </g>
      <text x="110" y="75" className="text-event">Event</text>
      <text x="300" y="75" className="text-sphere">Sphere</text>
    </svg>
  </div>
);

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [menuOpen]);

  return (
    <>
      <nav className={`nv-root ${scrolled ? "nv-scrolled" : ""}`}>
        <div className="nv-container">
          {/* LOGO */}
          <a href="/" className="nv-logo">
            <EventSphereLogo />
          </a>

          {/* DESKTOP LINKS */}
          <div className="nv-links-desktop">
            <a href="/" className="nv-link active">HOME</a>
            <a href="#about" className="nv-link">ABOUT</a>
            <a href="#services" className="nv-link">SERVICES</a>
            <a href="#featured" className="nv-link">EVENTS</a>
            <a href="#blogs" className="nv-link">BLOG</a>
            <a href="#cta" className="nv-link">CONTACT</a>
          </div>

          {/* ACTIONS (Only Login on Desktop) */}
          <div className="nv-actions-desktop">
            <a href="/login" className="nv-btn-login">LOGIN</a>
          </div>

          {/* HAMBURGER (Visible on Tablet/Mobile) */}
          <button className="nv-hamburger" onClick={() => setMenuOpen(true)}>
            <div className="nv-bar"></div>
            <div className="nv-bar" style={{ width: '18px' }}></div>
            <div className="nv-bar"></div>
          </button>
        </div>
      </nav>

      {/* MOBILE DRAWER MENU */}
      <div className={`nv-mobile-drawer ${menuOpen ? "nv-drawer-open" : ""}`}>
        <div className="nv-drawer-backdrop" onClick={() => setMenuOpen(false)}></div>
        
        <div className="nv-drawer-content">
          <div className="nv-drawer-header">
            <div className="nv-status-indicator">
                <span className="nv-pulse-dot"></span>
                SYSTEM ACTIVE
            </div>
            <button className="nv-close-btn" onClick={() => setMenuOpen(false)}>✕</button>
          </div>

          <div className="nv-drawer-links">
            <a href="/" onClick={() => setMenuOpen(false)}>HOME</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>ABOUT</a>
            <a href="#services" onClick={() => setMenuOpen(false)}>SERVICES</a>
            <a href="#featured" onClick={() => setMenuOpen(false)}>EVENTS</a>
            <a href="#blogs" onClick={() => setMenuOpen(false)}>BLOG</a>
            <a href="#cta" onClick={() => setMenuOpen(false)}>CONTACT</a>
            
            {/* LOGIN BUTTON INSIDE DRAWER FOR MOBILE/TABLET */}
            <div className="nv-drawer-footer">
                <a href="/login" className="nv-mobile-login-btn" onClick={() => setMenuOpen(false)}>
                    LOGIN TO PORTAL
                </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800&family=DM+Sans:wght@500;700&display=swap');

        .nv-root {
          position: fixed; top: 0; left: 0; width: 100%; z-index: 1000;
          padding: 24px 5%; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nv-scrolled {
          padding: 14px 5%; background: rgba(5, 7, 10, 0.85);
          backdrop-filter: blur(15px); border-bottom: 1px solid rgba(0, 212, 255, 0.2);
        }

        .nv-container { 
            max-width: 1400px; margin: 0 auto; 
            display: flex; align-items: center; justify-content: space-between; 
        }

        /* Logo */
        .logo-wrapper { height: 44px; display: flex; align-items: center; }
        .main-logo-svg { height: 100%; width: auto; overflow: visible; }
        .text-event { font-family: 'Orbitron', sans-serif; font-size: 55px; fill: #ffffff; font-weight: 800; }
        .text-sphere { font-family: 'Orbitron', sans-serif; font-size: 55px; fill: #00d4ff; font-weight: 800; filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.6)); }

        /* Desktop Nav */
        .nv-links-desktop { display: flex; gap: 32px; }
        .nv-link {
          color: rgba(255,255,255,0.6); text-decoration: none; font-family: 'DM Sans', sans-serif; 
          font-size: 13px; font-weight: 700; letter-spacing: 1.5px; transition: 0.3s;
        }
        .nv-link:hover, .nv-link.active { color: #00d4ff; }

        .nv-btn-login {
          border: 1px solid #00d4ff; padding: 10px 28px; color: #00d4ff; text-decoration: none;
          font-family: 'Orbitron', sans-serif; font-size: 11px; border-radius: 8px; transition: 0.3s;
          letter-spacing: 1px;
        }
        .nv-btn-login:hover { background: #00d4ff; color: #000; box-shadow: 0 0 20px rgba(0, 212, 255, 0.4); }

        /* Hamburger */
        .nv-hamburger { 
            display: none; flex-direction: column; align-items: flex-end; gap: 6px; 
            background: none; border: none; cursor: pointer; padding: 5px;
        }
        .nv-bar { width: 28px; height: 2px; background: #00d4ff; transition: 0.3s; border-radius: 10px; }

        /* --- MOBILE DRAWER UI --- */
        .nv-mobile-drawer {
          position: fixed; inset: 0; z-index: 2000;
          visibility: hidden; pointer-events: none; transition: 0.4s;
        }
        .nv-drawer-open { visibility: visible; pointer-events: auto; }

        .nv-drawer-backdrop {
          position: absolute; inset: 0; background: rgba(0,0,0,0.8);
          backdrop-filter: blur(4px); opacity: 0; transition: 0.4s;
        }
        .nv-drawer-open .nv-drawer-backdrop { opacity: 1; }

        .nv-drawer-content {
          position: absolute; top: 0; right: 0; width: 320px; height: 100%;
          background: #05070a; border-left: 1px solid rgba(0, 212, 255, 0.2);
          padding: 40px; transform: translateX(100%); transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex; flex-direction: column;
        }
        .nv-drawer-open .nv-drawer-content { transform: translateX(0); }

        .nv-drawer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 50px; }
        .nv-status-indicator {
            display: flex; align-items: center; gap: 8px; font-family: 'Orbitron'; 
            font-size: 10px; color: #00d4ff; letter-spacing: 2px;
        }
        .nv-pulse-dot {
            width: 6px; height: 6px; background: #00d4ff; border-radius: 50%;
            animation: nvPulse 2s infinite;
        }
        @keyframes nvPulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }

        .nv-close-btn { background: none; border: none; color: #fff; font-size: 24px; cursor: pointer; }

        .nv-drawer-links { display: flex; flex-direction: column; gap: 24px; }
        .nv-drawer-links a { 
            color: #fff; font-family: 'Syne', sans-serif; font-size: 20px; 
            font-weight: 800; text-decoration: none; transition: 0.3s;
        }
        .nv-drawer-links a:hover { color: #00d4ff; padding-left: 10px; }

        .nv-drawer-footer { margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.05); }
        .nv-mobile-login-btn {
            display: block; width: 100%; padding: 16px; background: #00d4ff; color: #000 !important;
            text-align: center; border-radius: 12px; font-family: 'Orbitron' !important;
            font-size: 12px !important; font-weight: 800; letter-spacing: 1px;
        }

        /* --- RESPONSIVE --- */
        @media (max-width: 992px) {
          .nv-links-desktop, .nv-actions-desktop { display: none; }
          .nv-hamburger { display: flex; }
          .logo-wrapper { height: 36px; }
          .nv-root { padding: 20px 5%; }
        }
      `}</style>
    </>
  );
}