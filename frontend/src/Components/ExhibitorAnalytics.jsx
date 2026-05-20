import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Box, Typography, Paper, Stack, CircularProgress, Chip
} from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";
import { TrendingUp, MessageSquare, Target, Activity, Award, Users } from "lucide-react";

const THEME = {
  bg: "#05070A",
  paper: "#0D1117",
  accent: "#019cb8",
  accentSoft: "rgba(1,156,184,0.08)",
  border: "rgba(255, 255, 255, 0.07)",
  textSecondary: "#64748B",
};

const STAT_COLORS = {
  leads:      { main: "#38bdf8", bg: "rgba(56,189,248,0.08)"  },
  queries:    { main: "#818cf8", bg: "rgba(129,140,248,0.08)" },
  conversion: { main: "#4ade80", bg: "rgba(74,222,128,0.08)"  },
  expos:      { main: "#f87171", bg: "rgba(248,113,113,0.08)" },
};

const ROLE_COLORS = {
  Sales:     { bg: "rgba(56,189,248,0.12)",  color: "#38bdf8"  },
  Technical: { bg: "rgba(129,140,248,0.12)", color: "#818cf8"  },
  Manager:   { bg: "rgba(251,191,36,0.12)",  color: "#FBBF24"  },
  Security:  { bg: "rgba(248,113,113,0.12)", color: "#f87171"  },
  Support:   { bg: "rgba(74,222,128,0.12)",  color: "#4ade80"  },
};

const AVATAR_PALETTE = ["#38bdf8","#818cf8","#4ade80","#f87171","#FBBF24","#019cb8","#e879f9"];

function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      bgcolor: "#0F1520", border: `1px solid ${THEME.border}`,
      borderRadius: "12px", p: "12px 16px", minWidth: 140,
    }}>
      <Typography sx={{ color: "#94A3B8", fontSize: "11px", mb: 1, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
        {label}
      </Typography>
      {payload.map((p, i) => (
        <Stack key={i} direction="row" justifyContent="space-between" spacing={3}>
          <Typography sx={{ color: "#94A3B8", fontSize: "12px" }}>{p.name}</Typography>
          <Typography sx={{ color: p.fill || THEME.accent, fontSize: "12px", fontWeight: 700 }}>{p.value}</Typography>
        </Stack>
      ))}
    </Box>
  );
};

function StatCard({ label, value, icon, main, bg, trend }) {
  return (
    <Paper sx={{
      p: "20px", bgcolor: THEME.paper, borderRadius: "20px",
      border: `1px solid ${THEME.border}`, position: "relative",
      overflow: "hidden", height: "100%", transition: "0.2s ease-in-out",
      "&:hover": { borderColor: main, transform: "translateY(-4px)", bgcolor: "rgba(255,255,255,0.02)" },
    }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography sx={{ color: THEME.textSecondary, fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", mb: 1 }}>
            {label}
          </Typography>
          <Typography sx={{ color: "#fff", fontSize: "28px", fontWeight: 900, lineHeight: 1, mb: 1 }}>
            {value}
          </Typography>
          {trend && (
            <Typography sx={{ color: main, fontSize: "11px", fontWeight: 700 }}>{trend} increase</Typography>
          )}
        </Box>
        <Box sx={{ width: 42, height: 42, borderRadius: "12px", bgcolor: bg, color: main, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

function ProgressRow({ label, value, max, accent }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: "8px" }}>
        <Typography sx={{ color: "#CBD5E1", fontSize: "13px", fontWeight: 500 }}>{label}</Typography>
        <Typography sx={{ color: accent, fontSize: "12px", fontWeight: 700 }}>
          {value} <span style={{ color: THEME.textSecondary, fontWeight: 400 }}>leads</span>
        </Typography>
      </Stack>
      <Box sx={{ height: "6px", bgcolor: "rgba(255,255,255,0.04)", borderRadius: "10px" }}>
        <Box sx={{ width: `${pct}%`, height: "100%", bgcolor: accent, borderRadius: "10px", transition: "width 1s ease" }} />
      </Box>
    </Box>
  );
}

function StaffBar({ name, role, leadsCount, queriesCount, totalLeads, avatarColor, rank }) {
  const pct = totalLeads > 0 ? Math.round((leadsCount / totalLeads) * 100) : 0;
  const conv = queriesCount > 0 ? ((leadsCount / queriesCount) * 100).toFixed(1) : "0.0";
  const roleStyle = ROLE_COLORS[role] || { bg: "rgba(255,255,255,0.08)", color: "#94A3B8" };

  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 },
      p: { xs: "10px 12px", sm: "12px 16px" }, borderRadius: "14px",
      bgcolor: rank === 1 ? "rgba(56,189,248,0.04)" : "transparent",
      border: rank === 1 ? "1px solid rgba(56,189,248,0.12)" : "1px solid transparent",
      transition: "0.2s",
      "&:hover": { bgcolor: "rgba(255,255,255,0.02)" },
    }}>
      <Typography sx={{ color: rank <= 3 ? THEME.accent : THEME.textSecondary, fontSize: "12px", fontWeight: 700, minWidth: "18px", textAlign: "center" }}>
        {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
      </Typography>
      <Box sx={{
        width: 36, height: 36, borderRadius: "50%",
        bgcolor: `${avatarColor}20`, color: avatarColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "11px", fontWeight: 700, flexShrink: 0,
      }}>
        {getInitials(name)}
      </Box>
      <Box sx={{ minWidth: { xs: 70, sm: 100 }, flexShrink: 0 }}>
        <Typography sx={{ color: "#fff", fontSize: { xs: "12px", sm: "13px" }, fontWeight: 600 }}>{name}</Typography>
        <Box sx={{ display: "inline-block", px: "6px", py: "1px", borderRadius: "6px", bgcolor: roleStyle.bg, mt: "2px" }}>
          <Typography sx={{ color: roleStyle.color, fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {role}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ flex: 1, mx: 1, display: { xs: "none", sm: "block" } }}>
        <Box sx={{ height: "6px", bgcolor: "rgba(255,255,255,0.04)", borderRadius: "10px" }}>
          <Box sx={{ width: `${pct}%`, height: "100%", bgcolor: avatarColor, borderRadius: "10px", transition: "width 1s ease" }} />
        </Box>
      </Box>
      <Typography sx={{ color: THEME.accent, fontSize: "13px", fontWeight: 800, minWidth: 28, textAlign: "right" }}>
        {leadsCount}
      </Typography>
      <Box sx={{
        px: "8px", py: "2px", borderRadius: "8px",
        bgcolor: parseFloat(conv) >= 30 ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
        minWidth: 50, textAlign: "center",
      }}>
        <Typography sx={{ fontSize: "11px", fontWeight: 700, color: parseFloat(conv) >= 30 ? "#4ade80" : "#f87171" }}>
          {conv}%
        </Typography>
      </Box>
    </Box>
  );
}

export default function ExhibitorAnalytics() {
  const [expoData, setExpoData] = useState([]);
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);

  const userData    = useMemo(() => JSON.parse(localStorage.getItem("user") || "{}"), []);
  const exhibitorId = userData?._id || userData?.id;

  useEffect(() => {
    if (exhibitorId) fetchAll();
  }, [exhibitorId]);

  const fetchAll = async () => {
    try {
      const [analyticsRes, eventsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/events/event-analytics/${exhibitorId}`),
        axios.get(`http://localhost:5000/api/events/my-events/${exhibitorId}`),
      ]);
      setExpoData(analyticsRes.data || []);
      setEvents(eventsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalLeads   = expoData.reduce((a, c) => a + (c.leads   || 0), 0);
    const totalQueries = expoData.reduce((a, c) => a + (c.queries || 0), 0);
    const avgConversion = totalQueries > 0 ? ((totalLeads / totalQueries) * 100).toFixed(1) : "0.0";
    return { totalLeads, totalQueries, avgConversion, expoCount: expoData.length };
  }, [expoData]);

  const staffStats = useMemo(() => {
    const map = {};
    events.forEach((event) => {
      const staff = event.staff || [];
      if (staff.length === 0) return;
      const analytics = expoData.find(
        (a) => a.expoName === event.expoId?.title || a.expoId === event.expoId?._id
      );
      const expoLeads   = analytics?.leads   || 0;
      const expoQueries = analytics?.queries || 0;
      const perStaffLeads   = Math.round(expoLeads   / staff.length);
      const perStaffQueries = Math.round(expoQueries / staff.length);
      staff.forEach((member) => {
        const key = `${member.name}||${member.role}`;
        if (!map[key]) {
          map[key] = { name: member.name, role: member.role, leads: 0, queries: 0, expos: 0, isPassIssued: member.isPassIssued };
        }
        map[key].leads   += perStaffLeads;
        map[key].queries += perStaffQueries;
        map[key].expos   += 1;
      });
    });
    return Object.values(map).sort((a, b) => b.leads - a.leads);
  }, [events, expoData]);

  const totalStaffLeads = useMemo(() => staffStats.reduce((a, s) => a + s.leads, 0), [staffStats]);

  const roleBreakdown = useMemo(() => {
    const map = {};
    staffStats.forEach((s) => { map[s.role] = (map[s.role] || 0) + 1; });
    return Object.entries(map).map(([role, count]) => ({ role, count }));
  }, [staffStats]);

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", bgcolor: THEME.bg }}>
      <CircularProgress sx={{ color: THEME.accent }} />
    </Box>
  );

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: THEME.bg, color: "#fff", px: { xs: 2, sm: 1 } }}>

      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography sx={{ color: "#fff", fontSize: { xs: "22px", sm: "28px" }, fontWeight: 900, letterSpacing: "-0.5px" }}>
            Command <span style={{ color: THEME.accent }}>Center</span>
          </Typography>
          <Typography sx={{ color: THEME.textSecondary, fontSize: "14px", mt: 0.5 }}>
            {userData.name || "Exhibitor"} • Live Performance Overview
          </Typography>
        </Box>
        <Box sx={{ px: 2, py: 1, bgcolor: THEME.accentSoft, border: "1px solid rgba(1,156,184,0.2)", borderRadius: "10px", display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: THEME.accent, animation: "pulse 2s infinite" }} />
          <Typography sx={{ color: THEME.accent, fontSize: "11px", fontWeight: 800 }}>LIVE SYNC</Typography>
        </Box>
      </Box>

      {/* STAT CARDS */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr", md: "repeat(4,1fr)" },
        gap: { xs: 1.5, sm: 3 },
        mb: 4
      }}>
        <StatCard label="Total Leads"   value={stats.totalLeads}          icon={<Target size={20}/>}        {...STAT_COLORS.leads}      trend="+12%" />
        <StatCard label="Total Queries" value={stats.totalQueries}        icon={<MessageSquare size={20}/>} {...STAT_COLORS.queries}    trend="+8%"  />
        <StatCard label="Conversion"    value={`${stats.avgConversion}%`} icon={<TrendingUp size={20}/>}   {...STAT_COLORS.conversion} trend="+3%"  />
        <StatCard label="Active Expos"  value={stats.expoCount}           icon={<Activity size={20}/>}     {...STAT_COLORS.expos}      />
      </Box>

      {/* ROW 1: Chart + Staff Table */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.5fr 1fr" }, gap: 3, mb: 3 }}>

        <Box sx={{ bgcolor: THEME.paper, border: `1px solid ${THEME.border}`, borderRadius: "24px", p: { xs: "16px", sm: "24px" } }}>
          <Typography sx={{ color: "#fff", fontSize: "16px", fontWeight: 800, mb: 4 }}>Expo Engagement Flow</Typography>
          <Box sx={{ width: "100%", height: { xs: 240, sm: 360 } }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expoData} barGap={8}>
                <CartesianGrid strokeDasharray="3 8" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="expoName" axisLine={false} tickLine={false} tick={{ fill: THEME.textSecondary, fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: THEME.textSecondary, fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                <Bar dataKey="leads"   name="Leads"   fill={THEME.accent} radius={[4,4,0,0]} barSize={28} />
                <Bar dataKey="queries" name="Queries" fill="#818cf8"      radius={[4,4,0,0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        <Box sx={{ bgcolor: THEME.paper, border: `1px solid ${THEME.border}`, borderRadius: "24px", p: { xs: "16px", sm: "24px" }, display: "flex", flexDirection: "column" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography sx={{ color: "#fff", fontSize: "16px", fontWeight: 800 }}>Staff Performance</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Users size={14} color={THEME.textSecondary} />
              <Typography sx={{ color: THEME.textSecondary, fontSize: "12px" }}>{staffStats.length} members</Typography>
            </Box>
          </Stack>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 60px 60px", px: "16px", pb: "8px", borderBottom: `1px solid ${THEME.border}` }}>
            <Typography sx={{ color: THEME.textSecondary, fontSize: "9px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Staff / Role</Typography>
            <Typography sx={{ color: THEME.textSecondary, fontSize: "9px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", textAlign: "center" }}>Leads</Typography>
            <Typography sx={{ color: THEME.textSecondary, fontSize: "9px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", textAlign: "center" }}>Conv%</Typography>
          </Box>

          <Stack sx={{ flex: 1, overflowY: "auto", mt: 1, gap: "2px",
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.1)", borderRadius: "4px" },
          }}>
            {staffStats.length === 0 && (
              <Typography sx={{ color: THEME.textSecondary, fontSize: "13px", p: 2 }}>No staff data found.</Typography>
            )}
            {staffStats.map((s, idx) => {
              const avatarColor = AVATAR_PALETTE[idx % AVATAR_PALETTE.length];
              const roleStyle   = ROLE_COLORS[s.role] || { bg: "rgba(255,255,255,0.08)", color: "#94A3B8" };
              const conv        = s.queries > 0 ? ((s.leads / s.queries) * 100).toFixed(1) : "0.0";
              const isTop       = idx === 0;
              return (
                <Box key={idx} sx={{
                  display: "grid", gridTemplateColumns: "1fr 60px 60px",
                  alignItems: "center", px: "16px", py: "10px", borderRadius: "12px",
                  bgcolor: isTop ? "rgba(56,189,248,0.04)" : "transparent",
                  border: isTop ? "1px solid rgba(56,189,248,0.1)" : "1px solid transparent",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.02)" }, transition: "0.15s",
                }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: `${avatarColor}20`, color: avatarColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, flexShrink: 0 }}>
                      {getInitials(s.name)}
                    </Box>
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        {isTop && <Award size={11} color="#38bdf8" />}
                        <Typography sx={{ color: "#fff", fontSize: "12px", fontWeight: 600 }}>{s.name}</Typography>
                      </Stack>
                      <Box sx={{ display: "inline-block", px: "5px", py: "1px", borderRadius: "5px", bgcolor: roleStyle.bg }}>
                        <Typography sx={{ color: roleStyle.color, fontSize: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.role}</Typography>
                      </Box>
                    </Box>
                  </Stack>
                  <Typography sx={{ color: THEME.accent, fontSize: "13px", fontWeight: 800, textAlign: "center" }}>{s.leads}</Typography>
                  <Box sx={{ mx: "auto", px: "6px", py: "2px", borderRadius: "6px", bgcolor: parseFloat(conv) >= 30 ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)" }}>
                    <Typography sx={{ fontSize: "10px", fontWeight: 700, color: parseFloat(conv) >= 30 ? "#4ade80" : "#f87171", textAlign: "center" }}>{conv}%</Typography>
                  </Box>
                </Box>
              );
            })}
          </Stack>

          {roleBreakdown.length > 0 && (
            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${THEME.border}` }}>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {roleBreakdown.map(({ role, count }) => {
                  const rs = ROLE_COLORS[role] || { bg: "rgba(255,255,255,0.08)", color: "#94A3B8" };
                  return (
                    <Box key={role} sx={{ px: "8px", py: "3px", borderRadius: "8px", bgcolor: rs.bg }}>
                      <Typography sx={{ color: rs.color, fontSize: "10px", fontWeight: 600 }}>{role} ({count})</Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}
        </Box>
      </Box>

      {/* ROW 2: Staff Leaderboard */}
      {staffStats.length > 0 && (
        <Box sx={{ bgcolor: THEME.paper, border: `1px solid ${THEME.border}`, borderRadius: "24px", p: { xs: "16px", sm: "24px" }, mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography sx={{ color: "#fff", fontSize: "16px", fontWeight: 800 }}>Staff Leads Leaderboard</Typography>
            <Chip label="All Expos" size="small" sx={{ bgcolor: THEME.accentSoft, color: THEME.accent, fontWeight: 700, fontSize: "10px", border: "1px solid rgba(1,156,184,0.2)" }} />
          </Stack>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: "16px", pb: "8px", borderBottom: `1px solid ${THEME.border}`, mb: 1 }}>
            <Typography sx={{ color: THEME.textSecondary, fontSize: "9px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", minWidth: "18px" }}>#</Typography>
            <Typography sx={{ color: THEME.textSecondary, fontSize: "9px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", minWidth: 36 }}></Typography>
            <Typography sx={{ color: THEME.textSecondary, fontSize: "9px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", minWidth: 100 }}>Staff</Typography>
            <Typography sx={{ color: THEME.textSecondary, fontSize: "9px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", flex: 1, ml: 1, display: { xs: "none", sm: "block" } }}>Progress</Typography>
            <Typography sx={{ color: THEME.textSecondary, fontSize: "9px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", minWidth: 28, textAlign: "right" }}>Leads</Typography>
            <Typography sx={{ color: THEME.textSecondary, fontSize: "9px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", minWidth: 50, textAlign: "center" }}>Conv%</Typography>
          </Box>

          <Stack spacing={0.5}>
            {staffStats.map((s, idx) => (
              <StaffBar
                key={idx}
                rank={idx + 1}
                name={s.name}
                role={s.role}
                leadsCount={s.leads}
                queriesCount={s.queries}
                totalLeads={totalStaffLeads}
                avatarColor={AVATAR_PALETTE[idx % AVATAR_PALETTE.length]}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* ROW 3: Performance + Inquiry Pulse */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.5fr 1fr" }, gap: 3 }}>
        <Box sx={{ bgcolor: THEME.paper, border: `1px solid ${THEME.border}`, borderRadius: "24px", p: { xs: "16px", sm: "24px" } }}>
          <Typography sx={{ color: "#fff", fontSize: "16px", fontWeight: 800, mb: 3 }}>Performance by Expo</Typography>
          <Stack spacing={3}>
            {expoData.length > 0
              ? expoData.map((item, idx) => (
                  <ProgressRow key={idx} label={item.expoName} value={item.leads || 0} max={stats.totalLeads} accent={THEME.accent} />
                ))
              : <Typography sx={{ color: THEME.textSecondary, fontSize: "13px" }}>No activity recorded</Typography>
            }
          </Stack>
        </Box>

        <Box sx={{ bgcolor: THEME.paper, border: `1px solid ${THEME.border}`, borderRadius: "24px", p: { xs: "16px", sm: "24px" }, flexGrow: 1 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography sx={{ color: "#fff", fontSize: "16px", fontWeight: 800 }}>Inquiry Pulse</Typography>
            <Chip label="LIVE" size="small" sx={{ height: 20, fontSize: "9px", bgcolor: "rgba(74,222,128,0.1)", color: "#4ade80", fontWeight: 700 }} />
          </Stack>
          <Box sx={{ height: { xs: 180, sm: 160 } }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={expoData}>
                <defs>
                  <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={THEME.accent} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={THEME.accent} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="queries" stroke={THEME.accent} strokeWidth={3} fill="url(#pulseGrad)" dot={{ fill: THEME.accent, r: 4 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Box>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </Box>
  );
}