import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { 
  Box, Typography, TextField, Button, Paper, 
  Stack, MenuItem, Select, FormControl, InputLabel, CircularProgress
} from "@mui/material";

// Icons
import TimeIcon from "@mui/icons-material/AccessTimeTwoTone";
import EventIcon from "@mui/icons-material/EventTwoTone";
import CategoryIcon from "@mui/icons-material/CategoryTwoTone"; // Added icon

const THEME = {
  bg: "#05070A",
  paper: "#0A0D14",
  accent: "#38bdf8",
  textPrimary: "#F8FAFC",
  textSecondary: "#64748B",
  border: "rgba(255, 255, 255, 0.05)",
};

export default function CreateSchedule() {
  const navigate = useNavigate();
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedExpo, setSelectedExpo] = useState(null);

  const [form, setForm] = useState({
    expoId: "",
    expoName: "", 
    type: "Speech", // Default value as per schema
    title: "", 
    speaker: "", 
    description: "", 
    date: "", 
    startTime: "", 
    endTime: "", 
    location: ""
  });

  const calculateDay = (startDate, sessionDate) => {
    const start = new Date(startDate);
    const session = new Date(sessionDate);
    const diffTime = Math.abs(session - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
    return `Day ${diffDays}`;
  };

  useEffect(() => {
    axios.get("http://localhost:5000/api/expo/all-expos")
      .then(res => setExpos(res.data))
      .catch(err => console.log("Fetch Error:", err));
  }, []);

  const handleExpoChange = (e) => {
    const expoId = e.target.value;
    const expo = expos.find(x => x._id === expoId);
    if (expo) {
      setSelectedExpo(expo);
      setForm(prev => ({
        ...prev,
        expoId: expoId,
        expoName: expo.title,
        location: expo.location?.venue || "",
        date: expo.startDate ? expo.startDate.split('T')[0] : ""
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedExpo) {
        Swal.fire({ title: "Wait", text: "Please select an Expo first", icon: "warning" });
        return;
    }

    setLoading(true);
    const calculatedDay = calculateDay(selectedExpo.startDate, form.date);

    const finalData = {
      ...form,
      day: calculatedDay, 
    };

    try {
      const response = await axios.post("http://localhost:5000/api/schedule/create", finalData);
      if (response.status === 201 || response.status === 200) {
        Swal.fire({ title: "Success", text: "Session Published!", icon: "success", background: THEME.paper, color: THEME.textPrimary })
          .then(() => navigate("/admin/schedule/manage"));
      }
    } catch (err) {
      Swal.fire({ 
          title: "Error", 
          text: err.response?.data?.message || "Failed to create", 
          icon: "error", 
          background: THEME.paper, 
          color: "#fff" 
      });
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      color: THEME.textPrimary,
      backgroundColor: "rgba(255,255,255,0.02)",
      "& fieldset": { borderColor: THEME.border },
      "&:hover fieldset": { borderColor: THEME.accent },
      "&.Mui-focused fieldset": { borderColor: THEME.accent },
      borderRadius: "10px",
    },
    "& .MuiInputLabel-root": { color: THEME.textSecondary },
    "& .MuiInputLabel-root.Mui-focused": { color: THEME.accent },
    "& .MuiSvgIcon-root": { color: THEME.textSecondary }
  };

 return (
  <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: THEME.bg, p: { xs: 2, md: 4 }, boxSizing: 'border-box' }}>
    
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, color: THEME.textPrimary }}>
        Session <span style={{ color: THEME.accent }}>Builder</span>
      </Typography>
      <Typography variant="body2" sx={{ color: THEME.textSecondary }}>
        Plan and publish sessions to your event's live timeline.
      </Typography>
    </Box>

    <form onSubmit={handleSubmit} style={{ width: '100%', boxSizing: 'border-box' }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 3,
        width: '100%',
        alignItems: 'stretch',
      }}>

        {/* Left Column - Configuration */}
        <Box sx={{ flex: '0 0 56.333%', minWidth: 0 }}>
          <Paper elevation={0} sx={{
            p: 4,
            height: '100%',
            bgcolor: THEME.paper,
            borderRadius: "16px",
            border: `1px solid ${THEME.border}`,
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
          }}>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <EventIcon sx={{ color: THEME.accent }} />
                <Typography sx={{ color: THEME.textPrimary, fontWeight: 700 }}>Session Configuration</Typography>
              </Box>

              <FormControl fullWidth sx={inputSx}>
                <InputLabel>Assign to Expo</InputLabel>
                <Select name="expoId" value={form.expoId} onChange={handleExpoChange} required label="Assign to Expo">
                  {expos.map(e => <MenuItem key={e._id} value={e._id}>{e.title}</MenuItem>)}
                </Select>
              </FormControl>

              {/* NEW DROPDOWN: Session Type */}
              <FormControl fullWidth sx={inputSx}>
                <InputLabel>Session Type</InputLabel>
                <Select 
                  name="type" 
                  value={form.type} 
                  onChange={handleChange} 
                  required 
                  label="Session Type"
                >
                  <MenuItem value="Speech">Speech</MenuItem>
                  <MenuItem value="Seminar">Seminar</MenuItem>
                  <MenuItem value="Workshop">Workshop</MenuItem>
                  <MenuItem value="Concert">Concert</MenuItem>
                  <MenuItem value="Networking">Networking</MenuItem>
                </Select>
              </FormControl>

              {selectedExpo && (
                <Typography sx={{ fontSize: '11px', color: THEME.accent, mt: -2, ml: 1 }}>
                  Allowed Range: {new Date(selectedExpo.startDate).toLocaleDateString()} - {new Date(selectedExpo.endDate).toLocaleDateString()}
                </Typography>
              )}

              <TextField fullWidth label="Session Title" name="title" value={form.title} onChange={handleChange} required sx={inputSx} />
              <TextField fullWidth label="Speaker Name" name="speaker" value={form.speaker} onChange={handleChange} required sx={inputSx} />
              <TextField fullWidth multiline rows={6} label="Description" name="description" value={form.description} onChange={handleChange} sx={inputSx} />
            </Stack>
          </Paper>
        </Box>

        {/* Right Column - Logistics */}
        <Box sx={{ flex: '0 0 43.666%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper elevation={0} sx={{
            p: 4,
            flexGrow: 1,
            bgcolor: THEME.paper,
            borderRadius: "16px",
            border: `1px solid ${THEME.border}`,
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
          }}>
            <Typography sx={{ color: THEME.textPrimary, fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimeIcon sx={{ color: THEME.accent }} /> Logistics
            </Typography>
            <Stack spacing={3}>
              <TextField fullWidth type="date" label="Date" name="date" value={form.date} onChange={handleChange} required sx={inputSx} InputLabelProps={{ shrink: true }}
                inputProps={{ min: selectedExpo?.startDate?.split('T')[0], max: selectedExpo?.endDate?.split('T')[0] }} />

              <Stack direction="row" spacing={2}>
                <TextField fullWidth type="time" label="Start" name="startTime" value={form.startTime} onChange={handleChange} required sx={inputSx} InputLabelProps={{ shrink: true }} />
                <TextField fullWidth type="time" label="End" name="endTime" value={form.endTime} onChange={handleChange} required sx={inputSx} InputLabelProps={{ shrink: true }} />
              </Stack>

              <TextField fullWidth label="Location" name="location" value={form.location} onChange={handleChange} required sx={inputSx}
                helperText={selectedExpo ? `Venue: ${selectedExpo.location.venue}` : ""} />
            </Stack>
          </Paper>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 2.5,
              borderRadius: "12px",
              bgcolor: THEME.accent,
              color: "#000",
              fontWeight: 800,
              fontSize: '1rem',
              "&:hover": { bgcolor: "#7dd3fc" }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Publish Session"}
          </Button>
        </Box>

      </Box>
    </form>
  </Box>
);
}