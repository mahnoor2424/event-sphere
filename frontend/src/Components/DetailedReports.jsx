import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaMapMarkerAlt, FaSyncAlt, FaUsers, FaBuilding, FaBookmark, FaChartLine } from "react-icons/fa";

export default function DetailedReports() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({ totalGlobalAttendees: 0, avgOccupancy: 0, totalEvents: 0 });
  const [loading, setLoading] = useState(true);

  const fetchLiveReports = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/analytics/detailed-reports");
      if (res.data) {
        setData(res.data.expos || []);
        setSummary(res.data.summary);
      }
    } catch (err) { console.error("Sync Error:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchLiveReports();
    const interval = setInterval(fetchLiveReports, 10000); // 10 sec auto-sync
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="report-root">
      <header className="report-nav">
        <h1>Admin <span>Intelligence</span> Hub</h1>
        <div className="status-indicator">
          <FaSyncAlt className={loading ? "spin" : ""} /> 
          {loading ? " Fetching Live Metrics..." : " System Live & Operational"}
        </div>
      </header>

      {/* STRATEGIC SUMMARY */}
      <div className="summary-container">
        <div className="s-card">
          <div className="icon-circle" style={{background: 'rgba(124, 111, 255, 0.1)', color: '#00fdfd'}}><FaUsers /></div>
          <div className="s-info">
            <h3>{summary.totalGlobalAttendees}</h3>
            <p>Total Registered Attendees</p>
          </div>
        </div>
        <div className="s-card">
          <div className="icon-circle" style={{background: 'rgba(47, 252, 190, 0.1)', color: '#2ffcbe'}}><FaChartLine /></div>
          <div className="s-info">
            <h3>{summary.avgOccupancy}%</h3>
            <p>Average Booth Occupancy</p>
          </div>
        </div>
        <div className="s-card">
          <div className="icon-circle" style={{background: 'rgba(255, 184, 77, 0.1)', color: '#ffb84d'}}><FaBuilding /></div>
          <div className="s-info">
            <h3>{summary.totalEvents}</h3>
            <p>Total Managed Expos</p>
          </div>
        </div>
      </div>

      {/* DETAILED DATA TABLE */}
      <div className="report-grid">
        <div className="table-header-custom">
          <h2>Expo Performance Analytics</h2>
          <p>Real-time attendee engagement and booth traffic data</p>
        </div>
        <table className="realtime-table">
          <thead>
            <tr>
              <th>Expo Details</th>
              <th>Engagement (Attendees)</th>
              <th>Session Popularity</th>
              <th>Space Allocation</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item._id}>
                <td>
                  <div className="title-box">
                    <strong>{item.title}</strong>
                    <span><FaMapMarkerAlt /> {item.location}</span>
                  </div>
                </td>
                <td className="traffic-cell">
                  <div className="val">{item.attendees}</div>
                  <p>Registered Attendees</p>
                </td>
                <td>
                  <div className="session-card">
                    <span className="s-title">{item.popularSession}</span>
                    <span className="s-bookmarks"><FaBookmark size={10}/> {item.bookmarksCount} Bookmarks</span>
                  </div>
                </td>
                <td>
                  <div className="occ-container">
                    <div className="occ-text">
                      <span>{item.exhibitorCount} / {item.totalCapacity} Booths Reserved</span>
                    </div>
                    <div className="occ-bar">
                      <div className="occ-fill" style={{ width: `${item.totalCapacity > 0 ? (item.exhibitorCount/item.totalCapacity)*100 : 0}%` }}></div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .report-root { padding: 40px; background: #05070A; color: white; min-height: 100vh; font-family: 'DM Sans', sans-serif; }
        .report-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 20px; }
        .report-nav h1 { font-size: 28px; font-weight: 800; }
        .report-nav h1 span { color: #00d9ff; }
        .status-indicator { font-size: 13px; color: #4ade80; display: flex; align-items: center; gap: 8px; font-weight: 600; background: rgba(74,222,128,0.1); padding: 8px 16px; border-radius: 50px; }

        .summary-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 40px; }
        .s-card { background: #0D1117; border: 1px solid rgba(255,255,255,0.05); padding: 25px; border-radius: 20px; display: flex; align-items: center; gap: 20px; }
        .icon-circle { width: 54px; height: 54px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .s-info h3 { margin: 0; font-size: 30px; font-weight: 800; color: #fff; line-height: 1; }
        .s-info p { margin: 5px 0 0; font-size: 13px; color: #8892AA; font-weight: 500; }

        .table-header-custom { margin-bottom: 20px; }
        .table-header-custom h2 { font-size: 20px; font-weight: 700; margin-bottom: 5px; }
        .table-header-custom p { font-size: 14px; color: #8892AA; }

        .realtime-table { width: 100%; border-collapse: separate; border-spacing: 0 10px; }
        .realtime-table th { padding: 15px 20px; text-align: left; color: #4A5568; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; }
        .realtime-table td { background: #0D1117; padding: 20px; border-top: 1px solid rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.03); }
        .realtime-table td:first-child { border-left: 1px solid rgba(255,255,255,0.03); border-radius: 15px 0 0 15px; }
        .realtime-table td:last-child { border-right: 1px solid rgba(255,255,255,0.03); border-radius: 0 15px 15px 0; }

        .title-box strong { display: block; font-size: 17px; margin-bottom: 6px; color: #EEF2FF; }
        .title-box span { font-size: 13px; color: #8892AA; display: flex; align-items: center; gap: 6px; }

        .traffic-cell .val { font-size: 26px; font-weight: 800; color: #00eeff; }
        .traffic-cell p { margin: 2px 0 0; font-size: 12px; color: #4A5568; }

        .session-card .s-title { display: block; font-weight: 700; font-size: 15px; color: #EEF2FF; margin-bottom: 8px; }
        .s-bookmarks { font-size: 11px; color: #2ffcbe; background: rgba(47,252,190,0.1); padding: 4px 10px; border-radius: 6px; font-weight: 700; }

        .occ-container { width: 100%; max-width: 200px; }
        .occ-text { font-size: 12px; color: #8892AA; margin-bottom: 8px; font-weight: 500; }
        .occ-bar { height: 8px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; }
        .occ-fill { height: 100%; background: linear-gradient(90deg, #00eeff, #2ffcbe); border-radius: 10px; transition: width 1.5s ease-in-out; }

        .spin { animation: spin 2s infinite linear; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}