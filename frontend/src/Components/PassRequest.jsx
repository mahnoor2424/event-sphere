import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Avatar, Chip, Stack, TextField, MenuItem, 
  InputAdornment, CircularProgress, Fade
} from "@mui/material";
import { 
  BadgeOutlined as PassIcon, 
  CheckCircle as SuccessIcon,
  SearchOutlined as SearchIcon,
  BusinessTwoTone as ExpoIcon,
  FilterList as FilterIcon,
  Bolt as ActionIcon
} from "@mui/icons-material";
import Swal from "sweetalert2";

// Matching the Scanner's Dark Theme
const THEME = { 
  bg: "#05070A",
  card: "#0A0D14", 
  cardAlt: "#11141B",
  accent: "#38bdf8", 
  green: "#10b981",
  border: "rgba(255, 255, 255, 0.05)", 
  textMuted: "#94A3B8" 
};

export default function PassRequest() {
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expoFilter, setExpoFilter] = useState("All");

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/events/all-showcases");
      setAllEvents(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const issuePass = async (eventId, staffEmail) => {
    try {
        await axios.put("http://localhost:5000/api/events/issue-staff-pass", { eventId, staffEmail });
        Swal.fire({ 
          title: "Access Authorized", 
          text: "The digital pass has been dispatched.", 
          icon: "success", 
          background: THEME.card, 
          color: "#fff",
          confirmButtonColor: THEME.accent
        });
        fetchAllData(); 
    } catch (err) { console.error(err); }
  };

  const filteredEvents = allEvents.filter(event => {
    const matchesExpo = expoFilter === "All" || event.expoId?.title === expoFilter;
    const matchesSearch = event.shopName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.staff.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesExpo && matchesSearch;
  });

  const uniqueExpos = ["All", ...new Set(allEvents.map(e => e.expoId?.title).filter(Boolean))];

  if (loading) return (
    <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'80vh', bgcolor: THEME.bg }}>
      <CircularProgress sx={{ color: THEME.accent }} />
    </Box>
  );

  return (
    <Box sx={{ p: 4, minHeight: "100vh", bgcolor: THEME.bg }}>
      
      {/* HEADER SECTION */}
      <Box sx={{ mb: 6 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: THEME.accent, boxShadow: `0 0 10px ${THEME.accent}` }} />
          <Typography sx={{ color: THEME.accent, fontWeight: 800, fontSize: "12px", letterSpacing: 2, textTransform: "uppercase" }}>
            Security Control
          </Typography>
        </Stack>
        <Typography variant="h3" sx={{ fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>
          Personnel <span style={{ color: THEME.accent }}>Credentialing</span>
        </Typography>
        <Typography sx={{ color: THEME.textMuted, mt: 1 }}>Review and authorize digital entry passes for event staff.</Typography>
      </Box>

      {/* SEARCH & FILTERS - Modern Style */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 4 }}>
        <TextField 
          placeholder="Search by staff or company..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ 
            flex: 2, bgcolor: THEME.card, borderRadius: '16px',
            "& .MuiOutlinedInput-root": { 
                color: "#fff", 
                borderRadius: '12px',
                "& fieldset": { borderColor: THEME.border },
                "&:hover fieldset": { borderColor: THEME.accent },
            } 
          }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: THEME.textMuted }} /></InputAdornment> }}
        />
        
        <TextField
          select
          size="small"
          value={expoFilter}
          onChange={(e) => setExpoFilter(e.target.value)}
          sx={{ 
            flex: 1, bgcolor: THEME.card, borderRadius: '12px',
            "& .MuiOutlinedInput-root": { 
                color: "#fff", 
                borderRadius: '12px',
                "& fieldset": { borderColor: THEME.border },
            },
          }}
        >
          {uniqueExpos.map(title => <MenuItem key={title} value={title}>{title}</MenuItem>)}
        </TextField>
      </Stack>

      {/* DATA TABLE - Glassmorphism Container */}
      <TableContainer component={Paper} sx={{ 
        bgcolor: THEME.card, 
        borderRadius: '24px', 
        border: `1px solid ${THEME.border}`, 
        backgroundImage: 'none',
        overflow: 'hidden',
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
      }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "rgba(255,255,255,0.02)" }}>
              <TableCell sx={{ color: THEME.textMuted, fontWeight: 800, fontSize: "11px", py: 2.5 }}>STAFF MEMBER</TableCell>
              <TableCell sx={{ color: THEME.textMuted, fontWeight: 800, fontSize: "11px" }}>EXHIBITOR / BOOTH</TableCell>
              <TableCell sx={{ color: THEME.textMuted, fontWeight: 800, fontSize: "11px" }}>ROLE</TableCell>
              <TableCell align="right" sx={{ color: THEME.textMuted, fontWeight: 800, fontSize: "11px" }}>STATUS & ACTION</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEvents.map((event) => (
              event.staff.map((member, idx) => (
                <TableRow key={`${event._id}-${idx}`} sx={{ 
                  '&:hover': { bgcolor: 'rgba(56,189,248,0.02)' },
                  borderBottom: `1px solid ${THEME.border}`
                }}>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ 
                        bgcolor: member.isPassIssued ? "rgba(16,185,129,0.1)" : "rgba(56,189,248,0.1)", 
                        color: member.isPassIssued ? THEME.green : THEME.accent,
                        border: `1px solid ${member.isPassIssued ? "rgba(16,185,129,0.2)" : "rgba(56,189,248,0.2)"}`,
                        fontWeight: 800,
                        fontSize: "14px"
                      }}>
                        {member.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: "14px" }}>{member.name}</Typography>
                        <Typography sx={{ color: THEME.textMuted, fontSize: '12px' }}>{member.email}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  
                  <TableCell>
                    <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: "14px" }}>{event.shopName}</Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <ExpoIcon sx={{ fontSize: 12, color: THEME.accent }} />
                        <Typography sx={{ color: THEME.accent, fontSize: '11px', fontWeight: 700, textTransform: "uppercase" }}>
                            {event.expoId?.title} • Booth {event.boothNumber}
                        </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Chip 
                        label={member.role} 
                        size="small" 
                        sx={{ bgcolor: THEME.cardAlt, color: THEME.textMuted, border: `1px solid ${THEME.border}`, fontWeight: 700, fontSize: "10px" }} 
                    />
                  </TableCell>

                  <TableCell align="right">
                    {member.isPassIssued ? (
                      <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                        <Box sx={{ px: 1.5, py: 0.5, borderRadius: "6px", bgcolor: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", gap: 1 }}>
                          <SuccessIcon sx={{ color: THEME.green, fontSize: 14 }} />
                          <Typography sx={{ color: THEME.green, fontWeight: 800, fontSize: '11px', letterSpacing: 0.5 }}>AUTHORIZED</Typography>
                        </Box>
                      </Stack>
                    ) : (
                      <Button 
                        variant="contained" 
                        size="small"
                        startIcon={<ActionIcon sx={{ fontSize: "14px !important" }} />} 
                        onClick={() => issuePass(event._id, member.email)}
                        sx={{ 
                          bgcolor: THEME.accent, color: '#000', fontWeight: 900, 
                          borderRadius: '8px', textTransform: 'none', px: 2,
                          fontSize: "12px",
                          boxShadow: `0 4px 14px 0 rgba(56,189,248,0.39)`,
                          "&:hover": { bgcolor: "#7dd3fc", boxShadow: `0 6px 20px rgba(56,189,248,0.23)` }
                        }}
                      >
                        Issue Pass
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}