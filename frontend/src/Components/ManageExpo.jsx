import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';
import {
  Box, Typography, Paper, IconButton, Chip, Stack,
  CircularProgress, Avatar, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, Zoom, Button,
  useMediaQuery, useTheme, Card, CardMedia, CardContent, CardActions, Grid
} from "@mui/material";

import EditIcon from "@mui/icons-material/EditTwoTone";
import DeleteIcon from "@mui/icons-material/DeleteTwoTone";
import FloorPlanIcon from "@mui/icons-material/MapTwoTone";
import ScheduleIcon from "@mui/icons-material/ScheduleTwoTone";
import DateIcon from "@mui/icons-material/EventTwoTone";
import LocationIcon from "@mui/icons-material/LocationOnTwoTone";
import ActiveIcon from "@mui/icons-material/CheckCircleTwoTone";
import DraftIcon from "@mui/icons-material/DriveFileRenameOutlineTwoTone";
import CloseIcon from "@mui/icons-material/Close";
import LockIcon from "@mui/icons-material/LockTwoTone";
import WarningIcon from "@mui/icons-material/ReportProblemTwoTone";
import AccessTimeIcon from "@mui/icons-material/AccessTimeFilledTwoTone";

const THEME = {
  bg: "#05070A",
  paper: "#0D1117",
  accent: "#38bdf8",
  border: "rgba(255, 255, 255, 0.08)",
  rowHover: "rgba(56, 189, 248, 0.04)"
};

export default function ManageExpo() {
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));   // < 600px
  const isTablet = useMediaQuery(muiTheme.breakpoints.down("lg"));   // < 1200px → cards layout

  const [scheduleModal, setScheduleModal] = useState({
    open: false, data: [], loading: false, expoName: "", expoStatus: "", expoId: ""
  });

  useEffect(() => { fetchExpos(); }, []);

  const fetchExpos = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/expo/all-expos");
      setExpos(res.data || []);
    } catch (err) { console.log(err); } finally { setLoading(false); }
  };

  const handleViewSchedule = async (expo) => {
    setScheduleModal({
      open: true, data: [], loading: true,
      expoName: expo.title, expoStatus: expo.status, expoId: expo._id
    });
    if (expo.status === 'active') {
      try {
        const res = await axios.get(`http://localhost:5000/api/schedule/expo/${expo._id}`);
        setScheduleModal(prev => ({ ...prev, data: res.data, loading: false }));
      } catch (err) { setScheduleModal(prev => ({ ...prev, loading: false })); }
    } else {
      setScheduleModal(prev => ({ ...prev, loading: false }));
    }
  };

  const updateStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active';
    try {
      await axios.put(`http://localhost:5000/api/expo/update-status/${id}`, { status: newStatus });
      fetchExpos();
      Swal.fire({ title: `Status: ${newStatus.toUpperCase()}`, icon: "success", toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, background: THEME.paper, color: '#fff' });
    } catch (err) { console.log(err); }
  };

  const handleDelete = async (id) => {
    Swal.fire({ title: "Are you sure?", text: "This will permanently delete the expo.", icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", background: THEME.paper, color: "#fff" })
      .then(async (result) => {
        if (result.isConfirmed) {
          try { await axios.delete(`http://localhost:5000/api/expo/delete/${id}`); fetchExpos(); } catch (err) { console.log(err); }
        }
      });
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const getBannerSrc = (image) => {
    if (!image || image.length <= 100) return null;
    return image.startsWith('data:image') ? image : `data:image/jpeg;base64,${image}`;
  };

  // ── Action buttons — shared between mobile cards and desktop table ──
  const ActionButtons = ({ item }) => (
    <Stack direction="row" spacing={0.5} flexWrap="wrap">
      <Tooltip title="Edit">
        <IconButton onClick={() => navigate(`/admin/expo/edit/${item._id}`)} sx={{ color: THEME.accent }} size="small">
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Designer">
        <IconButton onClick={() => navigate(`/admin/floor-plan-designer/${item._id}`)} sx={{ color: '#fbbf24' }} size="small">
          <FloorPlanIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Timeline">
        <IconButton onClick={() => handleViewSchedule(item)} sx={{ color: '#a78bfa' }} size="small">
          <ScheduleIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={item.status === 'active' ? "To Draft" : "Activate"}>
        <IconButton onClick={() => updateStatus(item._id, item.status)} sx={{ color: item.status === 'active' ? '#94a3b8' : '#4ade80' }} size="small">
          {item.status === 'active' ? <DraftIcon fontSize="small" /> : <ActiveIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
      <IconButton onClick={() => handleDelete(item._id)} sx={{ color: '#ef4444' }} size="small">
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Stack>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: THEME.bg, p: { xs: 0, sm: 0, md: 4 } }}>

      {/* Header */}
      <Box sx={{ mb: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3, md: 0 } }}>
        <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 900, color: '#fff' }}>
          Expo <span style={{ color: THEME.accent }}>Management</span>
        </Typography>
        <Typography sx={{ color: "#94A3B8", fontSize: { xs: '13px', sm: '14px' } }}>
          Monitor and manage all active event timelines.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: THEME.accent }} />
        </Box>
      ) : (
        <>
          {/* ── MOBILE & TABLET: Card layout ── */}
          {isTablet ? (
            <Grid container spacing={2} sx={{ px: { xs: 2, sm: 3, md: 0 } }}>
              {expos.map((item) => (
                <Grid item xs={12} sm={6} key={item._id}>
                  <Paper sx={{
                    bgcolor: THEME.paper, borderRadius: '16px',
                    border: `1px solid ${THEME.border}`, backgroundImage: 'none', overflow: 'hidden',
                    transition: '0.2s', '&:hover': { borderColor: THEME.accent }
                  }}>
                    {/* Banner */}
                    <Box sx={{ width: '100%', height: 110, bgcolor: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {getBannerSrc(item.image) ? (
                        <img src={getBannerSrc(item.image)} alt="Expo Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <DateIcon sx={{ fontSize: 36, color: '#444', opacity: 0.4 }} />
                      )}
                    </Box>

                    {/* Body */}
                    <Box sx={{ p: 2 }}>
                      {/* Title + Status */}
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 1 }}>
                        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '14px', lineHeight: 1.3, flex: 1 }}>
                          {item.title}
                        </Typography>
                        <Chip
                          label={item.status} size="small"
                          sx={{
                            fontWeight: 800, fontSize: '9px', textTransform: 'uppercase', flexShrink: 0,
                            bgcolor: item.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                            color: item.status === 'active' ? '#4ade80' : '#94a3b8'
                          }}
                        />
                      </Stack>

                      {/* Meta info */}
                      <Typography sx={{ color: "#94A3B8", fontSize: '11px', mb: 0.5 }}>
                        📍 {item.location?.venue}
                      </Typography>
                      <Typography sx={{ color: "#94A3B8", fontSize: '11px', mb: 1.5 }}>
                        📅 {formatDate(item.startDate)}
                      </Typography>

                      {/* Booths */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ color: '#64748b', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Booths</Typography>
                        <Typography sx={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>
                          {item.booths?.layout?.length || 0} / {item.booths?.total || 0}
                        </Typography>
                      </Stack>

                      {/* Divider */}
                      <Box sx={{ borderTop: `1px solid ${THEME.border}`, mt: 1.5, pt: 1.5 }}>
                        <ActionButtons item={item} />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}

              {expos.length === 0 && (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography sx={{ color: '#64748b' }}>No expos found.</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          ) : (
            // ── DESKTOP: Table layout (original) ──
            <TableContainer component={Paper} sx={{ bgcolor: THEME.paper, borderRadius: '16px', border: `1px solid ${THEME.border}`, backgroundImage: 'none', overflow: 'hidden', mx: { xs: 2, sm: 3, md: 0 } }}>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                  <TableRow>
                    <TableCell sx={{ color: "#94A3B8", fontWeight: 700, width: '80px' }}>BANNER</TableCell>
                    <TableCell sx={{ color: "#94A3B8", fontWeight: 700 }}>EXPO IDENTITY</TableCell>
                    <TableCell sx={{ color: "#94A3B8", fontWeight: 700 }}>STATUS</TableCell>
                    <TableCell sx={{ color: "#94A3B8", fontWeight: 700 }}>BOOTHS</TableCell>
                    <TableCell align="right" sx={{ color: "#94A3B8", fontWeight: 700 }}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expos.map((item) => (
                    <TableRow key={item._id} sx={{ '&:hover': { bgcolor: THEME.rowHover } }}>
                      <TableCell>
                        <Box sx={{ width: 65, height: 45, borderRadius: '8px', overflow: 'hidden', border: `1px solid ${THEME.border}`, bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getBannerSrc(item.image) ? (
                            <img src={getBannerSrc(item.image)} alt="Expo Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <DateIcon sx={{ fontSize: 18, color: "#444", opacity: 0.5 }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box>
                            <Typography sx={{ color: '#fff', fontWeight: 700 }}>{item.title}</Typography>
                            <Typography sx={{ color: "#94A3B8", fontSize: '11px' }}>{item.location?.venue} • {formatDate(item.startDate)}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip label={item.status} size="small" sx={{ fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', bgcolor: item.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(148, 163, 184, 0.1)', color: item.status === 'active' ? '#4ade80' : '#94a3b8' }} />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ color: '#fff', fontSize: '12px' }}>{item.booths?.layout?.length || 0} / {item.booths?.total || 0}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <ActionButtons item={item} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* ── SCHEDULE MODAL (responsive width) ── */}
      <Dialog
        open={scheduleModal.open} TransitionComponent={Zoom}
        onClose={() => setScheduleModal({ ...scheduleModal, open: false })}
        fullScreen={isMobile}  // full screen on mobile
        PaperProps={{
          sx: {
            bgcolor: "#0A0D14 !important", border: `1px solid ${THEME.border}`,
            borderRadius: isMobile ? 0 : '24px',
            width: '100%', maxWidth: { xs: '100%', sm: '500px' },
            backgroundImage: 'none !important', boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
          }
        }}
      >
        <DialogTitle sx={{ p: { xs: 2, sm: 3 }, borderBottom: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: "#0A0D14" }}>
          <Box>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1.5, fontSize: { xs: '15px', sm: '18px' } }}>
              <AccessTimeIcon sx={{ color: THEME.accent }} /> Event Agenda
            </Typography>
            <Typography sx={{ color: THEME.accent, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              {scheduleModal.expoName}
            </Typography>
          </Box>
          <IconButton onClick={() => setScheduleModal({ ...scheduleModal, open: false })} sx={{ color: '#94A3B8' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2, sm: 3 }, pt: { xs: 3, sm: 4 }, bgcolor: "#0A0D14" }}>
          {scheduleModal.expoStatus !== 'active' ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.05)', color: '#f59e0b', width: 80, height: 80, mx: 'auto', mb: 2, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <LockIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800 }}>Agenda Locked</Typography>
              <Typography sx={{ color: "#94A3B8", fontSize: '14px', mb: 4 }}>Expo must be active to view the timeline.</Typography>
              <Button fullWidth variant="contained"
                onClick={() => { updateStatus(scheduleModal.expoId, 'draft'); setScheduleModal(p => ({ ...p, open: false })); }}
                sx={{ bgcolor: THEME.accent, color: '#000', fontWeight: 900, borderRadius: '12px' }}>
                Activate Now
              </Button>
            </Box>
          ) : scheduleModal.loading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress size={40} sx={{ color: THEME.accent }} /></Box>
          ) : scheduleModal.data.length > 0 ? (
            <Box sx={{ px: { xs: 0, sm: 1 } }}>
              {scheduleModal.data.map((session, i) => (
                <Box key={i} sx={{ display: 'grid', gridTemplateColumns: { xs: '70px 32px 1fr', sm: '85px 40px 1fr' }, alignItems: 'start' }}>
                  {/* Time Column */}
                  <Box sx={{ textAlign: 'right', pt: 1, pr: 1.5 }}>
                    <Typography sx={{ color: THEME.accent, fontSize: { xs: '11px', sm: '12px' }, fontWeight: 900 }}>{session.startTime}</Typography>
                    <Typography sx={{ color: '#64748b', fontSize: { xs: '9px', sm: '10px' }, fontWeight: 700 }}>{session.endTime}</Typography>
                  </Box>
                  {/* Timeline Graphic */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', height: '100%' }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', border: `2px solid ${THEME.accent}`, bgcolor: '#0A0D14', zIndex: 1, mt: 1.2, boxShadow: `0 0 8px ${THEME.accent}` }} />
                    {i !== scheduleModal.data.length - 1 && (
                      <Box sx={{ width: '2px', flexGrow: 1, bgcolor: 'rgba(56, 189, 248, 0.2)', position: 'absolute', top: 20, bottom: -10 }} />
                    )}
                  </Box>
                  {/* Session Card */}
                  <Box sx={{ pb: { xs: 3, sm: 4 } }}>
                    <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'rgba(255,255,255,0.02)', border: `1px solid ${THEME.border}`, borderRadius: '18px', transition: '0.3s', "&:hover": { borderColor: THEME.accent, transform: 'translateX(4px)' } }}>
                      <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: '13px', sm: '14px' }, mb: 1.5, lineHeight: 1.4 }}>{session.title}</Typography>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '11px', bgcolor: THEME.accent, color: '#000', fontWeight: 900 }}>{session.speaker?.charAt(0)}</Avatar>
                        <Box>
                          <Typography sx={{ color: '#F8FAFC', fontSize: '12px', fontWeight: 600 }}>{session.speaker}</Typography>
                          <Typography sx={{ color: '#64748b', fontSize: '10px' }}>Speaker</Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <WarningIcon sx={{ fontSize: 50, color: THEME.accent, opacity: 0.2, mb: 1 }} />
              <Typography sx={{ color: '#fff', fontWeight: 700 }}>Agenda is Empty</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}