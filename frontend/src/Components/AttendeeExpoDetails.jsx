import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Box, Typography, Button, Grid, Paper, Stack, Chip, Tabs, Tab,
  Avatar, Divider, CircularProgress, Modal, IconButton, TextField,
  InputAdornment, Tooltip, MenuItem, Badge, Snackbar, Alert
} from "@mui/material";
import {
  Store, Map as MapIcon, Calendar, MapPin, Search,
  ArrowLeft, X, Download, Ticket, QrCode, UserCircle,
  Clock, Bookmark, BookmarkCheck, Bell, BellOff, RefreshCw, Users, Mic, BookOpen, Wrench, Music, LayoutGrid
} from "lucide-react";

// ─── THEME: Deep charcoal + cyan #00b8d1 ─────────────────────────────────────
const T = {
  bg:          "#080A0C",
  paper:       "#0E1116",
  paperAlt:    "#131820",
  accent:      "#00b8d1",
  accentDim:   "rgba(0,184,209,0.10)",
  accentBorder:"rgba(0,184,209,0.25)",
  border:      "rgba(255,255,255,0.06)",
  borderHov:   "rgba(255,255,255,0.12)",
  text:        "#E8EAF0",
  muted:       "#4A5568",
  green:       "#22C55E",
  greenDim:    "rgba(34,197,94,0.1)",
  blue:        "#38BDF8",
  red:         "#F87171",
  orange:      "#FB923C",
  teal:        "#2DD4BF",
};

const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    bgcolor: T.bg, borderRadius: "10px", color: T.text,
    "& fieldset": { borderColor: T.border },
    "&:hover fieldset": { borderColor: T.borderHov },
    "&.Mui-focused fieldset": { borderColor: T.accent },
    "&.Mui-disabled": { opacity: 0.5 },
  },
  "& .MuiSelect-icon": { color: T.muted },
  "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "rgba(255,255,255,0.35)" },
};

const DESIGNATIONS = [
  "Student","Business Professional","Entrepreneur","Researcher",
  "Freelancer","Investor","Journalist","Government Official",
  "Teacher / Educator","Other",
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AttendeeExpoDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [tab, setTab]           = useState(0);
  const [loading, setLoading]   = useState(true);
  const [expo, setExpo]         = useState(null);
  const [shops, setShops]       = useState([]);
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [regData, setRegData]   = useState({
    isRegistered: false, ticketId: "", designation: "", organization: "",
  });
  const [selectedShop, setSelectedShop] = useState(null);
  const [modalOpen, setModalOpen]       = useState(false);
  const [lastUpdated, setLastUpdated]   = useState(new Date());
  const [snackbar, setSnackbar]         = useState({ open: false, msg: "", severity: "success" });

  const startChatting = async () => {
  if (!selectedShop) return;
  
  // Aapke 'Event' model mein field ka naam 'exhibitorId' hai
  const exhibitorId = selectedShop.exhibitorId?._id || selectedShop.exhibitorId;

  if (!exhibitorId) {
    alert("Exhibitor ID not found! Please check if this booth has an owner.");
    return;
  }

  try {
    const res = await axios.post("http://localhost:5000/api/chat/conversation", {
      senderId: user.id || user._id,
      receiverId: exhibitorId, // Sahi ID yahan ja rahi hai
      expoId: id
    });
    // Messages page par bhej dein
    navigate("/attendee/messages", { state: { currentChatId: res.data._id } }); 
  } catch (err) {
    console.error("Chat start failed", err);
    alert("Chat shuru nahi ho saki.");
  }
};

  const fetchData = async () => {
    try {
      const [expoRes, shopsRes, statusRes, sessionsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/expo/get-expo/${id}`),
        axios.get(`http://localhost:5000/api/events/all-showcases`),
        axios.get(`http://localhost:5000/api/expo/registration-status/${user.id || user._id}/${id}`),
        axios.get(`http://localhost:5000/api/schedule/expo/${id}`).catch(() => ({ data: [] })),
      ]);
      setExpo(expoRes.data);
      setShops(shopsRes.data.filter((s) => (s.expoId?._id || s.expoId) === id));
      const ticket = statusRes.data.ticketData;
      setRegData({
        isRegistered: statusRes.data.isRegistered,
        ticketId:     ticket?.ticketId    || "",
        designation:  ticket?.designation || "",
        organization: ticket?.organization|| "",
      });
      setSessions(sessionsRes.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProfile = async (shop) => {
    setSelectedShop(shop);
    setModalOpen(true);
    try {
      await axios.put(`http://localhost:5000/api/expo/track-view/${id}/${shop.boothNumber}`);
    } catch { console.log("View tracking failed"); }
  };

  useEffect(() => { if (id) fetchData(); }, [id, user.id, user._id]);
  useEffect(() => {
    if (!id) return;
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [id]);

  const filteredShops = shops.filter((shop) =>
    shop.shopName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showSnack = (msg, severity = "success") =>
    setSnackbar({ open: true, msg, severity });

  if (loading)
    return (
      <Box sx={{ height: "80vh", display: "flex", justifyContent: "center", alignItems: "center", bgcolor: T.bg }}>
        <CircularProgress sx={{ color: T.accent }} />
      </Box>
    );

  if (!expo) return <Typography sx={{ color: T.text }}>Event not found</Typography>;

  const TAB_ITEMS = [
    { icon: <Store   size={16}/>, label: "Exhibitors" },
    { icon: <MapIcon size={16}/>, label: "Floor Plan" },
    { icon: <Calendar size={16}/>, label: "Schedule" },
    { icon: <Ticket  size={16}/>, label: "My Pass" },
  ];

  return (
    <Box sx={{ color: T.text, width: "100%", pb: 6, bgcolor: T.bg, minHeight: "100vh" }}>

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <Box sx={{
        position: "relative", mb: { xs: 3, md: 5 },
        mx: { xs: -1, sm: -2 }, mt: { xs: -1, sm: -2 },
        background: `linear-gradient(180deg, #0B1118 0%, ${T.bg} 100%)`,
        borderBottom: `1px solid ${T.border}`,
        pb: 0,
      }}>
        {/* Subtle grid texture */}
        <Box sx={{
          position: "absolute", inset: 0, opacity: 0.03,
          backgroundImage: "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}/>

        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: { xs: 2, sm: 3 }, pb: 0, position: "relative" }}>
          {/* Top row */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: { xs: 2, sm: 3 } }}>
            <Button
              onClick={() => navigate(-1)}
              startIcon={<ArrowLeft size={15}/>}
              sx={{
                color: T.muted, textTransform: "none", fontSize: "13px", fontWeight: 600,
                bgcolor: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}`,
                borderRadius: "10px", px: 2, py: 0.8,
                "&:hover": { bgcolor: "rgba(255,255,255,0.06)", color: T.text },
              }}
            >
              Back
            </Button>

            {/* Live badge */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{
              bgcolor: T.greenDim, border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: "10px", px: 1.8, py: 0.7,
            }}>
              <Box sx={{
                width: 6, height: 6, borderRadius: "50%", bgcolor: T.green,
                animation: "lp 2s infinite",
                "@keyframes lp": { "0%,100%": { opacity:1 }, "50%": { opacity:0.2 } },
              }}/>
              <Typography sx={{ fontSize: "11px", fontWeight: 800, color: T.green, letterSpacing: 1 }}>LIVE</Typography>
              <Typography sx={{ fontSize: "10px", color: T.muted, display: { xs: "none", sm: "block" } }}>
                {lastUpdated.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}
              </Typography>
              <IconButton onClick={fetchData} size="small" sx={{ color: T.muted, p: 0.3, "&:hover": { color: T.text } }}>
                <RefreshCw size={12}/>
              </IconButton>
            </Stack>
          </Stack>

          {/* Expo title */}
          <Box sx={{ mb: { xs: 2.5, sm: 3.5 } }}>
            <Typography sx={{
              fontSize: "clamp(20px, 5vw, 38px)", fontWeight: 900,
              color: T.text, letterSpacing: "-1px", lineHeight: 1.15, mb: 1.5,
            }}>
              {expo.title}
            </Typography>
            <Stack direction="row" spacing={{ xs: 2, sm: 3 }} flexWrap="wrap" useFlexGap>
              <Stack direction="row" alignItems="center" spacing={0.8}>
                <Calendar size={14} color={T.accent}/>
                <Typography sx={{ fontSize: "13px", color: T.muted, fontWeight: 600 }}>
                  {new Date(expo.startDate).toDateString()}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.8}>
                <MapPin size={14} color={T.accent}/>
                <Typography sx={{ fontSize: "13px", color: T.muted, fontWeight: 600 }}>
                  {typeof expo.location === "object" ? expo.location.city : expo.location}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Tabs — scrollable on mobile */}
          <Box sx={{
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
            mx: { xs: -2, sm: 0 },
            px: { xs: 2, sm: 0 },
          }}>
            <Stack direction="row" spacing={0.5} sx={{ minWidth: "max-content", pb: "1px" }}>
              {TAB_ITEMS.map((item, i) => (
                <Box
                  key={i}
                  onClick={() => setTab(i)}
                  sx={{
                    display: "flex", alignItems: "center", gap: 0.8,
                    px: { xs: 1.8, sm: 2.2 },
                    py: { xs: 1.2, sm: 1.4 },
                    cursor: "pointer", position: "relative",
                    fontSize: { xs: "12px", sm: "13px" }, fontWeight: 700,
                    borderRadius: "12px 12px 0 0",
                    color: tab === i ? T.accent : T.muted,
                    bgcolor: tab === i ? "rgba(28, 154, 174, 0.07)" : "transparent",
                    border: tab === i
                      ? `1px solid ${T.accentBorder}`
                      : "1px solid transparent",
                    borderBottom: tab === i
                      ? `1px solid ${T.bg}`
                      : "1px solid transparent",
                    transition: "all 0.18s",
                    "&:hover": { color: tab === i ? T.accent : T.text },
                    mb: "-1px",
                    whiteSpace: "nowrap",
                    minWidth: { xs: "80px", sm: "unset" },
                    justifyContent: "center",
                    WebkitTapHighlightColor: "transparent",
                    userSelect: "none",
                  }}
                >
                  {item.icon}
                  {item.label}
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* ── CONTENT ────────────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 1.5, sm: 2 } }}>

        {/* TAB 0 – Exhibitors */}
        {tab === 0 && (
          <Box>
            <TextField
              fullWidth
              placeholder="Search exhibitors by name, category or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                mb: 4,
                "& .MuiOutlinedInput-root": {
                  bgcolor: T.paper, borderRadius: "14px", color: T.text,
                  "& fieldset": { borderColor: T.border },
                  "&:hover fieldset": { borderColor: T.borderHov },
                  "&.Mui-focused fieldset": { borderColor: T.accent },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={17} color={T.muted}/>
                  </InputAdornment>
                ),
              }}
            />
            <Grid container spacing={2.5} alignItems="stretch">
              {filteredShops.map((shop) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={shop._id} sx={{ display: "flex" }}>
                  <ExhibitorCard shop={shop} onOpen={() => handleOpenProfile(shop)}/>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* TAB 1 – Floor Plan */}
        {tab === 1 && (
          <Box sx={{ overflowX: "auto" }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3.5 }}>
              <MapIcon size={18} color={T.accent}/>
              <Typography sx={{ fontWeight: 800, color: T.text, fontSize: "17px" }}>
                Digital Floor Plan
              </Typography>
            </Stack>
            <Box sx={{
              display: "grid", gridTemplateColumns: "repeat(10, 1fr)",
              gap: { xs: 0.7, sm: 1.2 }, minWidth: "600px", bgcolor: T.bg,
              p: { xs: 2, sm: 3.5 },
              borderRadius: "16px", border: `1px solid ${T.border}`,
            }}>
              {[...Array(10)].map((_, r) =>
                [...Array(10)].map((_, c) => {
                  const rowLabel  = String.fromCharCode(65 + r);
                  const colLabel  = (c + 1).toString().padStart(2, "0");
                  const displayCode = `${rowLabel}-${colLabel}`;
                  const booth = expo.booths?.layout?.find(
                    (b) => b.code === displayCode || b.id?.includes(displayCode)
                  );
                  return (
                    <Tooltip key={displayCode} title={booth ? `Full ID: ${booth.id}` : "Path"}>
                      <Box sx={{
                        height: { xs: 60, sm: 90 }, borderRadius: "10px",
                        cursor: booth ? "pointer" : "default",
                        bgcolor: booth
                          ? booth.status === "reserved"
                            ? "rgba(248,113,113,0.80)"
                            : "rgba(0,184,209,0.75)"
                          : "rgba(255,255,255,0.018)",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        transition: "0.2s",
                        border: booth ? "none" : `1px dashed rgba(255,255,255,0.04)`,
                        "&:hover": { transform: booth ? "scale(1.08)" : "none", zIndex: 10 },
                      }}>
                        {booth && (
                          <>
                            <Typography sx={{ fontSize: { xs: "8px", sm: "10px" }, fontWeight: 900, color: "#000" }}>{displayCode}</Typography>
                            <Typography sx={{ fontSize: { xs: "7px", sm: "8px" }, fontWeight: 800, color: "#000", mt: 0.4 }}>{booth.id?.slice(-11)}</Typography>
                            <Typography sx={{
                              fontSize: { xs: "7px", sm: "9px" }, fontWeight: 800, color: "#000",
                              textAlign: "center", px: 0.5, mt: 0.8,
                              overflow: "hidden", textOverflow: "ellipsis",
                              maxWidth: "100%", lineHeight: 1,
                            }}>
                              {booth.companyName || "Available"}
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Tooltip>
                  );
                })
              )}
            </Box>

            {/* Legend */}
            <Stack direction="row" spacing={{ xs: 2, sm: 3 }} sx={{ mt: 2.5 }} flexWrap="wrap" useFlexGap>
              {[
                { color: "rgba(0,184,209,0.75)",   label: "Available Booth" },
                { color: "rgba(248,113,113,0.85)", label: "Reserved" },
                { color: "rgba(255,255,255,0.018)", label: "Aisle / Path" },
              ].map((l) => (
                <Stack key={l.label} direction="row" alignItems="center" spacing={0.8}>
                  <Box sx={{ width: 12, height: 12, borderRadius: "4px", bgcolor: l.color, border: `1px solid ${T.border}` }}/>
                  <Typography sx={{ fontSize: "11px", color: T.muted, fontWeight: 600 }}>{l.label}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}

        {/* TAB 2 – Schedule */}
        {tab === 2 && (
          <ScheduleTab
            sessions={sessions} user={user} expoId={id}
            showSnack={showSnack} onRefresh={fetchData}
          />
        )}

        {/* TAB 3 – My Pass */}
        {tab === 3 && (
          <MyPassTab expo={expo} user={user} regData={regData} setRegData={setRegData}/>
        )}
      </Box>

      {/* ── EXHIBITOR MODAL ─────────────────────────────────────────── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90vw", sm: 440 },
          maxHeight: "90vh", overflowY: "auto",
          bgcolor: T.paper, borderRadius: "24px",
          p: { xs: 3, sm: 4 }, border: `1px solid ${T.accentBorder}`,
          color: T.text, outline: "none",
          boxShadow: `0 0 60px rgba(245,166,35,0.08)`,
        }}>
          {selectedShop && (
            <>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
                <Chip
                  label="Verified Exhibitor"
                  size="small"
                  sx={{ bgcolor: T.accentDim, color: T.accent, fontWeight: 800, fontSize: "11px" }}
                />
                <IconButton onClick={() => setModalOpen(false)} sx={{ color: T.muted, "&:hover": { color: T.text } }}>
                  <X size={18}/>
                </IconButton>
              </Stack>

              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Avatar sx={{
                  width: 76, height: 76, mx: "auto", mb: 2,
                  bgcolor: T.accentDim, color: T.accent,
                  fontSize: "28px", fontWeight: 900,
                  border: `2px solid ${T.accentBorder}`,
                }}>
                  {selectedShop.shopName?.[0]}
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 900, color: T.text }}>
                  {selectedShop.shopName}
                </Typography>
                <Typography sx={{ color: T.accent, fontWeight: 800, fontSize: "12px", letterSpacing: 1.5, mt: 0.4 }}>
                  BOOTH {selectedShop.boothNumber}
                </Typography>
              </Box>

              <Divider sx={{ borderColor: T.border, mb: 3 }}/>

              <Typography sx={{
                color: T.muted, fontSize: "13.5px", lineHeight: 1.7,
                mb: 4, textAlign: "center",
              }}>
                {selectedShop.description ||
                  "This exhibitor is part of the global summit, showcasing their latest industrial innovations and future-ready products."}
              </Typography>

              <Button
                fullWidth variant="contained"
                onClick={startChatting}
                sx={{
                  bgcolor: T.accent, color: "#fff", borderRadius: "12px",
                  py: 1.5, fontWeight: 800, textTransform: "none", fontSize: "14px",
                  "&:hover": { bgcolor: "#009db3" },
                }}
              >
                Chat with Exhibitor
              </Button>
            </>
          )}
        </Box>
      </Modal>

      {/* ── SNACKBAR ─────────────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ bgcolor: T.paper, color: T.text, border: `1px solid ${T.border}` }}
        >
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// ─── SCHEDULE TAB ─────────────────────────────────────────────────────────────
function ScheduleTab({ sessions, user, expoId, showSnack, onRefresh }) {
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`bookmarks_${expoId}`) || "[]"); }
    catch { return []; }
  });
  const [filterType,  setFilterType]  = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const saveBookmarks = (arr) => {
    setBookmarks(arr);
    localStorage.setItem(`bookmarks_${expoId}`, JSON.stringify(arr));
  };

  const toggleBookmark = (sessionId, title) => {
    const exists = bookmarks.includes(sessionId);
    const updated = exists ? bookmarks.filter((b) => b !== sessionId) : [...bookmarks, sessionId];
    saveBookmarks(updated);
    showSnack(exists ? `Removed "${title}"` : `"${title}" saved!`);
  };

  const SESSION_TYPES = ["all","speech","seminar","workshop","concert","networking"];

  const typeConfig = {
    speech:     { bg:"rgba(251,146,60,0.12)",  color:"#FB923C", border:"rgba(251,146,60,0.3)",  icon:<Mic size={13}/> },
    seminar:    { bg:"rgba(56,189,248,0.10)",  color:T.blue,    border:"rgba(56,189,248,0.3)",  icon:<BookOpen size={13}/> },
    workshop:   { bg:"rgba(245,166,35,0.12)",  color:T.accent,  border:T.accentBorder,          icon:<Wrench size={13}/> },
    concert:    { bg:"rgba(248,113,113,0.12)", color:T.red,     border:"rgba(248,113,113,0.3)", icon:<Music size={13}/> },
    networking: { bg:"rgba(34,197,94,0.10)",   color:T.green,   border:"rgba(34,197,94,0.3)",   icon:<Users size={13}/> },
  };

  const filterIcons = {
    all: <LayoutGrid size={13}/>, speech: <Mic size={13}/>,
    seminar: <BookOpen size={13}/>, workshop: <Wrench size={13}/>,
    concert: <Music size={13}/>, networking: <Users size={13}/>,
  };

  const filtered = sessions.filter((s) => {
    const matchType   = filterType === "all" || s.type?.toLowerCase() === filterType;
    const matchSearch = s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.speaker?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <Box sx={{ maxWidth: 860, mx: "auto" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
        <Box>
          <Typography sx={{ fontWeight: 900, fontSize: { xs: "17px", sm: "20px" }, color: T.text }}>Event Schedule</Typography>
          <Typography sx={{ color: T.muted, fontSize: "12px", mt: 0.3 }}>
            {filtered.length} session{filtered.length !== 1 ? "s" : ""} available
          </Typography>
        </Box>
        <Button
          onClick={onRefresh}
          startIcon={<RefreshCw size={14}/>}
          size="small"
          sx={{
            color: T.muted, textTransform: "none", fontSize: "12px",
            border: `1px solid ${T.border}`, borderRadius: "10px", px: 2,
            "&:hover": { color: T.text, borderColor: T.borderHov },
          }}
        >
          Refresh
        </Button>
      </Stack>

      <TextField
        fullWidth
        placeholder="Search by topic or speaker..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          mb: 2.5,
          "& .MuiOutlinedInput-root": {
            bgcolor: T.paper, borderRadius: "14px", color: T.text,
            "& fieldset": { borderColor: T.border },
            "&:hover fieldset": { borderColor: T.borderHov },
            "&.Mui-focused fieldset": { borderColor: T.accent },
          },
        }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><Search size={17} color={T.muted}/></InputAdornment>,
        }}
      />

      {/* Filter pills — scrollable on mobile */}
      <Box sx={{
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
        mb: 4,
        mx: { xs: -1.5, sm: 0 },
        px: { xs: 1.5, sm: 0 },
      }}>
        <Stack
          direction="row"
          sx={{
            flexWrap: "nowrap",
            gap: 1,
            minWidth: "max-content",
            pb: "2px",
          }}
        >
          {SESSION_TYPES.map((type) => {
            const isActive = filterType === type;
            return (
              <Box
                key={type}
                onClick={() => setFilterType(type)}
                sx={{
                  display: "flex", alignItems: "center", gap: 0.7,
                  px: { xs: 1.4, sm: 1.8 }, py: { xs: 0.6, sm: 0.7 },
                  borderRadius: "20px", cursor: "pointer",
                  fontWeight: 700, fontSize: "12px", textTransform: "capitalize",
                  transition: "all 0.15s",
                  bgcolor: isActive ? T.accent : T.paper,
                  color:   isActive ? "#000"   : T.muted,
                  border:  `1px solid ${isActive ? T.accent : T.border}`,
                  "&:hover": { borderColor: T.accent, color: isActive ? "#000" : T.accent },
                  whiteSpace: "nowrap",
                  WebkitTapHighlightColor: "transparent",
                  userSelect: "none",
                }}
              >
                {filterIcons[type]}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Box>
            );
          })}
        </Stack>
      </Box>

      <Stack spacing={2}>
        {filtered.length > 0 ? filtered.map((session) => {
          const isBookmarked = bookmarks.includes(session._id);
          const tCfg = typeConfig[session.type?.toLowerCase()] || typeConfig.speech;
          return (
            <Paper key={session._id} sx={{
              p: 0, bgcolor: T.paper, borderRadius: "18px",
              border: `1px solid ${isBookmarked ? T.accent : T.border}`,
              overflow: "hidden", transition: "all 0.2s",
              "&:hover": {
                borderColor: isBookmarked ? T.accent : T.borderHov,
                transform: "translateY(-2px)",
                boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
              },
            }}>
              <Box sx={{ height: "2px", background: tCfg.color, opacity: 0.6 }}/>
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{
                      display: "inline-flex", alignItems: "center", gap: 0.6,
                      px: 1.3, py: 0.45, borderRadius: "20px", mb: 1.5,
                      bgcolor: tCfg.bg, color: tCfg.color,
                      border: `1px solid ${tCfg.border}`,
                      fontSize: "11px", fontWeight: 800, textTransform: "capitalize",
                    }}>
                      {tCfg.icon}
                      {session.type || "Speech"}
                    </Box>
                    <Typography sx={{ fontWeight: 800, mb: 0.5, fontSize: { xs: "14px", sm: "1rem" }, lineHeight: 1.3, color: T.text }}>
                      {session.title}
                    </Typography>
                    {session.description && (
                      <Typography sx={{ color: T.muted, mb: 1.5, fontSize: "13px", lineHeight: 1.6 }}>
                        {session.description}
                      </Typography>
                    )}
                    {/* Info pills — wrap on mobile */}
                    <Stack direction="row" sx={{ mt: 2, flexWrap: "wrap", gap: { xs: 1, sm: 2 } }}>
                      {session.date && (
                        <InfoPill icon={<Calendar size={13} color={T.accent}/>} label={
                          new Date(session.date).toLocaleDateString("en-US",
                            { weekday:"short", month:"short", day:"numeric" })
                        } iconBg={T.accentDim}/>
                      )}
                      <InfoPill icon={<Clock size={13} color={T.blue}/>} label={`${session.startTime} – ${session.endTime}`} iconBg="rgba(56,189,248,0.1)"/>
                      <InfoPill icon={<UserCircle size={13} color={T.green}/>} label={session.speaker} iconBg={T.greenDim}/>
                      <InfoPill icon={<MapPin size={13} color={T.orange}/>} label={session.location} iconBg="rgba(251,146,60,0.1)"/>
                    </Stack>
                  </Box>
                  <IconButton
                    onClick={() => toggleBookmark(session._id, session.title)}
                    sx={{
                      ml: 1.5, mt: 0.5,
                      bgcolor: isBookmarked ? T.accentDim : "rgba(255,255,255,0.03)",
                      color:   isBookmarked ? T.accent    : T.muted,
                      border:  `1px solid ${isBookmarked ? T.accent : T.border}`,
                      transition: "all 0.18s",
                      "&:hover": { bgcolor: T.accentDim, color: T.accent },
                    }}
                  >
                    {isBookmarked ? <BookmarkCheck size={19}/> : <Bookmark size={19}/>}
                  </IconButton>
                </Stack>
              </Box>
            </Paper>
          );
        }) : (
          <Box sx={{ textAlign: "center", py: { xs: 8, sm: 12 }, opacity: 0.35 }}>
            <Calendar size={48} style={{ marginBottom: "14px", color: T.muted }}/>
            <Typography sx={{ fontWeight: 700, color: T.text }}>No sessions found</Typography>
            <Typography sx={{ fontSize: "13px", color: T.muted, mt: 0.5 }}>
              Try changing your filter or search query
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

// ─── HELPER: INFO PILL ────────────────────────────────────────────────────────
function InfoPill({ icon, label, iconBg }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.7}>
      <Box sx={{
        display:"flex", alignItems:"center", justifyContent:"center",
        width: 24, height: 24, borderRadius: "7px", bgcolor: iconBg,
      }}>
        {icon}
      </Box>
      <Typography sx={{ color: T.muted, fontWeight: 600, fontSize: "12px" }}>{label}</Typography>
    </Stack>
  );
}

// ─── MY PASS TAB ─────────────────────────────────────────────────────────────
function MyPassTab({ expo, user, regData, setRegData }) {
  const [designation, setDesignation] = useState(regData.designation || "");
  const [organization, setOrganization] = useState(regData.organization || "");
  const [registering, setRegistering]   = useState(false);
  const ticketRef = useRef(null);

  const handleRegister = async () => {
    if (!designation) { alert("Please select your designation."); return; }
    setRegistering(true);
    try {
      const res = await axios.post("http://localhost:5000/api/expo/register-attendee", {
        attendeeId: user.id || user._id, expoId: expo._id, designation, organization,
      });
      setRegData({ isRegistered: true, ticketId: res.data.ticketId, designation, organization });
    } catch {
      alert("Registration failed. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  const downloadPass = async () => {
    if (!ticketRef.current) return;
    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: "#0E1116", scale: 2, useCORS: true, logging: false,
      });
      const imgData  = canvas.toDataURL("image/png");
      const pdfWidth = 100;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pdf = new jsPDF({ orientation:"p", unit:"mm", format: [pdfWidth, pdfHeight] });
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${(user.name || "pass").replace(/\s+/g, "_")}_ExpoPass.pdf`);
    } catch (err) {
      console.error("PDF export failed", err);
    }
  };

  if (!regData.isRegistered) {
    return (
      <Box sx={{ maxWidth: 440, mx: "auto", px: { xs: 0, sm: 0 } }}>
        <Paper sx={{
          p: { xs: 3, sm: 4 }, bgcolor: T.paper, borderRadius: "22px",
          border: `1px solid ${T.accentBorder}`,
        }}>
          <Typography sx={{ fontWeight: 900, fontSize: "18px", mb: 0.5, color: T.text }}>
            Register for Expo Pass
          </Typography>
          <Typography sx={{ color: T.muted, fontSize: "13px", mb: 3.5 }}>
            Fill in your details to receive your official access pass
          </Typography>
          <Stack spacing={2.5}>
            {[
              { label: "Full Name",  val: user.name  || "", disabled: true  },
              { label: "Email",      val: user.email || "", disabled: true  },
            ].map(({ label, val, disabled }) => (
              <Box key={label}>
                <Typography sx={{ fontSize: "11px", fontWeight: 800, color: T.muted, mb: 0.8, letterSpacing: 0.5 }}>{label}</Typography>
                <TextField fullWidth value={val} disabled={disabled} size="small" sx={fieldStyle}/>
              </Box>
            ))}
            <Box>
              <Typography sx={{ fontSize:"11px", fontWeight:800, color:T.muted, mb:0.8, letterSpacing:0.5 }}>Designation</Typography>
              <TextField
                select fullWidth value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                size="small" sx={fieldStyle}
                SelectProps={{ MenuProps:{ PaperProps:{ sx:{ bgcolor:"#0D1117", color:T.text } } } }}
              >
                {DESIGNATIONS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </TextField>
            </Box>
            <Box>
              <Typography sx={{ fontSize:"11px", fontWeight:800, color:T.muted, mb:0.8, letterSpacing:0.5 }}>Organization</Typography>
              <TextField
                fullWidth value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Company or University" size="small" sx={fieldStyle}
              />
            </Box>
            <Button
              onClick={handleRegister}
              disabled={registering}
              variant="contained"
              sx={{
                bgcolor: T.accent, color: "#fff", borderRadius: "12px",
                py: 1.6, fontWeight: 900, textTransform: "none", fontSize: "15px", mt: 1,
                "&:hover": { bgcolor: "#009db3" },
              }}
            >
              {registering ? <CircularProgress size={21} sx={{ color: "#000" }}/> : "Get My Expo Pass →"}
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  const activeDesig = regData.designation || designation;
  const initials    = (user.name || "?").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const gateDate    = new Date(expo.startDate).toLocaleDateString("en-PK", { day:"2-digit", month:"short", year:"numeric" });

  return (
    <Box sx={{ maxWidth: 390, mx: "auto" }}>
      {/* Confirmed badge */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{
        mb: 2.5, px: 2, py: 1.2, bgcolor: T.greenDim,
        borderRadius: "12px", border: "1px solid rgba(34,197,94,0.2)",
      }}>
        <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: T.green }}/>
        <Typography sx={{ color: T.green, fontWeight: 800, fontSize: "13px" }}>
          Registration Confirmed
        </Typography>
      </Stack>

      {/* ── TICKET ── */}
      <Box ref={ticketRef} sx={{
        borderRadius: "22px", overflow: "hidden",
        bgcolor: T.paper, border: `1px solid ${T.accentBorder}`,
        boxShadow: `0 0 40px rgba(245,166,35,0.07)`,
      }}>
        {/* Ticket header band */}
        <Box sx={{
          background: "linear-gradient(135deg, #007a8a 0%, #009ab0 55%, #00b8d1 100%)",
          p: { xs: "20px 20px 28px", sm: "26px 26px 34px" }, position: "relative",
        }}>
          <Box sx={{
            position: "absolute", top: 18, right: 18,
            bgcolor: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "20px", px: 1.4, py: 0.5,
          }}>
            <Typography sx={{ fontSize: "9.5px", fontWeight: 800, color: "#fff", letterSpacing: 2 }}>ACCESS PASS</Typography>
          </Box>
          <Typography sx={{ fontSize: "9px", fontWeight: 800, letterSpacing: 3.5, color: "rgba(0,0,0,0.4)", mb: 0.8 }}>OFFICIAL ENTRY</Typography>
          <Typography sx={{ fontSize: { xs: "14px", sm: "17px" }, fontWeight: 900, color: "#fff" }}>{expo.title}</Typography>
        </Box>

        {/* Tear line */}
        <Box sx={{ display:"flex", alignItems:"center", mx:"-1px" }}>
          <Box sx={{ width:20, height:20, borderRadius:"50%", bgcolor: T.bg, border:`1px solid ${T.accentBorder}` }}/>
          <Box sx={{ flex:1, borderTop:`2px dashed ${T.accentBorder}` }}/>
          <Box sx={{ width:20, height:20, borderRadius:"50%", bgcolor: T.bg, border:`1px solid ${T.accentBorder}` }}/>
        </Box>

        {/* Attendee info */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{
          px: { xs: 2, sm: 3 }, py: 2.5, borderBottom:`1px dashed rgba(255,255,255,0.06)`,
        }}>
          <Box sx={{
            width:60, height:60, borderRadius:"14px",
            bgcolor: T.accentDim, border:`1.5px solid ${T.accentBorder}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            flexShrink: 0,
          }}>
            <Typography sx={{ fontSize:"21px", fontWeight:900, color:T.accent }}>{initials}</Typography>
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: { xs: "14px", sm: "16px" }, fontWeight:900, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.name}</Typography>
            <Typography sx={{ fontSize:"11px", fontWeight:800, color:T.accent, textTransform:"uppercase", letterSpacing:1 }}>{activeDesig}</Typography>
          </Box>
        </Stack>

        {/* Details grid */}
        <Box sx={{ display:"grid", gridTemplateColumns:"1fr 1fr", px: { xs: 2, sm: 3 } }}>
          {[
            { label:"Ticket ID",  val:regData.ticketId, mono:true   },
            { label:"Gate Date",  val:gateDate                       },
            { label:"Entry Type", val:"General Access", green:true   },
            { label:"Status",     val:"Confirmed",      green:true   },
          ].map((f, i) => (
            <Box key={i} sx={{
              py: 2,
              borderBottom: i < 2 ? `1px solid rgba(255,255,255,0.05)` : "none",
              borderRight:  i % 2 === 0 ? `1px solid rgba(255,255,255,0.05)` : "none",
              pl: i % 2 !== 0 ? 2 : 0,
            }}>
              <Typography sx={{ fontSize:"9px", fontWeight:800, color:"rgba(255,255,255,0.25)", letterSpacing:0.8 }}>
                {f.label}
              </Typography>
              <Typography sx={{
                fontSize: f.mono ? "11px" : "13px", fontWeight:800,
                color: f.green ? T.green : T.text,
                fontFamily: f.mono ? "monospace" : "inherit",
                wordBreak: "break-all",
              }}>
                {f.val}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* QR section */}
        <Stack direction="row" spacing={2.5} alignItems="center" sx={{
          px: { xs: 2, sm: 3 }, py:2.5, borderTop:`1px dashed rgba(255,255,255,0.06)`,
        }}>
          <Box sx={{ bgcolor:"#fff", borderRadius:"10px", p:1, flexShrink: 0 }}>
            <QrCode size={68} color="#1a1a1a"/>
          </Box>
          <Box sx={{ flex:1, minWidth: 0 }}>
            <Typography sx={{ fontSize:"9px", fontWeight:800, color:"rgba(255,255,255,0.25)", letterSpacing:1.5 }}>
              SCAN AT REGISTRATION
            </Typography>
            <Stack direction="row" alignItems="flex-end" spacing="2px" sx={{ mt:1, height:34, flexWrap:"wrap" }}>
              {[36,20,33,16,38,26,36,14,30,38,18,34,23,28,20].map((h, i) => (
                <Box key={i} sx={{
                  width:"3px", height:`${h}px`,
                  bgcolor: T.accentDim.replace("0.12","0.55"),
                  borderRadius:"1px",
                }}/>
              ))}
            </Stack>
          </Box>
        </Stack>

        {/* Disclaimer */}
        <Box sx={{
          px: { xs: 2, sm: 3 }, py:2,
          bgcolor:"rgba(255,255,255,0.018)",
          borderTop:`1px solid rgba(255,255,255,0.05)`,
        }}>
          <Typography sx={{ fontSize:"9.5px", color:"rgba(255,255,255,0.25)", lineHeight:1.6, textAlign:"center" }}>
            This pass is non-transferable and valid for one entry only.
            Present this QR code at the registration desk on the event day.
            Lost passes cannot be replaced — keep this safe.
          </Typography>
        </Box>
      </Box>

      {/* Download button */}
      <Box sx={{ py: 3 }}>
        <Button
          onClick={downloadPass}
          fullWidth variant="contained"
          startIcon={<Download size={16}/>}
          sx={{
            bgcolor: T.accent, color:"#fff", borderRadius:"12px",
            py:1.7, fontWeight:900, textTransform:"none", fontSize:"14px",
            "&:hover": { bgcolor:"#009db3" },
          }}
        >
          Save Pass to Device
        </Button>
      </Box>
    </Box>
  );
}

// ─── EXHIBITOR CARD ───────────────────────────────────────────────────────────
function ExhibitorCard({ shop, onOpen }) {
  return (
    <Paper sx={{
      p: { xs: 2.5, sm: 3 }, bgcolor: T.paper, borderRadius: "20px",
      border: `1px solid ${T.border}`,
      transition: "all 0.22s",
      "&:hover": {
        borderColor: T.accent,
        transform: "translateY(-5px)",
        boxShadow: `0 16px 40px rgba(0,0,0,0.5)`,
      },
      display: "flex", flexDirection: "column",
      width: "100%", minHeight: { xs: "240px", sm: "280px" },
    }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <Avatar sx={{
          bgcolor: T.accentDim, color: T.accent,
          fontWeight: 800, width: 44, height: 44,
          border: `1.5px solid ${T.accentBorder}`,
          fontSize: "16px",
        }}>
          {shop.shopName?.[0]}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography sx={{
            fontWeight: 800, fontSize: "14px", lineHeight: 1.3, color: T.text,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {shop.shopName || "New Exhibitor"}
          </Typography>
          <Typography sx={{ fontSize: "10px", color: T.accent, fontWeight: 800, letterSpacing: 1 }}>
            BOOTH {shop.boothNumber}
          </Typography>
        </Box>
      </Stack>

      <Typography sx={{
        color: T.muted, fontSize: "13px", lineHeight: 1.6,
        flexGrow: 1, overflow: "hidden",
        display: "-webkit-box", WebkitLineClamp: 5,
        WebkitBoxOrient: "vertical",
      }}>
        {shop.description || "Leading innovator in the sector. Click to view their full profile and interaction options."}
      </Typography>

      <Button
        onClick={onOpen}
        fullWidth
        variant="outlined"
        sx={{
          borderColor: T.accentBorder, color: T.accent,
          borderRadius: "11px", fontWeight: 800,
          textTransform: "none", mt: 2, py: 1.1,
          fontSize: "13px", flexShrink: 0,
          "&:hover": { bgcolor: T.accentDim, borderColor: T.accent },
          transition: "all 0.18s",
        }}
      >
        View Profile
      </Button>
    </Paper>
  );
} 