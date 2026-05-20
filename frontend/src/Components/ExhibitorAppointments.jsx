import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Box, Typography, Paper, Stack, CircularProgress,
  Container, Chip, Grid, Fade, Button, Avatar, Tabs, Tab, Divider, useMediaQuery, useTheme
} from "@mui/material";
import {
  AccessTimeTwoTone as TimeIcon,
  PersonTwoTone as AttendeeIcon,
  CheckCircleRounded as ApproveIcon,
  CancelRounded as DeclineIcon,
  EventAvailableTwoTone as ExpoIcon,
  HistoryToggleOffRounded as PendingIcon,
  DashboardCustomizeTwoTone as AllIcon
} from "@mui/icons-material";

const THEME = {
  bg: "#05070A",
  card: "#0A0D14",
  accent: "#00b8d1",
  border: "rgba(255, 255, 255, 0.08)",
  textSecondary: "#94A3B8",
  pending: "#9f900b",
  approved: "#2FFCBE",
  rejected: "#f87171"
};

export default function ExhibitorAppointments() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("all");

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const exhibitorId = userData?._id || userData?.id;

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/meetings/exhibitor/${exhibitorId}`);
      setMeetings(res.data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, [exhibitorId]);

  useEffect(() => {
    if (exhibitorId) fetchMeetings();
  }, [fetchMeetings, exhibitorId]);

  const handleStatusUpdate = async (meetingId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/meetings/status/${meetingId}`, { status: newStatus });
      setMeetings(prev => prev.map(m => m._id === meetingId ? { ...m, status: newStatus } : m));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const filteredMeetings = useMemo(() => {
    if (currentTab === "all") return meetings;
    return meetings.filter(m => m.status === currentTab);
  }, [meetings, currentTab]);

  const stats = {
    total: meetings.length,
    pending: meetings.filter(m => m.status === 'pending').length,
    approved: meetings.filter(m => m.status === 'approved').length
  };

  const getStatusColor = (status) => THEME[status] || THEME.textSecondary;

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', bgcolor: THEME.bg }}>
      <CircularProgress sx={{ color: THEME.accent }} />
    </Box>
  );

  return (
    <Box sx={{ bgcolor: THEME.bg, minHeight: '100vh', py: { xs: 3, sm: 6 } }}>
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>

        {/* HEADER & STATS */}
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Typography
            variant={isMobile ? "h4" : "h3"}
            sx={{ fontWeight: 900, color: "#fff", letterSpacing: -1.5, mb: 1, lineHeight: 1.2 }}
          >
            Meeting <span style={{ color: THEME.accent }}>Inbox</span>
          </Typography>

          {/* Stats Row — wraps on very small screens */}
          <Stack
            direction="row"
            spacing={{ xs: 2, sm: 3 }}
            sx={{ mt: 3, flexWrap: 'wrap', gap: { xs: 1.5, sm: 0 } }}
            divider={
              !isMobile
                ? <Divider orientation="vertical" flexItem sx={{ borderColor: THEME.border }} />
                : null
            }
          >
            <Box>
              <Typography variant="caption" sx={{ color: THEME.textSecondary, textTransform: 'uppercase', fontWeight: 700, fontSize: { xs: '10px', sm: '12px' } }}>Total Requests</Typography>
              <Typography variant={isMobile ? "h6" : "h5"} sx={{ color: '#fff', fontWeight: 800 }}>{stats.total}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: THEME.pending, textTransform: 'uppercase', fontWeight: 700, fontSize: { xs: '10px', sm: '12px' } }}>Pending</Typography>
              <Typography variant={isMobile ? "h6" : "h5"} sx={{ color: THEME.pending, fontWeight: 800 }}>{stats.pending}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: THEME.approved, textTransform: 'uppercase', fontWeight: 700, fontSize: { xs: '10px', sm: '12px' } }}>Approved</Typography>
              <Typography variant={isMobile ? "h6" : "h5"} sx={{ color: THEME.approved, fontWeight: 800 }}>{stats.approved}</Typography>
            </Box>
          </Stack>
        </Box>

        {/* FILTER TABS */}
        <Paper sx={{ bgcolor: THEME.card, borderRadius: '16px', border: `1px solid ${THEME.border}`, mb: { xs: 3, sm: 4 }, p: 0.5, overflowX: 'auto' }}>
          <Tabs
            value={currentTab}
            onChange={(e, val) => setCurrentTab(val)}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
            sx={{
              minHeight: { xs: 44, sm: 48 },
              "& .MuiTab-root": {
                color: THEME.textSecondary,
                fontWeight: 700,
                fontSize: { xs: '11px', sm: '13px' },
                minHeight: { xs: 44, sm: 48 },
                px: { xs: 1.5, sm: 2 },
                minWidth: { xs: 'auto', sm: 0 },
              },
              "& .Mui-selected": { color: THEME.accent },
              "& .MuiTabs-indicator": { bgcolor: THEME.accent, height: 3, borderRadius: '3px' }
            }}
          >
            <Tab label={isMobile ? "All" : "All Requests"} value="all" icon={<AllIcon sx={{ fontSize: { xs: 15, sm: 18 } }} />} iconPosition="start" />
            <Tab label={`Pending (${stats.pending})`} value="pending" icon={<PendingIcon sx={{ fontSize: { xs: 15, sm: 18 } }} />} iconPosition="start" />
            <Tab label="Approved" value="approved" icon={<ApproveIcon sx={{ fontSize: { xs: 15, sm: 18 } }} />} iconPosition="start" />
            <Tab label="Rejected" value="rejected" icon={<DeclineIcon sx={{ fontSize: { xs: 15, sm: 18 } }} />} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* MEETING LIST */}
        {filteredMeetings.length === 0 ? (
          <Fade in={true}>
            <Paper sx={{ p: { xs: 5, sm: 8 }, textAlign: 'center', bgcolor: THEME.card, borderRadius: '24px', border: `1px dashed ${THEME.border}` }}>
              <Typography sx={{ color: THEME.textSecondary }}>No meetings found in this category.</Typography>
            </Paper>
          </Fade>
        ) : (
          <Stack spacing={2.5}>
            {filteredMeetings.map((item) => (
              <Fade in={true} key={item._id}>
                <Paper sx={{
                  p: { xs: 2, sm: 3 },
                  bgcolor: THEME.card,
                  borderRadius: "20px",
                  border: `1px solid ${THEME.border}`,
                  transition: '0.3s',
                  position: 'relative',
                  "&:hover": { borderColor: getStatusColor(item.status), transform: 'translateY(-4px)' }
                }}>
                  {/* Status Bar */}
                  <Box sx={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: '5px', bgcolor: getStatusColor(item.status), borderRadius: '20px 0 0 20px'
                  }} />

                  {/* Mobile: stacked layout | Desktop: grid layout */}
                  {isMobile ? (
                    <Stack spacing={2} sx={{ pl: 1 }}>

                      {/* Row 1: Avatar + Name + Status/Actions */}
                      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                          <Avatar sx={{ bgcolor: THEME.accent, fontWeight: 800, width: 40, height: 40, flexShrink: 0, fontSize: 16 }}>
                            {item.attendeeId?.name?.[0]}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography noWrap sx={{ color: '#fff', fontWeight: 800, fontSize: '14px' }}>{item.attendeeId?.name}</Typography>
                            <Typography noWrap variant="caption" sx={{ color: THEME.textSecondary, fontSize: '11px' }}>{item.attendeeId?.email}</Typography>
                          </Box>
                        </Stack>

                        {/* Status badge (non-pending) on mobile top-right */}
                        {item.status !== 'pending' && (
                          <Chip
                            label={item.status}
                            size="small"
                            sx={{
                              bgcolor: `${getStatusColor(item.status)}15`,
                              color: getStatusColor(item.status),
                              borderColor: `${getStatusColor(item.status)}44`,
                              fontWeight: 900, textTransform: 'uppercase', fontSize: '9px',
                              flexShrink: 0
                            }}
                            variant="outlined"
                          />
                        )}
                      </Stack>

                      {/* Row 2: Expo + Date/Time */}
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <ExpoIcon sx={{ fontSize: 13, color: THEME.accent }} />
                          <Typography variant="caption" sx={{ color: THEME.accent, fontWeight: 800, textTransform: 'uppercase', fontSize: '11px' }}>
                            {item.expoId?.title}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <TimeIcon sx={{ fontSize: 13, color: '#fff' }} />
                            <Typography sx={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{item.time}</Typography>
                          </Box>
                          <Typography sx={{ color: THEME.textSecondary, fontSize: '12px' }}>{item.date}</Typography>
                        </Stack>
                      </Box>

                      {/* Row 3: Accept/Decline buttons for pending */}
                      {item.status === 'pending' && (
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small" variant="contained" fullWidth
                            onClick={() => handleStatusUpdate(item._id, 'approved')}
                            sx={{ bgcolor: THEME.approved, color: '#000', fontWeight: 800, borderRadius: '8px', fontSize: '12px', "&:hover": { bgcolor: '#25cc9a' } }}
                          >
                            Accept
                          </Button>
                          <Button
                            size="small" variant="outlined" fullWidth
                            onClick={() => handleStatusUpdate(item._id, 'rejected')}
                            sx={{ borderColor: THEME.border, color: THEME.rejected, fontWeight: 700, borderRadius: '8px', fontSize: '12px' }}
                          >
                            Decline
                          </Button>
                        </Stack>
                      )}

                      {/* Note */}
                      {item.note && (
                        <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '10px', borderLeft: `2px solid ${THEME.border}` }}>
                          <Typography variant="caption" sx={{ color: THEME.textSecondary, fontStyle: 'italic', fontSize: '11px' }}>
                            Note: "{item.note}"
                          </Typography>
                        </Box>
                      )}
                    </Stack>

                  ) : (
                    // Desktop Grid Layout (unchanged)
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: THEME.accent, fontWeight: 800, width: 45, height: 45 }}>
                            {item.attendeeId?.name?.[0]}
                          </Avatar>
                          <Box overflow="hidden">
                            <Typography noWrap sx={{ color: '#fff', fontWeight: 800 }}>{item.attendeeId?.name}</Typography>
                            <Typography noWrap variant="caption" sx={{ color: THEME.textSecondary }}>{item.attendeeId?.email}</Typography>
                          </Box>
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <ExpoIcon sx={{ fontSize: 14, color: THEME.accent }} />
                          <Typography variant="caption" sx={{ color: THEME.accent, fontWeight: 800, textTransform: 'uppercase' }}>
                            {item.expoId?.title}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={2}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <TimeIcon sx={{ fontSize: 14, color: '#fff' }} />
                            <Typography sx={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{item.time}</Typography>
                          </Box>
                          <Typography sx={{ color: THEME.textSecondary, fontSize: '13px' }}>{item.date}</Typography>
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={4} sx={{ textAlign: { sm: 'right' } }}>
                        {item.status === 'pending' ? (
                          <Stack direction="row" spacing={1} justifyContent={{ sm: 'flex-end' }}>
                            <Button
                              size="small" variant="contained"
                              onClick={() => handleStatusUpdate(item._id, 'approved')}
                              sx={{ bgcolor: THEME.approved, color: '#000', fontWeight: 800, borderRadius: '8px', "&:hover": { bgcolor: '#25cc9a' } }}
                            >
                              Accept
                            </Button>
                            <Button
                              size="small" variant="outlined"
                              onClick={() => handleStatusUpdate(item._id, 'rejected')}
                              sx={{ borderColor: THEME.border, color: THEME.rejected, fontWeight: 700, borderRadius: '8px' }}
                            >
                              Decline
                            </Button>
                          </Stack>
                        ) : (
                          <Chip
                            label={item.status}
                            size="small"
                            sx={{
                              bgcolor: `${getStatusColor(item.status)}15`,
                              color: getStatusColor(item.status),
                              borderColor: `${getStatusColor(item.status)}44`,
                              fontWeight: 900, textTransform: 'uppercase', fontSize: '10px'
                            }}
                            variant="outlined"
                          />
                        )}
                      </Grid>

                      {item.note && (
                        <Grid item xs={12}>
                          <Box sx={{ mt: 1, p: 1.5, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '10px', borderLeft: `2px solid ${THEME.border}` }}>
                            <Typography variant="caption" sx={{ color: THEME.textSecondary, fontStyle: 'italic' }}>
                              Note: "{item.note}"
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  )}
                </Paper>
              </Fade>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}