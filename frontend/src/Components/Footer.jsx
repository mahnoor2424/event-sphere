import React, { useState } from "react";

const THEME = {
  bg: "#05070A",
  card: "#0A0D14",
  accent: "#38bdf8",
  accentGlow: "rgba(56,189,248,0.15)",
  border: "rgba(255,255,255,0.06)",
  textSecondary: "#64748B",
  textMuted: "#334155",
};

// --- Futuristic Logo Component ---
const EventSphereLogo = () => (
  <div className="footer-logo-wrapper">
    <svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg" className="footer-logo-svg">
      {/* --- GLOBE ICON --- */}
      <g className="globe-group">
        <circle cx="60" cy="55" r="35" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.6"/>
        <ellipse cx="60" cy="55" rx="12" ry="35" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
        <ellipse cx="60" cy="55" rx="25" ry="35" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
        <line x1="25" y1="55" x2="95" y2="55" stroke="#38bdf8" strokeWidth="1.5" />
        {/* Pulsing Point */}
        <circle cx="75" cy="40" r="4" fill="#38bdf8">
           <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* Star */}
        <path d="M90,30 L92,35 L98,35 L93,39 L95,45 L90,41 L85,45 L87,39 L82,35 L88,35 Z" fill="#38bdf8" />
      </g>

      {/* --- TEXT SECTION --- */}
      <text x="115" y="75" className="ft-text-white">Event</text>
      <text x="320" y="75" className="ft-text-blue">Sphere</text>
    </svg>
  </div>
);

const links = {
  "Platform": ["Explore Expos", "Become an Exhibitor", "Schedule", "Live Sessions"],
  "Support": ["Help Center", "Terms of Service", "Privacy Policy", "Contact Us"],
  "Company": ["About Us", "Blog", "Careers", "Press Kit"],
};

const socialIcons = [
  { label: "X", svg: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.635 5.904-5.635Zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
  { label: "LinkedIn", svg: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg> },
  { label: "Instagram", svg: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg> },
  { label: "YouTube", svg: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg> },
];

export default function Footer() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@800;900&family=DM+Sans:wght@400;500;700&display=swap');

        /* Logo Specific CSS */
        .footer-logo-wrapper { height: 45px; display: flex; align-items: center; margin-bottom: 24px; margin-left: -10px; }
        .footer-logo-svg { height: 100%; width: auto; overflow: visible; }
        .ft-text-white { font-family: 'Orbitron', sans-serif; font-size: 58px; fill: #ffffff; font-weight: 900; }
        .ft-text-blue { font-family: 'Orbitron', sans-serif; font-size: 58px; fill: #38bdf8; font-weight: 900; filter: drop-shadow(0 0 12px rgba(56, 189, 248, 0.5)); }

        .footer-link {
          color: #64748B; font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: 0.22s ease; display: inline-block; position: relative;
        }
        .footer-link:hover { color: #38bdf8; transform: translateX(4px); }

        .social-btn {
          width: 38px; height: 38px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center;
          color: #64748B; cursor: pointer; transition: 0.22s ease;
        }
        .social-btn:hover {
          background: rgba(56,189,248,0.12); border-color: rgba(56,189,248,0.35); color: #38bdf8;
          transform: translateY(-3px); box-shadow: 0 8px 20px rgba(56,189,248,0.15);
        }

        .footer-divider-line {
          width: 100%; height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.2) 30%, rgba(56,189,248,0.2) 70%, transparent 100%);
          margin: 0; border: none;
        }

        @media (max-width: 600px) {
          .footer-grid { grid-template-columns: 1fr !important; }
          .footer-links-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-bottom { flex-direction: column !important; text-align: center; }
        }
      `}</style>

      <footer style={{ background: THEME.bg, borderTop: `1px solid ${THEME.border}`, padding: 0, fontFamily: "'DM Sans', sans-serif", position: 'relative', overflow: 'hidden' }}>
        
        {/* Decorative Glows */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '600px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px 0' }}>

          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 2fr', gap: '60px', marginBottom: '56px' }}>

            {/* Brand Column */}
            <div>
              {/* --- INTEGRATED LOGO --- */}
              <EventSphereLogo />

              <p style={{ color: THEME.textSecondary, fontSize: '13.5px', lineHeight: 1.75, marginBottom: '28px', maxWidth: '300px' }}>
                The world's leading platform for virtual and physical exhibitions. Connecting exhibitors and attendees globally through the digital sphere.
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                {socialIcons.map((s) => (
                  <button key={s.label} className="social-btn" title={s.label}>{s.svg}</button>
                ))}
              </div>
            </div>

            {/* Links Grid */}
            <div className="footer-links-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
              {Object.entries(links).map(([section, items]) => (
                <div key={section}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <div style={{ width: '3px', height: '14px', borderRadius: '2px', background: THEME.accent }} />
                    <h5 style={{ color: '#fff', fontSize: '12px', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>{section}</h5>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {items.map((item) => (
                      <li key={item}><span className="footer-link">{item}</span></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter strip */}
          <div style={{ background: 'rgba(56,189,248,0.03)', border: `1px solid rgba(56,189,248,0.1)`, borderRadius: '16px', padding: '24px', marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: '14px', margin: '0 0 4px' }}>Stay synchronized</p>
              <p style={{ color: THEME.textSecondary, fontSize: '12.5px', margin: 0 }}>Join our newsletter for the latest expo updates and system features.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input type="email" placeholder="terminal@access.com" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.1)`, borderRadius: '8px', padding: '10px 16px', color: '#fff', outline: 'none', width: '220px' }} />
              <button style={{ background: THEME.accent, color: '#000', border: 'none', borderRadius: '8px', padding: '10px 24px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Subscribe</button>
            </div>
          </div>

          <hr className="footer-divider-line" />

          <div className="footer-bottom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0 32px', gap: '16px' }}>
            <p style={{ color: THEME.textMuted, fontSize: '12px', margin: 0 }}>
              © 2025 <span style={{ color: THEME.textSecondary }}>EventSphere Corp</span>. All Rights Reserved.
            </p>
            <div style={{ display: 'flex', gap: '24px' }}>
              {['Privacy', 'Terms', 'Cookies'].map((item) => (
                <span key={item} className="footer-link" style={{ fontSize: '12px' }}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}