import React, { useState, useEffect } from "react";
import { FaBroadcastTower, FaUserPlus, FaCalendarCheck, FaBolt, FaCircle, FaHdd } from "react-icons/fa";

export default function LiveStats() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const logs = [
    { id: 1, action: "New Exhibitor Registration", user: "TechVanguard", time: "Just Now", type: "user" },
    { id: 2, action: "Session Timeline Adjusted", user: "Admin_01", time: "12m ago", type: "edit" },
    { id: 3, action: "Gateway Connection Secured", user: "System", time: "45m ago", type: "system" },
  ];

  return (
    <div className="premium-live-root">
      <div className="bg-glass-mesh"></div>

      {/* HEADER SECTION */}
      <div className="live-header-v2">
        <div className="header-info">
          <div className="live-badge">
            <span className="ping-dot"></span> LIVE DATA STREAM
          </div>
          <h1 className="tech-title">System <span>Integrity</span></h1>
        </div>
        <div className="digital-clock-v2">
          <span className="label">GLOBAL TIME</span>
          <div className="time-display">{time}</div>
        </div>
      </div>

      <div className="live-main-grid">
        
        {/* LEFT: ACTIVITY FEED */}
        <div className="glass-panel activity-feed">
          <div className="panel-header">
            <h3><FaBroadcastTower className="pulse-icon-v2" /> Activity Ticker</h3>
            <span className="live-tag">REAL-TIME</span>
          </div>
          
          <div className="ticker-list">
            {logs.map((log) => (
              <div key={log.id} className="ticker-item">
                <div className={`ticker-status-line ${log.type}`}></div>
                <div className="ticker-content">
                  <div className="ticker-top">
                    <span className="ticker-action">{log.action}</span>
                    <span className="ticker-time">{log.time}</span>
                  </div>
                  <div className="ticker-meta">
                    <span className="ticker-user">Source: <strong>{log.user}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="feed-footer">
            <div className="scanning-bar"></div>
            Monitoring incoming packets...
          </div>
        </div>

        {/* RIGHT: HEALTH & PERFORMANCE */}
        <div className="performance-column">
          
          {/* UPTIME GAUGE */}
          <div className="glass-panel health-gauge-card">
            <h3>Core Performance</h3>
            <div className="gauge-container">
              <div className="gauge-outer">
                <div className="gauge-inner">
                  <h2>99.9<span>%</span></h2>
                  <p>OPERATIONAL</p>
                </div>
                <svg className="gauge-svg">
                  <circle className="bg" cx="70" cy="70" r="65"></circle>
                  <circle className="meter" cx="70" cy="70" r="65"></circle>
                </svg>
              </div>
            </div>
          </div>

          {/* MINI PERFORMANCE STATS */}
          <div className="mini-stats-grid">
            <div className="mini-card glass-panel">
               <div className="m-icon"><FaBolt /></div>
               <div className="m-data">
                 <p>Latency</p>
                 <h4>14ms</h4>
               </div>
            </div>
            <div className="mini-card glass-panel">
               <div className="m-icon purple"><FaHdd /></div>
               <div className="m-data">
                 <p>Load</p>
                 <h4>22%</h4>
               </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&family=JetBrains+Mono:wght@500&display=swap');

        .premium-live-root { padding: 40px; font-family: 'Plus Jakarta Sans', sans-serif; color: white; position: relative; min-height: 100vh; }
        
        .bg-glass-mesh {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: radial-gradient(circle at 80% 20%, rgba(112, 0, 255, 0.08) 0%, transparent 40%),
                      radial-gradient(circle at 20% 80%, rgba(0, 212, 255, 0.08) 0%, transparent 40%);
          z-index: -1;
        }

        .live-header-v2 { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        .tech-title { font-size: 40px; font-weight: 800; letter-spacing: -1px; margin: 5px 0; }
        .tech-title span { color: #00d4ff; text-shadow: 0 0 20px rgba(0, 212, 255, 0.4); }
        
        .live-badge { background: rgba(0, 255, 136, 0.1); color: #00ff88; padding: 6px 15px; border-radius: 50px; font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 8px; letter-spacing: 1px; width: fit-content; }
        .ping-dot { width: 8px; height: 8px; background: #00ff88; border-radius: 50%; box-shadow: 0 0 10px #00ff88; animation: pulse 1.5s infinite; }

        .digital-clock-v2 { text-align: right; }
        .digital-clock-v2 .label { font-size: 10px; color: #5d7b8a; letter-spacing: 2px; }
        .digital-clock-v2 .time-display { font-family: 'JetBrains Mono', monospace; font-size: 28px; color: #00d4ff; font-weight: 500; }

        .live-main-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 25px; }

        .glass-panel { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 24px; padding: 30px; backdrop-filter: blur(20px); }
        
        /* Activity Feed */
        .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .live-tag { font-size: 10px; background: #ff007a; padding: 2px 8px; border-radius: 4px; font-weight: 800; }
        
        .ticker-list { display: flex; flex-direction: column; gap: 15px; }
        .ticker-item { background: rgba(255,255,255,0.02); border-radius: 16px; display: flex; overflow: hidden; transition: 0.3s; }
        .ticker-item:hover { background: rgba(255,255,255,0.05); transform: translateX(10px); }
        .ticker-status-line { width: 4px; }
        .ticker-status-line.user { background: #00d4ff; }
        .ticker-status-line.edit { background: #7000ff; }
        .ticker-status-line.system { background: #00ff88; }
        
        .ticker-content { padding: 15px 20px; width: 100%; }
        .ticker-top { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .ticker-action { font-weight: 700; font-size: 15px; }
        .ticker-time { font-size: 12px; color: #5d7b8a; }
        .ticker-user { font-size: 12px; color: #829ca9; }
        .ticker-user strong { color: #fff; }

        .feed-footer { margin-top: 30px; font-size: 11px; color: #5d7b8a; display: flex; align-items: center; gap: 15px; }
        .scanning-bar { flex: 1; height: 1px; background: linear-gradient(90deg, #00d4ff, transparent); position: relative; overflow: hidden; }
        .scanning-bar::after { content: ''; position: absolute; left: 0; top: 0; width: 30%; height: 100%; background: #00d4ff; animation: scan 2s infinite; }

        /* Health Gauge */
        .gauge-container { display: flex; justify-content: center; padding: 20px 0; }
        .gauge-outer { position: relative; width: 140px; height: 140px; }
        .gauge-svg { transform: rotate(-90deg); width: 140px; height: 140px; }
        .gauge-svg circle { fill: none; stroke-width: 8; stroke-linecap: round; }
        .gauge-svg .bg { stroke: rgba(255,255,255,0.05); }
        .gauge-svg .meter { stroke: #00ff88; stroke-dasharray: 408; stroke-dashoffset: 40; filter: drop-shadow(0 0 8px #00ff88); }
        
        .gauge-inner { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
        .gauge-inner h2 { font-size: 28px; font-weight: 800; margin: 0; color: #fff; }
        .gauge-inner h2 span { font-size: 14px; color: #00ff88; }
        .gauge-inner p { font-size: 9px; letter-spacing: 1px; color: #5d7b8a; margin: 0; }

        /* Mini Cards */
        .mini-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; }
        .mini-card { padding: 20px; display: flex; align-items: center; gap: 15px; }
        .m-icon { width: 40px; height: 40px; border-radius: 12px; background: rgba(0, 212, 255, 0.1); color: #00d4ff; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .m-icon.purple { background: rgba(112, 0, 255, 0.1); color: #7000ff; }
        .m-data p { font-size: 11px; color: #5d7b8a; margin: 0; }
        .m-data h4 { font-size: 18px; font-weight: 800; margin: 0; }

        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        @keyframes scan { 0% { left: -100%; } 100% { left: 100%; } }
      `}</style>
    </div>
  );
}