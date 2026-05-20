import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  StorefrontOutlined as BoothIcon,
  GroupsOutlined as StaffIcon,
  AdsClickOutlined as LeadIcon,
  QuestionAnswerOutlined as QueryIcon,
  AutoGraphOutlined as AnalyticsIcon,
  ArrowForward as ArrowIcon,
  FlashOnOutlined as LiveIcon,
  TrendingUp as TrendingIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";

// ── TOKENS (UNTOUCHED) ──────────────────────────────────────────────────
const T = {
  bg: "#07090F",
  card: "#0E1118",
  cardHover: "#131720",
  border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(255,255,255,0.12)",
  accent: "#00d9ff",
  accentSoft: "rgba(70, 207, 220, 0.2)",
  teal: "#00D9B5",
  tealSoft: "rgba(0,217,181,0.08)",
  amber: "#F5A623",
  amberSoft: "rgba(245,166,35,0.08)",
  rose: "#FF6B8A",
  roseSoft: "rgba(255,107,138,0.08)",
  sky: "#38BDF8",
  skySoft: "rgba(56,189,248,0.08)",
  textMain: "#F0F2FF",
  textSub: "#6B7280",
  textMid: "#9CA3AF",
};

// ── GLOBAL STYLES (UPDATED FOR 4-COLUMN STATS) ────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Outfit:wght@300;400;500;600&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${T.bg}; font-family: 'Outfit', sans-serif; color: ${T.textMain}; overflow-x: hidden; }
    
    .stat-card {
      background: ${T.card};
      border: 1px solid ${T.border};
      border-radius: 20px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .stat-card:hover { border-color: ${T.borderHover}; transform: translateY(-3px); background: ${T.cardHover}; }

    /* ── STATS GRID: 4 COLUMNS ON LAPTOP ── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr); /* Force 4 columns */
      gap: 16px; 
      margin-bottom: 28px;
    }

    .bottom-grid {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 16px;
    }

    /* Tablet: 2 Columns */
    @media (max-width: 1100px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 1024px) {
      .bottom-grid { grid-template-columns: 1fr; }
    }

    /* Mobile: 1 Column */
    @media (max-width: 600px) {
      .stats-grid { grid-template-columns: 1fr; }
      .header-flex { flex-direction: column; align-items: flex-start !important; gap: 20px !important; }
      .main-container { padding: 24px 16px !important; }
      .primary-btn { width: 100%; justify-content: center; }
    }

    .fade-in { animation: fadeUp 0.5s ease both; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

    .booth-row {
      background: rgba(255,255,255,0.015);
      border: 1px solid ${T.border};
      border-radius: 14px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      transition: 0.2s;
    }
    .booth-row:hover { background: rgba(255,255,255,0.035); }

    .primary-btn {
      display: flex; align-items: center; gap: 8px; padding: 10px 20px;
      background: ${T.accentSoft}; border: 1px solid rgba(70, 207, 220, 0.3);
      border-radius: 12px; color: ${T.accent}; font-weight: 600; cursor: pointer;
    }

    .quick-btn {
      width: 100%; background: none; border: none; cursor: pointer;
      display: flex; align-items: center; gap: 12px; padding: 12px 14px;
      border-radius: 12px; color: ${T.textSub}; font-size: 14px; transition: 0.2s;
    }
    .quick-btn:hover { background: ${T.accentSoft}; color: ${T.accent}; }
  `}</style>
);

// ── STAT CARD ──
const StatCard = ({ label, value, sub, icon, color, colorSoft, accentLine }) => (
  <div className="stat-card fade-in" style={{ position: 'relative' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: accentLine }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: colorSoft, display: "flex", alignItems: "center", justifyContent: "center", color }}>{icon}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, background: colorSoft, borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700, color }}>
        <TrendingIcon style={{ fontSize: 12 }} /> Live
      </div>
    </div>
    <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 32, fontWeight: 900, color: T.textMain, lineHeight: 1, marginBottom: 4 }}>{value}</div>
    <div style={{ fontSize: 12, fontWeight: 600, color: T.textSub }}>{label}</div>
    <div style={{ fontSize: 10, color, fontWeight: 500, marginTop: 4 }}>{sub}</div>
  </div>
);

// ── MAIN COMPONENT ──
export default function ExhibitorHome() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myEvents, setMyEvents] = useState([]);
  const [stats, setStats] = useState({ leads: 0, queries: 0, views: 0 });
  const [totalBooths, setTotalBooths] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchDashboardData(parsedUser._id || parsedUser.id);
    }
  }, []);

  const fetchDashboardData = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      const [eventRes, analyticsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/events/my-events/${id}`),
        axios.get(`http://localhost:5000/api/expo/event-analytics/${id}`),
      ]);
      setMyEvents(eventRes.data || []);
      setTotalBooths(eventRes.data?.length || 0);
      const analyticsData = analyticsRes.data || [];
      setStats({
        leads: analyticsData.reduce((a, c) => a + (Number(c.leads) || 0), 0),
        queries: analyticsData.reduce((a, c) => a + (Number(c.queries) || 0), 0),
        views: analyticsData.reduce((a, c) => a + (Number(c.views) || 0), 0),
      });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg, color: T.textSub }}>Loading...</div>;

  return (
    <>
      <GlobalStyle />
      <div className="main-container" style={{ minHeight: "100vh", background: T.bg, padding: "32px 28px 64px" }}>

        {/* ── HEADER ── */}
        <div className="header-flex fade-in" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 36 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.teal, boxShadow: `0 0 8px ${T.teal}` }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: T.teal, letterSpacing: "0.1em" }}>LIVE DASHBOARD</span>
            </div>
            <h1 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 900, color: T.textMain, lineHeight: 1.1 }}>
              Welcome back, <span style={{ color: T.accent }}>{user?.organization || user?.name || "Partner"}</span>
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="primary-btn" onClick={() => navigate("/exhibitor/booth-selection")}>
              <LiveIcon style={{ fontSize: 16 }} /> Join Expo
            </button>
          </div>
        </div>

        {/* ── STATS GRID (NOW 4 IN A ROW ON LAPTOP) ── */}
        <div className="stats-grid">
          <StatCard label="Total Leads" value={stats.leads} sub="Direct captures" color={T.teal} colorSoft={T.tealSoft} accentLine={T.teal} icon={<LeadIcon fontSize="small" />} />
          <StatCard label="Booth Traffic" value={stats.views} sub="Profile views" color={T.sky} colorSoft={T.skySoft} accentLine={T.sky} icon={<ViewIcon fontSize="small" />} />
          <StatCard label="Inquiries" value={stats.queries} sub="Unread queries" color={T.amber} colorSoft={T.amberSoft} accentLine={T.amber} icon={<QueryIcon fontSize="small" />} />
          <StatCard label="Active Booths" value={totalBooths} sub="In-progress" color={T.rose} colorSoft={T.roseSoft} accentLine={T.rose} icon={<BoothIcon fontSize="small" />} />
        </div>

        {/* ── BOTTOM GRID ── */}
        <div className="bottom-grid">
          <div className="fade-in" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 22, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontWeight: 800, color: T.textMain }}>Active Showcases</span>
              <button style={{ background: "none", border: "none", color: T.accent, fontSize: 13, fontWeight: 600, cursor: "pointer" }} onClick={() => navigate("/exhibitor/booth/manage")}>View All →</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {myEvents.map((item, i) => (
                <div key={i} className="booth-row" onClick={() => navigate(`/exhibitor/booth-setup?expoId=${item.expoId?._id}&boothId=${item.boothNumber}`)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", color: T.accent, fontWeight: 800 }}>{item.shopName?.[0]}</div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{item.shopName}</div>
                      <div style={{ fontSize: 12, color: T.textSub }}>{item.expoId?.title} <span style={{ color: T.accent }}>#{item.boothNumber}</span></div>
                    </div>
                  </div>
                  <ArrowIcon style={{ fontSize: 16, color: T.textSub }} />
                </div>
              ))}
            </div>
          </div>

          <div className="fade-in" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 22, padding: 24 }}>
            <span style={{ fontWeight: 800, color: T.textMain }}>Quick Actions</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 18 }}>
              {[
                { label: "Staff Members", icon: <StaffIcon fontSize="small" />, path: "/exhibitor/booth/staff" },
                { label: "Lead Reports", icon: <LeadIcon fontSize="small" />, path: "/exhibitor/analytics" },
                { label: "Branding", icon: <AnalyticsIcon fontSize="small" />, path: "/exhibitor/profile/edit" },
              ].map((link, i) => (
                <button key={i} className="quick-btn" onClick={() => navigate(link.path)}>
                   <div style={{ width: 32, height: 32, borderRadius: 8, background: T.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}>{link.icon}</div>
                   {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}