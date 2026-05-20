import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Box, Typography, Paper, Grid, Stack, Container, 
  IconButton, Button, Chip, CircularProgress, Divider
} from "@mui/material";
import { 
  FilePresentTwoTone as FileIcon,
  CloudDownloadTwoTone as DownloadIcon,
  VerifiedUserTwoTone as VerifiedIcon,
  HourglassEmptyTwoTone as PendingIcon,
  InfoOutlined as InfoIcon,
  OpenInNewTwoTone as OpenIcon
} from "@mui/icons-material";

const THEME = {
  bg: "#05070A",
  card: "#0A0D14",
  accent: "#38bdf8", // Consistent blue accent
  border: "rgba(255, 255, 255, 0.08)",
  textSecondary: "#94A3B8",
};

export default function ExhibitorDocument() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?._id || userData?.id;

  useEffect(() => {
    if (userId) fetchDocs();
  }, [userId]);

  const fetchDocs = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/user/${userId}`);
      setUserProfile(res.data);
    } catch (err) { 
      console.error("Error fetching documents", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDownload = (base64, index) => {
    const link = document.createElement("a");
    link.href = base64;
    link.download = `Document_${index + 1}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpen = (base64) => {
    const newTab = window.open();
    newTab.document.body.innerHTML = `<iframe src="${base64}" width="100%" height="100%" style="border:none;"></iframe>`;
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress sx={{ color: THEME.accent }} />
    </Box>
  );

  const documents = userProfile?.documents || [];
  const isVerified = userProfile?.isVerified || false;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 900, color: "#fff", mb: 1, letterSpacing: '-1px' }}>
          Document <span style={{ color: THEME.accent }}>Vault</span>
        </Typography>
        <Typography sx={{ color: THEME.textSecondary, fontSize: '15px' }}>
          {isVerified 
            ? "Your account and documents are fully verified." 
            : "Review your submitted credentials and verification status."}
        </Typography>
      </Box>

      {documents.length === 0 ? (
        <Paper sx={{ p: 10, textAlign: 'center', bgcolor: THEME.card, borderRadius: '28px', border: `1px dashed ${THEME.border}`, backgroundImage: 'none' }}>
            <InfoIcon sx={{ fontSize: 50, color: THEME.textSecondary, mb: 2 }} />
            <Typography sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>No documents found in your vault.</Typography>
            <Button 
              variant="contained" 
              href="/exhibitor/profile" // Link to profile to upload
              sx={{ bgcolor: THEME.accent, color: '#000', fontWeight: 800, borderRadius: '10px', textTransform: 'none' }}
            >
              Go to Profile to Upload
            </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {documents.map((doc, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper sx={{ 
                p: 3, bgcolor: THEME.card, borderRadius: '24px', border: `1px solid ${isVerified ? 'rgba(74, 222, 128, 0.2)' : THEME.border}`,
                transition: '0.3s', '&:hover': { borderColor: THEME.accent, transform: 'translateY(-5px)' },
                backgroundImage: 'none', position: 'relative', overflow: 'hidden'
              }}>
                {/* Visual Accent for Verified Docs */}
                {isVerified && (
                  <Box sx={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', background: 'linear-gradient(135deg, transparent 50%, rgba(74, 222, 128, 0.1) 50%)' }} />
                )}

                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    <Box sx={{ 
                      width: 52, height: 52, borderRadius: '16px', 
                      bgcolor: isVerified ? 'rgba(74, 222, 128, 0.1)' : 'rgba(56, 189, 248, 0.1)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      color: isVerified ? '#4ade80' : THEME.accent 
                    }}>
                        <FileIcon sx={{ fontSize: 30 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>Document_{index+1}</Typography>
                        <Typography sx={{ color: THEME.textSecondary, fontSize: '11px' }}>Legal Submission</Typography>
                    </Box>
                </Stack>

                <Divider sx={{ borderColor: THEME.border, mb: 2 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    {/* 🟢 DYNAMIC STATUS CHIP */}
                    <Chip 
                        icon={isVerified ? <VerifiedIcon sx={{ fontSize: '14px !important' }} /> : <PendingIcon sx={{ fontSize: '14px !important' }} />} 
                        label={isVerified ? "Verified" : "Pending"} 
                        size="small" 
                        sx={{ 
                          bgcolor: isVerified ? 'rgba(74, 222, 128, 0.1)' : 'rgba(251, 191, 36, 0.1)', 
                          color: isVerified ? '#4ade80' : '#fbbf24', 
                          fontWeight: 800, fontSize: '10px', px: 0.5
                        }} 
                    />

                    <Stack direction="row" spacing={1}>
                        <IconButton size="small" onClick={() => handleOpen(doc)} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: THEME.accent, color: '#000' } }}>
                            <OpenIcon fontSize="inherit" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDownload(doc, index)} sx={{ color: THEME.accent, bgcolor: 'rgba(56, 189, 248, 0.05)', '&:hover': { bgcolor: '#fff', color: '#000' } }}>
                            <DownloadIcon fontSize="inherit" />
                        </IconButton>
                    </Stack>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Verification Notice */}
      <Paper sx={{ 
        mt: 8, p: 3, 
        bgcolor: isVerified ? 'rgba(74, 222, 128, 0.03)' : 'rgba(56, 189, 248, 0.03)', 
        border: `1px solid ${isVerified ? '#4ade8033' : '#38bdf833'}`, 
        borderRadius: '20px', backgroundImage: 'none'
      }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <VerifiedIcon sx={{ color: isVerified ? '#4ade80' : THEME.accent }} />
            <Box>
              <Typography sx={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>
                {isVerified ? "Authentication Complete" : "Privacy & Security"}
              </Typography>
              <Typography sx={{ color: THEME.textSecondary, fontSize: '13px' }}>
                {isVerified 
                  ? "Admin has approved your business credentials. You are now a verified partner."
                  : "All documents are encrypted and only accessible by the event organizers for verification."}
              </Typography>
            </Box>
          </Stack>
      </Paper>
    </Container>
  );
}