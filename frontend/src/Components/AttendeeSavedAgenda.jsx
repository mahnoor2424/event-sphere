import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // SweetAlert Import
import { 
  Bell, Clock, MapPin, Trash2, CalendarDays, 
  ExternalLink, Sparkles, Layout, Calendar, ChevronRight
} from "lucide-react";

// ─── PREMIUM AZURE DESIGN SYSTEM ───
const T = {
  bg:           "#05070A",
  paper:        "#0D1117",
  paperAlt:     "#161B22",
  accent:       "#00b8d1", 
  accentDim:    "rgba(0,184,209,0.06)",
  accentBorder: "rgba(0,184,209,0.20)",
  border:       "rgba(255,255,255,0.05)",
  textMain:     "#F0F6FC",
  textSub:      "#8B949E",
  teal:         "#10B981",
  red:          "#EF4444",
};

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body { 
      background: ${T.bg}; 
      font-family: 'Inter', sans-serif; 
      color: ${T.textMain}; 
      -webkit-font-smoothing: antialiased;
    }

    h1, h2, h3, .heading-font {
      font-family: 'Plus Jakarta Sans', sans-serif;
      letter-spacing: -0.02em;
    }

    /* SweetAlert Premium Dark Styling */
    .swal2-popup {
      background: ${T.paper} !important;
      border: 1px solid ${T.accentBorder} !important;
      border-radius: 24px !important;
      color: ${T.textMain} !important;
      font-family: 'Inter', sans-serif !important;
    }
    .swal2-title { font-family: 'Plus Jakarta Sans' !important; color: #fff !important; font-weight: 800 !important; }
    .swal2-confirm { background: ${T.accent} !important; color: #000 !important; font-weight: 800 !important; border-radius: 12px !important; }
    .swal2-cancel { background: transparent !important; color: ${T.textSub} !important; border: 1px solid ${T.border} !important; border-radius: 12px !important; }

    .hub-card {
      background: ${T.paper};
      border: 1px solid ${T.border};
      border-radius: 20px;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      overflow: hidden;
      display: flex;
    }

    .hub-card:hover {
      background: ${T.paperAlt};
      border-color: ${T.accentBorder};
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }

    .hub-card::before {
      content: ""; position: absolute; top: 0; left: 0; width: 4px; height: 100%;
      background: ${T.accent}; opacity: 0.8;
    }

    .expo-badge {
      background: ${T.accentDim};
      color: ${T.accent};
      padding: 5px 12px;
      border-radius: 8px;
      font-size: 10px;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      border: 1px solid ${T.accentBorder};
      margin-bottom: 10px;
    }

    .time-block {
      min-width: 110px;
      padding: 30px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-right: 1px solid ${T.border};
      background: rgba(255,255,255,0.01);
    }

    .btn-icon {
      background: rgba(255,255,255,0.03);
      border: 1px solid ${T.border};
      border-radius: 12px;
      padding: 12px;
      color: ${T.textSub};
      cursor: pointer;
      transition: 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-icon:hover {
      background: ${T.accentDim};
      border-color: ${T.accent};
      color: ${T.accent};
      transform: scale(1.05);
    }
    .btn-delete:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.2);
      color: ${T.red};
    }

    .spin {
      width: 35px; height: 35px;
      border: 3px solid ${T.border};
      border-top-color: ${T.accent};
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `}</style>
);

export default function AttendeeGlobalReminders() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchGlobalAgenda = async () => {
    try {
      setLoading(true);
      const allKeys = Object.keys(localStorage);
      const expoBookmarkKeys = allKeys.filter(key => key.startsWith("bookmarks_"));
      
      if (expoBookmarkKeys.length === 0) {
        setReminders([]);
        setLoading(false);
        return;
      }

      let allSavedData = [];
      for (const key of expoBookmarkKeys) {
        const expoId = key.replace("bookmarks_", "");
        const savedIds = JSON.parse(localStorage.getItem(key) || "[]");

        if (savedIds.length > 0) {
          try {
            const [expoRes, scheduleRes] = await Promise.all([
              axios.get(`http://localhost:5000/api/expo/get-expo/${expoId}`),
              axios.get(`http://localhost:5000/api/schedule/expo/${expoId}`)
            ]);

            const matched = scheduleRes.data
              .filter(s => savedIds.includes(s._id))
              .map(s => ({ 
                ...s, 
                parentExpoId: expoId, 
                parentExpoTitle: expoRes.data.title 
              }));

            allSavedData = [...allSavedData, ...matched];
          } catch (e) { console.error(`Error for expo ${expoId}`); }
        }
      }

      const sorted = allSavedData.sort((a, b) => new Date(a.date + " " + a.startTime) - new Date(b.date + " " + b.startTime));
      setReminders(sorted);
    } catch (err) {
      console.error("Global fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalAgenda();
  }, []);

  const removeReminder = async (expoId, sessionId) => {
    const result = await Swal.fire({
      title: 'Remove Session?',
      text: "This session will be removed from your agenda.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      const key = `bookmarks_${expoId}`;
      const saved = JSON.parse(localStorage.getItem(key) || "[]");
      const updated = saved.filter(id => id !== sessionId);
      localStorage.setItem(key, JSON.stringify(updated));
      setReminders(prev => prev.filter(s => s._id !== sessionId));

      Swal.fire({
        title: 'Removed!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
      <div className="spin" />
    </div>
  );

  return (
    <>
      <GlobalStyle />
      <div style={{ minHeight: "100vh", background: T.bg, paddingBottom: 80 }}>
        
        {/* HEADER SECTION */}
        <div style={{ 
          borderBottom: `1px solid ${T.border}`, 
          padding: "30px 40px", 
          background: "rgba(5,7,10,0.85)", 
          backdropFilter: "blur(20px)", 
          position: "sticky", top: 0, zIndex: 100 
        }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                <Bell size={22} color={T.accent} />
                <h1 style={{ fontSize: "28px", fontWeight: 800 }}>
                  Global <span style={{ color: T.accent }}>Agenda</span>
                </h1>
              </div>
              <p style={{ fontSize: 13, color: T.textSub, fontWeight: 500 }}>Management console for your bookmarked sessions</p>
            </div>
            <div style={{ 
              background: T.accentDim, border: `1px solid ${T.accentBorder}`, 
              padding: "10px 20px", borderRadius: "14px", fontSize: "12px", fontWeight: 800, color: T.accent 
            }}>
              {reminders.length} SESSIONS ACTIVE
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: "50px auto", padding: "0 25px" }}>
          
          {reminders.length === 0 ? (
            <div style={{ 
              padding: '120px 40px', textAlign: 'center', background: T.paper, 
              borderRadius: 32, border: `1px dashed ${T.border}` 
            }}>
              <CalendarDays size={54} color={T.textSub} style={{ marginBottom: 24, opacity: 0.2 }} />
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Agenda is empty</h3>
              <p style={{ color: T.textSub, fontSize: 15 }}>Bookmark sessions from individual expo details to track them here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {reminders.map((session) => (
                <div key={session._id} className="hub-card">
                  
                  {/* Timeline Block */}
                  <div className="time-block">
                    <div className="heading-font" style={{ fontSize: 24, fontWeight: 800, color: T.textMain, lineHeight: 1 }}>
                      {session.startTime.split(' ')[0]}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: T.accent, textTransform: 'uppercase', marginTop: 8, letterSpacing: 0.5 }}>
                      {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  
                  <div style={{ flex: 1, padding: "25px 35px", display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
                    <div style={{ flex: 1 }}>
                        <div className="expo-badge">
                            <Layout size={12} /> {session.parentExpoTitle}
                        </div>
                        
                        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: "#fff" }}>
                          {session.title}
                        </h3>
                        
                        <div style={{ display: 'flex', gap: 25, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.textSub, fontSize: 14, fontWeight: 500 }}>
                                <MapPin size={16} color={T.accent} /> {session.location}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.textSub, fontSize: 14, fontWeight: 500 }}>
                                <Clock size={16} color={T.accent} /> {session.startTime} - {session.endTime}
                            </div>
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button 
                            className="btn-icon"
                            onClick={() => navigate(`/attendee/expo/${session.parentExpoId}`)} // Smart Navigation
                            title="Go to Expo Lobby"
                        >
                            <ExternalLink size={20} />
                        </button>
                        <button 
                            className="btn-icon btn-delete"
                            onClick={() => removeReminder(session.parentExpoId, session._id)}
                            title="Remove Session"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SMART FOOTER */}
          {reminders.length > 0 && (
            <div style={{ 
              marginTop: 60, padding: "30px 40px", borderRadius: 28, 
              background: "rgba(16,185,129,0.03)", border: "1px solid rgba(16,185,129,0.1)", 
              display: 'flex', gap: 24, alignItems: 'center' 
            }}>
                <div style={{ 
                  width: 48, height: 48, borderRadius: 14, background: 'rgba(16,185,129,0.1)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  <Sparkles color="#10B981" size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "#10B981", marginBottom: 4 }}>System Reminders Synced</h4>
                  <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.5 }}>
                    Session alerts are registered for <b>{user.email}</b>. You will be notified via email 15 minutes before the start of each session.
                  </p>
                </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}