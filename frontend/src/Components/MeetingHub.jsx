import React, { useState, useEffect } from "react";
import axios from "axios";

// ─── DESIGN TOKENS — matches AttendeeExpoDetails ─────────────
const T = {
  bg:           "#080A0C",
  paper:        "#0E1116",
  paperAlt:     "#131820",
  accent:       "#00b8d1",
  accentDim:    "rgba(0,184,209,0.10)",
  accentBorder: "rgba(0,184,209,0.25)",
  accentGlow:   "rgba(0,184,209,0.30)",
  border:       "rgba(255,255,255,0.06)",
  borderHov:    "rgba(255,255,255,0.12)",
  text:         "#E8EAF0",
  muted:        "#4A5568",
  mutedLight:   "#64748B",
  green:        "#22C55E",
  greenDim:     "rgba(34,197,94,0.10)",
  red:          "#F87171",
};

// ─── LOCATION HELPER (logic untouched) ───────────────────────
const formatLocation = (loc, fallback = "Convention Center") => {
  if (!loc) return fallback;
  if (typeof loc === "object") {
    return [loc.venue, loc.city, loc.address].filter(Boolean).join(", ") || fallback;
  }
  return loc || fallback;
};

// ─── GLOBAL STYLES ────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: ${T.bg};
      font-family: 'Outfit', sans-serif;
      color: ${T.text};
      -webkit-font-smoothing: antialiased;
    }

    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${T.accentBorder}; border-radius: 4px; }

    /* ── EXPO CARDS ── */
    .mh-card {
      background: ${T.paper};
      border: 1px solid ${T.border};
      border-radius: 20px;
      transition: border-color 0.22s, transform 0.22s, box-shadow 0.22s;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }
    .mh-card:hover {
      border-color: ${T.accentBorder};
      transform: translateY(-5px);
      box-shadow: 0 20px 48px rgba(0,0,0,0.55);
    }
    .mh-card.selected {
      border-color: ${T.accent};
      background: rgba(0,184,209,0.05);
      box-shadow: 0 0 0 1px ${T.accent}, 0 20px 48px -8px ${T.accentGlow};
    }

    /* ── SHOP CARDS ── */
    .mh-shop-card {
      background: ${T.paper};
      border: 1px solid ${T.border};
      border-radius: 18px;
      transition: border-color 0.22s, transform 0.22s, box-shadow 0.22s;
      cursor: pointer;
      overflow: hidden;
    }
    .mh-shop-card:hover {
      border-color: ${T.accentBorder};
      transform: translateY(-4px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.5);
    }
    .mh-shop-card.selected {
      border-color: ${T.accent};
      background: rgba(0,184,209,0.05);
    }

    /* ── FORM INPUTS ── */
    .mh-input {
      width: 100%;
      background: ${T.bg};
      border: 1px solid ${T.border};
      border-radius: 12px;
      padding: 13px 16px;
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
      font-weight: 400;
      color: ${T.text};
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      color-scheme: dark;
    }
    .mh-input::placeholder { color: ${T.muted}; }
    .mh-input:focus {
      border-color: ${T.accent};
      box-shadow: 0 0 0 3px ${T.accentDim};
    }
    textarea.mh-input {
      resize: none;
      min-height: 110px;
      line-height: 1.6;
    }

    /* ── SUBMIT BUTTON ── */
    .mh-submit {
      width: 100%;
      padding: 15px 28px;
      background: ${T.accent};
      border: none;
      border-radius: 13px;
      color: #fff;
      font-family: 'Outfit', sans-serif;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.02em;
      cursor: pointer;
      transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 8px 28px -6px ${T.accentGlow};
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .mh-submit:hover:not(:disabled) {
      background: #009db3;
      transform: translateY(-2px);
      box-shadow: 0 16px 40px -8px ${T.accentGlow};
    }
    .mh-submit:disabled { opacity: 0.5; cursor: not-allowed; }

    /* ── BACK BUTTON ── */
    .mh-back {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: rgba(255,255,255,0.03);
      border: 1px solid ${T.border};
      border-radius: 10px;
      padding: 8px 16px;
      color: ${T.muted};
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.2s, border-color 0.2s, background 0.2s;
    }
    .mh-back:hover {
      color: ${T.text};
      border-color: ${T.borderHov};
      background: rgba(255,255,255,0.05);
    }

    /* ── STEPPER ── */
    .mh-step-line {
      flex: 1;
      height: 1px;
      min-width: 20px;
      max-width: 60px;
      margin: 0 10px;
      transition: background 0.4s;
    }

    /* ── LABEL ── */
    .mh-label {
      display: block;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.16em;
      color: ${T.muted};
      text-transform: uppercase;
      margin-bottom: 9px;
      font-family: 'Outfit', sans-serif;
    }

    /* ── GRID ── */
    .mh-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 600px) { .mh-grid-2 { grid-template-columns: 1fr; } }

    /* ── ANIMATIONS ── */
    .mh-fade {
      animation: mhFadeUp 0.4s cubic-bezier(0.23,1,0.32,1) both;
    }
    @keyframes mhFadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .mh-spin {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.25);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── BADGE ── */
    .mh-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: ${T.accentDim};
      border: 1px solid ${T.accentBorder};
      border-radius: 7px;
      padding: 4px 10px;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.14em;
      color: ${T.accent};
      text-transform: uppercase;
      font-family: 'Outfit', sans-serif;
    }

    .mh-mono {
      font-family: 'JetBrains Mono', monospace;
    }
  `}</style>
);

// ─── SVG ICONS ────────────────────────────────────────────────
const Ico = {
  ArrowLeft: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" style={{transform:"scaleX(-1)",transformOrigin:"center"}}/>
    </svg>
  ),
  Check: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Clock: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Message: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Map: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Building: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  Send: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Info: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
};

// ─── STEPPER ──────────────────────────────────────────────────
function MHStepper({ active }) {
  const steps = ["Select Expo", "Select Exhibitor", "Schedule Meeting"];
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {steps.map((label, i) => (
        <React.Fragment key={i}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
              background: i < active ? T.green : i === active ? T.accent : "rgba(255,255,255,0.06)",
              border: i === active ? `2px solid ${T.accent}` : "2px solid transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, fontFamily: "'Outfit', sans-serif",
              color: i <= active ? "#fff" : T.muted,
              transition: "all 0.35s",
              boxShadow: i === active ? `0 0 14px ${T.accentGlow}` : "none",
            }}>
              {i < active ? <Ico.Check /> : i + 1}
            </div>
            <span style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 12, fontWeight: i === active ? 600 : 400,
              color: i === active ? T.text : i < active ? T.green : T.muted,
              whiteSpace: "nowrap", transition: "color 0.35s",
            }}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="mh-step-line" style={{
              background: i < active
                ? `linear-gradient(90deg, ${T.green}, ${T.accent})`
                : T.border,
            }}/>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── LOADER ───────────────────────────────────────────────────
const Loader = () => (
  <div style={{
    minHeight: "100vh", background: T.bg,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 16,
  }}>
    <GlobalStyle />
    <div style={{
      width: 36, height: 36, borderRadius: "50%",
      border: `3px solid ${T.border}`,
      borderTopColor: T.accent,
      animation: "spin 0.8s linear infinite",
    }}/>
    <p style={{ fontFamily: "'Outfit', sans-serif", color: T.muted, fontSize: 14 }}>
      Loading registrations...
    </p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ─── TOAST ────────────────────────────────────────────────────
function Toast({ open, msg, severity, onClose }) {
  useEffect(() => {
    if (open) { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }
  }, [open]);
  if (!open) return null;
  const isSuccess = severity === "success";
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: isSuccess ? T.greenDim : "rgba(248,113,113,0.1)",
      border: `1px solid ${isSuccess ? "rgba(34,197,94,0.3)" : "rgba(248,113,113,0.3)"}`,
      borderRadius: 14, padding: "13px 20px",
      display: "flex", alignItems: "center", gap: 10,
      backdropFilter: "blur(20px)",
      boxShadow: "0 20px 48px rgba(0,0,0,0.5)",
      animation: "mhFadeUp 0.3s ease",
    }}>
      <div style={{
        width: 7, height: 7, borderRadius: "50%",
        background: isSuccess ? T.green : T.red, flexShrink: 0,
      }}/>
      <span style={{
        color: isSuccess ? T.green : T.red,
        fontSize: 13, fontFamily: "'Outfit', sans-serif", fontWeight: 500,
      }}>
        {isSuccess ? "Meeting request sent successfully." : msg}
      </span>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function MeetingHub() {
  // ── ALL LOGIC IDENTICAL — zero changes ──
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [activeStep, setActiveStep]     = useState(0);
  const [registrations, setRegistrations] = useState([]);
  const [selectedReg, setSelectedReg]   = useState(null);
  const [shops, setShops]               = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [booking, setBooking]           = useState(false);
  const [meetingData, setMeetingData]   = useState({ date: "", time: "", note: "" });
  const [snackbar, setSnackbar]         = useState({ open: false, msg: "", severity: "success" });

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/expo/my-registrations/${user.id || user._id}`);
        setRegistrations(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, [user.id, user._id]);

  const handleExpoSelect = async (reg) => {
    setSelectedReg(reg);
    setActiveStep(1);
    try {
      const expoId = reg.expoId?._id || reg.expoId;
      const [showcasesRes, expoRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/events/all-showcases`),
        axios.get(`http://localhost:5000/api/expo/get-expo/${expoId}`),
      ]);
      const layout = expoRes.data?.booths?.layout || [];
      const filteredShops = showcasesRes.data
        .filter((s) => {
          const sExpoId = s.expoId?._id || s.expoId;
          return sExpoId?.toString() === expoId?.toString();
        })
        .map((shop) => {
          const matchedBooth  = layout.find((b) => b.exhibitorId && b.exhibitorId.toString() === shop.exhibitorId?.toString());
          const fallbackBooth = layout.find((b) => b.id && b.id.toString() === shop.boothNumber?.toString());
          const correctBoothId = matchedBooth?.id || fallbackBooth?.id || shop.boothNumber;
          return { ...shop, correctBoothId };
        });
      setShops(filteredShops);
    } catch (err) {
      console.error("handleExpoSelect Error:", err);
    }
  };

  const handleShopSelect = (shop) => {
    setSelectedShop(shop);
    setActiveStep(2);
  };

 const handleBookMeeting = async () => {
  setBooking(true);
try {
  const res = await axios.post(`http://localhost:5000/api/meetings/book`, {
    userId: user.id || user._id,
    shopId: selectedShop._id,
    expoId: selectedReg?.expoId?._id || selectedReg?.expoId,
    ...meetingData,
  });

  console.log("✅ Booking response:", res.status, res.data); // YEH DEKHO

    // ✅ Booking kamyab — ab tracking calls alag try mein
    try {
      const eId = selectedReg?.expoId?._id || selectedReg?.expoId;
      const bId = selectedShop.correctBoothId;
      await axios.put(`http://localhost:5000/api/expo/track-lead/${eId}/${bId}`);
      await axios.put(`http://localhost:5000/api/expo/track-query/${eId}/${bId}`);
    } catch (trackErr) {
      console.warn("Tracking failed (non-critical):", trackErr.message);
      // Silent fail — user ko disturb nahi karna
    }

    // ✅ Yahan pahunch gaye = booking confirmed
    setSnackbar({ open: true, msg: "Meeting booked!", severity: "success" });
    setActiveStep(0);
    setSelectedReg(null);
    setSelectedShop(null);
    setMeetingData({ date: "", time: "", note: "" });

  } catch (err) {
    // ❌ Sirf tab aaye jab booking khud fail ho
    console.error("Booking Error:", err.response?.data || err.message);
    setSnackbar({ open: true, msg: "Booking failed.", severity: "error" });
  } finally {
    setBooking(false);
  }
};

  if (loading) return <Loader />;

  // ── UI ──
  return (
    <>
      <GlobalStyle />
      <Toast
        open={snackbar.open} msg={snackbar.msg} severity={snackbar.severity}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />

      {/* Subtle bg glow */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `radial-gradient(ellipse 60% 40% at 80% 10%, rgba(0,184,209,0.05) 0%, transparent 70%),
                     radial-gradient(ellipse 50% 30% at 10% 90%, rgba(0,184,209,0.03) 0%, transparent 70%)`,
      }}/>

      <div style={{ minHeight: "100vh", background: T.bg, position: "relative", zIndex: 1 }}>

        {/* ── HEADER ──────────────────────────────────────────── */}
        <div style={{
          borderBottom: `1px solid ${T.border}`,
          background: "rgba(8,10,12,0.85)",
          backdropFilter: "blur(20px)",
          position: "sticky", top: 0, zIndex: 100,
        }}>
          <div style={{
            maxWidth: 1100, margin: "0 auto",
            padding: "18px 32px",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 16, flexWrap: "wrap",
          }}>
            {/* Logo + title */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: T.accentDim,
                border: `1.5px solid ${T.accentBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: T.accent,
              }}>
                <Ico.Users />
              </div>
              <div>
                <div style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 17, fontWeight: 800, color: T.text, lineHeight: 1.1,
                  letterSpacing: "-0.3px",
                }}>
                  Meeting Hub
                </div>
                <div style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 11, color: T.muted, marginTop: 1, fontWeight: 400,
                }}>
                  B2B Connection Platform
                </div>
              </div>
            </div>

            <MHStepper active={activeStep} />
          </div>
        </div>

        {/* ── CONTENT ─────────────────────────────────────────── */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px 80px" }}>

          {/* ── STEP 1: EXPO SELECTION ── */}
          {activeStep === 0 && (
            <div className="mh-fade">
              {/* Page heading */}
              <div style={{ marginBottom: 36 }}>
                <span className="mh-badge" style={{ marginBottom: 14, display: "inline-flex" }}>
                  <Ico.Building /> Your Registrations
                </span>
                <h1 style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "clamp(26px, 4vw, 38px)",
                  fontWeight: 900, color: T.text,
                  letterSpacing: "-1px", lineHeight: 1.15, marginBottom: 10,
                }}>
                  Select an Expo
                  <br />
                  <span style={{ color: T.accent }}>to get started</span>
                </h1>
                <p style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 14, color: T.muted, maxWidth: 400, lineHeight: 1.65,
                }}>
                  Choose one of your registered expos to discover exhibitors and schedule B2B meetings.
                </p>
              </div>

              {registrations.length === 0 ? (
                <div style={{
                  background: T.paper, border: `1px dashed ${T.border}`,
                  borderRadius: 20, padding: "60px 40px", textAlign: "center",
                }}>
                  <p style={{ color: T.muted, fontFamily: "'Outfit', sans-serif", fontSize: 14 }}>
                    No registrations found. Register for an expo first.
                  </p>
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: 18,
                }}>
                  {registrations.map((reg) => (
                    <div
                      key={reg._id}
                      className={`mh-card${selectedReg?._id === reg._id ? " selected" : ""}`}
                      onClick={() => handleExpoSelect(reg)}
                      style={{ padding: 26 }}
                    >
                      {/* Top accent line */}
                      <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, height: 2,
                        background: `linear-gradient(90deg, ${T.accent}, rgba(0,184,209,0.2))`,
                        borderRadius: "20px 20px 0 0",
                      }}/>

                      <div style={{
                        display: "flex", justifyContent: "space-between",
                        alignItems: "flex-start", marginBottom: 18, marginTop: 6,
                      }}>
                        <span className="mh-badge">2025 Edition</span>
                        <div style={{
                          width: 30, height: 30, borderRadius: 8,
                          background: T.accentDim, border: `1px solid ${T.accentBorder}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: T.accent, fontSize: 13,
                        }}>→</div>
                      </div>

                      <h3 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 19, fontWeight: 800, color: T.text,
                        lineHeight: 1.25, marginBottom: 7,
                      }}>
                        {reg.expoId?.title || "Expo Event"}
                      </h3>
                      <p style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 13, color: T.muted, lineHeight: 1.55, marginBottom: 18,
                      }}>
                        {reg.expoId?.description?.slice(0, 70) || "International business exhibition"}...
                      </p>

                      <div style={{
                        display: "flex", alignItems: "center", gap: 6,
                        color: T.muted, paddingTop: 14,
                        borderTop: `1px solid ${T.border}`,
                      }}>
                        <Ico.Map />
                        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12 }}>
                          {formatLocation(reg.expoId?.location, "Convention Center, NY")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: EXHIBITOR SELECTION ── */}
          {activeStep === 1 && (
            <div className="mh-fade">
              <button className="mh-back" onClick={() => setActiveStep(0)} style={{ marginBottom: 28 }}>
                <Ico.ArrowLeft /> Back to Expos
              </button>

              {/* Context bar */}
              <div style={{
                background: T.accentDim, border: `1px solid ${T.accentBorder}`,
                borderRadius: 14, padding: "14px 20px",
                display: "flex", alignItems: "center", gap: 14,
                marginBottom: 36, maxWidth: 460,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                  background: T.accent,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff",
                }}>
                  <Ico.Building />
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 9, fontWeight: 800, letterSpacing: "0.14em",
                    color: T.accent, textTransform: "uppercase", marginBottom: 3,
                  }}>
                    Selected Expo
                  </div>
                  <div style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 14, fontWeight: 600, color: T.text,
                  }}>
                    {selectedReg?.expoId?.title}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 32 }}>
                <h1 style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "clamp(24px, 4vw, 34px)",
                  fontWeight: 900, color: T.text,
                  letterSpacing: "-0.8px", lineHeight: 1.2, marginBottom: 8,
                }}>
                  Choose Your{" "}
                  <span style={{ color: T.accent }}>Business Partner</span>
                </h1>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: T.muted }}>
                  {shops.length} exhibitor{shops.length !== 1 ? "s" : ""} available at this expo
                </p>
              </div>

              {shops.length === 0 ? (
                <div style={{
                  background: T.paper, border: `1px dashed ${T.border}`,
                  borderRadius: 20, padding: "60px 40px", textAlign: "center",
                }}>
                  <p style={{ color: T.muted, fontFamily: "'Outfit', sans-serif", fontSize: 14 }}>
                    No exhibitors found for this expo.
                  </p>
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: 16,
                }}>
                  {shops.map((shop) => (
                    <div
                      key={shop._id}
                      className={`mh-shop-card${selectedShop?._id === shop._id ? " selected" : ""}`}
                      onClick={() => handleShopSelect(shop)}
                      style={{ padding: 22 }}
                    >
                      <div style={{
                        display: "flex", flexDirection: "column",
                        alignItems: "center", textAlign: "center", gap: 14,
                      }}>
                        {/* Avatar */}
                        <div style={{
                          width: 58, height: 58, borderRadius: 16, flexShrink: 0,
                          background: T.accentDim,
                          border: `1.5px solid ${T.accentBorder}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: 22, fontWeight: 800, color: T.accent,
                        }}>
                          {shop.shopName?.[0]?.toUpperCase() || "S"}
                        </div>

                        <div>
                          <h3 style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 6,
                          }}>
                            {shop.shopName}
                          </h3>
                          <span style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: 10, color: T.muted,
                            background: "rgba(255,255,255,0.04)",
                            border: `1px solid ${T.border}`,
                            padding: "3px 10px", borderRadius: 20,
                          }}>
                            {shop.category || "Tech Exhibitor"}
                          </span>
                        </div>

                        <div style={{ width: "100%", height: 1, background: T.border }}/>

                        <div style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: 12, fontWeight: 600, color: T.accent,
                        }}>
                          Schedule Meeting
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: SCHEDULING FORM ── */}
          {activeStep === 2 && selectedShop && (
            <div className="mh-fade" style={{ maxWidth: 640, margin: "0 auto" }}>
              <button className="mh-back" onClick={() => setActiveStep(1)} style={{ marginBottom: 28 }}>
                <Ico.ArrowLeft /> Back to Exhibitors
              </button>

              <div style={{
                background: T.paper,
                border: `1px solid ${T.accentBorder}`,
                borderRadius: 22,
                overflow: "hidden",
                boxShadow: `0 0 60px rgba(0,184,209,0.06)`,
              }}>

                {/* Form header */}
                <div style={{
                  padding: "30px 32px 26px",
                  borderBottom: `1px solid ${T.border}`,
                  position: "relative",
                }}>
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 2,
                    background: `linear-gradient(90deg, ${T.accent}, rgba(0,184,209,0.2))`,
                  }}/>

                  <span className="mh-badge" style={{ marginBottom: 14, display: "inline-flex" }}>
                    <Ico.Calendar /> Appointment Request
                  </span>

                  <h2 style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 24, fontWeight: 900, color: T.text,
                    lineHeight: 1.2, marginBottom: 12,
                    letterSpacing: "-0.5px",
                  }}>
                    Schedule with{" "}
                    <span style={{ color: T.accent }}>{selectedShop.shopName}</span>
                  </h2>

                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: T.muted }}>
                      <Ico.Building />
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12 }}>
                        {selectedReg?.expoId?.title}
                      </span>
                    </div>
                    <div style={{ width: 1, height: 12, background: T.border }}/>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: T.muted }}>
                      <Ico.Map />
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12 }}>
                        {formatLocation(selectedReg?.expoId?.location)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form body */}
                <div style={{ padding: "32px" }}>
                  <div className="mh-grid-2" style={{ marginBottom: 20 }}>
                    <div>
                      <label className="mh-label">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        className="mh-input"
                        value={meetingData.date}
                        onChange={(e) => setMeetingData({ ...meetingData, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="mh-label">
                        Preferred Time
                      </label>
                      <input
                        type="time"
                        className="mh-input"
                        value={meetingData.time}
                        onChange={(e) => setMeetingData({ ...meetingData, time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label className="mh-label">
                      Conversation Topic
                    </label>
                    <textarea
                      className="mh-input"
                      placeholder="Briefly describe what you'd like to discuss — products, partnerships, demos..."
                      value={meetingData.note}
                      onChange={(e) => setMeetingData({ ...meetingData, note: e.target.value })}
                    />
                  </div>

                  {/* Info notice */}
                  <div style={{
                    background: T.accentDim, border: `1px solid ${T.accentBorder}`,
                    borderRadius: 12, padding: "13px 16px",
                    display: "flex", gap: 10, alignItems: "flex-start",
                    marginBottom: 28,
                  }}>
                    <div style={{ color: T.accent, marginTop: 1, flexShrink: 0 }}>
                      <Ico.Info />
                    </div>
                    <p style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 13, color: T.accent, lineHeight: 1.55, opacity: 0.85,
                    }}>
                      Your request will be sent to <strong>{selectedShop.shopName}</strong>. They'll confirm within 24 hours via email.
                    </p>
                  </div>

                  <button
                    className="mh-submit"
                    onClick={handleBookMeeting}
                    disabled={booking || !meetingData.date || !meetingData.time}
                  >
                    {booking ? (
                      <>
                        <span className="mh-spin"/>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Ico.Send />
                        Send Meeting Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}