import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Box, Typography, TextField, Button, Paper, 
  InputAdornment, Chip, Stack, Container, CircularProgress, 
  MenuItem, Select, FormControl, InputLabel
} from "@mui/material";

// Icons
import {
  SaveOutlined as SaveIcon,
  ArrowBackIosNewOutlined as BackIcon,
  AccessTimeOutlined as TimeIcon,
  MicExternalOnOutlined as SpeakerIcon,
  PlaceOutlined as LocationIcon,
  DescriptionOutlined as DescIcon,
  EditNoteOutlined as EditIcon,
  CategoryOutlined as CategoryIcon,
  DashboardOutlined as ExpoIcon
} from "@mui/icons-material";

const THEME = {
  accent: "#38bdf8",
  bg: "#05070A",
  cardBg: "#0A0D14",
  border: "rgba(255, 255, 255, 0.08)",
  textSecondary: "#94a3b8",
  textPrimary: "#F8FAFC",
};

export default function EditSchedule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [expos, setExpos] = useState([]); 
  const [selectedExpo, setSelectedExpo] = useState(null);

  const [form, setForm] = useState({
    expoId: "",
    expoName: "",
    type: "Speech",
    title: "",
    speaker: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: ""
  });

  // 1. Fetch Session Details AND Expos List
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Corrected API endpoints to match your "Create" page
        const [sessionRes, exposRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/schedule/session/${id}`),
          axios.get(`http://localhost:5000/api/expo/all-expos`) 
        ]);

        const sessionData = sessionRes.data;
        const allExpos = exposRes.data;
        
        setExpos(allExpos);

        // Find the currently assigned expo
        const currentExpo = allExpos.find(x => x._id === sessionData.expoId || x.title === sessionData.expoName);
        setSelectedExpo(currentExpo);

        const rawDate = sessionData.date ? sessionData.date.split('T')[0] : "";
        
        setForm({ 
          ...sessionData, 
          date: rawDate,
          expoId: currentExpo?._id || sessionData.expoId 
        });
        
        setFetching(false);
      } catch (err) {
        console.error(err);
        Swal.fire({ title: "Error", text: "Data load nahi ho saka", icon: "error", background: THEME.cardBg, color: "#fff" });
        navigate("/admin/schedule/manage");
      }
    };
    fetchData();
  }, [id, navigate]);

  // Handle Expo Change (Same logic as Create page)
  const handleExpoChange = (e) => {
    const expoId = e.target.value;
    const expo = expos.find(x => x._id === expoId);
    if (expo) {
      setSelectedExpo(expo);
      setForm(prev => ({
        ...prev,
        expoId: expoId,
        expoName: expo.title, // or expo.name
        location: expo.location?.venue || prev.location
      }));
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/schedule/update/${id}`, form);
      Swal.fire({ title: "Success", text: "Agenda updated!", icon: "success", background: THEME.cardBg, color: "#fff" });
      navigate("/admin/schedule/manage");
    } catch (err) {
      Swal.fire({ title: "Update Failed", icon: "error", background: THEME.cardBg, color: "#fff" });
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      color: "#fff",
      backgroundColor: "rgba(255,255,255,0.01)",
      "& fieldset": { borderColor: THEME.border },
      "&:hover fieldset": { borderColor: THEME.accent },
      "&.Mui-focused fieldset": { borderColor: THEME.accent },
      borderRadius: "12px",
    },
    "& .MuiInputLabel-root": { color: THEME.textSecondary },
    "& .MuiInputLabel-root.Mui-focused": { color: THEME.accent },
    "& .MuiSvgIcon-root": { color: THEME.textSecondary }
  };

  if (fetching) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <CircularProgress sx={{ color: THEME.accent }} />
    </Box>
  );

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: "#05070A", p: { xs: 2, md: 4 } }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Button onClick={() => navigate(-1)} startIcon={<BackIcon />} sx={{ color: THEME.textSecondary, mb: 2 }}>
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff' }}>
            Edit <span style={{ color: THEME.accent }}>Session</span>
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            
            {/* Left Card */}
            <Paper elevation={0} sx={{ flex: 1.5, p: 4, bgcolor: THEME.cardBg, borderRadius: "20px", border: `1px solid ${THEME.border}` }}>
              <Stack spacing={3}>
                
                {/* EXPO SELECT DROPDOWN */}
                <FormControl fullWidth sx={inputSx}>
                  <InputLabel>Assign to Expo</InputLabel>
                  <Select
                    name="expoId"
                    value={form.expoId}
                    onChange={handleExpoChange}
                    required
                    label="Assign to Expo"
                    startAdornment={<InputAdornment position="start"><ExpoIcon sx={{mr: 1, color: THEME.accent}}/></InputAdornment>}
                  >
                    {expos.map((e) => (
                      <MenuItem key={e._id} value={e._id}>
                        {e.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* SESSION TYPE */}
                <FormControl fullWidth sx={inputSx}>
                  <InputLabel>Session Type</InputLabel>
                  <Select name="type" value={form.type} onChange={handleChange} required label="Session Type">
                    <MenuItem value="Speech">Speech</MenuItem>
                    <MenuItem value="Seminar">Seminar</MenuItem>
                    <MenuItem value="Workshop">Workshop</MenuItem>
                    <MenuItem value="Concert">Concert</MenuItem>
                    <MenuItem value="Networking">Networking</MenuItem>
                  </Select>
                </FormControl>

                <TextField fullWidth label="Title" name="title" value={form.title} onChange={handleChange} required sx={inputSx} />
                <TextField fullWidth label="Speaker" name="speaker" value={form.speaker} onChange={handleChange} required sx={inputSx} />
                <TextField fullWidth multiline rows={4} label="Description" name="description" value={form.description} onChange={handleChange} sx={inputSx} />
              </Stack>
            </Paper>

            {/* Right Card */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Paper sx={{ p: 4, bgcolor: THEME.cardBg, borderRadius: "20px", border: `1px solid ${THEME.border}` }}>
                <Stack spacing={3}>
                  <TextField fullWidth type="date" label="Date" name="date" value={form.date} onChange={handleChange} required sx={inputSx} InputLabelProps={{ shrink: true }} />
                  <Stack direction="row" spacing={2}>
                    <TextField fullWidth type="time" label="Start" name="startTime" value={form.startTime} onChange={handleChange} required sx={inputSx} InputLabelProps={{ shrink: true }} />
                    <TextField fullWidth type="time" label="End" name="endTime" value={form.endTime} onChange={handleChange} required sx={inputSx} InputLabelProps={{ shrink: true }} />
                  </Stack>
                  <TextField fullWidth label="Location" name="location" value={form.location} onChange={handleChange} required sx={inputSx} />
                </Stack>
              </Paper>

              <Button 
                type="submit" fullWidth variant="contained" disabled={loading}
                sx={{ py: 2, borderRadius: "12px", bgcolor: THEME.accent, color: "#000", fontWeight: 800 }}
              >
                {loading ? <CircularProgress size={24} /> : "Update Session"}
              </Button>
            </Box>

          </Stack>
        </form>
      </Container>
    </Box>
  );
}