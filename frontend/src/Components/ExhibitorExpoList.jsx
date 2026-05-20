import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import { 
  Box, Typography, Paper, Button, Stack, Chip, CircularProgress, Avatar, Container,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, AlertTitle
} from "@mui/material";
import { 
  HourglassEmptyRounded as PendingIcon,
  ArrowForwardRounded as JoinIcon,
  EmojiEventsOutlined as AwardIcon,
  ErrorOutlined as ErrorIcon,
  CheckCircleOutlined as SuccessIcon,
  TaskAltRounded as AssignedIcon
} from "@mui/icons-material";
import Swal from "sweetalert2";

const THEME = {
  bg: "#05070A",
  paper: "#0A0D14",
  accent: "#00b8d1",
  border: "rgba(255, 255, 255, 0.05)",
  textSecondary: "#64748B",
  rowHover: "rgba(0, 184, 209, 0.04)"
};

export default function ExhibitorExpoList() {
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false); 
  const navigate = useNavigate(); 
  
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?._id || userData?.id;
  const userEmail = userData.email;

  useEffect(() => { 
    fetchExpos(); 
    checkUserStatus(); 
  }, []);

  const checkUserStatus = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/user/${userId}`);
      setIsVerified(res.data.isVerified);
    } catch (err) { console.error("Status Check Error", err); }
  };

  const fetchExpos = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/expo/all-expos");
      setExpos(res.data ? res.data.filter(e => e.status === 'active') : []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleApply = async (expo) => {
    try {
      const userRes = await axios.get(`http://localhost:5000/api/auth/user/${userId}`);
      const currentUser = userRes.data;

      const isProfileComplete = currentUser.organization && currentUser.logo;
      const hasDocuments = currentUser.documents && currentUser.documents.length > 0;

      if (!isProfileComplete || !hasDocuments) {
        return Swal.fire({
          title: "Profile Incomplete",
          text: "You must complete your Business Profile and upload verification documents first.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Complete Profile Now",
          confirmButtonColor: THEME.accent,
          background: THEME.paper,
          color: "#fff",
        }).then((result) => {
          if (result.isConfirmed) navigate("/exhibitor/profile/edit");
        });
      }

      if (!currentUser.isVerified) {
        return Swal.fire({
          title: "Verification Pending",
          text: "Admin has not verified your documents yet. Please wait for approval.",
          icon: "info",
          background: THEME.paper,
          color: "#fff"
        });
      }

      Swal.fire({
        title: 'Submit Application?',
        html: `Confirm booth request for <b>${expo.title}</b>?`,
        icon: 'question',
        showCancelButton: true, confirmButtonColor: THEME.accent, background: THEME.paper, color: '#fff'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await axios.post("http://localhost:5000/api/expo/apply", { expoId: expo._id, exhibitorEmail: userEmail });
            Swal.fire({ title: 'Request Sent!', icon: 'success', background: THEME.paper, color: '#fff' });
            fetchExpos();
          } catch (err) {
            Swal.fire({ title: 'Error', text: 'Failed to send request.', icon: 'error', background: THEME.paper, color: '#fff' });
          }
        }
      });

    } catch (err) {
      Swal.fire("Error", "Connection failed.", "error");
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', bgcolor: THEME.bg }}>
      <CircularProgress sx={{ color: THEME.accent }} />
    </Box>
  );

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: THEME.bg, color: "#fff", overflowX: 'hidden' }}>
      
      {/* Custom Scrollbar Style for Table */}
      <style>{`
        .responsive-table::-webkit-scrollbar { height: 6px; }
        .responsive-table::-webkit-scrollbar-track { background: ${THEME.bg}; }
        .responsive-table::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 10px; }
        .responsive-table::-webkit-scrollbar-thumb:hover { background: ${THEME.accent}; }
      `}</style>

      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        
        {/* 1. VERIFICATION BANNER */}
        {isVerified ? (
            <Alert 
                severity="success" 
                icon={<SuccessIcon sx={{ color: '#10b981' }} />}
                sx={{ mb: 4, borderRadius: '16px', bgcolor: 'rgba(16, 185, 129, 0.05)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}
            >
                <AlertTitle sx={{ fontWeight: 800 }}>Account Verified</AlertTitle>
                Your profile is officially verified. You can now apply for booth spaces.
            </Alert>
        ) : (
            <Alert 
                severity="warning" 
                icon={<ErrorIcon sx={{ color: '#f59e0b' }} />}
                sx={{ mb: 4, borderRadius: '16px', bgcolor: 'rgba(245, 158, 11, 0.05)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' }}
            >
                <AlertTitle sx={{ fontWeight: 800 }}>Verification Required</AlertTitle>
                Complete your profile and wait for Admin approval to start applying.
            </Alert>
        )}

        <Box sx={{ mb: { xs: 4, sm: 6 } }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <AwardIcon sx={{ color: THEME.accent, fontSize: 18 }} />
            <Typography sx={{ color: THEME.accent, fontWeight: 700, fontSize: '12px', letterSpacing: 1.5, textTransform: 'uppercase' }}>Marketplace</Typography>
          </Stack>
          <Typography variant="h4" sx={{ fontWeight: 900, fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>
            Available <span style={{ color: THEME.accent }}>Expositions</span>
          </Typography>
        </Box>

        {/* TABLE CONTAINER WITH HORIZONTAL SCROLL */}
        <TableContainer 
          component={Paper} 
          className="responsive-table"
          sx={{ 
            bgcolor: THEME.paper, 
            borderRadius: '24px', 
            border: `1px solid ${THEME.border}`, 
            backgroundImage: 'none',
            maxWidth: '100%',
            overflowX: 'auto' 
          }}
        >
          <Table sx={{ minWidth: 800 }}> {/* Fixed minWidth ensures columns don't crush */}
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                <TableCell sx={{ color: THEME.textSecondary, fontWeight: 700, borderBottom: `1px solid ${THEME.border}` }}>EVENT IDENTITY</TableCell>
                <TableCell sx={{ color: THEME.textSecondary, fontWeight: 700, borderBottom: `1px solid ${THEME.border}` }}>LOCATION</TableCell>
                <TableCell sx={{ color: THEME.textSecondary, fontWeight: 700, borderBottom: `1px solid ${THEME.border}` }}>DATE</TableCell>
                <TableCell sx={{ color: THEME.textSecondary, fontWeight: 700, borderBottom: `1px solid ${THEME.border}` }}>BOOTHS</TableCell>
                <TableCell align="right" sx={{ color: THEME.textSecondary, fontWeight: 700, borderBottom: `1px solid ${THEME.border}` }}>APPLICATION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expos.map((item) => {
                const hasApplied = item.appliedExhibitors?.includes(userEmail);
                const isFull = item.booths?.available <= 0;
                const assignedBooth = item.booths?.layout?.find(
                    (b) => String(b.exhibitorId) === String(userId) || String(b.exhibitorId?._id) === String(userId)
                );

                return (
                  <TableRow key={item._id} sx={{ '&:hover': { bgcolor: THEME.rowHover } }}>
                    <TableCell sx={{ borderBottom: `1px solid ${THEME.border}`, whiteSpace: 'nowrap' }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'rgba(0, 184, 209, 0.1)', color: THEME.accent, fontWeight: 800 }}>{item.title.charAt(0)}</Avatar>
                        <Box>
                          <Typography sx={{ color: '#fff', fontWeight: 700 }}>{item.title}</Typography>
                          <Typography sx={{ color: '#10b981', fontSize: '10px', fontWeight: 700 }}>VERIFIED ORGANIZER</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ borderBottom: `1px solid ${THEME.border}`, color: THEME.textSecondary, whiteSpace: 'nowrap' }}>
                      {item.location?.venue}
                    </TableCell>
                    <TableCell sx={{ borderBottom: `1px solid ${THEME.border}`, color: '#fff', whiteSpace: 'nowrap' }}>
                      {new Date(item.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ borderBottom: `1px solid ${THEME.border}`, whiteSpace: 'nowrap' }}>
                      <Chip 
                        label={isFull ? "Fully Booked" : `${item.booths?.available} Available`}
                        size="small"
                        sx={{ bgcolor: isFull ? 'rgba(255,0,0,0.1)' : 'rgba(0,184,209,0.1)', color: isFull ? '#ff6464' : THEME.accent, fontWeight: 700, fontSize: '11px' }} 
                      />
                    </TableCell>

                    <TableCell align="right" sx={{ borderBottom: `1px solid ${THEME.border}`, whiteSpace: 'nowrap' }}>
                      {assignedBooth ? (
                        <Button disabled startIcon={<AssignedIcon />} sx={{ bgcolor: 'rgba(16, 185, 129, 0.1) !important', color: '#10b981 !important', borderRadius: '10px', textTransform: 'none', fontWeight: 800, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            Assigned
                        </Button>
                      ) : hasApplied ? (
                        <Button disabled startIcon={<PendingIcon />} sx={{ bgcolor: 'rgba(255, 255, 255, 0.05) !important', color: 'rgba(255, 255, 255, 0.3) !important', borderRadius: '10px', textTransform: 'none' }}>
                          Request Pending
                        </Button>
                      ) : isFull ?  (
                         <Button disabled sx={{ bgcolor: 'rgba(255,0,0,0.08) !important', color: 'rgba(255,100,100,0.5) !important', borderRadius: '10px', textTransform: 'none' }}>
                            Full
                         </Button>
                      ) : (
                        <Button variant="contained" onClick={() => handleApply(item)} endIcon={<JoinIcon />} sx={{ bgcolor: THEME.accent, color: '#000', fontWeight: 800, borderRadius: '10px', textTransform: 'none', "&:hover": { bgcolor: THEME.accent, opacity: 0.9 } }}>
                          Apply for Booth
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}