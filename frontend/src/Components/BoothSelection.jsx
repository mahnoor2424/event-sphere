import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Box, Typography, Paper, Stack, Container, Button, 
  Avatar, CircularProgress, Divider 
} from "@mui/material";

import ShopIcon from "@mui/icons-material/StorefrontTwoTone";
import MagicIcon from "@mui/icons-material/AutoFixHighTwoTone";
import ArrowIcon from "@mui/icons-material/ArrowForwardRounded";

const THEME = {
  accent: "#00b8d1", 
  warning: "#fbbf24",
  bg: "#05070A", 
  card: "#0A0D14", 
  border: "rgba(255, 255, 255, 0.05)",
  textSecondary: "#64748B",
};

export default function BoothSelection() {
  const [myBooths, setMyBooths] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchBooths(); }, []);

  const fetchBooths = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?._id || userData?.id;
    try {
      const res = await axios.get("http://localhost:5000/api/expo/all-expos");
      let found = [];
      res.data.forEach(expo => {
        if (expo.booths?.layout) {
          expo.booths.layout.forEach(booth => {
            if (booth.status === 'reserved' && String(booth.exhibitorId) === String(userId)) {
              const hasShop = !!(booth.boothDetails && booth.boothDetails.shopName);
              found.push({ 
                expoId: expo._id, expoTitle: expo.title, 
                venue: expo.location?.venue || "Main Hall",
                boothId: booth.id, 
                shopName: hasShop ? booth.boothDetails.shopName : null,
                hasContent: hasShop 
              });
            }
          });
        }
      });
      setMyBooths(found);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10, bgcolor: THEME.bg, minHeight: '100vh' }}>
      <CircularProgress sx={{ color: THEME.accent }} />
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: THEME.bg, py: 3, color: '#fff' }}>
      <Container maxWidth={false} disableGutters sx={{ px: 3 }}>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.5px', mb: 0.5 }}>
            My <span style={{ color: THEME.accent }}>Showcases</span>
          </Typography>
          <Typography sx={{ color: THEME.textSecondary, fontSize: '13px' }}>
            {myBooths.length} Booths reserved under your profile.
          </Typography>
        </Box>

        {myBooths.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', bgcolor: THEME.card, borderRadius: '20px', border: `1px dashed ${THEME.border}` }}>
            <Typography sx={{ color: THEME.textSecondary }}>No assigned booths found.</Typography>
          </Paper>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridAutoRows: '220px',
            gap: 2,
            '@media (max-width: 1100px)': { gridTemplateColumns: 'repeat(3, 1fr)' },
            '@media (max-width: 768px)':  { gridTemplateColumns: 'repeat(2, 1fr)' },
            '@media (max-width: 480px)':  { gridTemplateColumns: '1fr' },
          }}>
            {myBooths.map((item, idx) => (
              <Paper key={idx} sx={{ 
                p: 2.5, 
                bgcolor: THEME.card, 
                borderRadius: '20px', 
                border: `1px solid ${THEME.border}`,
                transition: '0.3s', 
                position: 'relative',
                display: 'flex', 
                flexDirection: 'column',
                boxSizing: 'border-box',
                overflow: 'hidden',
                "&:hover": { 
                  borderColor: THEME.accent, 
                  transform: 'translateY(-5px)', 
                  boxShadow: `0 12px 30px rgba(1, 37, 47, 0.4)` 
                }
              }}>
                
                <Box sx={{ position: 'absolute', top: 15, right: 15 }}>
                  <Box sx={{ 
                    width: 4, height: 4, borderRadius: '50%', 
                    bgcolor: item.hasContent ? THEME.accent : THEME.warning, 
                    boxShadow: `0 0 10px ${item.hasContent ? THEME.accent : THEME.warning}` 
                  }} />
                </Box>

                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(221, 19, 19, 0.02)', 
                    color: item.hasContent ? THEME.accent : THEME.warning, 
                    borderRadius: '4px', width: 22, height: 22, 
                    border: `1px solid ${THEME.border}`,
                    flexShrink: 0
                  }}>
                    {item.hasContent ? <ShopIcon fontSize="small" /> : <MagicIcon fontSize="small" />}
                  </Avatar>
                  <Box sx={{ overflow: 'hidden', flex: 1 }}>
                    <Typography noWrap sx={{ fontWeight: 800, color: "#d6d3d3", fontSize: '14px' }}>
                      {item.expoTitle}
                    </Typography>
                    <Typography sx={{ color: THEME.textSecondary, fontSize: '11px' }}>
                      Booth ID: {item.boothId}
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ borderColor: THEME.border, mb: 2 }} />

                <Box sx={{ flexGrow: 1 }}>
                  <Typography sx={{ fontSize: '10px', color: THEME.textSecondary, fontWeight: 700, mb: 0.5 }}>
                    STATUS
                  </Typography>
                  {item.hasContent ? (
                    <Typography noWrap sx={{ fontWeight: 700, color: THEME.accent, fontSize: '13px' }}>
                      {item.shopName}
                    </Typography>
                  ) : (
                    <Typography sx={{ color: THEME.warning, fontSize: '12px', fontWeight: 600 }}>
                      ● Setup Pending
                    </Typography>
                  )}
                </Box>

                <Button 
                  fullWidth variant="contained" 
                  endIcon={<ArrowIcon sx={{ fontSize: '16px' }} />}
                  onClick={() => navigate(`/exhibitor/booth-setup?expoId=${item.expoId}&boothId=${item.boothId}`)}
                  sx={{ 
                    bgcolor: item.hasContent ? 'rgba(255,255,255,0.03)' : THEME.accent, 
                    color: item.hasContent ? '#fff' : '#000', 
                    fontWeight: 800, borderRadius: '10px', py: 1.2, 
                    textTransform: 'none', fontSize: '12px',
                    '&:hover': { bgcolor: THEME.accent, color: '#000' }
                  }}
                >
                  {item.hasContent ? "Edit Showcase" : "Initialize Now"}
                </Button>
              </Paper>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}