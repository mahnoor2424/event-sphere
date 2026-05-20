import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2"; 
import { 
  Calendar, Clock, CheckCircle2, XCircle, Timer, 
  ChevronRight, MessageSquare, MapPin, LayoutGrid, 
  Trash2, AlertCircle
} from "lucide-react";

// ─── THE PRO CONSOLE DESIGN SYSTEM ───
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
  green:        "#10B981",
  red:          "#EF4444",
  yellow:       "#F59E0B",
};

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');

    body {
      background: ${T.bg};
      font-family: 'Inter', sans-serif; /* Clean Body Font */
      color: ${T.textMain};
      -webkit-font-smoothing: antialiased;
    }

    h1, h2, h3, .syne-font {
      font-family: 'Plus Jakarta Sans', sans-serif; /* Premium Heading Font */
      letter-spacing: -0.02em;
    }

    /* SweetAlert Customization */
    .swal2-popup {
      background: ${T.paper} !important;
      border: 1px solid ${T.accentBorder} !important;
      border-radius: 24px !important;
      color: ${T.textMain} !important;
    }
    .swal2-title { font-family: 'Plus Jakarta Sans' !important; font-weight: 800 !important; }

    .pro-card {
      background: ${T.paper};
      border: 1px solid ${T.border};
      border-radius: 20px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 28px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .pro-card:hover {
      background: ${T.paperAlt};
      border-color: ${T.accentBorder};
      transform: translateY(-4px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }

    .pro-card.expired { opacity: 0.45; filter: grayscale(1); }

    .filter-btn {
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      border: 1px solid transparent;
      background: transparent;
      color: ${T.textSub};
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: 0.2s;
    }

    .filter-btn.active {
      background: ${T.accentDim};
      border-color: ${T.accentBorder};
      color: ${T.accent};
    }

    .date-box {
      min-width: 80px;
      text-align: center;
      padding-right: 24px;
      border-right: 1px solid ${T.border};
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .status-pill {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 5px 12px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .delete-btn {
      color: ${T.textSub};
      padding: 10px;
      border-radius: 10px;
      cursor: pointer;
      border: none;
      background: transparent;
      transition: 0.2s;
    }
    .delete-btn:hover { background: rgba(239, 68, 68, 0.1); color: ${T.red}; }

    @keyframes spin { to { transform: rotate(360deg); } }
  `}</style>
);

export default function AttendeeAppointments() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchMeetings = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const id = user.id || user._id;
    if (!id) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/meetings/attendee/${id}`);
      setMeetings(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMeetings(); }, []);

  const handleDelete = async (e, meetingId) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: 'Remove Appointment?',
      text: "This will permanently delete the record from your schedule.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete It',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/meetings/${meetingId}`);
        setMeetings(meetings.filter(m => m._id !== meetingId));
        Swal.fire({ title: 'Deleted', icon: 'success', timer: 1500, showConfirmButton: false });
      } catch (err) {
        Swal.fire('Error', 'Deletion failed.', 'error');
      }
    }
  };

  const isPast = (dateStr) => {
    const meetingDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    return meetingDate < today;
  };

  const filtered = useMemo(() => 
    filter === "all" ? meetings : meetings.filter(m => m.status === filter)
  , [meetings, filter]);

  const getStatusInfo = (status) => {
    switch(status) {
      case "approved": return { color: T.green, label: "APPROVED", icon: <CheckCircle2 size={12}/>, bg: "rgba(16, 185, 129, 0.1)" };
      case "rejected": return { color: T.red, label: "REJECTED", icon: <XCircle size={12}/>, bg: "rgba(239, 68, 68, 0.1)" };
      default: return { color: T.yellow, label: "PENDING", icon: <Timer size={12}/>, bg: "rgba(245, 158, 11, 0.1)" };
    }
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg }}>
        <div style={{ width: 35, height: 35, border: `2px solid ${T.border}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, padding: "60px 24px" }}>
      <GlobalStyle />
      
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: 25, height: 2, background: T.accent }} />
                <span style={{ fontSize: '10px', fontWeight: 800, color: T.accent, letterSpacing: '2px', textTransform: 'uppercase' }}>Attendee Management</span>
            </div>
            <h1 style={{ fontSize: "40px", fontWeight: 800, margin: 0, letterSpacing: '-1.5px' }}>
              My <span style={{ color: T.accent }}>Schedule</span>
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.02)', padding: '5px', borderRadius: '12px', border: `1px solid ${T.border}` }}>
            {["all", "pending", "approved", "rejected"].map(t => (
              <button key={t} className={`filter-btn ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>{t}</button>
            ))}
          </div>
        </div>

        {/* LIST SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px', background: T.paper, borderRadius: '24px', border: `1px dashed ${T.border}` }}>
              <LayoutGrid size={40} style={{ color: T.textSub, opacity: 0.2, marginBottom: '15px' }} />
              <p style={{ color: T.textSub, fontSize: '14px', fontWeight: 500 }}>No appointments found in your schedule.</p>
            </div>
          ) : (
            filtered.map((m) => {
              const info = getStatusInfo(m.status);
              const expired = isPast(m.date);
              const [month, day] = m.date.split(' ');

              return (
                <div key={m._id} className={`pro-card ${expired ? 'expired' : ''}`}>
                  
                  {/* Date Block */}
                  <div className="date-box">
                    <div style={{ fontSize: '11px', fontWeight: 800, color: T.accent, textTransform: 'uppercase' }}>{month}</div>
                    <div className="syne-font" style={{ fontSize: '28px', fontWeight: 800, color: T.textMain, lineHeight: 1, marginTop: 4 }}>{day}</div>
                  </div>

                  {/* Info Block */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                       <div className="status-pill" style={{ color: expired ? T.red : info.color, background: expired ? "rgba(239, 68, 68, 0.1)" : info.bg }}>
                          {expired ? <AlertCircle size={11}/> : info.icon} {expired ? "EXPIRED" : info.label}
                       </div>
                       <span style={{ fontSize: '9px', color: T.textSub, opacity: 0.5, fontWeight: 700 }}>ID: {m._id.slice(-6).toUpperCase()}</span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px', color: '#fff' }}>
                        {m.exhibitorId?.shopName || "Private Exhibitor"}
                    </h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: T.textSub, fontSize: '13px', fontWeight: 500 }}>
                          <MapPin size={14} color={T.accent} /> {m.expoId?.title}
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: T.textMain, fontSize: '13px', fontWeight: 600 }}>
                          <Clock size={14} color={T.accent} /> {m.time}
                       </div>
                    </div>
                  </div>

                  {/* Note Preview */}
                  {m.note && (
                    <div style={{ maxWidth: '180px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: `1px solid ${T.border}`, display: {xs: 'none', md: 'block'} }}>
                        <p style={{ fontSize: '11px', color: T.textSub, fontStyle: 'italic', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{m.note}"</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button className="delete-btn" onClick={(e) => handleDelete(e, m._id)}>
                        <Trash2 size={18} />
                    </button>
                    <ChevronRight size={18} style={{ color: T.textSub, opacity: 0.3 }} />
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}