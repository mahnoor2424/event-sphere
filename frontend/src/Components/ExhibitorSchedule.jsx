import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { 
  Box, Typography, Paper, Stack, CircularProgress, 
  Container, Chip, Grid, MenuItem, Select, FormControl, InputLabel, Fade
} from "@mui/material";
import { 
  AccessTimeTwoTone as TimeIcon, 
  PersonTwoTone as SpeakerIcon, 
  PlaceTwoTone as LocationIcon,
  FilterListRounded as FilterIcon,
  EventNoteRounded as EmptyIcon,
  CalendarMonthTwoTone as DateIcon
} from "@mui/icons-material";

const THEME = {
  bg: "#05070A",
  card: "#0A0D14",
  accent: "#00b8d1",
  border: "rgba(255, 255, 255, 0.08)",
  textSecondary: "#94A3B8"
};

export default function ExhibitorSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [myExpos, setMyExpos] = useState([]); 
  const [selectedExpo, setSelectedExpo] = useState("all");
  const [loading, setLoading] = useState(true);

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const exhibitorId = userData?._id || userData?.id;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 🟢 STEP 1: Pehle exhibitor ke joined Showcases fetch karein (Most Accurate)
      const eventRes = await axios.get(`http://localhost:5000/api/events/my-events/${exhibitorId}`);
      
      const joined = eventRes.data
        .filter(item => item.expoId) // Ensure expoId exists
        .map(item => ({
          id: String(item.expoId._id || item.expoId), // Handle both populated and string ID
          title: item.expoId.title || "Untitled Expo"
        }));

      // Remove duplicates from joined list
      const uniqueExpos = Array.from(new Map(joined.map(e => [e.id, e])).values());
      setMyExpos(uniqueExpos);

      // 🟢 STEP 2: Saare schedule sessions fetch karein
      const scheduleRes = await axios.get("http://localhost:5000/api/schedule/all"); 
      
      // 🟢 STEP 3: Match sessions with exhibitor's joined expos
      const relevantSchedule = scheduleRes.data.filter(session => {
        const sessionExpoId = String(session.expoId._id || session.expoId);
        return uniqueExpos.some(expo => expo.id === sessionExpoId);
      });

      setSchedule(relevantSchedule);

    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [exhibitorId]);

  useEffect(() => {
    if (exhibitorId) fetchData();
  }, [fetchData, exhibitorId]);

  // Handle Filtering based on Dropdown
  const filteredSchedule = selectedExpo === "all" 
    ? schedule 
    : schedule.filter(s => String(s.expoId._id || s.expoId) === String(selectedExpo));

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', bgcolor: THEME.bg }}>
      <CircularProgress sx={{ color: THEME.accent }} />
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* HEADER */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 900, color: "#fff", letterSpacing: -1.5 }}>
          Event <span style={{ color: THEME.accent }}>Timeline</span>
        </Typography>
        <Typography sx={{ color: THEME.textSecondary, mt: 1 }}>
            View official agenda for the expos you are participating in.
        </Typography>
      </Box>

      {/* MODERN FILTER */}
      {myExpos.length > 0 && (
        <Paper sx={{ p: 2, mb: 4, bgcolor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: '16px' }}>
            <Stack direction="row" spacing={2} alignItems="center">
            <FilterIcon sx={{ color: THEME.accent }} />
            <FormControl fullWidth size="small">
                <InputLabel sx={{ color: THEME.textSecondary }}>Filter Timeline by Expo</InputLabel>
                <Select
                    value={selectedExpo}
                    label="Filter Timeline by Expo"
                    onChange={(e) => setSelectedExpo(e.target.value)}
                    sx={{ color: '#fff', ".MuiOutlinedInput-notchedOutline": { borderColor: THEME.border } }}
                    MenuProps={{ PaperProps: { sx: { bgcolor: THEME.card, color: '#fff', border: `1px solid ${THEME.border}` } } }}
                >
                    <MenuItem value="all">System Wide (Show All Joined)</MenuItem>
                    {myExpos.map(expo => <MenuItem key={expo.id} value={expo.id}>{expo.title}</MenuItem>)}
                </Select>
            </FormControl>
            </Stack>
        </Paper>
      )}

      {/* TIMELINE LIST */}
      {filteredSchedule.length === 0 ? (
        <Paper sx={{ p: 10, textAlign: 'center', bgcolor: THEME.card, borderRadius: '30px', border: `1px dashed ${THEME.border}` }}>
          <EmptyIcon sx={{ fontSize: 60, color: THEME.border, mb: 2 }} />
          <Typography sx={{ color: THEME.textSecondary }}>
            No sessions scheduled for your selected expo(s).
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {filteredSchedule.map((item, index) => (
            <Fade in={true} key={item._id} timeout={500}>
              <Paper sx={{ 
                p: 3, bgcolor: THEME.card, borderRadius: "24px", border: `1px solid ${THEME.border}`, 
                position: 'relative', transition: '0.3s', 
                "&:hover": { borderColor: THEME.accent, transform: 'translateX(10px)' }
              }}>
                <Box sx={{ position: 'absolute', left: 0, top: '25%', bottom: '25%', width: '4px', bgcolor: THEME.accent, borderRadius: '0 4px 4px 0' }} />
                
                <Grid container spacing={2} alignItems="center">
                  {/* Date & Time */}
                  <Grid item xs={12} sm={3}>
                     <Stack direction="row" spacing={1} alignItems="center">
                        <TimeIcon sx={{ color: THEME.accent, fontSize: 18 }} />
                        <Typography sx={{ color: '#fff', fontWeight: 800 }}>{item.startTime}</Typography>
                     </Stack>
                     <Typography sx={{ color: THEME.textSecondary, fontSize: '11px', ml: 3 }}>
                        {new Date(item.date).toDateString()}
                     </Typography>
                  </Grid>

                  {/* Title & Info */}
                  <Grid item xs={12} sm={6}>
                     <Typography sx={{ color: THEME.accent, fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', mb: 0.5 }}>
                        {myExpos.find(e => e.id === String(item.expoId._id || item.expoId))?.title || "Conference"}
                     </Typography>
                     <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>{item.title}</Typography>
                     
                     <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: THEME.textSecondary }}>
                          <SpeakerIcon sx={{ fontSize: 14 }} />
                          <Typography variant="caption">{item.speaker}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: THEME.textSecondary }}>
                          <LocationIcon sx={{ fontSize: 14 }} />
                          <Typography variant="caption">{item.location}</Typography>
                        </Box>
                     </Stack>
                  </Grid>

                  {/* Badge */}
                  <Grid item xs={12} sm={3} sx={{ textAlign: {xs: 'left', sm: 'right'} }}>
                     <Chip label="Conference" size="small" variant="outlined" sx={{ color: THEME.accent, borderColor: THEME.accent, fontWeight: 700, fontSize: '10px' }} />
                  </Grid>
                </Grid>
              </Paper>
            </Fade>
          ))}
        </Stack>
      )}
    </Container>
  );
}