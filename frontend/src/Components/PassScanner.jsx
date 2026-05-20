import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  Box, Typography, Paper, Stack, Avatar, Chip, Button, Fade
} from "@mui/material";
import {
  Verified as VerifiedIcon,
  QrCode2 as QrIcon,
  RestartAlt as ResetIcon,
  Business as CompanyIcon,
  LocationOn as BoothIcon,
  Stars as VIPIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material";

// Exhibitor Theme - Using Gold/Amber for a premium feel
const EXHIBITOR_THEME = {
  bg: "#05070A",
  card: "#0A0D14",
  cardAlt: "#11141B",
  accent: "#fbbf24", // Gold Amber
  green: "#10b981",
  border: "rgba(251,191,36,0.1)",
  sub: "#94a3b8",
};

export default function ExhibitorScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5QrcodeScanner("reader", {
      fps: 20,
      qrbox: { width: 240, height: 240 },
      aspectRatio: 1.0,
    });

    scanner.render((result) => {
      try {
        setScanResult(JSON.parse(result));
        setScanning(false);
      } catch (e) { console.error("Invalid QR"); }
    }, () => {});

    return () => scanner.clear().catch(() => {});
  }, [scanning]);

  const handleReset = () => {
    setScanResult(null);
    setScanning(true);
  };

  return (
    <Box sx={{
      minHeight: "100vh", bgcolor: EXHIBITOR_THEME.bg, display: "flex",
      flexDirection: "column", alignItems: "center",
      py: 4, px: 2, boxSizing: "border-box",
    }}>

      {/* HEADER */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Box sx={{
          display: "inline-flex", alignItems: "center", gap: 1,
          bgcolor: "rgba(251,191,36,0.08)", border: `1px solid rgba(251,191,36,0.2)`,
          borderRadius: "50px", px: 2.5, py: 0.8, mb: 2,
        }}>
          <VIPIcon sx={{ color: EXHIBITOR_THEME.accent, fontSize: 14 }} />
          <Typography sx={{ color: EXHIBITOR_THEME.accent, fontSize: "11px", fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" }}>
            Exhibitor Portal
          </Typography>
        </Box>
        <Typography sx={{ fontSize: "24px", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>
          Partner <span style={{ color: EXHIBITOR_THEME.accent }}>Verification</span>
        </Typography>
      </Box>

      {/* SCANNER AREA */}
      {scanning && (
        <Box sx={{ width: "100%", maxWidth: 360 }}>
          <Box sx={{
            position: "relative", borderRadius: "24px", overflow: "hidden",
            border: `1px solid ${EXHIBITOR_THEME.border}`,
            boxShadow: `0 0 60px rgba(251,191,36,0.05)`,
          }}>
            <div id="reader" style={{ width: "100%" }} />
            
            {/* Animated Laser - Gold */}
            <Box sx={{
              position: "absolute", left: "calc(50% - 90px)", width: 180, height: "2px",
              bgcolor: EXHIBITOR_THEME.accent, boxShadow: `0 0 15px ${EXHIBITOR_THEME.accent}`,
              animation: "laser 2.5s ease-in-out infinite",
              "@keyframes laser": {
                "0%": { top: "calc(50% - 90px)" },
                "50%": { top: "calc(50% + 90px)" },
                "100%": { top: "calc(50% - 90px)" },
              },
            }} />
          </Box>
        </Box>
      )}

      {/* EXHIBITOR RESULT CARD */}
      {scanResult && (
        <Fade in timeout={400}>
          <Box sx={{ width: "100%", maxWidth: 400 }}>
            
            <Box sx={{
              bgcolor: EXHIBITOR_THEME.accent, borderRadius: "16px 16px 0 0",
              py: 1.2, display: "flex", alignItems: "center", justifyContent: "center", gap: 1,
            }}>
              <VerifiedIcon sx={{ color: "#000", fontSize: 16 }} />
              <Typography sx={{ color: "#000", fontWeight: 900, fontSize: "12px", letterSpacing: 2 }}>
                EXHIBITOR VERIFIED
              </Typography>
            </Box>

            <Paper elevation={0} sx={{
              bgcolor: EXHIBITOR_THEME.card, borderRadius: "0 0 24px 24px",
              border: `1px solid rgba(251,191,36,0.2)`, borderTop: "none",
              overflow: "hidden",
            }}>

              <Box sx={{ pt: 4, pb: 3, px: 3, textAlign: "center" }}>
                <Avatar sx={{
                  width: 80, height: 80, mx: "auto", mb: 2,
                  bgcolor: "rgba(251,191,36,0.1)", color: EXHIBITOR_THEME.accent,
                  border: `2px solid ${EXHIBITOR_THEME.accent}`,
                  fontSize: "32px", fontWeight: 900,
                }}>
                  {scanResult.company?.charAt(0) || "E"}
                </Avatar>
                
                {/* Company Name - Biggest Heading */}
                <Typography sx={{ color: EXHIBITOR_THEME.accent, fontWeight: 900, fontSize: "22px", mb: 0.5 }}>
                  {scanResult.company || "Company Name"}
                </Typography>
                
                <Typography sx={{ color: "#fff", fontWeight: 500, fontSize: "14px", opacity: 0.8 }}>
                  Representative: {scanResult.name}
                </Typography>
              </Box>

              <Box sx={{ px: 3, pb: 3 }}>
                <Stack spacing={1.5} sx={{ borderTop: `1px solid ${EXHIBITOR_THEME.border}`, pt: 3 }}>
                  
                  {/* Booth Highlight */}
                  <Box sx={{ 
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    bgcolor: EXHIBITOR_THEME.cardAlt, p: 2, borderRadius: "12px", border: `1px solid ${EXHIBITOR_THEME.border}`
                  }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <BoothIcon sx={{ color: EXHIBITOR_THEME.accent, fontSize: 20 }} />
                      <Typography sx={{ color: EXHIBITOR_THEME.sub, fontSize: "12px", fontWeight: 700 }}>BOOTH ASSIGNMENT</Typography>
                    </Stack>
                    <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "18px" }}>{scanResult.booth}</Typography>
                  </Box>

                  {/* Other Details */}
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                    <Box sx={{ bgcolor: EXHIBITOR_THEME.cardAlt, p: 1.5, borderRadius: "12px" }}>
                      <Typography sx={{ color: EXHIBITOR_THEME.sub, fontSize: "9px", fontWeight: 800, mb: 0.5 }}>ACCESS LEVEL</Typography>
                      <Typography sx={{ color: "#fff", fontSize: "13px", fontWeight: 700 }}>Full Access</Typography>
                    </Box>
                    <Box sx={{ bgcolor: EXHIBITOR_THEME.cardAlt, p: 1.5, borderRadius: "12px" }}>
                      <Typography sx={{ color: EXHIBITOR_THEME.sub, fontSize: "9px", fontWeight: 800, mb: 0.5 }}>STAFF ID</Typography>
                      <Typography sx={{ color: "#fff", fontSize: "13px", fontWeight: 700 }}>{scanResult.id || "EX-001"}</Typography>
                    </Box>
                  </Box>
                </Stack>

                <Button
                  fullWidth variant="contained"
                  startIcon={<ResetIcon />}
                  onClick={handleReset}
                  sx={{
                    mt: 3, bgcolor: EXHIBITOR_THEME.accent, color: "#000",
                    fontWeight: 900, borderRadius: "12px", py: 1.5,
                    "&:hover": { bgcolor: "#f59e0b" },
                  }}
                >
                  Verify Next Exhibitor
                </Button>
              </Box>
            </Paper>
          </Box>
        </Fade>
      )}
    </Box>
  );
}