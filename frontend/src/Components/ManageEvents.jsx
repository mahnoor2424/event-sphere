import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Grid, Paper, Chip, Stack, IconButton } from "@mui/material";
import { AddCircleOutlined as AddIcon, EditOutlined as EditIcon, RemoveRedEyeOutlined as ViewIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const THEME = { accent: "#00b8d1", bg: "#05070A", card: "#0A0D14", border: "rgba(255, 255, 255, 0.08)" };

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch only this exhibitor's created booth events
    const userData = JSON.parse(localStorage.getItem("user"));
    axios.get(`http://localhost:5000/api/exhibitor/my-events/${userData._id}`)
      .then(res => setEvents(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: "#fff" }}>My <span style={{ color: THEME.accent }}>Showcases</span></Typography>
          <Typography sx={{ color: "#94A3B8" }}>Manage your shops and product events across all expos.</Typography>
        </Box>
        <Button 
          variant="contained" startIcon={<AddIcon />} 
          onClick={() => navigate("/exhibitor/booth/setup")}
          sx={{ bgcolor: THEME.accent, color: "#000", fontWeight: 800, borderRadius: "10px", px: 3 }}
        >
          Create New Shop Event
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {events.length === 0 ? (
          <Box sx={{ p: 10, textAlign: 'center', width: '100%', border: `1px dashed ${THEME.border}`, borderRadius: '20px' }}>
             <Typography sx={{ color: "#94A3B8" }}>No active showcase found. Click 'Create' to set up your booth.</Typography>
          </Box>
        ) : (
          events.map((ev) => (
            <Grid item xs={12} md={6} lg={4} key={ev._id}>
              <Paper sx={{ p: 3, bgcolor: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: "20px" }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Chip label={`Booth ${ev.boothId}`} size="small" sx={{ bgcolor: THEME.accent, color: "#000", fontWeight: 700 }} />
                  <Typography sx={{ color: "#94A3B8", fontSize: "12px" }}>{ev.expoName}</Typography>
                </Stack>
                <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>{ev.shopName}</Typography>
                <Typography sx={{ color: "#94A3B8", fontSize: "13px", mt: 1, mb: 3 }} noWrap>{ev.description}</Typography>
                
                <Divider sx={{ borderColor: THEME.border, mb: 2 }} />
                
                <Stack direction="row" spacing={1}>
                  <Button fullWidth size="small" startIcon={<EditIcon />} sx={{ color: THEME.accent }}>Edit</Button>
                  <Button fullWidth size="small" startIcon={<ViewIcon />} sx={{ color: "#fff" }}>View</Button>
                </Stack>
              </Paper>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}