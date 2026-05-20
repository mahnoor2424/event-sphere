import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { 
  Box, Typography, Grid, Paper, IconButton, Chip, Stack, 
  MenuItem, Select, FormControl, CircularProgress, 
  Avatar, Button, Tooltip, Divider
} from "@mui/material";

// Icons (TwoTone for Dashboard look)
import EditIcon from "@mui/icons-material/EditTwoTone";
import DeleteIcon from "@mui/icons-material/DeleteTwoTone";
import TimeIcon from "@mui/icons-material/ScheduleTwoTone";
import LocationIcon from "@mui/icons-material/PlaceTwoTone";
import DateIcon from "@mui/icons-material/TodayTwoTone";
import SearchIcon from "@mui/icons-material/FilterListTwoTone";
import EmptyIcon from "@mui/icons-material/EventBusyTwoTone";
import RefreshIcon from "@mui/icons-material/RestartAltTwoTone";
import AddIcon from "@mui/icons-material/AddBoxTwoTone";
import GroupIcon from "@mui/icons-material/GroupsTwoTone";
import CategoryIcon from "@mui/icons-material/CategoryTwoTone"; // Dynamic Type Icon

// Exactly matching your Dashboard Theme
const THEME = {
  bg: "#05070A",        // Deep Dark
  paper: "#0A0D14",     // Sidebar/Card color
  accent: "#38bdf8",    // Sky Blue
  textPrimary: "#F8FAFC",
  textSecondary: "#64748B",
  border: "rgba(255, 255, 255, 0.05)",
};

export default function ManageSchedule() {
  const [expos, setExpos] = useState([]);
  const [selectedExpo, setSelectedExpo] = useState("all");
  const [allSessions, setAllSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const expoRes = await axios.get("http://localhost:5000/api/expo/all-expos");
      setExpos(expoRes.data.filter(e => e.status === 'active'));

      const sessionRes = await axios.get("http://localhost:5000/api/schedule/all"); 
      setAllSessions(sessionRes.data);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredSessions = selectedExpo === "all" 
    ? allSessions 
    : allSessions.filter(s => s.expoId === selectedExpo);

  const getExpoTitle = (id) => expos.find(e => e._id === id)?.title || "Event";

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Session?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#334155",
      confirmButtonText: "Yes, Delete",
      background: THEME.paper,
      color: THEME.textPrimary
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/api/schedule/delete/${id}`);
          setAllSessions(prev => prev.filter(s => s._id !== id));
          Swal.fire({ title: "Deleted", icon: "success", background: THEME.paper, color: "#fff" });
        } catch (err) { Swal.fire("Error", "Action failed", "error"); }
      }
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: THEME.bg, pb: 8 }}>
      
      {/* HEADER SECTION */}
      <Box sx={{ py: 3, mb: 4, borderBottom: `1px solid ${THEME.border}` }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: THEME.textPrimary }}>
              Schedule <span style={{ color: THEME.accent }}>Console</span>
            </Typography>
            <Typography variant="body2" sx={{ color: THEME.textSecondary }}>
              Manage and monitor all session timelines.
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Refresh Data">
              <IconButton onClick={fetchData} sx={{ border: `1px solid ${THEME.border}`, color: THEME.textSecondary }}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/schedule/create')}
              sx={{ bgcolor: THEME.accent, color: '#000', fontWeight: 700, borderRadius: '8px', textTransform: 'none', "&:hover": { bgcolor: '#7dd3fc' } }}
            >
              New Session
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* QUICK ANALYTICS */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: 'Total Sessions', val: allSessions.length, icon: <DateIcon />, color: THEME.accent },
          { label: 'Active Speakers', val: [...new Set(allSessions.map(s => s.speaker))].length, icon: <GroupIcon />, color: '#a855f7' },
          { label: 'Expos Covered', val: expos.length, icon: <SearchIcon />, color: '#10b981' }
        ].map((stat, i) => (
          <Grid item xs={12} sm={4} key={i}>
            <Paper sx={{ p: 2, bgcolor: THEME.paper, border: `1px solid ${THEME.border}`, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.03)', color: stat.color, borderRadius: '8px', width: 40, height: 40 }}>{stat.icon}</Avatar>
              <Box>
                <Typography variant="h6" sx={{ color: THEME.textPrimary, fontWeight: 700, lineHeight: 1 }}>{stat.val}</Typography>
                <Typography variant="caption" sx={{ color: THEME.textSecondary }}>{stat.label}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* FILTER CONTROLS */}
      <Paper elevation={0} sx={{ p: 1.5, mb: 4, bgcolor: THEME.paper, borderRadius: '12px', border: `1px solid ${THEME.border}`, display: 'flex', alignItems: 'center', gap: 2 }}>
        <SearchIcon sx={{ color: THEME.textSecondary, ml: 1 }} />
        <FormControl fullWidth size="small">
          <Select
            value={selectedExpo}
            onChange={(e) => setSelectedExpo(e.target.value)}
            sx={{ color: THEME.textPrimary, ".MuiOutlinedInput-notchedOutline": { border: 'none' }, fontWeight: 600, fontSize: '14px' }}
          >
            <MenuItem value="all">System Wide Timeline (All Expos)</MenuItem>
            {expos.map(e => <MenuItem key={e._id} value={e._id}>{e.title}</MenuItem>)}
          </Select>
        </FormControl>
        <Chip label={`${filteredSessions.length} Entries`} size="small" sx={{ bgcolor: 'rgba(56, 189, 248, 0.1)', color: THEME.accent, fontWeight: 700 }} />
      </Paper>

      {/* SESSIONS GRID */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 10 }}><CircularProgress size={30} sx={{ color: THEME.accent }} /></Box>
      ) : filteredSessions.length > 0 ? (
        <Grid container spacing={2.5}>
          {filteredSessions.map((session) => (
            <Grid item xs={12} md={6} lg={4} key={session._id}>
              <Paper sx={{ 
                bgcolor: THEME.paper, border: `1px solid ${THEME.border}`, borderRadius: '16px', overflow: 'hidden', transition: '0.2s',
                "&:hover": { borderColor: THEME.accent, transform: 'translateY(-3px)' }
              }}>
                {/* CARD HEADER */}
                <Box sx={{ p: 1.5, px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${THEME.border}`, bgcolor: 'rgba(255,255,255,0.01)' }}>
                  <Typography variant="caption" sx={{ color: THEME.accent, fontWeight: 800, letterSpacing: 0.5 }}>
                    {getExpoTitle(session.expoId).toUpperCase()}
                  </Typography>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" onClick={() => navigate(`/admin/schedule/edit/${session._id}`)} sx={{ color: THEME.textSecondary, "&:hover": { color: THEME.accent } }}><EditIcon fontSize="inherit"/></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(session._id)} sx={{ color: THEME.textSecondary, "&:hover": { color: '#ef4444' } }}><DeleteIcon fontSize="inherit"/></IconButton>
                  </Stack>
                </Box>

                <Box sx={{ p: 2.5 }}>
                  {/* ✅ UPDATED: DYNAMIC SESSION TYPE BADGE */}
                  <Box sx={{ mb: 1.5 }}>
                    <Chip 
                      label={session.type || "Speech"} 
                      size="small" 
                      icon={<CategoryIcon style={{ fontSize: '14px', color: THEME.accent }} />}
                      sx={{ 
                        bgcolor: 'rgba(56, 189, 248, 0.1)', 
                        color: THEME.accent, 
                        fontWeight: 700, 
                        fontSize: '10px', 
                        textTransform: 'uppercase',
                        borderRadius: '6px',
                        border: `1px solid rgba(56, 189, 248, 0.2)`
                      }} 
                    />
                  </Box>

                  <Typography variant="subtitle1" sx={{ color: THEME.textPrimary, fontWeight: 700, mb: 2, lineHeight: 1.3 }}>
                    {session.title}
                  </Typography>
                  
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ width: 28, height: 28, bgcolor: THEME.accent, color: '#000', fontSize: '12px', fontWeight: 900 }}>{session.speaker?.charAt(0)}</Avatar>
                      <Typography variant="body2" sx={{ color: THEME.textPrimary, fontWeight: 500 }}>{session.speaker}</Typography>
                    </Stack>

                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <TimeIcon sx={{ fontSize: 16, color: THEME.accent }} />
                          <Typography variant="caption" sx={{ color: THEME.textSecondary }}>{session.startTime} - {session.endTime}</Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LocationIcon sx={{ fontSize: 16, color: '#fbbf24' }} />
                          <Typography variant="caption" sx={{ color: THEME.textSecondary }} noWrap>{session.location}</Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Stack>
                </Box>

                <Divider sx={{ borderColor: THEME.border }} />
                <Box sx={{ p: 1, px: 2, bgcolor: 'rgba(255,255,255,0.01)', textAlign: 'right' }}>
                   <Typography variant="caption" sx={{ color: THEME.textSecondary, fontSize: '10px' }}>
                     Scheduled: {new Date(session.date).toLocaleDateString()}
                   </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 10, border: `1px dashed ${THEME.border}`, borderRadius: '16px' }}>
          <EmptyIcon sx={{ fontSize: 40, color: THEME.textSecondary, mb: 1 }} />
          <Typography sx={{ color: THEME.textSecondary, fontSize: '14px' }}>No session data found.</Typography>
        </Box>
      )}
    </Box>
  );
}