import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box, Typography, Paper, Grid, Stack, Avatar, Chip,
  CircularProgress, Container, Button, Divider,
} from "@mui/material";
import {
  HandshakeTwoTone as CollaborationIcon,
  StorefrontTwoTone as ShopIcon,
  GroupsTwoTone as NeighborsIcon,
  MessageTwoTone as ChatIcon,
  ArrowUpward as TopIcon,
  ArrowDownward as BottomIcon,
  ArrowBack as LeftIcon,
  ArrowForward as RightIcon,
} from "@mui/icons-material";

const THEME = {
  bg:            "#05070A",
  card:          "#0A0D14",
  cardHover:     "#0D1018",
  accent:        "#00b8d1",
  accentDim:     "rgba(0,184,209,0.08)",
  border:        "rgba(255,255,255,0.07)",
  borderAccent:  "rgba(0,184,209,0.3)",
  textSecondary: "#64748B",
  textMuted:     "#334155",
};

const POS_ICONS = {
  "Left Neighbor":   <LeftIcon   sx={{ fontSize: 11 }} />,
  "Right Neighbor":  <RightIcon  sx={{ fontSize: 11 }} />,
  "Top Neighbor":    <TopIcon    sx={{ fontSize: 11 }} />,
  "Bottom Neighbor": <BottomIcon sx={{ fontSize: 11 }} />,
};

export default function NeighboringExhibitors() {
  const navigate = useNavigate();
  const [loading, setLoading]         = useState(true);
  const [neighborData, setNeighborData] = useState([]);
  const [startingChat, setStartingChat] = useState(null);

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId   = userData?._id || userData?.id;

  const handleMessage = async (neighbor, expoId) => {
    const receiverId = neighbor.exhibitorId?._id || neighbor.exhibitorId;
    if (!receiverId) { alert("This neighbor has not set up their profile yet."); return; }
    setStartingChat(neighbor.id);
    try {
      const res = await axios.post("http://localhost:5000/api/chat/conversation", {
        senderId: userId, receiverId, expoId,
      });
      navigate("/exhibitor/messages", { state: { currentChatId: res.data._id } });
    } catch { alert("Could not start conversation."); }
    finally { setStartingChat(null); }
  };

  const findNeighbors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/expo/my-events/${userId}`);
      const myShops = res.data || [];
      let allNeighbors = [];

      for (const myShop of myShops) {
        const expoId    = myShop.expoId?._id || myShop.expoId;
        const myBoothId = myShop.boothNumber;
        if (!expoId || !myBoothId) continue;

        const parts = myBoothId.split('-');
        if (parts.length < 4) continue;

        const myLetter = parts[2];
        const myNum    = parseInt(parts[3]);

        const expoRes = await axios.get(`http://localhost:5000/api/expo/get-expo/${expoId}`);
        const layout  = expoRes.data.booths?.layout || [];
        const foundInThisExpo = [];

        layout.forEach(booth => {
          const boothOwnerId  = booth.exhibitorId?._id || booth.exhibitorId;
          if (booth.status !== "reserved" || boothOwnerId?.toString() === userId.toString()) return;

          const bParts = booth.id?.split('-');
          if (!bParts || bParts.length < 4) return;

          const bLetter   = bParts[2];
          const bNum      = parseInt(bParts[3]);
          const sameLetter = bLetter === myLetter;
          const sameNum    = bNum    === myNum;
          const adjNum     = Math.abs(bNum - myNum) === 1;
          const adjLetter  = Math.abs(bLetter.charCodeAt(0) - myLetter.charCodeAt(0)) === 1;

          if ((sameLetter && adjNum) || (sameNum && adjLetter)) {
            let pos = "Neighbor";
            if (sameLetter && bNum === myNum - 1) pos = "Left Neighbor";
            if (sameLetter && bNum === myNum + 1) pos = "Right Neighbor";
            if (sameNum && bLetter.charCodeAt(0) === myLetter.charCodeAt(0) - 1) pos = "Top Neighbor";
            if (sameNum && bLetter.charCodeAt(0) === myLetter.charCodeAt(0) + 1) pos = "Bottom Neighbor";
            foundInThisExpo.push({ ...booth, position: pos });
          }
        });

        if (foundInThisExpo.length > 0) {
          allNeighbors.push({
            expoId, expoTitle: expoRes.data.title,
            myBooth: myBoothId, neighbors: foundInThisExpo,
          });
        }
      }
      setNeighborData(allNeighbors);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { if (userId) findNeighbors(); }, [findNeighbors, userId]);

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", bgcolor: THEME.bg }}>
      <CircularProgress size={28} sx={{ color: THEME.accent }} />
    </Box>
  );

  return (
    <Box sx={{ bgcolor: THEME.bg, minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">

        {/* ── Header ── */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <CollaborationIcon sx={{ color: THEME.accent, fontSize: 22 }} />
          <Typography sx={{ color: THEME.accent, fontWeight: 700, fontSize: 11, letterSpacing: 3 }}>
            EXHIBITOR NETWORK
          </Typography>
        </Stack>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", mb: 4 }}>
          Collaboration Hub
        </Typography>

        {/* ── Empty State ── */}
        {neighborData.length === 0 ? (
          <Paper sx={{
            p: 6, textAlign: "center", bgcolor: THEME.card,
            borderRadius: "16px", border: `1px dashed ${THEME.border}`,
          }}>
            <NeighborsIcon sx={{ fontSize: 40, color: THEME.textMuted, mb: 1.5 }} />
            <Typography sx={{ color: THEME.textSecondary, fontSize: 13 }}>
              No occupied neighboring booths found.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={5}>
            {neighborData.map((data, idx) => (
              <Box key={idx}>

                {/* Expo label row */}
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2.5 }}>
                  <Chip
                    label={data.expoTitle}
                    size="small"
                    sx={{ bgcolor: THEME.accent, color: "#000", fontWeight: 800, fontSize: 11, height: 22 }}
                  />
                  <Divider sx={{ flex: 1, borderColor: THEME.border }} />
                </Stack>

                {/* ── Booth Grid ── */}
                <Grid container spacing={2} alignItems="stretch">

                  {/* My Booth — compact */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{
                      height: "100%", p: 2.5,
                      bgcolor: THEME.accentDim,
                      borderRadius: "12px",
                      border: `1px dashed ${THEME.borderAccent}`,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      gap: 0.5, minHeight: 110,
                    }}>
                      <Typography sx={{ color: THEME.accent, fontWeight: 700, fontSize: 9, letterSpacing: 2 }}>
                        YOUR BOOTH
                      </Typography>
                      <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: 20, letterSpacing: 1 }}>
                        {/* Show only the last 2 parts: G-10 */}
                        {data.myBooth.split('-').slice(-2).join('-')}
                      </Typography>
                      <Typography sx={{ color: THEME.textSecondary, fontSize: 10 }}>
                        {data.myBooth}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Neighbor Cards */}
                  {data.neighbors.map((neighbor, nIdx) => {
                    const shopName =
                      neighbor.boothDetails?.shopName ||
                      neighbor.exhibitorId?.organization ||
                      neighbor.companyName ||
                      "Partner Exhibitor";

                    const boothShort = neighbor.id?.split('-').slice(-2).join('-');
                    const isBusy = startingChat === neighbor.id;

                    return (
                      <Grid item xs={12} sm={6} md={3} key={nIdx}>
                        <Paper sx={{
                          height: "100%", p: 2,
                          bgcolor: THEME.card,
                          borderRadius: "12px",
                          border: `1px solid ${THEME.border}`,
                          display: "flex", flexDirection: "column",
                          gap: 1.5,
                          transition: "border-color 0.2s",
                          "&:hover": { borderColor: "rgba(0,184,209,0.2)" },
                        }}>

                          {/* Top row: position badge + booth code */}
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Chip
                              icon={POS_ICONS[neighbor.position]}
                              label={neighbor.position}
                              size="small"
                              sx={{
                                bgcolor: "rgba(255,255,255,0.04)",
                                color: THEME.textSecondary,
                                fontSize: 10,
                                height: 20,
                                "& .MuiChip-icon": { color: THEME.textSecondary },
                              }}
                            />
                            <Typography sx={{ color: THEME.accent, fontWeight: 800, fontSize: 12 }}>
                              {boothShort}
                            </Typography>
                          </Stack>

                          {/* Avatar + name */}
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar sx={{
                              width: 36, height: 36,
                              bgcolor: "rgba(0,184,209,0.08)",
                              color: THEME.accent,
                            }}>
                              <ShopIcon sx={{ fontSize: 18 }} />
                            </Avatar>
                            <Typography sx={{
                              color: "#fff", fontWeight: 700, fontSize: 13,
                              overflow: "hidden", textOverflow: "ellipsis",
                              whiteSpace: "nowrap", maxWidth: 120,
                            }}>
                              {shopName}
                            </Typography>
                          </Stack>

                          {/* Collaborate button */}
                          <Button
                            fullWidth
                            size="small"
                            variant="contained"
                            startIcon={isBusy
                              ? <CircularProgress size={12} sx={{ color: "#000" }} />
                              : <ChatIcon sx={{ fontSize: 14 }} />
                            }
                            disabled={isBusy}
                            onClick={() => handleMessage(neighbor, data.expoId)}
                            sx={{
                              bgcolor: THEME.accent,
                              color: "#000",
                              fontWeight: 800,
                              fontSize: 11,
                              borderRadius: "8px",
                              py: 0.6,
                              mt: "auto",
                              textTransform: "none",
                              "&:hover": { bgcolor: "#00d4f0" },
                            }}
                          >
                            Collaborate
                          </Button>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}