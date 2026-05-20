import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Chip, Stack, Container, CircularProgress, Tooltip, Avatar, Fade
} from "@mui/material";
import { 
  EditTwoTone as EditIcon, 
  DeleteTwoTone as DeleteIcon, 
  StorefrontTwoTone as ShopIcon,
  LaunchTwoTone as ViewIcon,
  EventAvailableTwoTone as EventIcon
} from "@mui/icons-material";
import Swal from "sweetalert2";

const THEME = {
  accent: "#00b8d1",
  bg: "#05070A",
  card: "#0A0D14",
  border: "rgba(255, 255, 255, 0.08)",
  textSecondary: "#94A3B8",
  success: "#10b981"
};

export default function ManageShowcases() {
  const [showcases, setShowcases] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const exhibitorId = userData?._id || userData?.id;

  useEffect(() => {
    if (exhibitorId) fetchMyShowcases();
  }, [exhibitorId]);

  const fetchMyShowcases = async () => {
    try {
      // 🟢 Database se data fetch ho raha hai
      const res = await axios.get(`http://localhost:5000/api/events/my-events/${exhibitorId}`);
      setShowcases(res.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will permanently remove your digital showcase.",
      icon: "warning",
      showCancelButton: true,
      background: THEME.card,
      color: "#fff",
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, Delete",
      cancelButtonColor: THEME.border
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/api/events/delete/${id}`);
          setShowcases(showcases.filter(s => s._id !== id));
          Swal.fire({ title: "Deleted", icon: "success", background: THEME.card, color: "#fff" });
        } catch (err) {
          Swal.fire("Error", "Could not delete showcase", "error");
        }
      }
    });
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 20, bgcolor: THEME.bg, minHeight: '100vh' }}>
      <CircularProgress sx={{ color: THEME.accent }} />
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', py: 6, bgcolor: THEME.bg }}>
      <Container maxWidth="lg">
        
        {/* HEADER SECTION */}
        <Box sx={{ mb: 6 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <ShopIcon sx={{ color: THEME.accent, fontSize: 20 }} />
            <Typography sx={{ color: THEME.accent, fontWeight: 700, fontSize: '12px', letterSpacing: 1.5, textTransform: 'uppercase' }}>Assets Overview</Typography>
          </Stack>
          <Typography variant="h3" sx={{ fontWeight: 900, color: "#fff", letterSpacing: -1.5 }}>
            Manage <span style={{ color: THEME.accent }}>Showcases</span>
          </Typography>
          <Typography sx={{ color: THEME.textSecondary, mt: 1 }}>Monitor and edit your active digital storefronts across all registered expos.</Typography>
        </Box>

        {/* TABLE SECTION */}
        <TableContainer component={Paper} sx={{ 
          bgcolor: THEME.card, borderRadius: '28px', border: `1px solid ${THEME.border}`, 
          backgroundImage: 'none', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' 
        }}>
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
              <TableRow>
                <TableCell sx={{ color: THEME.textSecondary, fontWeight: 700, py: 3 }}>BRAND IDENTITY</TableCell>
                <TableCell sx={{ color: THEME.textSecondary, fontWeight: 700 }}>EVENT / VENUE</TableCell>
                <TableCell sx={{ color: THEME.textSecondary, fontWeight: 700 }}>BOOTH ID</TableCell>
                <TableCell sx={{ color: THEME.textSecondary, fontWeight: 700 }}>STATUS</TableCell>
                <TableCell align="right" sx={{ color: THEME.textSecondary, fontWeight: 700 }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {showcases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 12 }}>
                    <Typography sx={{ color: THEME.textSecondary }}>No active showcases found.</Typography>
                    <Typography sx={{ color: THEME.accent, fontSize: '13px', mt: 1, cursor: 'pointer' }} onClick={() => navigate('/exhibitor/booth-selection')}>Initialize your first booth now →</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                showcases.map((row) => (
                  <TableRow key={row._id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.01)' }, transition: '0.2s' }}>
                    <TableCell sx={{ borderBottom: `1px solid ${THEME.border}`, py: 3 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        {/* 🟢 Database se Logo dikhana */}
                        <Avatar 
                          src={row.logo} 
                          sx={{ bgcolor: 'rgba(0,184,209,0.1)', color: THEME.accent, width: 48, height: 48, border: `1px solid ${THEME.border}` }}
                        >
                          <ShopIcon />
                        </Avatar>
                        <Box>
                          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>{row.shopName}</Typography>
                          <Typography sx={{ color: THEME.textSecondary, fontSize: '11px' }}>ID: {row._id.slice(-6).toUpperCase()}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    
                    <TableCell sx={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <Typography sx={{ color: '#E2E8F0', fontWeight: 600, fontSize: '14px' }}>{row.expoId?.title || "Unknown Event"}</Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                         <EventIcon sx={{ fontSize: 12, color: THEME.textSecondary }} />
                         <Typography sx={{ color: THEME.textSecondary, fontSize: '11px' }}>{row.expoId?.location?.venue || "N/A"}</Typography>
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <Chip label={`#${row.boothNumber}`} size="small" sx={{ bgcolor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', fontWeight: 800, borderRadius: '8px' }} />
                    </TableCell>

                    <TableCell sx={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <Chip label="LIVE" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: THEME.success, fontSize: '10px', fontWeight: 900, border: `1px solid ${THEME.success}33` }} />
                    </TableCell>

                    <TableCell align="right" sx={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Edit Content">
                          <IconButton onClick={() => navigate(`/exhibitor/booth-setup?expoId=${row.expoId?._id}&boothId=${row.boothNumber}`)} sx={{ color: THEME.accent, bgcolor: 'rgba(0,184,209,0.05)', '&:hover': { bgcolor: 'rgba(0,184,209,0.2)' } }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove Store">
                          <IconButton onClick={() => handleDelete(row._id)} sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.05)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}