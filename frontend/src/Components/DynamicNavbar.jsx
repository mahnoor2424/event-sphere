import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Badge, IconButton, Menu, MenuItem, Typography, Box, 
  Stack, Divider, Avatar, Tooltip, CircularProgress 
} from "@mui/material";
import { 
  NotificationsNoneOutlined as NotificationIcon, 
  FiberManualRecord, 
  RocketLaunchOutlined as ExpoIcon,
  InfoOutlined as InfoIcon,
  DoneAllOutlined as MarkReadIcon
} from "@mui/icons-material";

const THEME = {
  accent: "#38bdf8",
  bg: "#0A0D14",
  border: "rgba(255, 255, 255, 0.08)",
  textSecondary: "#94a3b8",
  unreadBg: "rgba(56, 189, 248, 0.05)"
};

export default function DynamicNavbar() {
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Fetching Real Data
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/expo/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.log("Notification Fetch Error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000); // 45 sec refresh
    return () => clearInterval(interval);
  }, []);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Simple Time Formatter
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box>
      <Tooltip title="Notification Center">
        <IconButton onClick={handleOpen} sx={{ color: THEME.textSecondary, transition: '0.3s', "&:hover": { color: '#fff' } }}>
          <Badge 
            badgeContent={unreadCount} 
            color="error" 
            sx={{ "& .MuiBadge-badge": { fontSize: '10px', height: '18px', minWidth: '18px', fontWeight: 800 } }}
          >
            <NotificationIcon sx={{ fontSize: 24 }} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 2, width: 360, maxHeight: 480, bgcolor: THEME.bg,
            color: "#fff", borderRadius: "16px", border: `1px solid ${THEME.border}`,
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)", overflow: 'hidden'
          }
        }}
      >
        {/* HEADER */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.02)' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.5px' }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
             <Stack direction="row" spacing={0.5} sx={{ cursor: 'pointer', color: THEME.accent, opacity: 0.8, "&:hover": { opacity: 1 } }}>
                <MarkReadIcon sx={{ fontSize: 14 }} />
                <Typography sx={{ fontSize: '11px', fontWeight: 700 }}>Mark all as read</Typography>
             </Stack>
          )}
        </Box>
        <Divider sx={{ borderColor: THEME.border }} />

        {/* NOTIFICATION LIST */}
        <Box sx={{ maxHeight: 380, overflowY: 'auto', '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '10px' } }}>
          {loading && notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={20} sx={{ color: THEME.accent }} /></Box>
          ) : notifications.length > 0 ? (
            notifications.map((n) => (
              <MenuItem 
                key={n._id} 
                onClick={handleClose}
                sx={{ 
                  py: 2, px: 2, borderBottom: `1px solid ${THEME.border}`,
                  bgcolor: !n.isRead ? THEME.unreadBg : 'transparent',
                  "&:hover": { bgcolor: 'rgba(255,255,255,0.04)' },
                  transition: '0.2s'
                }}
              >
                <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                  <Avatar sx={{ bgcolor: n.type === 'expo_active' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255,255,255,0.05)', color: n.type === 'expo_active' ? THEME.accent : '#fff', width: 40, height: 40, borderRadius: '12px' }}>
                    {n.type === 'expo_active' ? <ExpoIcon fontSize="small" /> : <InfoIcon fontSize="small" />}
                  </Avatar>
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontSize: '13px', fontWeight: !n.isRead ? 700 : 400, color: '#fff', mb: 0.5, lineHeight: 1.4 }}>
                      {n.message}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                       <Typography sx={{ fontSize: '10px', color: THEME.textSecondary }}>
                         {formatTime(n.createdAt)}
                       </Typography>
                       {!n.isRead && <FiberManualRecord sx={{ fontSize: 6, color: THEME.accent }} />}
                    </Stack>
                  </Box>
                </Stack>
              </MenuItem>
            ))
          ) : (
            <Box sx={{ py: 6, textAlign: 'center' }}>
               <NotificationIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.05)', mb: 1 }} />
               <Typography sx={{ color: THEME.textSecondary, fontSize: '12px' }}>Everything is up to date.</Typography>
            </Box>
          )}
        </Box>

        {/* FOOTER */}
        <Box 
          sx={{ 
            p: 1.5, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.02)', 
            cursor: 'pointer', "&:hover": { bgcolor: 'rgba(255,255,255,0.05)' } 
          }}
        >
          <Typography sx={{ fontSize: '12px', color: THEME.accent, fontWeight: 700 }}>
            View All Activity
          </Typography>
        </Box>
      </Menu>
    </Box>
  );
}