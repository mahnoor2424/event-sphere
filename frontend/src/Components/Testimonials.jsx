import React, { useState, useEffect, useRef } from "react";

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

.tm-root {
  background: #05070A;
  padding: 110px 0 120px;
  overflow: hidden;
  position: relative;
  font-family: 'DM Sans', sans-serif;
}

.tm-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(130px);
  pointer-events: none;
  opacity: 0.08;
}
.tm-orb-1 { width: 500px; height: 500px; background: #00f2ff; top: -100px; left: -100px; }
.tm-orb-2 { width: 400px; height: 400px; background: #0070ff; bottom: -80px; right: -80px; }

.tm-grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0,242,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,242,255,0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent);
}

.tm-inner {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* --- BADGE (KICKER) KO CENTER KARNE KE LIYE UPDATED CSS --- */
.tm-kicker {
    display: flex;             /* flex use kiya takay dot aur text align rahein */
    align-items: center;
    justify-content: center;   /* content center karne ke liye */
    gap: 10px;
    background: rgba(0, 212, 255, 0.05);
    border: 1px solid rgba(0, 212, 255, 0.2);
    padding: 8px 20px;
    border-radius: 100px;
    margin: 0 auto 24px;       /* Isse pura badge center ho jayega */
    width: fit-content;        /* Takay background sirf text jitna rahe */
    color: #00f2ff;
    font-size: 14px;
    font-weight: 600;
}

.tm-kicker-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #00f2ff;
  animation: tmPulse 2s infinite;
}

@keyframes tmPulse {
  0%,100% { opacity:1; transform: scale(1); }
  50% { opacity:0.4; transform: scale(1.4); }
}

.tm-heading {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(32px, 5vw, 54px);
  font-weight: 800;
  text-align: center;
  color: #fff;
  line-height: 1.05;
  margin-bottom: 14px;
  letter-spacing: -1px;
}
.tm-heading em {
  font-style: normal;
  background: linear-gradient(135deg, #00f2ff, #00d9ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.tm-sub {
  color: #64748B;
  font-size: 15px;
  line-height: 1.7;
  max-width: 600px;     /* Text ko thoda compact karne ke liye */
  margin: 0 auto 64px;  /* Sub-text ko bhi center kiya */
  text-align:center;
}

/* Scrolling track */
.tm-track-wrap {
  overflow: hidden;
  position: relative;
  margin: 0 -24px;
}
.tm-track-wrap::before,
.tm-track-wrap::after {
  content: '';
  position: absolute;
  top: 0; bottom: 0;
  width: 120px;
  z-index: 3;
  pointer-events: none;
}
.tm-track-wrap::before { left: 0; background: linear-gradient(90deg, #05070A, transparent); }
.tm-track-wrap::after  { right: 0; background: linear-gradient(-90deg, #05070A, transparent); }

.tm-track {
  display: flex;
  gap: 20px;
  width: max-content;
  animation: tmScroll 40s linear infinite;
  padding: 12px 24px;
}
.tm-track:hover { animation-play-state: paused; }

@keyframes tmScroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* Card Styling */
.tm-card {
  width: 340px;
  flex-shrink: 0;
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(0,242,255,0.1);
  border-radius: 20px;
  padding: 28px;
  transition: border-color 0.3s, transform 0.3s;
  cursor: default;
  position: relative;
  overflow: hidden;
}
.tm-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0,242,255,0.4), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}
.tm-card:hover { border-color: rgba(0,242,255,0.3); transform: translateY(-4px); }
.tm-card:hover::before { opacity: 1; }

.tm-stars {
  display: flex;
  gap: 3px;
  margin-bottom: 16px;
}
.tm-star { color: #00f2ff; font-size: 13px; }

.tm-quote {
  font-size: 14px;
  color: rgba(255,255,255,0.75);
  line-height: 1.75;
  margin-bottom: 24px;
  font-weight: 400;
}
.tm-quote-mark {
  font-size: 40px;
  color: rgba(0,242,255,0.2);
  font-family: Georgia, serif;
  line-height: 0.5;
  display: block;
  margin-bottom: 10px;
}

.tm-author {
  display: flex;
  align-items: center;
  gap: 12px;
  border-top: 1px solid rgba(255,255,255,0.05);
  padding-top: 18px;
}
.tm-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  color: #000;
  flex-shrink: 0;
}
.tm-author-info { flex: 1; min-width: 0; }
.tm-name { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 2px; }
.tm-role { font-size: 11px; color: #64748B; }
.tm-badge {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 100px;
  flex-shrink: 0;
}

/* Summary row */
.tm-summary {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-top: 60px;
  padding-top: 48px;
  border-top: 1px solid rgba(255,255,255,0.05);
  flex-wrap: wrap;
}
.tm-summary-stat { text-align: center; }
.tm-summary-num {
  font-family: 'Syne', sans-serif;
  font-size: 36px;
  font-weight: 800;
  color: #00f2ff;
  line-height: 1;
  margin-bottom: 4px;
}
.tm-summary-label { font-size: 12px; color: #64748B; text-transform: uppercase; letter-spacing: 1px; }
.tm-summary-divider { width: 1px; height: 48px; background: rgba(255,255,255,0.06); }
.tm-summary-text { flex: 1; min-width: 200px; font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.7; }

@media (max-width: 768px) {
  .tm-root { padding: 80px 0 90px; }
  .tm-card { width: 290px; }
  .tm-summary { gap: 20px; }
  .tm-summary-divider { display: none; }
}
`;

const testimonials = [
  {
    quote: "EventSphere completely transformed how we host our annual tech summit. The booth management tools alone saved us 40+ hours of coordination.",
    name: "Sarah Al-Rashid",
    role: "Head of Events, NovaTech Dubai",
    initials: "SA",
    color: "#00b8d1",
    badge: "Exhibitor",
    badgeColor: "rgba(0,184,209,0.15)",
    badgeText: "#00b8d1",
    stars: 5,
  },
  {
    quote: "From registration to live analytics — everything is seamless. Our attendees keep coming back because the experience is just so polished.",
    name: "Marcus Osei",
    role: "CEO, Accra Global Forum",
    initials: "MO",
    color: "#7c3aed",
    badge: "Organizer",
    badgeColor: "rgba(124,58,237,0.15)",
    badgeText: "#a78bfa",
    stars: 5,
  },
  {
    quote: "I discovered three incredible vendors at the last expo. The smart recommendation engine literally pointed me to my now-favourite supplier.",
    name: "Priya Menon",
    role: "Procurement Lead, Lumina Corp",
    initials: "PM",
    color: "#059669",
    badge: "Attendee",
    badgeColor: "rgba(5,150,105,0.15)",
    badgeText: "#34d399",
    stars: 5,
  },
  {
    quote: "The collaboration hub feature is a game-changer. We closed two partnership deals right inside the platform during the event.",
    name: "Zaid Al-Farsi",
    role: "Partnership Director, Meridian Group",
    initials: "ZA",
    color: "#d97706",
    badge: "Exhibitor",
    badgeColor: "rgba(217,119,6,0.15)",
    badgeText: "#fbbf24",
    stars: 5,
  },
  {
    quote: "Real-time analytics gave us insights we never had before. We could see which booths were trending and adjust our strategy on the fly.",
    name: "Elena Kovač",
    role: "Marketing VP, BrandWave EU",
    initials: "EK",
    color: "#db2777",
    badge: "Exhibitor",
    badgeColor: "rgba(219,39,119,0.15)",
    badgeText: "#f472b6",
    stars: 5,
  },
  {
    quote: "Setting up our virtual booth took under 30 minutes. The drag-and-drop showcase editor is incredibly intuitive — no dev team needed.",
    name: "James Okafor",
    role: "Startup Founder, BuildLab Lagos",
    initials: "JO",
    color: "#0284c7",
    badge: "Exhibitor",
    badgeColor: "rgba(2,132,199,0.15)",
    badgeText: "#38bdf8",
    stars: 5,
  },
];

const doubled = [...testimonials, ...testimonials];

export default function Testimonials() {
  return (
    <>
      <style>{styles}</style>
      <section className="tm-root" id="testimonials">
        <div className="tm-orb tm-orb-1" />
        <div className="tm-orb tm-orb-2" />
        <div className="tm-grid-overlay" />

        <div className="tm-inner">
          <div className="tm-kicker">
            <span className="tm-kicker-dot" />
            Trusted Worldwide
          </div>
          <h2 className="tm-heading">
            Real voices,<br /><em>real results.</em>
          </h2>
          <p className="tm-sub">
            Thousands of organizers, exhibitors, and attendees use EventSphere to create
            unforgettable experiences. Here's what they say.
          </p>
        </div>

        <div className="tm-track-wrap">
          <div className="tm-track">
            {doubled.map((t, i) => (
              <div className="tm-card" key={i}>
                <div className="tm-stars">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <span className="tm-star" key={s}>★</span>
                  ))}
                </div>
                <span className="tm-quote-mark">"</span>
                <p className="tm-quote">{t.quote}</p>
                <div className="tm-author">
                  <div className="tm-avatar" style={{ background: t.color }}>{t.initials}</div>
                  <div className="tm-author-info">
                    <div className="tm-name">{t.name}</div>
                    <div className="tm-role">{t.role}</div>
                  </div>
                  <div
                    className="tm-badge"
                    style={{ background: t.badgeColor, color: t.badgeText }}
                  >
                    {t.badge}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="tm-inner">
          <div className="tm-summary">
            <div className="tm-summary-stat">
              <div className="tm-summary-num">4.9</div>
              <div className="tm-summary-label">Avg Rating</div>
            </div>
            <div className="tm-summary-divider" />
            <div className="tm-summary-stat">
              <div className="tm-summary-num">12K+</div>
              <div className="tm-summary-label">Reviews</div>
            </div>
            <div className="tm-summary-divider" />
            <div className="tm-summary-stat">
              <div className="tm-summary-num">98%</div>
              <div className="tm-summary-label">Satisfaction</div>
            </div>
            <div className="tm-summary-divider" />
            <p className="tm-summary-text">
              EventSphere is rated the #1 expo management platform across G2, Capterra, 
              and Product Hunt — three years running.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}