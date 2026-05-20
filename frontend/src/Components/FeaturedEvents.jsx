import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Monitor, Cpu, Shirt, Terminal, Layout, Users, 
  Calendar, MapPin, ChevronRight, Info, Target, ShieldCheck 
} from "lucide-react";

// Icons mapping based on theme
const THEME_ICONS = {
  gaming: <Monitor className="w-6 h-6" />,
  hardware: <Cpu className="w-6 h-6" />,
  fashion: <Shirt className="w-6 h-6" />,
  tech: <Terminal className="w-6 h-6" />,
  default: <Layout className="w-6 h-6" />,
};

function getExhibitorCount(expo) {
  return expo.booths?.layout?.filter((b) => b.status === "reserved" || b.exhibitorId).length || 0;
}

function getSlotPercent(expo) {
  const count = getExhibitorCount(expo);
  const total = expo.booths?.total || expo.booths?.layout?.length || 20;
  return Math.round((count / total) * 100);
}

export default function FeaturedExpos() {
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/expo/all")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setExpos(res.data.filter((e) => e.status === "active"));
        }
      })
      .catch((err) => console.error("Error fetching expos:", err))
      .finally(() => setLoading(false));
  }, []);

 const handleBook = (expoId) => {
  navigate(`/expo-details/${expoId}`);
};

  return (
    <section className="fe-section" id="featured">
      <div className="fe-container">
        
        {/* Header */}
        <div className="fe-header">
          <div className="fe-badge">
             <span className="fe-dot-pulse"></span>
             <span className="fe-badge-text">Live Network Nodes</span>
          </div>
          <h2 className="fe-main-title">FEATURED <span className="fe-cyan-gradient">EXHIBITIONS</span></h2>
          <p className="fe-sub">Strategic tech hubs designed for market dominance and global networking.</p>
        </div>

        {loading ? (
          <div className="fe-loading-wrap">
            <div className="fe-loader-ring" />
            <p>Scanning Network...</p>
          </div>
        ) : (
          <div className="fe-grid">
            {expos.map((expo, index) => {
              const fillPercent = getSlotPercent(expo);
              return (
                <article key={expo._id} className="fe-card" style={{ animationDelay: `${index * 100}ms` }}>
                  {/* Decorative Background Glow */}
                  <div className="fe-card-glow"></div>
                  
                  <div className="fe-card-inner">
                    {/* Top Section: Icon & Theme */}
                    <div className="fe-card-head">
                      <div className="fe-icon-container">
                        {THEME_ICONS[expo.theme?.toLowerCase()] || THEME_ICONS.default}
                      </div>
                      <div className="fe-theme-tag">{expo.theme || 'General'}</div>
                    </div>

                    {/* Title & Location */}
                    <h3 className="fe-card-title">{expo.title}</h3>
                    <div className="fe-location-info">
                      <MapPin size={14} className="fe-cyan" />
                      <span>{expo.location?.city || "Remote Location"}</span>
                    </div>

                    <p className="fe-card-desc">
                      Access top-tier networking with over {getExhibitorCount(expo)} verified industry partners.
                    </p>

                    {/* Progress Bar (Fill Rate) */}
                    <div className="fe-progress-zone">
                      <div className="fe-progress-meta">
                        <span className="fe-label-tiny">Slot Saturation</span>
                        <span className="fe-percent-txt">{fillPercent}%</span>
                      </div>
                      <div className="fe-progress-bar-bg">
                        <div className="fe-progress-fill" style={{ width: `${fillPercent}%` }}></div>
                      </div>
                    </div>

                    {/* Reveal Component Area */}
                    <div className="fe-info-wrapper">
                      <div className="fe-tooltip-trigger">
                        <div className="fe-trigger-btn">
                          <Target size={14} /> <span>Tactical Intel</span>
                        </div>

                        {/* HOVER REVEAL - Futuristic HUD Style */}
                        <div className="fe-hover-reveal">
                          <div className="fe-reveal-box">
                            <div className="fe-reveal-header">
                              <ShieldCheck size={20} className="fe-cyan" />
                              <div className="fe-verify-block">
                                <p className="fe-verify-title">NODE VERIFIED</p>
                                <p className="fe-verify-sub">Encrypted Transmission</p>
                              </div>
                            </div>
                            <div className="fe-reveal-stats">
                              <div className="fe-mini-stat">
                                <Calendar size={12} />
                                <span>{new Date(expo.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              </div>
                              <div className="fe-mini-stat">
                                <Users size={12} />
                                <span>{expo.booths?.total || 20} Slots</span>
                              </div>
                            </div>
                            <div className="fe-reveal-footer">System Ready for Deployment</div>
                            <div className="fe-reveal-arrow"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Final Action */}
                    <button className="fe-action-btn" onClick={() => handleBook(expo._id)}>
                      <span>Initiate Protocol</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Auth Modal - Cyberpunk Style */}
      {modalOpen && (
        <div className="fe-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="fe-modal-card" onClick={e => e.stopPropagation()}>
             <div className="fe-lock-icon"><ShieldCheck size={48} /></div>
             <h3>Access Denied</h3>
             <p>Authentication required to view high-level expo protocols and slot availability.</p>
             <div className="fe-modal-btns">
                <button className="fe-btn-primary" onClick={() => navigate("/login")}>Login / Identity</button>
                <button className="fe-btn-ghost" onClick={() => setModalOpen(false)}>Back to Intel</button>
             </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;900&family=Outfit:wght@300;500;700&display=swap');

        .fe-section { 
          background: #05070a; 
          padding: 120px 5%; 
          color: #fff; 
          font-family: 'Outfit', sans-serif; 
          position: relative;
          overflow: hidden;
          height: auto;
        }

        .fe-container { max-width: 1200px; margin: 0 auto; position: relative; z-index: 2; }

        /* HEADER */
        .fe-header { text-align: center; margin-bottom: 80px; }
        .fe-badge { 
          display: inline-flex; align-items: center; gap: 10px; 
          background: rgba(0,212,255,0.05); border: 1px solid rgba(0,212,255,0.2); 
          padding: 8px 20px; border-radius: 100px; margin-bottom: 24px;
        }
        .fe-dot-pulse { 
          width: 8px; height: 8px; background: #00d4ff; border-radius: 50%; 
          box-shadow: 0 0 12px #00d4ff; animation: fe-pulse 2s infinite; 
        }
        .fe-badge-text { font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #00d4ff; text-transform: uppercase; }
        
        .fe-main-title { font-family: 'Orbitron', sans-serif; font-size: clamp(2.2rem, 5vw, 3.8rem); font-weight: 900; letter-spacing: -1px; margin: 0; }
        .fe-cyan-gradient {
          background: linear-gradient(90deg, #00d4ff, rgb(50, 159, 227));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .fe-sub { color: #8a95ad; font-size: 1.1rem; max-width: 550px; margin: 20px auto 0; font-weight: 300; }

        /* GRID & CARDS */
        .fe-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 32px; }
        
        .fe-card {
          position: relative;
          background: #00030e;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 32px;
          padding: 2px; /* For Gradient Border effect */
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .fe-card:hover {
          transform: translateY(-12px);
          border-color: rgba(0,212,255,0.4);
          box-shadow: 0 20px 60px -20px rgba(0, 212, 255, 0.3);
        }

        .fe-card-inner {
          background: #00070c;
          border-radius: 30px;
          padding: 40px;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 2;
        }

        .fe-card-glow {
          position: absolute; top: -20%; left: -20%; width: 140%; height: 140%;
          background: radial-gradient(circle at center, rgba(0,212,255,0.05) 0%, transparent 70%);
          opacity: 0; transition: 0.5s; pointer-events: none;
        }
        .fe-card:hover .fe-card-glow { opacity: 1; }

        .fe-card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        
        .fe-icon-container {
          width: 52px; height: 52px; background: #161b2b; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px; color: #00d4ff; display: flex; align-items: center; justify-content: center;
          transition: 0.5s;
        }
        .fe-card:hover .fe-icon-container { color: #fff; background: #00d4ff; border-color: #00d4ff; transform: rotate(10deg); }

        .fe-theme-tag { 
          font-size: 10px; font-weight: 800; color: #00d4ff; text-transform: uppercase; 
          background: rgba(0,212,255,0.1); padding: 4px 12px; border-radius: 100px;
        }

        .fe-card-title { font-family: 'Orbitron', sans-serif; font-size: 1.3rem; font-weight: 700; margin: 0 0 10px; color: #fff; }
        
        .fe-location-info { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #8a95ad; margin-bottom: 18px; }
        .fe-cyan { color: #00d4ff; }

        .fe-card-desc { color: #8a95ad; font-size: 0.9rem; line-height: 1.6; margin-bottom: 24px; flex-grow: 1; }

        /* PROGRESS BAR */
        .fe-progress-zone { margin-bottom: 30px; }
        .fe-progress-meta { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .fe-label-tiny { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #505c75; letter-spacing: 1px; }
        .fe-percent-txt { font-size: 10px; font-weight: 900; color: #00d4ff; }
        .fe-progress-bar-bg { height: 4px; background: #1a1f2e; border-radius: 10px; overflow: hidden; }
        .fe-progress-fill { height: 100%; background: linear-gradient(90deg, #00d4ff, #0072ff); border-radius: 10px; transition: 1s ease-out; }

        /* INFO REVEAL HUD */
        .fe-info-wrapper { position: relative; margin-bottom: 24px; }
        .fe-tooltip-trigger { display: inline-block; position: relative; }
        .fe-trigger-btn { 
          display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; 
          color: #00d4ff; cursor: help; text-transform: uppercase;
        }

        .fe-hover-reveal {
          position: absolute; bottom: 100%; left: 0; transform: translateY(10px);
          width: 240px; opacity: 0; visibility: hidden; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: 100; padding-bottom: 15px;
        }
        .fe-tooltip-trigger:hover .fe-hover-reveal { opacity: 1; visibility: visible; transform: translateY(0); }

        .fe-reveal-box {
          background: #05070a; border: 1px solid #00d4ff; border-radius: 20px;
          padding: 20px; box-shadow: 0 20px 50px rgba(0,212,255,0.2);
        }
        .fe-reveal-header { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; }
        .fe-verify-title { font-size: 10px; font-weight: 900; color: #00d4ff; letter-spacing: 1px; margin: 0; }
        .fe-verify-sub { font-size: 8px; color: #505c75; margin: 0; text-transform: uppercase; }

        .fe-reveal-stats { display: flex; gap: 15px; margin-bottom: 12px; }
        .fe-mini-stat { display: flex; align-items: center; gap: 6px; font-size: 10px; color: #fff; }
        .fe-reveal-footer { font-size: 8px; font-weight: 700; color: #00d4ff; text-transform: uppercase; text-align: center; }
        .fe-reveal-arrow { 
          position: absolute; bottom: 8px; left: 24px; width: 12px; height: 12px; 
          background: #05070a; border-right: 1px solid #00d4ff; border-bottom: 1px solid #00d4ff; 
          transform: rotate(45deg);
        }

        /* ACTION BUTTON */
        .fe-action-btn {
          width: 100%; padding: 18px; background: #00d4ff; color: #000; border: none;
          border-radius: 18px; font-size: 12px; font-weight: 900; text-transform: uppercase;
          letter-spacing: 1px; cursor: pointer; display: flex; align-items: center; justify-content: center;
          gap: 12px; transition: 0.3s; font-family: 'Orbitron', sans-serif;
        }
        .fe-action-btn:hover { background: #fff; transform: scale(1.02); }

        /* MODAL */
        .fe-modal-overlay { 
          position: fixed; inset: 0; background: rgba(0,0,0,0.85); 
          backdrop-filter: blur(10px); z-index: 999; display: flex; align-items: center; justify-content: center; 
        }
        .fe-modal-card { 
          background: #0d111c; border: 1px solid rgba(0,212,255,0.3); padding: 50px; 
          border-radius: 40px; max-width: 440px; text-align: center; 
        }
        .fe-lock-icon { color: #00d4ff; margin-bottom: 24px; animation: fe-pulse 2s infinite; }
        .fe-modal-card h3 { font-family: 'Orbitron', sans-serif; font-size: 1.8rem; margin-bottom: 16px; }
        .fe-modal-card p { color: #8a95ad; margin-bottom: 32px; line-height: 1.6; }
        .fe-modal-btns { display: flex; flex-direction: column; gap: 12px; }
        .fe-btn-primary { 
          padding: 16px; background: #00d4ff; color: #000; border: none; 
          border-radius: 14px; font-weight: 800; cursor: pointer; font-family: 'Orbitron', sans-serif;
        }
        .fe-btn-ghost { 
          padding: 16px; background: transparent; border: 1px solid #1a1f2e; color: #8a95ad; 
          border-radius: 14px; cursor: pointer; font-weight: 600;
        }

        @keyframes fe-pulse { 
          0%, 100% { transform: scale(1); opacity: 1; } 
          50% { transform: scale(1.1); opacity: 0.7; } 
        }

        @media (max-width: 768px) {
          .fe-grid { grid-template-columns: 1fr; }
          .fe-card { padding: 30px; }
        }
      `}</style>
    </section>
  );
}