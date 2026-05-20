import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

export default function EventSchedule() {
  const [expos, setExpos] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expoRes, scheduleRes] = await Promise.all([
          axios.get("http://localhost:5000/api/expo/all"),
          axios.get("http://localhost:5000/api/schedule/all"),
        ]);
        const activeExpos = Array.isArray(expoRes.data)
          ? expoRes.data.filter((e) => e.status === "active")
          : [];
        const today = new Date().toISOString().split("T")[0];
        const futureSessions = Array.isArray(scheduleRes.data)
          ? scheduleRes.data.filter((s) => s.date >= today)
          : [];
        setExpos(activeExpos);
        setSessions(futureSessions);
        if (activeExpos.length > 0) setActiveId(activeExpos[0]._id);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredSessions = useMemo(() => {
    if (!activeId) return [];
    return sessions.filter(
      (s) => s.expoId === activeId || s.expo === activeId
    );
  }, [sessions, activeId]);

  const activeExpo = expos.find((e) => e._id === activeId);
  const getCount = (id) =>
    sessions.filter((s) => s.expoId === id || s.expo === id).length;
  const getInitials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "??";
  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short" });

  return (
    <section className="es-section">
      <div className="es-container">

        {/* Header */}
        <div className="es-header">
          <div className="es-badge">
            <span className="es-bdot" />
            <span className="es-btxt">Upcoming Events</span>
          </div>
          <h2 className=" fe-main-title">EXPO <em className="es-accent">TIMELINES</em></h2>
          <div className="es-uline" />
          <p className="es-sub">Select an expo tab to view its sessions and workshops.</p>
        </div>

        {loading ? (
          <div className="es-loading">
            <div className="es-spinner" />
            <p className="es-spin-txt">Loading schedules...</p>
          </div>
        ) : expos.length === 0 ? (
          <div className="es-empty">
            <div className="es-empty-ico">📅</div>
            <h3>No Active Expos</h3>
            <p>No active expos found right now.</p>
          </div>
        ) : (
          <>
            {/* Tabs - Centered and Responsive */}
            <div className="es-tabs-outer">
              <div className="es-tabs-row">
                {expos.map((expo) => {
                  const cnt = getCount(expo._id);
                  return (
                    <button
                      key={expo._id}
                      className={`es-tab${activeId === expo._id ? " es-tab-active" : ""}`}
                      onClick={() => setActiveId(expo._id)}
                    >
                      <span className="es-tname">{expo.title}</span>
                      <span className="es-tcount">{cnt} session{cnt !== 1 ? "s" : ""}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Info Row */}
            {filteredSessions.length > 0 && (
              <div className="es-info-row">
                <span className="es-idot" />
                <span>
                  Showing{" "}
                  <strong style={{ color: "#e4ecff" }}>{filteredSessions.length}</strong>{" "}
                  session{filteredSessions.length !== 1 ? "s" : ""} for{" "}
                  <strong style={{ color: "#00d9ff" }}>{activeExpo?.title}</strong>
                </span>
              </div>
            )}

            {/* Session Cards */}
            {filteredSessions.length === 0 ? (
              <div className="es-empty">
                <div className="es-empty-ico">📅</div>
                <h3>No Sessions Yet</h3>
                <p>This expo has no upcoming sessions scheduled.</p>
              </div>
            ) : (
              <div className="es-cards">
                {filteredSessions.map((session, i) => (
                  <div className="es-card" key={i}>
                    {/* Avatar */}
                    <div className="es-avatar">
                      {getInitials(session.speaker)}
                      <div className="es-aring" />
                    </div>

                    <div className="es-card-inner">
                      <div className="es-card-top">
                        <div className="es-tags">
                          <span className="es-type-tag">{session.type || "Event"}</span>
                          <span className="es-date-tag">{fmtDate(session.date)}</span>
                        </div>
                        <span className="es-time-pill es-time-mobile">
                          {session.startTime} – {session.endTime}
                        </span>
                      </div>

                      <h3 className="es-stitle">{session.title}</h3>

                      <div className="es-card-bottom">
                        <div className="es-meta">
                          <span className="es-mi">
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            {session.speaker}
                          </span>
                          <span className="es-mi">
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                              <polyline points="22,6 12,13 2,6" />
                            </svg>
                            {session.email}
                          </span>
                          <span className="es-mi">
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                              <circle cx="12" cy="9" r="2.5" />
                            </svg>
                            {session.location}
                          </span>
                        </div>

                        <div className="es-right">
                          <span className="es-time-pill es-time-desktop">
                            {session.startTime} – {session.endTime}
                          </span>
                          <button className="es-det-btn">
                            Details
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');

        .es-section {
          background: #000209;
          padding: 60px 5%;
          font-family: 'DM Sans', sans-serif;
          color: #f8fafc;
          min-height: 100vh;
          position: relative;
        }

        .es-container { max-width: 1100px; margin: 0 auto; }

        /* ── Header ── */
        .es-header { text-align: center; margin-bottom: 40px; }
        .es-badge { display: inline-flex; align-items: center; gap: 7px; background: rgba(7,243,255,0.07); border: 1px solid rgba(0,213,255,0.18); padding: 5px 16px; border-radius: 100px; margin-bottom: 16px; }
        .es-bdot { width: 7px; height: 7px; border-radius: 50%; background: #00d9ff; animation: esBdot 1.6s ease infinite; }
        @keyframes esBdot { 0%,100%{opacity:1} 50%{opacity:.3} }
        .es-btxt { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #00d9ff; font-weight: 700; }
        .es-title { font-family: 'Orbitron', sans-serif; font-size: clamp(1.8rem, 4vw, 2.6rem); font-weight: 900; margin-bottom: 10px; }
        .es-accent { color: #00d9ff; font-style: normal; }
        .es-uline { width: 40px; height: 3px; background: #00d9ff; margin: 0 auto 15px; border-radius: 2px; }
        .es-sub { color: #64748b; font-size: 14px; }

        /* ── Tabs Responsive Fix ── */
        .es-tabs-outer {
          margin-bottom: 35px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .es-tabs-row {
          display: flex;
          justify-content: center; /* Desktop par center */
          flex-wrap: wrap; /* Mobile par automatic niche shift */
          gap: 10px;
        }
        .es-tab {
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          padding: 12px 20px;
          transition: all 0.3s ease;
          min-width: 120px;
          text-align: center;
        }
        .es-tab-active {
          border-bottom-color: #00d9ff;
          background: rgba(0, 217, 255, 0.05);
        }
        .es-tname { 
          font-family: 'Orbitron', sans-serif; 
          font-size: 11px; 
          font-weight: 700; 
          color: #475569; 
          display: block; 
          margin-bottom: 4px;
        }
        .es-tab-active .es-tname { color: #00d9ff; }
        .es-tcount { font-size: 10px; color: #334155; }

        /* ── Cards ── */
        .es-cards { display: flex; flex-direction: column; gap: 16px; }
        .es-card {
          background: #00070c;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: all 0.3s ease;
        }
        .es-card:hover {
          border-color: #00d9ff44;
          transform: translateY(-2px);
          background: #01090f;
        }

        .es-avatar {
          width: 55px; height: 55px; border-radius: 15px;
          background: linear-gradient(135deg, #00d9ff, #0077ff);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Orbitron', sans-serif; font-size: 16px; font-weight: 900;
          color: #000; flex-shrink: 0; position: relative;
        }
        .es-aring { position: absolute; inset: -3px; border: 1px solid #00d9ff; border-radius: 18px; opacity: 0.3; }

        .es-card-inner { flex: 1; min-width: 0; }
        .es-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .es-tags { display: flex; gap: 8px; }
        .es-type-tag { font-size: 9px; font-weight: 800; background: rgba(0,217,255,0.1); color: #00d9ff; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; }
        .es-date-tag { font-size: 9px; color: #64748b; background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 6px; }

        .es-stitle { font-family: 'Orbitron', sans-serif; font-size: 1rem; color: #f8fafc; margin-bottom: 12px; }
        
        .es-card-bottom { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
        .es-meta { display: flex; gap: 20px; flex-wrap: wrap; }
        .es-mi { font-size: 12px; color: #94a3b8; display: flex; align-items: center; gap: 6px; }
        
        .es-right { display: flex; align-items: center; gap: 15px; }
        .es-time-pill { background: #00d9ff; color: #000; font-size: 10px; font-weight: 800; padding: 6px 12px; border-radius: 8px; }
        .es-time-mobile { display: none; }
        .es-det-btn { background: transparent; border: 1px solid #00d9ff33; color: #00d9ff; padding: 6px 15px; border-radius: 8px; font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: 0.3s; }
        .es-det-btn:hover { background: #00d9ff; color: #000; }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .es-tabs-row { justify-content: center; }
          .es-card { flex-direction: column; align-items: flex-start; gap: 15px; }
          .es-avatar { width: 45px; height: 45px; font-size: 14px; }
          .es-time-desktop { display: none; }
          .es-time-mobile { display: block; }
          .es-card-bottom { flex-direction: column; align-items: flex-start; }
          .es-right { width: 100%; justify-content: flex-end; }
        }

        @media (max-width: 480px) {
          .es-tab { flex: 1 1 40%; min-width: 100px; padding: 10px; }
          .es-title { font-size: 1.5rem; }
          .es-meta { flex-direction: column; gap: 8px; }
          .es-avatar { display: none; }
        }

        /* Loading Spinner */
        .es-loading { text-align: center; padding: 50px; }
        .es-spinner { width: 40px; height: 40px; border: 3px solid rgba(0,217,255,0.1); border-top-color: #00d9ff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
}