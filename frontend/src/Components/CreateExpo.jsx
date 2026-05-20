import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { 
  Box, Typography, Grid, TextField, Button, Paper, 
  InputAdornment, Chip, Stack, Container, Divider
} from "@mui/material";

// TwoTone Icons for Dashboard Look
import RocketIcon from "@mui/icons-material/RocketLaunchTwoTone";
import InfoIcon from "@mui/icons-material/InfoTwoTone";
import DateIcon from "@mui/icons-material/TodayTwoTone";
import LocationIcon from "@mui/icons-material/PlaceTwoTone";
import BoothIcon from "@mui/icons-material/GridViewTwoTone";
import DescIcon from "@mui/icons-material/DescriptionTwoTone";
import TitleIcon from "@mui/icons-material/TitleTwoTone";
import ThemeIcon from "@mui/icons-material/ColorLensTwoTone";

// Matching Dashboard Theme Exactly
const THEME = {
  bg: "#05070A",        // Deep Dark
  paper: "#0A0D14",     // Sidebar/Card color
  accent: "#38bdf8",    // Sky Blue
  textPrimary: "#F8FAFC",
  textSecondary: "#64748B",
  border: "rgba(255, 255, 255, 0.05)",
};

export default function CreateExpo() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "", theme: "", description: "", image: "",
    startDate: "", endDate: "",
    venue: "", city: "", address: "",
    capacity: "", totalBooths: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Canvas se compress karein
  const reader = new FileReader();
  reader.onloadend = () => {
    const img = new Image();
    img.src = reader.result;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Max 400px width
      const ratio = Math.min(400 / img.width, 200 / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Quality 0.7 = 70% (size bohot kam hogi)
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
      console.log("Compressed size:", compressedBase64.length); // ~50-80KB
      setForm(prev => ({ ...prev, image: compressedBase64 }));
    };
  };
  reader.readAsDataURL(file);
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      title: form.title,
      theme: form.theme,
      image: form.image, 
      startDate: form.startDate,
      endDate: form.endDate,
      location: { 
        venue: form.venue, 
        city: form.city, 
        address: form.address 
      },
      capacity: Number(form.capacity) || 0,
      booths: { 
        total: Number(form.totalBooths) || 0, 
        available: Number(form.totalBooths) || 0, 
        layout: [] 
      },
      attendees: [],
      schedule: [],
      status: "draft"
    };

    try {
      const response = await axios.post("http://localhost:5000/api/expo/create-expo", payload);
      
      if(response.status === 201 || response.status === 200) {
        const newExpoId = response.data._id;
        Swal.fire({ 
          title: "Expo Initialized", 
          text: "Event details saved. Redirecting to Designer...", 
          icon: "success",
          background: THEME.paper, 
          color: THEME.textPrimary, 
          confirmButtonColor: THEME.accent
        }).then(() => {
          navigate(`/admin/floor-plan-designer/${newExpoId}`);
        });
      }
    } catch (err) {
      Swal.fire({ 
        title: "Error", 
        text: err.response?.data?.message || "Failed to create event.", 
        icon: "error", 
        background: THEME.paper, 
        color: THEME.textPrimary 
      });
    }
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      color: THEME.textPrimary,
      backgroundColor: "rgba(255,255,255,0.02)",
      fontSize: "14px",
      "& fieldset": { borderColor: THEME.border },
      "&:hover fieldset": { borderColor: THEME.accent },
      "&.Mui-focused fieldset": { borderColor: THEME.accent },
      borderRadius: "10px",
    },
    "& .MuiInputLabel-root": { color: THEME.textSecondary, fontSize: '13px' },
    "& .MuiInputLabel-root.Mui-focused": { color: THEME.accent },
  };

return (
  <Box sx={{ minHeight: '100vh', bgcolor: THEME.bg, pb: 8, width: '100%', boxSizing: 'border-box' }}>
    
    {/* HEADER SECTION */}
    <Box sx={{ py: 3, mb: 4, borderBottom: `1px solid ${THEME.border}` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: THEME.textPrimary }}>
            Initialize <span style={{ color: THEME.accent }}>New Expo</span>
          </Typography>
          <Typography variant="body2" sx={{ color: THEME.textSecondary }}>
            Setup core details and logistics for your next event.
          </Typography>
        </Box>
        <Chip 
          label="Step 1: Core Configuration" 
          sx={{ bgcolor: 'rgba(56, 189, 248, 0.1)', color: THEME.accent, fontWeight: 700, borderRadius: '8px' }} 
        />
      </Box>
    </Box>

    <form onSubmit={handleSubmit} style={{ width: '100%', boxSizing: 'border-box' }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: 3,
        width: '100%',
        alignItems: 'stretch',
      }}>

    {/* LEFT: MAIN INFO */}
<Box sx={{ flex: '0 0 54.333%', minWidth: 0 }}>
  <Paper elevation={0} sx={{ p: 4, height: '100%', bgcolor: THEME.paper, borderRadius: "16px", border: `1px solid ${THEME.border}`, boxSizing: 'border-box' }}>
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <InfoIcon sx={{ color: THEME.accent }} />
        <Typography sx={{ color: THEME.textPrimary, fontWeight: 700 }}>General Information</Typography>
      </Box>

      {/* 1. Title Field */}
      <TextField 
        fullWidth label="Event Title" name="title" value={form.title} onChange={handleChange} required sx={inputSx} 
        InputProps={{ startAdornment: <InputAdornment position="start"><TitleIcon sx={{ fontSize: 18, color: THEME.textSecondary }} /></InputAdornment> }}
      />

      {/* 2. Theme Field */}
      <TextField 
        fullWidth label="Event Theme" name="theme" value={form.theme} onChange={handleChange} required sx={inputSx} 
        InputProps={{ startAdornment: <InputAdornment position="start"><ThemeIcon sx={{ fontSize: 18, color: THEME.textSecondary }} /></InputAdornment> }}
      />

      {/* Image Upload Section */}
<Box>
  <Typography sx={{ color: THEME.textSecondary, fontSize: '13px', mb: 1, ml: 1 }}>
    Expo Banner Image
  </Typography>
  <Box 
    sx={{ 
      border: `2px dashed ${form.image ? THEME.accent : THEME.border}`,
      borderRadius: "12px",
      p: 2,
      textAlign: 'center',
      bgcolor: "rgba(255,255,255,0.02)",
      cursor: 'pointer',
      transition: '0.3s',
      "&:hover": { borderColor: THEME.accent, bgcolor: "rgba(56, 189, 248, 0.05)" }
    }}
    component="label"
  >
    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
    
    {form.image ? (
      <Box sx={{ position: 'relative' }}>
        <img 
          src={form.image} 
          alt="Preview" 
          style={{ width: '100%', maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }} 
        />
        <Typography sx={{ color: THEME.accent, fontSize: '12px', mt: 1, fontWeight: 600 }}>
          Click to Change Image
        </Typography>
      </Box>
    ) : (
      <Stack alignItems="center" spacing={1}>
        <RocketIcon sx={{ color: THEME.textSecondary, fontSize: 30 }} />
        <Typography sx={{ color: THEME.textSecondary, fontSize: '14px' }}>
          Click to Upload Banner (PNG, JPG)
        </Typography>
      </Stack>
    )}
  </Box>
</Box>

      {/* 4. Description Field */}
      <TextField 
        fullWidth multiline rows={4} label="Description" name="description" value={form.description} onChange={handleChange} sx={inputSx} 
        InputProps={{ 
          startAdornment: <InputAdornment position="start" sx={{ mt: 1.5, alignSelf: 'flex-start' }}><DescIcon sx={{ fontSize: 18, color: THEME.textSecondary }} /></InputAdornment> 
        }}
      />
    </Stack>
  </Paper>
</Box>

        {/* RIGHT: LOGISTICS */}
        <Box sx={{ flex: '0 0 43.666%', minWidth: 0 }}>
          <Stack spacing={3} sx={{ height: '100%' }}>
            
            {/* Timeline */}
            <Paper elevation={0} sx={{ p: 3, bgcolor: THEME.paper, borderRadius: "16px", border: `1px solid ${THEME.border}` }}>
              <Typography sx={{ color: THEME.textPrimary, fontWeight: 700, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <DateIcon sx={{ fontSize: 18, color: THEME.accent }} /> Timeline
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField fullWidth type="date" label="Start Date" name="startDate" value={form.startDate} onChange={handleChange} InputLabelProps={{ shrink: true }} sx={inputSx} required />
                <TextField fullWidth type="date" label="End Date" name="endDate" value={form.endDate} onChange={handleChange} InputLabelProps={{ shrink: true }} sx={inputSx} required />
              </Box>
            </Paper>

            {/* Venue */}
            <Paper elevation={0} sx={{ p: 3, bgcolor: THEME.paper, borderRadius: "16px", border: `1px solid ${THEME.border}` }}>
              <Typography sx={{ color: THEME.textPrimary, fontWeight: 700, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon sx={{ fontSize: 18, color: THEME.accent }} /> Venue Details
              </Typography>
              <TextField fullWidth label="Venue Name" name="venue" value={form.venue} onChange={handleChange} sx={{ ...inputSx, mb: 2.5 }} required />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField fullWidth label="City" name="city" value={form.city} onChange={handleChange} sx={inputSx} />
                <TextField fullWidth label="Address" name="address" value={form.address} onChange={handleChange} sx={inputSx} />
              </Box>
            </Paper>

            {/* Capacity */}
            <Paper elevation={0} sx={{ p: 3, bgcolor: THEME.paper, borderRadius: "16px", border: `1px solid ${THEME.border}` }}>
              <Typography sx={{ color: THEME.textPrimary, fontWeight: 700, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BoothIcon sx={{ fontSize: 18, color: THEME.accent }} /> Capacity Management
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField fullWidth type="number" label="Attendees Limit" name="capacity" value={form.capacity} onChange={handleChange} sx={inputSx} />
                <TextField fullWidth type="number" label="Total Booths" name="totalBooths" value={form.totalBooths} onChange={handleChange} sx={inputSx} />
              </Box>
            </Paper>

            <Button 
              type="submit" fullWidth variant="contained" 
              startIcon={<RocketIcon />}
              sx={{ 
                py: 2, borderRadius: "10px", bgcolor: THEME.accent, color: "#000", fontWeight: 800, textTransform: 'none', fontSize: '15px',
                "&:hover": { bgcolor: "#7dd3fc", boxShadow: `0 8px 25px ${THEME.accent}44` }, transition: '0.3s'
              }}
            >
              Proceed to Floor Designer
            </Button>

          </Stack>
        </Box>

      </Box>
    </form>
  </Box>
);
}