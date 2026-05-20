import React, { useState, useEffect } from "react";
import { Box, Typography, Stack, Button, Avatar, Chip, CircularProgress } from "@mui/material";
import { LayersOutlined as ExpoIcon, PeopleOutlined as PeopleIcon, PendingActionsOutlined as PendingIcon, StorefrontOutlined as ShowcaseIcon, Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const T = {
  bg: "#05070A",
  card: "#0D1117",
  accent: "#38bdf8",
  border: "rgba(255,255,255,0.07)",
  sub: "#64748B",
};

const StatCard = ({ label, value, sub, icon, color, onClick }) => (
  <Box onClick={onClick} sx={{
    bgcolor: T.card, border: `1px solid ${T.border}`, borderRadius: "20px",
    p: "24px", cursor: "pointer", transition: "all 0.2s ease-in-out",
    height: '100%',
    "&:hover": { borderColor: color, transform: 'translateY(-4px)', bgcolor: 'rgba(255,255,255,0.02)' }
  }}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Box>
        <Typography sx={{ color: T.sub, fontSize: "11px", fontWeight: 600, letterSpacing: 1, mb: 1, textTransform: 'uppercase' }}>{label}</Typography>
        <Typography sx={{ color: "#fff", fontSize: "32px", fontWeight: 900, lineHeight: 1, mb: 1 }}>{value}</Typography>
        <Typography sx={{ color, fontSize: "11px", fontWeight: 700 }}>{sub}</Typography>
      </Box>
      <Box sx={{ width: 42, height: 42, borderRadius: "12px", bgcolor: `${color}15`, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </Box>
    </Stack>
  </Box>
);

export default function HomeDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "Admin" });
  const [loading, setLoading] = useState(true);
  const [expos, setExpos] = useState([]);
  const [pendingApps, setPendingApps] = useState([]);
  const [showcases, setShowcases] = useState([]);
  const [totalAttendees, setTotalAttendees] = useState(0); // Attendee count state

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s && s !== "undefined") { const p = JSON.parse(s); if (p?.name) setUser(p); }
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // FIX 1: Added 'attendeeRes' in destructuring
      const [expoRes, appRes, showcaseRes, attendeeRes] = await Promise.all([
        axios.get("http://localhost:5000/api/expo/all-expos"),
        axios.get("http://localhost:5000/api/expo/pending-applications"),
        axios.get("http://localhost:5000/api/events/all-showcases"),
        axios.get("http://localhost:5000/api/auth/attendee-stats"), // This needs the backend route I told you
      ]);

      setExpos(expoRes.data || []);
      setPendingApps(appRes.data || []);
      setShowcases(showcaseRes.data || []);
      
      // FIX 2: Set the attendee count state
      setTotalAttendees(attendeeRes.data.totalAttendees || 0);

    } catch (err) { 
      console.error("Fetch Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const activeExpos = expos.filter(e => e.status === "active").length;

  const statusColor = (s) =>
    s === "active" ? { bg: "rgba(74,222,128,0.12)", color: "#4ade80" } :
    s === "completed" ? { bg: "rgba(148,163,184,0.12)", color: "#94A3B8" } :
    { bg: "rgba(251,191,36,0.12)", color: "#fbbf24" };

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <CircularProgress sx={{ color: T.accent }} />
    </Box>
  );

  return (
    <Box sx={{ width: "100%", color: "#fff", px: 1 }}>

      {/* ROW 1: WELCOME */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography sx={{ color: "#fff", fontSize: "28px", fontWeight: 900 }}>
            Welcome back, <span style={{ color: T.accent }}>{user?.name || "Administrator"}</span>
          </Typography>
          <Typography sx={{ color: T.sub, fontSize: "14px" }}>Dashboard Overview</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/admin/expo/create")} sx={{ bgcolor: T.accent, color: "#000", fontWeight: 800, borderRadius: "12px", textTransform: "none" }}>
          Create New Expo
        </Button>
      </Box>

      {/* ROW 2: STATS */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 3, mb: 4 }}>
        <StatCard label="Total Expos" value={expos.length} sub={`${activeExpos} Active`} color={T.accent} icon={<ExpoIcon />} onClick={() => navigate("/admin/expo/manage")} />
        
        {/* FIX 3: Changed 'value' to totalAttendees */}
        <StatCard label="Attendees" value={totalAttendees} sub="Registered Visitors" color="#4ade80" icon={<PeopleIcon />} onClick={() => navigate("/admin/attendees")} />
        
        <StatCard label="Pending Requests" value={pendingApps.length} sub="Exhibitors" color="#fbbf24" icon={<PendingIcon />} onClick={() => navigate("/admin/exhibitors/requests")} />
        <StatCard label="Live Showcases" value={showcases.length} sub="Active Booths" color="#f87171" icon={<ShowcaseIcon />} onClick={() => navigate("/admin/exhibitors/booths")} />
      </Box>

      {/* ROW 3: LISTS */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
        <Box sx={{ bgcolor: T.card, border: `1px solid ${T.border}`, borderRadius: "24px", p: "24px", minHeight: "400px" }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography sx={{ color: "#fff", fontSize: "16px", fontWeight: 800 }}>Incoming Requests</Typography>
            <Button size="small" onClick={() => navigate("/admin/exhibitors/requests")} sx={{ color: T.accent }}>View All</Button>
          </Stack>
          <Stack spacing={1.5}>
            {pendingApps.slice(0, 5).map((app) => (
              <Box key={app._id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, borderRadius: "16px", bgcolor: "rgba(255,255,255,0.02)" }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ width: 40, height: 40, bgcolor: `${T.accent}15`, color: T.accent }}>{app.exhibitorId?.name?.charAt(0)}</Avatar>
                  <Box>
                    <Typography sx={{ color: "#fff", fontSize: "13px", fontWeight: 700 }}>{app.exhibitorId?.organization || app.exhibitorId?.name}</Typography>
                    <Typography sx={{ color: T.sub, fontSize: "11px" }}>{app.expoId?.title}</Typography>
                  </Box>
                </Stack>
                <Typography onClick={() => navigate("/admin/exhibitors/requests")} sx={{ color: T.accent, fontSize: "11px", cursor: "pointer" }}>Manage</Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <Stack spacing={3}>
          <Box sx={{ bgcolor: T.card, border: `1px solid ${T.border}`, borderRadius: "24px", p: "24px" }}>
            <Typography sx={{ color: "#fff", fontSize: "16px", fontWeight: 800, mb: 3 }}>Active Events</Typography>
            {expos.slice(0, 3).map((expo) => (
              <Box key={expo._id} sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography sx={{ color: "#fff", fontSize: "14px" }}>{expo.title}</Typography>
                <Chip label={expo.status} size="small" sx={{ bgcolor: statusColor(expo.status).bg, color: statusColor(expo.status).color }} />
              </Box>
            ))}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}