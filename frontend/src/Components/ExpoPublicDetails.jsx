import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function getExhibitorCount(expo) {
  return expo.booths?.layout?.filter(b => b.status === "reserved" || b.exhibitorId).length || 0;
}

export default function ExpoPublicDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expo, setExpo] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoleAlert, setShowRoleAlert] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expoRes, scheduleRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/expo/all`),
          axios.get(`http://localhost:5000/api/schedule/all`)
        ]);
        const currentExpo = expoRes.data.find(e => e._id === id);
        setExpo(currentExpo);
        const expoSessions = scheduleRes.data.filter(s => s.expoId === id || s.expo === id);
        setSessions(expoSessions);
      } catch (err) {
        console.error("Error fetching detail data", err);
      } finally {
        setLoading(false);
        setTimeout(() => setMounted(true), 50);
      }
    };
    fetchData();
  }, [id]);

  const handleRegistration = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token) {
      if (role === "attendee") navigate(`/attendee/expo/${id}`);
      else if (role === "exhibitor") navigate(`/exhibitor/expo/${id}`);
      else navigate("/login");
    } else {
      setShowRoleAlert(true);
    }
  };

  if (loading) return (
    <div className="ep-splash">
      <div className="ep-splash-inner">
        <div className="ep-splash-rings">
          <div className="ep-ring r1" /><div className="ep-ring r2" /><div className="ep-ring r3" />
        </div>
        <p className="ep-splash-txt">LOADING NODE</p>
      </div>
    </div>
  );

  if (!expo) return (
    <div className="ep-splash">
      <p className="ep-splash-txt">NODE NOT FOUND</p>
    </div>
  );

  const fillPercent = Math.round((getExhibitorCount(expo) / (expo.booths?.total || 20)) * 100);
  const startDate = new Date(expo.startDate);

  return (
    <div className={`ep-root ${mounted ? "ep-mounted" : ""}`}>

      {/* ── ROLE CHOICE MODAL ── */}
      {showRoleAlert && (
        <div className="ep-modal-bg" onClick={(e) => e.target === e.currentTarget && setShowRoleAlert(false)}>
          <div className="ep-modal">
            <button className="ep-modal-close" onClick={() => setShowRoleAlert(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            <div className="ep-modal-glow" />
            <div className="ep-modal-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <p className="ep-modal-eyebrow">SELECT IDENTITY</p>
            <h2 className="ep-modal-title">Who Are You?</h2>
            <p className="ep-modal-sub">Choose your role to access the full expo protocol and unlock your digital pass.</p>
            <div className="ep-modal-cards">
              <button className="ep-role-card" onClick={() => { setShowRoleAlert(false); navigate("/login?role=attendee"); }}>
                <div className="ep-role-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
                  </svg>
                </div>
                <div className="ep-role-info">
                  <strong>Attendee</strong>
                  <span>Browse booths & sessions</span>
                </div>
                <div className="ep-role-arrow">→</div>
              </button>
              <button className="ep-role-card ep-role-card--cyan" onClick={() => { setShowRoleAlert(false); navigate("/login?role=exhibitor"); }}>
                <div className="ep-role-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-4 0v2M12 12v4M10 14h4"/>
                  </svg>
                </div>
                <div className="ep-role-info">
                  <strong>Exhibitor</strong>
                  <span>Manage your booth & leads</span>
                </div>
                <div className="ep-role-arrow">→</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NAVBAR ── */}
      <nav className="ep-nav">
        <button className="ep-back" onClick={() => navigate("/")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </button>
        <div className="ep-nav-badge">
          <span className="ep-live-dot" />
          LIVE EVENT
        </div>
        <button className="ep-nav-cta" onClick={handleRegistration}>Get Pass</button>
      </nav>

      {/* ── HERO ── */}
      <div className="ep-hero">
        <div className="ep-hero-noise" />
        <div className="ep-hero-grid" />
        <div className="ep-hero-glow g1" /><div className="ep-hero-glow g2" />

        <div className="ep-hero-inner">
          <div className="ep-hero-top">
            <span className="ep-eyebrow">{expo.theme?.toUpperCase() || "GENERAL"}</span>
            <span className="ep-eyebrow ep-eyebrow--dim">{expo.location?.city || "GLOBAL"}</span>
          </div>
          <h1 className="ep-title">{expo.title}</h1>

          <div className="ep-hero-meta">
            <div className="ep-meta-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              {startDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </div>
            <div className="ep-meta-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
              {getExhibitorCount(expo)} Exhibitors
            </div>
            <div className="ep-meta-pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {sessions.length} Sessions
            </div>
          </div>

          {/* Fill bar */}
          <div className="ep-fill-bar">
            <div className="ep-fill-meta">
              <span>Booth Availability</span>
              <span className="ep-fill-pct">{100 - fillPercent}% remaining</span>
            </div>
            <div className="ep-fill-track">
              <div className="ep-fill-progress" style={{ width: `${fillPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="ep-body">

        {/* LEFT CONTENT */}
        <div className="ep-main">

          {/* STAT STRIP */}
          <div className="ep-stats-strip">
            {[
              { val: "3", label: "Days" },
              { val: sessions.length || "0", label: "Sessions" },
              { val: getExhibitorCount(expo), label: "Exhibitors" },
              { val: expo.booths?.total || 20, label: "Total Booths" },
            ].map((s, i) => (
              <div key={i} className="ep-stat-item">
                <div className="ep-stat-val">{s.val}</div>
                <div className="ep-stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>

          {/* TABS */}
          <div className="ep-tabs">
            {["overview", "sessions", "location"].map(tab => (
              <button key={tab} className={`ep-tab ${activeTab === tab ? "ep-tab--active" : ""}`} onClick={() => setActiveTab(tab)}>
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          <div className="ep-tab-content">
            {activeTab === "overview" && (
              <div className="ep-overview">
                <p className="ep-desc">
                  {expo.description || `Welcome to ${expo.title} — one of the most anticipated ${expo.theme || "tech"} events of the year. This expo brings together the brightest minds, boldest innovators, and most strategic investors on a single platform. Explore cutting-edge products, forge powerful connections, and position your brand at the frontier of the industry.`}
                </p>
                <div className="ep-highlights">
                  {[
                    { icon: "", title: "Curated Networking", desc: "AI-matched connections with verified industry leaders" },
                    { icon: "", title: "Live Streams", desc: "Real-time session broadcasts and Q&A with speakers" },
                    { icon: "", title: "Deal Lounge", desc: "Exclusive space for high-value business conversations" },
                    { icon: "", title: "Awards Ceremony", desc: "Recognizing top innovators across all categories" },
                  ].map((h, i) => (
                    <div key={i} className="ep-highlight-card">
                      <div className="ep-highlight-icon">{h.icon}</div>
                      <div>
                        <strong>{h.title}</strong>
                        <p>{h.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "sessions" && (
              <div className="ep-sessions">
                {sessions.length > 0 ? sessions.map((s, i) => (
                  <div key={i} className="ep-session-row" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="ep-session-num">{String(i + 1).padStart(2, "0")}</div>
                    <div className="ep-session-time">{s.startTime || "TBA"}</div>
                    <div className="ep-session-body">
                      <h4>{s.title}</h4>
                      <span>{s.speaker && `by ${s.speaker}`}</span>
                    </div>
                    <div className="ep-session-tag">{s.type || "TALK"}</div>
                  </div>
                )) : (
                  <div className="ep-empty-state">
                    <div className="ep-empty-icon"></div>
                    <p>Sessions will be announced soon.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "location" && (
              <div className="ep-location-tab">
                <div className="ep-location-card">
                  <div className="ep-location-map-placeholder">
                    <div className="ep-map-pin"></div>
                    <p>{expo.location?.city || "Location TBA"}</p>
                    {expo.location?.address && <span>{expo.location.address}</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="ep-sidebar">
          <div className="ep-pass-card">
            <div className="ep-pass-noise" />
            <div className="ep-pass-header">
              <div className="ep-pass-badge">DIGITAL PASS</div>
              <h3>Unlock Full Access</h3>
              <p>Get your verified pass and access everything this expo has to offer.</p>
            </div>

            <div className="ep-perks">
              {[
                { icon: "", text: "All Exhibitor Booths" },
                { icon: "", text: "Live Session Streams" },
                { icon: "", text: "AI Matchmaking" },
                { icon: "", text: "Exclusive Networking" },
              ].map((p, i) => (
                <div key={i} className="ep-perk">
                  <span className="ep-perk-icon">{p.icon}</span>
                  <span>{p.text}</span>
                  <span className="ep-perk-check">✓</span>
                </div>
              ))}
            </div>

            <button className="ep-activate-btn" onClick={handleRegistration}>
              <span>Activate Pass</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>

            <div className="ep-pass-footer">
              <span className="ep-node-id">NODE · {id.slice(-8).toUpperCase()}</span>
              <span className="ep-secure-tag"> Secure</span>
            </div>
          </div>

          {/* Mini date card */}
          <div className="ep-date-card">
            <div className="ep-date-month">{startDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase()}</div>
            <div className="ep-date-day">{startDate.getDate()}</div>
            <div className="ep-date-year">{startDate.getFullYear()}</div>
            <div className="ep-date-divider" />
            <div className="ep-date-location">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {expo.location?.city || "TBA"}
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;700&display=swap');

        :root {
          --bg: #00030a;
          --bg2: #01090e;
          --bg3: #010e18;
          --border: rgba(255,255,255,0.07);
          --border-cyan: rgba(0, 200, 255, 0.25);
          --cyan: #00d9ff;
          --cyan-dim: rgba(0, 217, 255, 0.12);
          --text: #EEF0F5;
          --text-dim: #6B7791;
          --text-mid: #9BA5BB;
          --ff-head: 'Cabinet Grotesk', sans-serif;
          --ff-serif: 'Instrument Serif', serif;
          --ff-mono: 'JetBrains Mono', monospace;
        }

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        .ep-root {
          background: var(--bg);
          min-height: 100vh;
          color: var(--text);
          font-family: var(--ff-head);
          overflow-x: hidden;
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .ep-mounted { opacity: 1; }

        /* SPLASH */
        .ep-splash {
          background: var(--bg);
          height: 100vh;
          display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 24px;
        }
        .ep-splash-rings { position: relative; width: 80px; height: 80px; }
        .ep-ring {
          position: absolute; inset: 0; border-radius: 50%;
          border: 1.5px solid transparent;
          animation: spin 2s linear infinite;
        }
        .ep-ring.r1 { border-top-color: var(--cyan); animation-duration: 1.8s; }
        .ep-ring.r2 { inset: 12px; border-top-color: rgba(0, 225, 255, 0.5); animation-duration: 2.4s; animation-direction: reverse; }
        .ep-ring.r3 { inset: 24px; border-top-color: rgba(0, 187, 255, 0.25); animation-duration: 3s; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ep-splash-txt {
          font-family: var(--ff-mono);
          font-size: 10px; letter-spacing: 4px; color: var(--text-dim);
        }

        /* MODAL */
        .ep-modal-bg {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(8,11,18,0.88);
          backdrop-filter: blur(20px);
          display: flex; align-items: center; justify-content: center; padding: 20px;
          animation: epFadeIn 0.25s ease;
        }
        @keyframes epFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .ep-modal {
          background: var(--bg2);
          border: 1px solid var(--border-cyan);
          border-radius: 28px;
          padding: 48px 40px 40px;
          max-width: 460px; width: 100%;
          position: relative; overflow: hidden;
          animation: epSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes epSlideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .ep-modal-glow {
          position: absolute; top: -60px; left: 50%; transform: translateX(-50%);
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(1, 200, 255, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .ep-modal-close {
          position: absolute; top: 20px; right: 20px;
          width: 36px; height: 36px; border-radius: 50%;
          background: var(--bg3); border: 1px solid var(--border);
          color: var(--text-dim); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .ep-modal-close svg { width: 16px; height: 16px; }
        .ep-modal-close:hover { color: var(--text); border-color: rgba(255,255,255,0.15); }
        .ep-modal-icon {
          width: 64px; height: 64px; border-radius: 20px;
          background: var(--cyan-dim); border: 1px solid var(--border-cyan);
          display: flex; align-items: center; justify-content: center;
          color: var(--cyan); margin-bottom: 24px;
        }
        .ep-modal-icon svg { width: 28px; height: 28px; }
        .ep-modal-eyebrow {
          font-family: var(--ff-mono);
          font-size: 9px; letter-spacing: 3px; color: var(--cyan);
          margin-bottom: 8px; display: block;
        }
        .ep-modal-title {
          font-size: 2rem; font-weight: 900;
          letter-spacing: -0.5px; margin-bottom: 10px;
          line-height: 1.1;
        }
        .ep-modal-sub {
          color: var(--text-dim); font-size: 0.9rem;
          line-height: 1.7; margin-bottom: 32px;
        }
        .ep-modal-cards { display: flex; flex-direction: column; gap: 12px; }
        .ep-role-card {
          display: flex; align-items: center; gap: 16px;
          background: var(--bg3); border: 1px solid var(--border);
          border-radius: 16px; padding: 18px 20px;
          cursor: pointer; transition: all 0.25s; text-align: left;
          color: var(--text); width: 100%;
        }
        .ep-role-card:hover { border-color: rgba(255,255,255,0.15); transform: translateX(4px); }
        .ep-role-card--cyan { border-color: var(--border-cyan); }
        .ep-role-card--cyan:hover { border-color: var(--cyan); background: rgba(5, 193, 255, 0.05); }
        .ep-role-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: rgba(255,255,255,0.05); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ep-role-card--cyan .ep-role-icon { background: var(--cyan-dim); border-color: var(--border-cyan); color: var(--cyan); }
        .ep-role-icon svg { width: 20px; height: 20px; }
        .ep-role-info { flex: 1; }
        .ep-role-info strong { display: block; font-size: 0.95rem; font-weight: 700; margin-bottom: 3px; }
        .ep-role-info span { font-size: 0.8rem; color: var(--text-dim); }
        .ep-role-arrow { color: var(--text-dim); font-size: 1.1rem; transition: transform 0.2s; }
        .ep-role-card:hover .ep-role-arrow { transform: translateX(4px); }
        .ep-role-card--cyan .ep-role-arrow { color: var(--cyan); }

        /* NAV */
        .ep-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 48px;
          border-bottom: 1px solid var(--border);
          position: sticky; top: 0; z-index: 100;
          background: rgba(8,11,18,0.85);
          backdrop-filter: blur(24px);
        }
        .ep-back {
          display: flex; align-items: center; gap: 8px;
          font-family: var(--ff-mono); font-size: 11px; letter-spacing: 1px;
          color: var(--text-dim); background: none; border: none; cursor: pointer;
          transition: color 0.2s;
        }
        .ep-back svg { width: 16px; height: 16px; }
        .ep-back:hover { color: var(--text); }
        .ep-nav-badge {
          display: flex; align-items: center; gap: 8px;
          font-family: var(--ff-mono); font-size: 10px; letter-spacing: 2px; color: var(--cyan);
        }
        .ep-live-dot {
          width: 7px; height: 7px; border-radius: 50%; background: var(--cyan);
          box-shadow: 0 0 8px var(--cyan);
          animation: livePulse 2s infinite;
        }
        @keyframes livePulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        .ep-nav-cta {
          padding: 9px 22px;
          background: var(--cyan); color: #080B12;
          border: none; border-radius: 10px;
          font-family: var(--ff-head); font-size: 13px; font-weight: 800;
          cursor: pointer; transition: all 0.2s;
          letter-spacing: 0.3px;
        }
        .ep-nav-cta:hover { background: #00eeff; transform: translateY(-1px); }

        /* HERO */
        .ep-hero {
          position: relative; overflow: hidden;
          padding: 80px 48px 60px;
          border-bottom: 1px solid var(--border);
        }
        .ep-hero-noise {
          position: absolute; inset: 0; pointer-events: none; opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px;
        }
        .ep-hero-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse at 50% 0%, black 0%, transparent 70%);
        }
        .ep-hero-glow {
          position: absolute; pointer-events: none; border-radius: 50%;
          filter: blur(80px);
        }
        .ep-hero-glow.g1 {
          top: -100px; right: -50px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(0, 247, 255, 0.07) 0%, transparent 70%);
        }
        .ep-hero-glow.g2 {
          bottom: -80px; left: 20%;
          width: 400px; height: 300px;
          background: radial-gradient(circle, rgba(0,100,255,0.05) 0%, transparent 70%);
        }
        .ep-hero-inner { max-width: 1100px; margin: 0 auto; position: relative; z-index: 1; }
        .ep-hero-top { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .ep-eyebrow {
          font-family: var(--ff-mono); font-size: 10px; letter-spacing: 2.5px;
          color: var(--cyan);
          background: rgba(0, 238, 255, 0.08); border: 1px solid rgba(0, 238, 255, 0.2);
          padding: 5px 14px; border-radius: 6px;
        }
        .ep-eyebrow--dim { color: var(--text-dim); background: var(--bg3); border-color: var(--border); }
        .ep-title {
          font-family: var(--ff-head);
          font-size: clamp(3rem, 7vw, 5.5rem);
          font-weight: 900;
          letter-spacing: -3px;
          line-height: 0.95;
          margin-bottom: 40px;
          background: linear-gradient(160deg, #fff 30%, rgba(255,255,255,0.5));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .ep-hero-meta { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 36px; }
        .ep-meta-pill {
          display: flex; align-items: center; gap: 8px;
          background: var(--bg2); border: 1px solid var(--border);
          padding: 10px 18px; border-radius: 100px;
          font-size: 0.85rem; font-weight: 500; color: var(--text-mid);
        }
        .ep-meta-pill svg { width: 14px; height: 14px; stroke: var(--cyan); }

        /* FILL BAR */
        .ep-fill-bar { max-width: 480px; }
        .ep-fill-meta { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 11px; color: var(--text-dim); font-family: var(--ff-mono); letter-spacing: 0.5px; }
        .ep-fill-pct { color: var(--cyan); }
        .ep-fill-track { height: 3px; background: rgba(255,255,255,0.06); border-radius: 10px; overflow: hidden; }
        .ep-fill-progress { height: 100%; background: linear-gradient(90deg, var(--cyan), #0080FF); border-radius: 10px; transition: width 1.2s cubic-bezier(0.4,0,0.2,1); }

        /* BODY */
        .ep-body {
          max-width: 1200px; margin: 0 auto;
          padding: 60px 48px;
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 56px;
          align-items: start;
        }

        /* STATS STRIP */
        .ep-stats-strip {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 1px; background: var(--border);
          border: 1px solid var(--border); border-radius: 18px;
          overflow: hidden; margin-bottom: 44px;
        }
        .ep-stat-item {
          background: var(--bg2);
          padding: 22px 20px; text-align: center;
          transition: background 0.2s;
        }
        .ep-stat-item:hover { background: var(--bg3); }
        .ep-stat-val {
          font-size: 2rem; font-weight: 900;
          color: var(--cyan); line-height: 1; margin-bottom: 6px;
          font-family: var(--ff-head);
        }
        .ep-stat-lbl {
          font-family: var(--ff-mono);
          font-size: 9px; letter-spacing: 1.5px; color: var(--text-dim); text-transform: uppercase;
        }

        /* TABS */
        .ep-tabs { display: flex; gap: 4px; margin-bottom: 32px; background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 5px; }
        .ep-tab {
          flex: 1; padding: 10px; border: none; background: none;
          font-family: var(--ff-mono); font-size: 10px; letter-spacing: 1.5px;
          color: var(--text-dim); cursor: pointer; border-radius: 8px;
          transition: all 0.2s;
        }
        .ep-tab:hover { color: var(--text); background: rgba(255,255,255,0.04); }
        .ep-tab--active { background: var(--bg3); color: var(--cyan); border: 1px solid var(--border-cyan); }

        /* TAB CONTENT */
        .ep-desc { color: var(--text-mid); line-height: 1.9; font-size: 1rem; margin-bottom: 36px; }
        .ep-highlights { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .ep-highlight-card {
          background: var(--bg2); border: 1px solid var(--border);
          border-radius: 16px; padding: 20px;
          display: flex; gap: 14px; align-items: flex-start;
          transition: all 0.2s;
        }
        .ep-highlight-card:hover { border-color: rgba(255,255,255,0.12); transform: translateY(-2px); }
        .ep-highlight-icon { font-size: 1.4rem; line-height: 1; flex-shrink: 0; margin-top: 2px; }
        .ep-highlight-card strong { display: block; font-size: 0.9rem; font-weight: 700; margin-bottom: 5px; }
        .ep-highlight-card p { font-size: 0.8rem; color: var(--text-dim); line-height: 1.5; }

        /* SESSIONS */
        .ep-sessions { display: flex; flex-direction: column; gap: 10px; }
        .ep-session-row {
          display: grid; grid-template-columns: 36px 70px 1fr auto;
          gap: 16px; align-items: center;
          background: var(--bg2); border: 1px solid var(--border);
          border-radius: 14px; padding: 18px 22px;
          transition: all 0.25s;
          animation: epFadeIn 0.4s ease both;
        }
        .ep-session-row:hover { border-color: rgba(4, 238, 255, 0.2); transform: translateX(4px); background: var(--bg3); }
        .ep-session-num { font-family: var(--ff-mono); font-size: 11px; color: var(--text-dim); }
        .ep-session-time { font-family: var(--ff-mono); font-size: 11px; color: var(--cyan); }
        .ep-session-body h4 { font-size: 0.9rem; font-weight: 700; margin-bottom: 3px; }
        .ep-session-body span { font-size: 0.78rem; color: var(--text-dim); }
        .ep-session-tag {
          font-family: var(--ff-mono); font-size: 9px; letter-spacing: 1px;
          color: var(--cyan); border: 1px solid rgba(0, 238, 255, 0.25);
          padding: 4px 10px; border-radius: 6px; white-space: nowrap;
        }
        .ep-empty-state { text-align: center; padding: 60px 20px; }
        .ep-empty-icon { font-size: 2.5rem; margin-bottom: 16px; }
        .ep-empty-state p { color: var(--text-dim); font-size: 0.9rem; font-family: var(--ff-mono); letter-spacing: 1px; }

        /* LOCATION TAB */
        .ep-location-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; }
        .ep-location-map-placeholder {
          height: 280px; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 12px;
          background: var(--bg3);
        }
        .ep-map-pin { font-size: 3rem; }
        .ep-location-map-placeholder p { font-size: 1.1rem; font-weight: 700; }
        .ep-location-map-placeholder span { font-size: 0.85rem; color: var(--text-dim); }

        /* SIDEBAR */
        .ep-sidebar { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 72px; }

        /* PASS CARD */
        .ep-pass-card {
          background: var(--bg2);
          border: 1px solid var(--border-cyan);
          border-radius: 24px;
          padding: 36px 32px;
          position: relative; overflow: hidden;
        }
        .ep-pass-noise {
          position: absolute; inset: 0; pointer-events: none; opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 150px;
        }
        .ep-pass-header { margin-bottom: 28px; position: relative; }
        .ep-pass-badge {
          font-family: var(--ff-mono); font-size: 9px; letter-spacing: 2.5px;
          color: var(--cyan); margin-bottom: 12px; display: block;
        }
        .ep-pass-header h3 { font-size: 1.5rem; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 10px; line-height: 1.15; }
        .ep-pass-header p { color: var(--text-dim); font-size: 0.88rem; line-height: 1.65; }

        .ep-perks { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
        .ep-perk {
          display: flex; align-items: center; gap: 12px;
          background: var(--bg3); border: 1px solid var(--border);
          border-radius: 10px; padding: 11px 14px;
          font-size: 0.85rem; font-weight: 500;
        }
        .ep-perk-icon { font-size: 1rem; line-height: 1; }
        .ep-perk span:last-child { margin-left: auto; }
        .ep-perk-check { color: var(--cyan); font-size: 0.8rem; }

        .ep-activate-btn {
          width: 100%; padding: 18px;
          background: var(--cyan); border: none; border-radius: 14px;
          color: #080B12;
          font-family: var(--ff-head); font-weight: 900; font-size: 14px;
          letter-spacing: 0.5px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 12px;
          transition: all 0.25s;
          position: relative; z-index: 1;
        }
        .ep-activate-btn svg { width: 18px; height: 18px; stroke: #080B12; transition: transform 0.2s; }
        .ep-activate-btn:hover { background: #00fbff; transform: translateY(-2px); box-shadow: 0 16px 40px rgba(0, 234, 255, 0.2); }
        .ep-activate-btn:hover svg { transform: translateX(4px); }

        .ep-pass-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; }
        .ep-node-id { font-family: var(--ff-mono); font-size: 8px; letter-spacing: 2px; color: rgba(107,119,145,0.5); }
        .ep-secure-tag { font-family: var(--ff-mono); font-size: 9px; color: var(--text-dim); }

        /* DATE CARD */
        .ep-date-card {
          background: var(--bg2); border: 1px solid var(--border);
          border-radius: 20px; padding: 28px 32px;
          display: flex; align-items: center; gap: 0;
          flex-direction: row; justify-content: center;
        }
        .ep-date-month { font-family: var(--ff-mono); font-size: 11px; letter-spacing: 2px; color: var(--cyan); margin-right: 10px; }
        .ep-date-day { font-size: 2.5rem; font-weight: 900; line-height: 1; color: var(--text); margin-right: 6px; }
        .ep-date-year { font-size: 0.85rem; color: var(--text-dim); margin-right: 20px; align-self: flex-end; padding-bottom: 4px; }
        .ep-date-divider { width: 1px; height: 40px; background: var(--border); margin-right: 20px; }
        .ep-date-location { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; font-weight: 600; color: var(--text-mid); }
        .ep-date-location svg { width: 14px; height: 14px; stroke: var(--cyan); flex-shrink: 0; }

        /* RESPONSIVE */
        @media (max-width: 960px) {
          .ep-body { grid-template-columns: 1fr; gap: 40px; padding: 40px 24px; }
          .ep-nav { padding: 14px 24px; }
          .ep-hero { padding: 60px 24px 48px; }
          .ep-sidebar { position: static; }
          .ep-stats-strip { grid-template-columns: repeat(2,1fr); }
        }
        @media (max-width: 600px) {
          .ep-title { letter-spacing: -2px; }
          .ep-highlights { grid-template-columns: 1fr; }
          .ep-session-row { grid-template-columns: 50px 1fr; }
          .ep-session-num, .ep-session-tag { display: none; }
          .ep-date-card { flex-wrap: wrap; gap: 12px; text-align: center; }
          .ep-date-divider { display: none; }
        }
      `}</style>
    </div>
  );
}