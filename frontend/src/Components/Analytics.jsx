import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend 
} from "recharts";
import { FaDownload, FaUsers, FaCalendarAlt, FaRocket, FaDiceD6, FaArrowUp } from "react-icons/fa";

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/analytics/summary")
      .then(res => setData(res.data))
      .catch(err => console.log(err));
  }, []);

  // 📥 IMPROVED DOWNLOAD LOGIC
  const downloadReport = () => {
    if (!data) return;
    const csvRows = [
      ["SYSTEM ANALYTICS REPORT - EVENTSPHERE"],
      ["Generated On", new Date().toLocaleString()],
      [],
      ["Metric Name", "Value Count"],
      ["Total Expo Events", data.stats.totalExpos],
      ["Verified Exhibitors", data.stats.totalExhibitors],
      ["Scheduled Sessions", data.stats.totalSessions],
      [],
      ["DETAILED SESSION DISTRIBUTION"],
      ["Expo ID", "Sessions"]
    ];
    data.sessionDistribution.forEach(item => csvRows.push([item._id, item.sessionCount]));
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `EventSphere_Report_${Date.now()}.csv`;
    link.click();
  };

  if (!data) return (
    <div className="loader-container">
      <div className="pulse-loader"></div>
      <p>Initializing Intelligence...</p>
    </div>
  );

  // 🎯 TARGET RADIAL DATA
  const radialData = [
    { name: 'Exhibitors', value: data.stats.totalExhibitors, fill: '#00ff88' },
    { name: 'Sessions', value: data.stats.totalSessions, fill: '#7000ff' },
    { name: 'Expos', value: data.stats.totalExpos, fill: '#00d4ff' },
  ];

  return (
    <div className="analytics-root">
      {/* MESH BACKGROUND LAYER */}
      <div className="bg-mesh"></div>

      {/* TOP HEADER */}
      <div className="dashboard-header">
        <div className="title-section">
          <span className="pre-title">Command Center</span>
          <h1 className="main-heading">Event <span>Intelligence</span></h1>
          <p className="sub-heading">Advanced metrics and real-time performance tracking.</p>
        </div>
        
        <div className="action-section">
          <button className="premium-download-btn" onClick={downloadReport}>
            <div className="btn-icon"><FaDownload /></div>
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="kpi-grid-premium">
        {[
          { label: "Active Expos", val: data.stats.totalExpos, icon: <FaRocket />, color: "#00d4ff" },
          { label: "Top Exhibitors", val: data.stats.totalExhibitors, icon: <FaUsers />, color: "#00ff88" },
          { label: "Total Sessions", val: data.stats.totalSessions, icon: <FaCalendarAlt />, color: "#7000ff" },
          { label: "Avg Engagement", val: "94%", icon: <FaDiceD6 />, color: "#ff007a" },
        ].map((item, idx) => (
          <div className="kpi-card-v2" key={idx}>
            <div className="kpi-glow" style={{ background: item.color }}></div>
            <div className="kpi-inner">
              <div className="kpi-icon-v2" style={{ color: item.color }}>{item.icon}</div>
              <div className="kpi-data">
                <span className="kpi-label">{item.label}</span>
                <h2 className="kpi-value">{item.val}</h2>
              </div>
              <div className="kpi-badge"><FaArrowUp /> 12%</div>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div className="viz-main-grid">
        
        {/* AREA CHART */}
        <div className="viz-card-v2 main-viz">
          <div className="viz-header-v2">
            <h3>Growth Trajectory</h3>
            <div className="legend-pills">
              <span className="pill active">Sessions</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data.sessionDistribution}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="_id" stroke="#4a606b" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis stroke="#4a606b" fontSize={11} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#051118', border: '1px solid #1a333d', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="sessionCount" stroke="#00d4ff" strokeWidth={3} fill="url(#areaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* RADIAL TARGET CHART */}
        <div className="viz-card-v2 radial-viz">
          <div className="viz-header-v2">
            <h3>Target Accuracy</h3>
          </div>
          <div className="radial-content-wrapper">
            <ResponsiveContainer width="100%" height={280}>
              <RadialBarChart 
                cx="50%" cy="50%" 
                innerRadius="30%" outerRadius="100%" 
                barSize={12} data={radialData}
              >
                <RadialBar
                  minAngle={15}
                  background={{ fill: 'rgba(255,255,255,0.03)' }}
                  clockWise
                  dataKey="value"
                  cornerRadius={15}
                />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="radial-info-overlay">
              <h2>88%</h2>
              <p>Achieved</p>
            </div>
          </div>
          <div className="radial-custom-legend">
              <div className="leg-item"><span className="dot blue"></span> Expo</div>
              <div className="leg-item"><span className="dot purple"></span> Session</div>
              <div className="leg-item"><span className="dot green"></span> Users</div>
          </div>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');

        .analytics-root { 
          padding: 40px; 
          font-family: 'Plus Jakarta Sans', sans-serif; 
          color: white; 
          position: relative; 
          min-height: 100vh;
          overflow-x: hidden;
        }

        .bg-mesh {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: radial-gradient(circle at 0% 0%, rgba(0, 212, 255, 0.08) 0%, transparent 40%),
                      radial-gradient(circle at 100% 100%, rgba(112, 0, 255, 0.08) 0%, transparent 40%);
          z-index: -1;
        }

        /* TYPOGRAPHY & HEADERS */
        .main-heading { font-size: 48px; font-weight: 800; letter-spacing: -2px; margin: 0; }
        .main-heading span { background: linear-gradient(90deg, #00d4ff, #7000ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .pre-title { text-transform: uppercase; letter-spacing: 3px; font-size: 12px; color: #00d4ff; font-weight: 700; }
        .sub-heading { color: #5d7b8a; font-size: 16px; margin-top: 10px; }

        .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 50px; }

        /* PREMIUM DOWNLOAD BUTTON */
        .premium-download-btn {
          background: #fff; color: #000; border: none; padding: 6px 20px 6px 6px; border-radius: 50px;
          display: flex; align-items: center; gap: 15px; font-weight: 700; cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .btn-icon { background: #000; color: #fff; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .premium-download-btn:hover { transform: scale(1.05); box-shadow: 0 15px 30px rgba(255,255,255,0.1); }

        /* KPI CARDS V2 */
        .kpi-grid-premium { display: grid; grid-template-columns: repeat(4, 1fr); gap: 25px; margin-bottom: 40px; }
        .kpi-card-v2 { position: relative; border-radius: 24px; padding: 1px; overflow: hidden; background: rgba(255,255,255,0.05); }
        .kpi-inner { background: #010a0f; border-radius: 24px; padding: 25px; position: relative; z-index: 2; display: flex; flex-direction: column; gap: 15px; }
        .kpi-glow { position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; opacity: 0.1; filter: blur(40px); z-index: 1; }
        .kpi-icon-v2 { font-size: 24px; }
        .kpi-label { color: #5d7b8a; font-size: 13px; font-weight: 600; }
        .kpi-value { font-size: 32px; font-weight: 800; margin: 0; }
        .kpi-badge { font-size: 11px; background: rgba(0,255,136,0.1); color: #00ff88; padding: 4px 10px; border-radius: 50px; width: fit-content; }

        /* VIZ CARDS */
        .viz-main-grid { display: grid; grid-template-columns: 1.8fr 1.2fr; gap: 25px; }
        .viz-card-v2 { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 30px; padding: 30px; backdrop-filter: blur(20px); }
        .viz-header-v2 h3 { font-size: 18px; font-weight: 700; margin-bottom: 25px; color: #fff; }

        /* RADIAL CUSTOM */
        .radial-content-wrapper { position: relative; }
        .radial-info-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
        .radial-info-overlay h2 { font-size: 36px; font-weight: 800; margin: 0; color: #00ff88; }
        .radial-info-overlay p { margin: 0; font-size: 12px; color: #5d7b8a; text-transform: uppercase; }
        .radial-custom-legend { display: flex; justify-content: center; gap: 15px; margin-top: 15px; }
        .leg-item { font-size: 11px; color: #5d7b8a; display: flex; align-items: center; gap: 6px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot.blue { background: #00d4ff; } .dot.purple { background: #7000ff; } .dot.green { background: #00ff88; }

        /* LOADER */
        .loader-container { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; }
        .pulse-loader { width: 40px; height: 40px; background: #00d4ff; border-radius: 50%; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { transform: scale(0.8); opacity: 0.5; box-shadow: 0 0 0 0 rgba(0,212,255,0.7); } 70% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 20px rgba(0,212,255,0); } 100% { transform: scale(0.8); opacity: 0.5; } }
      `}</style>
    </div>
  );
}