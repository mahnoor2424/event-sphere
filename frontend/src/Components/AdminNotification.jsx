import React, { useState } from "react";
import axios from "axios";
import { 
  Box, Typography, TextField, Button, ToggleButtonGroup, 
  ToggleButton, Paper, Stack, CircularProgress, Container, InputAdornment
} from "@mui/material";
import { 
  SendOutlined as SendIcon, 
  CampaignOutlined as BroadcastIcon,
  GroupsOutlined as AllIcon,
  BusinessCenterOutlined as ExhibitorIcon,
  PersonOutlined as AttendeeIcon
} from "@mui/icons-material";
import Swal from "sweetalert2";

const THEME = {
  bg: "#05070A",
  card: "#0D1117",
  accent: "#38bdf8",
  border: "rgba(255, 255, 255, 0.08)",
  textSecondary: "#94A3B8"
};

export default function SendNotificationForm() {
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      return Swal.fire({
        title: "Empty Message",
        text: "Please write something before sending.",
        icon: "warning",
        background: THEME.card,
        color: "#fff"
      });
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/notifications/broadcast", {
        message: message,
        recipientType: target
      });
      
      Swal.fire({
        title: "Dispatched!",
        text: `Announcement sent to all ${target}s.`,
        icon: "success",
        background: THEME.card,
        color: "#fff",
        confirmButtonColor: THEME.accent
      });
      setMessage("");
    } catch (err) {
      console.error("Broadcast Error:", err);
      Swal.fire("Error", "Server connection failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <BroadcastIcon sx={{ color: THEME.accent, fontSize: 32 }} />
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900, letterSpacing: '-1px' }}>
            Broadcast Center
          </Typography>
        </Stack>
        <Typography sx={{ color: THEME.textSecondary, fontSize: '15px' }}>
          Publish instant alerts and announcements to the entire EventSphere ecosystem.
        </Typography>
      </Box>

      <Paper sx={{ 
        p: 4, 
        bgcolor: THEME.card, 
        border: `1px solid ${THEME.border}`, 
        borderRadius: '28px',
        backgroundImage: 'none',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
      }}>
        <Stack spacing={4}>
          {/* Target Selection */}
          <Box>
            <Typography sx={{ color: '#fff', fontSize: '14px', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AllIcon sx={{ fontSize: 18, color: THEME.accent }} /> Select Target Audience
            </Typography>
            <ToggleButtonGroup
              value={target}
              exclusive
              onChange={(e, val) => val && setTarget(val)}
              fullWidth
              sx={{ 
                gap: 1,
                "& .MuiToggleButton-root": { 
                  color: THEME.textSecondary, 
                  border: `1px solid ${THEME.border} !important`,
                  borderRadius: '12px !important',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  "&.Mui-selected": { 
                    bgcolor: `${THEME.accent}15`, 
                    color: THEME.accent,
                    borderColor: `${THEME.accent} !important` 
                  },
                  "&:hover": { bgcolor: 'rgba(255,255,255,0.03)' }
                } 
              }}
            >
              <ToggleButton value="all"><Stack direction="row" spacing={1} alignItems="center"><AllIcon fontSize="small"/> <Typography variant="body2">Everyone</Typography></Stack></ToggleButton>
              <ToggleButton value="exhibitor"><Stack direction="row" spacing={1} alignItems="center"><ExhibitorIcon fontSize="small"/> <Typography variant="body2">Exhibitors</Typography></Stack></ToggleButton>
              <ToggleButton value="attendee"><Stack direction="row" spacing={1} alignItems="center"><AttendeeIcon fontSize="small"/> <Typography variant="body2">Attendees</Typography></Stack></ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Message Input */}
          <Box>
            <Typography sx={{ color: '#fff', fontSize: '14px', fontWeight: 700, mb: 2 }}>
              Announcement Message
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={5}
              variant="outlined"
              placeholder="Type your official announcement here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                  bgcolor: 'rgba(255,255,255,0.02)',
                  borderRadius: '16px',
                  fontSize: '15px',
                  "& fieldset": { borderColor: THEME.border },
                  "&:hover fieldset": { borderColor: THEME.accent },
                  "&.Mui-focused fieldset": { borderColor: THEME.accent },
                }
              }}
            />
          </Box>

          {/* Action Button */}
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} sx={{ color: '#000' }} /> : <SendIcon />}
            sx={{
              bgcolor: THEME.accent,
              color: "#000",
              fontWeight: 800,
              py: 2,
              borderRadius: '16px',
              fontSize: '16px',
              textTransform: 'none',
              "&:hover": { bgcolor: "#fff", transform: 'translateY(-2px)' },
              transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: `0 8px 20px ${THEME.accent}33`
            }}
          >
            {loading ? "Processing Broadcast..." : "Publish Announcement"}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}