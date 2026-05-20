import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  CalendarMonthOutlined as Calendar, 
  PeopleAltOutlined as Users, 
  ConfirmationNumberOutlined as Ticket, 
  ArrowForward as ArrowIcon,
  AccessTimeOutlined as Clock, 
  StarBorderOutlined as Star, 
  NotificationsOutlined as Bell, 
  MapOutlined as Map, 
  LaunchOutlined as ExternalLink, 
  ChevronRight as ChevronIcon, 
  AutoAwesomeOutlined as Sparkles,
  LocationSearchingOutlined as Target
} from "@mui/icons-material";

// ── TOKENS (Exhibitor Theme Match) ───────────────────────────
const T = {
  bg: "#07090F",
  card: "#0E1118",
  cardHover: "#131720",
  border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(255,255,255,0.12)",
  accent: "#00d9ff", // Cyan accent
  accentSoft: "rgba(0, 217, 255, 0.1)",
  teal: "#00D9B5",
  tealSoft: "rgba(0,217,181,0.08)",
  amber: "#F5A623",
  amberSoft: "rgba(245,166,35,0.08)",
  textMain: "#F0F2FF",
  textSub: "#6B7280",
};

// ── GLOBAL STYLES ────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    // @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;700;800;900&family=Outfit:wght@300;400;500;600&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${T.bg}; font-family: &quot;Cabinet Grotesk&quot;, sans-serif; color: ${T.textMain}; }

    .bento-card {
      background: ${T.card};
      border: 1px solid ${T.border};
      border-radius: 22px;
      padding: 24px;
      transition: all 0.3s cubic-bezier(0.23,1,0.32,1);
      position: relative;
      overflow: hidden;
    }
    .bento-card:hover {
      border-color: ${T.borderHover};
      transform: translateY(-4px);
      background: ${T.cardHover};
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }

    .pulse-dot {
      width: 6px; height: 6px; background: ${T.teal}; border-radius: 50%;
      box-shadow: 0 0 10px ${T.teal};
      animation: shadow-pulse 2s infinite;
    }
    @keyframes shadow-pulse {
      0% { box-shadow: 0 0 0 0px rgba(0, 217, 181, 0.4); }
      100% { box-shadow: 0 0 0 10px rgba(0, 217, 181, 0); }
    }

    .action-row {
      background: rgba(255,255,255,0.015);
      border: 1px solid ${T.border};
      border-radius: 16px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      transition: all 0.25s;
    }
    .action-row:hover {
      background: ${T.accentSoft};
      border-color: ${T.accent}40;
    }
  `}</style>
);

export default function AttendeeDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [stats, setStats] = useState({ meetings: 0, expos: 0, bookmarks: 0 });
  const [nextMeeting, setNextMeeting] = useState(null);
  const [latestExpoId, setLatestExpoId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userId = user.id || user._id;
        const [meetingsRes, exposRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/meetings/attendee/${userId}`),
          axios.get(`http://localhost:5000/api/expo/my-registrations/${userId}`)
        ]);
        
        const allKeys = Object.keys(localStorage);
        const bookmarksCount = allKeys
          .filter(k => k.startsWith("bookmarks_"))
          .reduce((acc, k) => acc + JSON.parse(localStorage.getItem(k)).length, 0);

        setStats({
          meetings: meetingsRes.data.filter(m => m.status === 'approved').length,
          expos: exposRes.data.length,
          bookmarks: bookmarksCount
        });

        const confirmed = meetingsRes.data
          .filter(m => m.status === 'approved')
          .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
        setNextMeeting(confirmed);

        if (exposRes.data.length > 0) {
          const latest = exposRes.data[exposRes.data.length - 1];
          setLatestExpoId(latest.expoId?._id || latest.expoId);
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchDashboardData();
  }, []);

  const goToExpoTab = (tabIndex) => {
    if (latestExpoId) {
      navigate(`/attendee/expo/${latestExpoId}`, { state: { activeTab: tabIndex } });
    } else {
      navigate('/attendee/explore');
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg }}>
      <div style={{ width: '36px', height: '36px', border: `3px solid ${T.border}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, padding: "40px 28px" }}>
      <GlobalStyle />
      
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* ── HEADER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: T.teal, fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
              <Sparkles style={{ fontSize: 16 }} /> Intelligence Hub
            </div>
           <h1 style={{ 
  fontFamily: 'Cabinet Grotesk, sans-serif', // Yahan comma lagana zaroori hai
  fontSize: '34px', 
  fontWeight: 900, 
  color: T.textMain, 
  lineHeight: 1.1 
}}>
              Welcome back, <span style={{ color: T.accent }}>{user.name?.split(' ')[0]}</span>
            </h1>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => navigate('/attendee/bookmarks')} style={{ width: '44px', height: '44px', borderRadius: '14px', background: T.card, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textSub, cursor: 'pointer' }}>
               <Bell style={{ fontSize: 20 }} />
            </button>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: `linear-gradient(135deg, ${T.accent}, #5b21b6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontFamily: 'Cabinet Grotesk' }}>
               {user.name?.[0]}
            </div>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: "Registered Expos", val: stats.expos, icon: <Ticket />, color: T.accent, soft: T.accentSoft },
            { label: "Confirmed Meetings", val: stats.meetings, icon: <Users />, color: T.teal, soft: T.tealSoft },
            { label: "Saved Sessions", val: stats.bookmarks, icon: <Star />, color: T.amber, soft: T.amberSoft },
          ].map((s, i) => (
            <div key={i} className="bento-card">
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: s.soft, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                {s.icon}
              </div>
              <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif',fontSize: '32px', fontWeight: 900, marginBottom: '4px' }}>{s.val}</div>
              <div style={{ color: T.textSub, fontSize: '13px', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── MAIN CONTENT GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>
          
          {/* LIVE MEETING CARD */}
          <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '320px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <div className="pulse-dot"></div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: T.teal, textTransform: 'uppercase', letterSpacing: '1px' }}>Network Status: Active</span>
              </div>

              {nextMeeting ? (
                <>
                  <h2 style={{ fontFamily: 'Cabinet Grotesk, sans-serif',fontSize: '28px', fontWeight: 800, marginBottom: '12px', lineHeight: 1.2 }}>
                    Meeting with {nextMeeting.exhibitorId?.shopName}
                  </h2>
                  <p style={{ color: T.textSub, marginBottom: '32px', fontSize: '15px' }}>Your next confirmed appointment is scheduled.</p>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}`, padding: '10px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar style={{ fontSize: 18, color: T.accent }} />
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{nextMeeting.date}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}`, padding: '10px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock style={{ fontSize: 18, color: T.teal }} />
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{nextMeeting.time}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 style={{ fontFamily: 'Cabinet Grotesk', fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>Grow Your Network</h2>
                  <p style={{ color: T.textSub, marginBottom: '32px', fontSize: '15px' }}>No meetings today. Browse exhibitors to start connecting.</p>
                  <button onClick={() => navigate('/attendee/meeting-hub')} style={{ background: T.accent, color: '#000', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Meeting Hub <ArrowIcon style={{ fontSize: 18 }} />
                  </button>
                </>
              )}
            </div>
            
            {nextMeeting && (
              <button onClick={() => navigate('/attendee/my-appointments')} style={{ width: 'fit-content', background: T.accentSoft, color: T.accent, border: `1px solid ${T.accent}40`, padding: '10px 20px', borderRadius: '12px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                View Full Details <ExternalLink style={{ fontSize: 16 }} />
              </button>
            )}
            
            <Target style={{ position: 'absolute', right: '-30px', bottom: '-30px', fontSize: '180px', opacity: 0.03, color: T.accent }} />
          </div>

          {/* QUICK ACTIONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span style={{ fontFamily: 'Cabinet Grotesk', fontSize: '16px', fontWeight: 800, color: T.textMain }}>Quick Access</span>
            
            <div onClick={() => goToExpoTab(3)} className="action-row">
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: T.tealSoft, color: T.teal, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ticket style={{ fontSize: 20 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>Access Pass</div>
                  <div style={{ fontSize: '12px', color: T.textSub }}>Entry QR Code</div>
                </div>
                <ChevronIcon style={{ fontSize: 18, color: T.textSub }} />
            </div>

            <div onClick={() => goToExpoTab(1)} className="action-row">
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: T.accentSoft, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Map style={{ fontSize: 20 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>Venue Map</div>
                  <div style={{ fontSize: '12px', color: T.textSub }}>Interactive Hall</div>
                </div>
                <ChevronIcon style={{ fontSize: 18, color: T.textSub }} />
            </div>

            <div onClick={() => navigate('/attendee/bookmarks')} className="action-row">
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: T.amberSoft, color: T.amber, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar style={{ fontSize: 20 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>Reminders</div>
                  <div style={{ fontSize: '12px', color: T.textSub }}>Saved Sessions</div>
                </div>
                <ChevronIcon style={{ fontSize: 18, color: T.textSub }} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}