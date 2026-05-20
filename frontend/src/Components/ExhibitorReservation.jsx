import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Box, Typography, Paper, Chip, CircularProgress, Container, 
  Stack, Divider, Grid, Avatar, Button 
} from "@mui/material";
import { 
  StorefrontTwoTone as BoothIcon, 
  VerifiedUserTwoTone as VerifiedIcon, 
  LocationOnTwoTone as LocationIcon,
  CalendarMonthTwoTone as DateIcon,
  MapTwoTone as MapIcon,
  RocketLaunchTwoTone as LaunchIcon 
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const THEME = {
  bg: "#05070A",
  card: "#0A0D14",
  accent: "#00b8d1", 
  reserved: "#f43f5e", 
  border: "rgba(255, 255, 255, 0.05)",
  textMuted: "#64748B",
  glass: "rgba(0, 184, 209, 0.03)"
};

export default function ExhibitorReservation() {
  const navigate = useNavigate();
  const [myReservations, setMyReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllReservations = async () => {
      const rawUser = localStorage.getItem("user");
      if (!rawUser || rawUser === "undefined") { navigate("/login"); return; }
      try {
        const loggedInUser = JSON.parse(rawUser);
        const userId = loggedInUser.id || loggedInUser._id;
        const res = await axios.get(`http://localhost:5000/api/expo/all-expos`);
        const foundReservations = [];
        res.data.forEach(expo => {
          if (expo.booths?.layout) {
            const booth = expo.booths.layout.find(b => String(b.exhibitorId) === String(userId));
            if (booth) {
              foundReservations.push({
                id: expo._id,
                title: expo.title,
                venue: expo.location?.venue,
                date: expo.startDate,
                myBoothId: booth.id,
                layout: expo.booths.layout
              });
            }
          }
        });
        setMyReservations(foundReservations);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchAllReservations();
  }, [navigate]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10, bgcolor: THEME.bg, minHeight: '100vh' }}>
      <CircularProgress sx={{ color: THEME.accent }} />
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: THEME.bg, py: 4 }}>
      <Container maxWidth="lg">
        
        {/* HEADER */}
        <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Box>
             <Typography variant="h4" sx={{ fontWeight: 900, color: "#fff", letterSpacing: -1 }}>
               Booth <span style={{ color: THEME.accent }}>Allocation</span>
             </Typography>
             <Typography sx={{ color: THEME.textMuted, fontSize: '14px' }}>Reserved spots and setup controls.</Typography>
          </Box>
          <Chip label={`${myReservations.length} Active`} size="small" sx={{ bgcolor: THEME.glass, color: THEME.accent, fontWeight: 700 }} />
        </Box>

        {myReservations.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center', bgcolor: THEME.card, borderRadius: '24px', border: `1px dashed ${THEME.border}` }}>
             <Typography sx={{ color: THEME.textMuted }}>No reservations found.</Typography>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {myReservations.map((res) => (
              <Paper key={res.id} sx={{ 
                bgcolor: THEME.card, borderRadius: "20px", border: `1px solid ${THEME.border}`, 
                overflow: 'hidden', transition: '0.3s', "&:hover": { borderColor: THEME.accent }
              }}>
                <Grid container>
                  {/* LEFT: INFO */}
                  <Grid item xs={12} md={7} sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                       <Avatar sx={{ bgcolor: 'rgba(0,184,209,0.1)', color: THEME.accent, borderRadius: '12px', width: 45, height: 45 }}>
                          <MapIcon />
                       </Avatar>
                       <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>{res.title}</Typography>
                          <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: THEME.textMuted }}>
                                <LocationIcon sx={{ fontSize: 14 }} />
                                <Typography variant="caption">{res.venue}</Typography>
                             </Box>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: THEME.textMuted }}>
                                <DateIcon sx={{ fontSize: 14 }} />
                                <Typography variant="caption">{new Date(res.date).toLocaleDateString()}</Typography>
                             </Box>
                          </Stack>
                       </Box>
                       <Box sx={{ textAlign: 'right', mr: 2 }}>
                          <Typography sx={{ color: THEME.accent, fontWeight: 900, fontSize: '18px' }}>{res.myBoothId}</Typography>
                          <Typography sx={{ color: THEME.textMuted, fontSize: '9px', fontWeight: 700 }}>BOOTH ID</Typography>
                       </Box>
                    </Stack>
                    <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.03)' }} />
                    <Stack direction="row" spacing={1} alignItems="center">
                       <VerifiedIcon sx={{ color: '#10b981', fontSize: 16 }} />
                       <Typography sx={{ color: '#10b981', fontSize: '12px', fontWeight: 700 }}>Official Space Allocated</Typography>
                    </Stack>
                  </Grid>

                  {/* RIGHT: PREVIEW & BUTTON (FIXED OVERFLOW) */}
                  <Grid item xs={12} md={5} sx={{ 
                    bgcolor: 'rgba(0,0,0,0.2)', p: 2.5, display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', borderLeft: `1px solid ${THEME.border}` 
                  }}>
                     <Stack direction="row" spacing={3} alignItems="center" sx={{ width: '100%', justifyContent: 'center' }}>
                        
                        {/* Preview Map Section */}
                        <Box sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(10, 1fr)', 
                          gap: '4px', // Fixed gap
                          width: 'fit-content', // Box automatically adjusts to content
                          maxWidth: '130px', 
                          p: 1, 
                          bgcolor: '#05070A', 
                          borderRadius: '10px', 
                          border: `1px solid ${THEME.border}`,
                          overflow: 'hidden' // Important fix
                        }}>
                          {res.layout.slice(0, 100).map((booth) => (
                             <Box key={booth.id} sx={{
                               width: '8px', // Fixed small width
                               height: '8px', // Fixed small height
                               borderRadius: '1.5px',
                               bgcolor: booth.id === res.myBoothId ? THEME.accent : (booth.status === 'reserved' ? THEME.reserved : "rgba(255,255,255,0.05)"),
                               boxShadow: booth.id === res.myBoothId ? `0 0 6px ${THEME.accent}` : 'none'
                             }} />
                          ))}
                        </Box>

                        {/* Setup Button Section */}
                       <Button 
  variant="contained" 
  size="small"
  startIcon={<LaunchIcon sx={{ fontSize: '16px !important' }} />}
  // ✅ Backticks (`) use karein single quotes (') nahi
  onClick={() => navigate(`/exhibitor/booth-setup?expoId=${res.id}&boothId=${res.myBoothId}`)}
  sx={{ 
    bgcolor: THEME.accent, color: '#000', fontWeight: 900, 
    fontSize: '11px', textTransform: 'none', borderRadius: '10px',
    height: '40px', px: 2, '&:hover': { bgcolor: '#fff' }
  }}
>
  Setup Showcase
</Button>

                     </Stack>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Stack>
        )}

        {/* Legend */}
        <Stack direction="row" spacing={3} justifyContent="center" sx={{ mt: 5, opacity: 0.6 }}>
           <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 8, height: 8, bgcolor: THEME.accent, borderRadius: '2px' }} />
              <Typography variant="caption" sx={{ color: THEME.textMuted }}>Your Spot</Typography>
           </Stack>
           <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 8, height: 8, bgcolor: THEME.reserved, borderRadius: '2px' }} />
              <Typography variant="caption" sx={{ color: THEME.textMuted }}>Occupied</Typography>
           </Stack>
        </Stack>
      </Container>
    </Box>
  );
}