import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Box, Typography, Grid, Button, Stack, CircularProgress, Chip, 
  Paper, IconButton, Modal, Backdrop, Fade, Avatar, Container, Divider
} from "@mui/material";
import { 
  Calendar, MapPin, X, Info, Ticket, ArrowRight, 
  LayoutGrid, Zap, ShieldCheck, Clock, RefreshCcw, Building2
} from "lucide-react";

// ── DARK CONSOLE THEME WITH WHITE TEXT ──
const THEME = {
  bg: "#05070A",        
  paper: "#0A0D14",     
  accent: "#00b8d1",    
  textPrimary: "#FFFFFF", // Pure White
  textSecondary: "#94A3B8", // Soft Gray for labels
  border: "rgba(255, 255, 255, 0.08)",
  success: "#10b981",
};

export default function AttendeeMyEvents() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpo, setSelectedExpo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchMyEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/expo/my-registrations/${user.id || user._id}`);
      setRegistrations(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(user.id || user._id) fetchMyEvents();
  }, [user.id, user._id]);

  const handleOpenInfo = (expo) => {
    setSelectedExpo(expo);
    setModalOpen(true);
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: THEME.bg }}>
      <CircularProgress sx={{ color: THEME.accent }} />
    </Box>
  );

  return (
    <Box sx={{ bgcolor: THEME.bg, minHeight: "100vh", color: THEME.textPrimary, pb: 10 }}>
      <Container maxWidth="xl">
        
        {/* HEADER */}
        <Box sx={{ py: 3, mb: 4, borderBottom: `1px solid ${THEME.border}` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: THEME.textPrimary }}>
                Events <span style={{ color: THEME.accent }}>Console</span>
              </Typography>
              <Typography variant="body2" sx={{ color: THEME.textSecondary }}>
                Manage your registered event environments.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <IconButton onClick={fetchMyEvents} sx={{ border: `1px solid ${THEME.border}`, color: THEME.textSecondary }}>
                <RefreshCcw size={18} />
              </IconButton>
              <Chip 
                icon={<ShieldCheck size={14} color={THEME.accent} />}
                label="Registered Attendee" 
                sx={{ bgcolor: 'rgba(56, 189, 248, 0.05)', color: THEME.accent, fontWeight: 700, border: `1px solid ${THEME.border}` }} 
              />
            </Stack>
          </Stack>
        </Box>

        {/* STATS */}
        <Grid container spacing={2} sx={{ mb: 5 }}>
          {[
            { label: 'Total Joined', val: registrations.length, icon: <Ticket size={20}/>, color: THEME.accent },
            { label: 'Active Access', val: registrations.length, icon: <Zap size={20}/>, color: THEME.success },
            { label: 'Upcoming', val: registrations.length, icon: <Clock size={20}/>, color: '#fbbf24' }
          ].map((stat, i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Paper sx={{ p: 2, bgcolor: THEME.paper, border: `1px solid ${THEME.border}`, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.02)', color: stat.color, borderRadius: '8px', width: 42, height: 42 }}>{stat.icon}</Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1, color: "#FFFFFF" }}>{stat.val}</Typography>
                  <Typography variant="caption" sx={{ color: THEME.textSecondary, fontWeight: 600 }}>{stat.label}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* GRID (4 CARDS PER ROW) */}
        {registrations.length > 0 ? (
          <Grid container spacing={2.5}>
            {registrations.map((reg) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={reg._id}>
                <Paper sx={{ 
                  bgcolor: THEME.paper, border: `1px solid ${THEME.border}`, borderRadius: '16px', overflow: 'hidden', transition: '0.2s',
                  height: '100%', display: 'flex', flexDirection: 'column',
                  "&:hover": { borderColor: THEME.accent, transform: 'translateY(-4px)' }
                }}>
                  {/* PASS ID HEADER */}
                  <Box sx={{ p: 1.5, px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${THEME.border}`, bgcolor: 'rgba(255,255,255,0.01)' }}>
                    <Typography variant="caption" sx={{ color: THEME.accent, fontWeight: 800 }}>
                      PASS-ID: {reg._id?.slice(-6).toUpperCase()}
                    </Typography>
                    <Chip label="JOINED" size="small" sx={{ height: 18, fontSize: '9px', fontWeight: 900, bgcolor: 'rgba(16, 185, 129, 0.1)', color: THEME.success, border: `1px solid ${THEME.success}33` }} />
                  </Box>

                  <Box sx={{ p: 2, flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, minHeight: '3em', color: "#FFFFFF", display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                      {reg.expoId?.title}
                    </Typography>

                    <Stack spacing={1.5} sx={{ mb: 3 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <MapPin size={14} color={THEME.accent} />
                        <Typography variant="caption" sx={{ color: THEME.textSecondary }}>
                          {typeof reg.expoId?.location === 'object' ? reg.expoId.location.city : (reg.expoId?.location || 'Global')}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Calendar size={14} color="#fbbf24" />
                        <Typography variant="caption" sx={{ color: THEME.textSecondary }}>
                          {new Date(reg.expoId?.startDate).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Button 
                        fullWidth variant="contained" 
                        onClick={() => navigate(`/attendee/expo/${reg.expoId?._id}`)} 
                        endIcon={<ArrowRight size={14}/>}
                        sx={{ bgcolor: THEME.accent, color: '#000', fontWeight: 700, borderRadius: '8px', textTransform: 'none', "&:hover": { bgcolor: '#7dd3fc' } }}
                      >
                        Enter Lobby
                      </Button>
                      <IconButton 
                        size="small"
                        onClick={() => handleOpenInfo(reg.expoId)}
                        sx={{ border: `1px solid ${THEME.border}`, color: THEME.textSecondary, borderRadius: '8px' }}
                      >
                        <Info size={18} />
                      </IconButton>
                    </Stack>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <EmptyPlaceholder navigate={navigate} />
        )}

        {/* INFO MODAL (WHITE TEXT) */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 500, sx: { backdropFilter: 'blur(4px)', bgcolor: 'rgba(0,0,0,0.8)' } }}
        >
          <Fade in={modalOpen}>
            <Box sx={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: 500 }, bgcolor: THEME.paper, border: `1px solid ${THEME.border}`,
              boxShadow: 24, p: 4, borderRadius: '20px', outline: 'none'
            }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: THEME.accent }}>Event Overview</Typography>
                <IconButton onClick={() => setModalOpen(false)} sx={{ color: THEME.textSecondary }}><X size={20}/></IconButton>
              </Stack>

              {selectedExpo && (
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="caption" sx={{ color: THEME.textSecondary, textTransform: 'uppercase', fontWeight: 700 }}>Event Title</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#FFFFFF" }}>{selectedExpo.title}</Typography>
                  </Box>

                  <Box sx={{ bgcolor: 'rgba(255,255,255,0.03)', p: 2, borderRadius: '12px', border: `1px solid ${THEME.border}` }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Building2 size={18} color={THEME.accent} />
                      <Box>
                        <Typography variant="caption" sx={{ color: THEME.textSecondary, display: 'block' }}>Organizer</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#FFFFFF" }}>{selectedExpo.organizerName || "Official Expo Partner"}</Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <MapPin size={18} color={THEME.accent} />
                      <Box>
                        <Typography variant="caption" sx={{ color: THEME.textSecondary, display: 'block' }}>Location</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#FFFFFF" }}>
                           {typeof selectedExpo.location === 'object' 
                             ? `${selectedExpo.location.address}, ${selectedExpo.location.city}` 
                             : selectedExpo.location}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: THEME.textSecondary, textTransform: 'uppercase', fontWeight: 700 }}>Description</Typography>
                    <Typography variant="body2" sx={{ color: "#FFFFFF", opacity: 0.8, lineHeight: 1.6, mt: 1 }}>
                      {selectedExpo.description || "No additional description provided for this event."}
                    </Typography>
                  </Box>

                  <Button 
                    fullWidth 
                    variant="outlined" 
                    onClick={() => setModalOpen(false)}
                    sx={{ borderColor: THEME.border, color: "#FFFFFF", borderRadius: '10px', py: 1.5, fontWeight: 700 }}
                  >
                    Close
                  </Button>
                </Stack>
              )}
            </Box>
          </Fade>
        </Modal>

      </Container>
    </Box>
  );
}

function EmptyPlaceholder({ navigate }) {
  return (
    <Paper sx={{ py: 12, textAlign: 'center', bgcolor: THEME.paper, borderRadius: '16px', border: `1px dashed ${THEME.border}` }}>
      <LayoutGrid size={48} color={THEME.textSecondary} style={{ marginBottom: '16px', opacity: 0.3 }} />
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: "#FFFFFF" }}>No Registrations</Typography>
      <Typography sx={{ color: THEME.textSecondary, mb: 4, fontSize: '14px' }}>Find an event to get started.</Typography>
      <Button onClick={() => navigate('/attendee/explore')} variant="contained" sx={{ bgcolor: THEME.accent, color: "#000", fontWeight: 800, px: 5, borderRadius: '8px' }}>Discover Events</Button>
    </Paper>
  );
}