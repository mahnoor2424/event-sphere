import React, { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Box, Drawer, CssBaseline, AppBar, Toolbar, List, Typography, 
  Divider, ListItemButton, ListItemIcon, ListItemText, 
  IconButton, Menu, MenuItem, Avatar, Badge, Collapse, Stack,
  useMediaQuery, useTheme
} from "@mui/material";

// Icons
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import DashboardIcon from "@mui/icons-material/SpaceDashboardOutlined";
import ExploreIcon from "@mui/icons-material/ExploreOutlined";
import BookmarkIcon from "@mui/icons-material/BookmarkBorderOutlined";
import MapIcon from "@mui/icons-material/MapOutlined";
import NotificationIcon from "@mui/icons-material/NotificationsNoneOutlined";
import LogoutIcon from "@mui/icons-material/PowerSettingsNewOutlined";
import MenuIcon from "@mui/icons-material/SegmentOutlined";
import EventAvailableIcon from "@mui/icons-material/EventAvailableOutlined";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import { Video, History } from "lucide-react";

const drawerWidth = 260;

const THEME = {
  bg: "#05070A",
  sidebar: "#0A0D14",
  accent: "#00b8d1", 
  accentHover: "rgba(0, 184, 209, 0.08)",
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  border: "rgba(255, 255, 255, 0.06)",
};

export default function AttendeeDashboardLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Tablet aur mobile detect karne ke liye
  
  // Mobile par initial state band (false) honi chahiye
  const [open, setOpen] = useState(!isMobile);
  const [meetingHubOpen, setMeetingHubOpen] = useState(false); 
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const attendeeId = userData._id || userData.id;

  // Responsive logic: screen change hone par sidebar adjust karna
  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) setOpen(false); // Mobile par click karte hi sidebar band ho jaye
  };

  // 🔔 NOTIFICATION FETCHING LOGIC
  const fetchNotifications = async () => {
    if (!attendeeId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/notifications/attendee/${attendeeId}`);
      setNotifications(res.data);
    } catch (err) { 
      console.error("Attendee Notif API Error", err); 
    }
  };

  useEffect(() => { 
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 15000);
    return () => clearInterval(timer);
  }, [attendeeId]);

  const handleMarkAsRead = async () => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/mark-read-attendee/${attendeeId}`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setNotifAnchor(null);
    } catch (err) { 
      console.error("Mark Read Error", err); 
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const displayNotifs = notifications.slice(0, 5);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <Box sx={{ display: "flex", bgcolor: THEME.bg, minHeight: "100vh" }}>
      <CssBaseline />

       <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #05070A; }
        ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: ${THEME.accent}; }
        .notif-scroll::-webkit-scrollbar { width: 4px; }
      `}</style>
      
      {/* --- TOP NAVBAR --- */}
      <AppBar position="fixed" sx={{ 
        width: { md: open ? `calc(100% - ${drawerWidth}px)` : "100%" }, 
        ml: { md: open ? `${drawerWidth}px` : 0 }, 
        background: "rgba(10, 13, 20, 0.8)", 
        backdropFilter: "blur(12px)", 
        borderBottom: `1px solid ${THEME.border}`, 
        zIndex: 1100, 
        boxShadow: 'none', 
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <IconButton onClick={handleDrawerToggle} sx={{ color: THEME.textSecondary }}><MenuIcon /></IconButton>
            <Typography sx={{ 
              color: THEME.accent, 
              fontWeight: 800, 
              fontSize: { xs: '0.65rem', sm: '0.75rem' }, 
              letterSpacing: 2, 
              textTransform: 'uppercase',
              display: { xs: 'none', xsm: 'block' } // Very small screens pe hide karein ya chota rakhein
            }}>
                Attendee Portal
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)} sx={{ color: THEME.textSecondary }}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationIcon />
              </Badge>
            </IconButton>

            {/* NOTIFICATION DROPDOWN */}
            <Menu 
              anchorEl={notifAnchor} open={Boolean(notifAnchor)} onClose={() => setNotifAnchor(null)}
              slotProps={{ paper: { sx: { mt: 1.5, bgcolor: '#0A0D14', border: `1px solid ${THEME.border}`, color: '#fff', width: { xs: 280, sm: 320 }, borderRadius: '16px', backgroundImage: 'none' } } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2, borderBottom: `1px solid ${THEME.border}` }}>
                <Typography sx={{ fontWeight: 800, fontSize: '13px' }}>Notifications</Typography>
                {unreadCount > 0 && (
                   <Typography onClick={handleMarkAsRead} sx={{ fontSize: '11px', color: THEME.accent, cursor: 'pointer', fontWeight: 600 }}>
                      Mark all read
                   </Typography>
                )}
              </Stack>
              <Box className="notif-scroll" sx={{ maxHeight: 350, overflowY: 'auto' }}>
                {displayNotifs.length > 0 ? displayNotifs.map(n => {
                   const isAdmin = n.senderRole === 'admin' || n.type === 'broadcast';
                   return (
                    <MenuItem key={n._id} onClick={() => setNotifAnchor(null)} sx={{ py: 1.5, borderBottom: `1px solid rgba(255,255,255,0.03)`, whiteSpace: 'normal', display: 'block' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ 
                          fontSize: '8px', fontWeight: 900, px: 0.8, py: 0.2, borderRadius: '4px',
                          bgcolor: isAdmin ? 'rgba(248, 113, 113, 0.15)' : 'rgba(0, 184, 209, 0.15)',
                          color: isAdmin ? '#f87171' : '#00b8d1', textTransform: 'uppercase'
                        }}>
                          {isAdmin ? 'Official Admin' : 'Exhibitor'}
                        </Typography>
                        <Typography sx={{ fontSize: '9px', color: '#475569' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: n.isRead ? 'transparent' : (isAdmin ? '#f87171' : '#00b8d1'), mt: 0.8, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '12px', color: n.isRead ? THEME.textSecondary : '#fff' }}>{n.message}</Typography>
                      </Box>
                    </MenuItem>
                   )
                }) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                     <Typography sx={{ color: THEME.textSecondary, fontSize: '12px' }}>No notifications yet</Typography>
                  </Box>
                )}
              </Box>
              <Divider sx={{ borderColor: THEME.border }} />
              <Box sx={{ p: 1.2, textAlign: 'center'}}>
                  <Typography onClick={() => { setNotifAnchor(null); handleNavigation('/attendee/notifications'); }}
                    sx={{ fontSize: '11px', color: THEME.accent, cursor: 'pointer', fontWeight: 700 }}>
                    View All Activity
                  </Typography>
              </Box>
            </Menu>

            {/* PROFILE SECTION */}
            <Box onClick={(e) => setProfileAnchor(e.currentTarget)} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', p: 0.5, px: { xs: 0.5, sm: 1.5 }, borderRadius: '12px', "&:hover": { bgcolor: 'rgba(255,255,255,0.03)' } }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: THEME.accent, fontSize: '14px', fontWeight: 700 }}>{userData.name?.charAt(0)}</Avatar>
            </Box>

            <Menu anchorEl={profileAnchor} open={Boolean(profileAnchor)} onClose={() => setProfileAnchor(null)} 
              slotProps={{ paper: { sx: { mt: 1.5, bgcolor: THEME.sidebar, border: `1px solid ${THEME.border}`, color: '#fff', width: 180, borderRadius: '12px' } } }}>
              <MenuItem onClick={() => { setProfileAnchor(null); handleNavigation('/attendee/profile'); }} sx={{ fontSize: '14px' }}>My Profile</MenuItem>
              <Divider sx={{ borderColor: THEME.border }} />
              <MenuItem onClick={handleLogout} sx={{ color: '#f87171', fontSize: '14px', fontWeight: 600 }}>
                <LogoutIcon sx={{ fontSize: 18, mr: 1 }} /> Sign Out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* --- SIDEBAR DRAWER --- */}
      <Drawer 
        variant={isMobile ? "temporary" : "persistent"} 
        anchor="left" 
        open={open} 
        onClose={() => setOpen(false)} // Mobile click outside band karne ke liye
        sx={{ 
          width: drawerWidth, 
          flexShrink: 0,
          "& .MuiDrawer-paper": { 
            width: drawerWidth, 
            bgcolor: THEME.sidebar, 
            borderRight: `1px solid ${THEME.border}`,
            boxSizing: 'border-box',
            overflowY: 'auto', 
            fontSize:'12px !important',
            scrollbarWidth: 'none', 
            '&::-webkit-scrollbar': { display: 'none' } 
          } 
        }}
      >
          <Box sx={{ p: "24px 24px 16px", mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
  <svg viewBox="0 0 80 80" width="36" height="36" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <circle cx="40" cy="40" r="28" fill="none" stroke="#00c8f0" strokeWidth="1" opacity="0.5"/>
    <ellipse cx="40" cy="40" rx="10" ry="28" fill="none" stroke="#00c8f0" strokeWidth="0.8" opacity="0.5"/>
    <ellipse cx="40" cy="40" rx="20" ry="28" fill="none" stroke="#00c8f0" strokeWidth="0.5" opacity="0.3"/>
    <line x1="12" y1="40" x2="68" y2="40" stroke="#00c8f0" strokeWidth="0.8" opacity="0.4"/>
    <circle cx="54" cy="28" r="3.5" fill="#00c8f0">
      <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="54" cy="28" r="7" fill="none" stroke="#00c8f0" strokeWidth="0.7" opacity="0.3"/>
    <path d="M66 18 L67.5 22 L72 22 L68.5 24.5 L70 29 L66 26.5 L62 29 L63.5 24.5 L60 22 L64.5 22 Z" fill="#00c8f0" opacity="0.85"/>
  </svg>
  <Typography variant="h6" sx={{ fontFamily: "'Syne', sans-serif", color: '#fff', fontWeight: 800, fontSize: '1.1rem', letterSpacing: 0.5 }}>
    Event<span style={{ color: '#00c8f0' }}>Sphere</span>
  </Typography>
</Box>

          <List sx={{ px: 2 }}>
            <ListItemButton onClick={() => handleNavigation("/attendee")} sx={{ borderRadius: "12px", mb: 0.8, color: location.pathname === "/attendee" ? THEME.accent : THEME.textSecondary, bgcolor: location.pathname === "/attendee" ? THEME.accentHover : "transparent" }}>
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Dashboard Overview" primaryTypographyProps={{ fontSize: '14px', fontWeight: 600 }} />
            </ListItemButton>

            <ListItemButton onClick={() => handleNavigation("/attendee/explore")} sx={{ borderRadius: "12px", mb: 0.8, color: location.pathname === "/attendee/explore" ? THEME.accent : THEME.textSecondary, bgcolor: location.pathname === "/attendee/explore" ? THEME.accentHover : "transparent" }}>
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}><ExploreIcon /></ListItemIcon>
              <ListItemText primary="Explore Expo" primaryTypographyProps={{ fontSize: '12px !important', fontWeight: 600 }} />
            </ListItemButton>

            <ListItemButton onClick={() => handleNavigation("/attendee/my-events")} sx={{ borderRadius: "12px", mb: 0.8, color: location.pathname === "/attendee/my-events" ? THEME.accent : THEME.textSecondary }}>
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}><EventAvailableIcon /></ListItemIcon>
              <ListItemText primary="My Registrations" primaryTypographyProps={{ fontSize: '14px' }} />
            </ListItemButton>

            <ListItemButton onClick={() => setMeetingHubOpen(!meetingHubOpen)} sx={{ borderRadius: "12px", mb: 0.8, color: location.pathname.includes("meeting") ? THEME.accent : THEME.textSecondary }}>
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}><CalendarMonthIcon /></ListItemIcon>
              <ListItemText primary="Meeting Hub" primaryTypographyProps={{ fontSize: '14px' }} />
              {meetingHubOpen ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
            </ListItemButton>

            <Collapse in={meetingHubOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ mb: 1 }}>
                <ListItemButton onClick={() => handleNavigation("/attendee/meeting-hub")} sx={{ pl: 6, borderRadius: "12px", mb: 0.5, color: location.pathname === "/attendee/meeting-hub" ? THEME.accent : THEME.textSecondary }}>
                  <ListItemIcon sx={{ color: "inherit", minWidth: 30 }}><Video size={16} /></ListItemIcon>
                  <ListItemText primary="Schedule Meeting" primaryTypographyProps={{ fontSize: '13px' }} />
                </ListItemButton>
                <ListItemButton onClick={() => handleNavigation("/attendee/my-appointments")} sx={{ pl: 6, borderRadius: "12px", color: location.pathname === "/attendee/my-appointments" ? THEME.accent : THEME.textSecondary }}>
                  <ListItemIcon sx={{ color: "inherit", minWidth: 30 }}><History size={16} /></ListItemIcon>
                  <ListItemText primary="My Appointments" primaryTypographyProps={{ fontSize: '13px' }} />
                </ListItemButton>
              </List>
            </Collapse>

            <ListItemButton onClick={() => handleNavigation("/attendee/notification")} sx={{ borderRadius: "12px", mb: 0.8, color: location.pathname === "/attendee/notification" ? THEME.accent : THEME.textSecondary }}>
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}><NotificationIcon /></ListItemIcon>
              <ListItemText primary="Notification" primaryTypographyProps={{ fontSize: '14px' }} />
            </ListItemButton>

            <ListItemButton onClick={() => handleNavigation("/attendee/bookmarks")} sx={{ borderRadius: "12px", mb: 0.8, color: location.pathname === "/attendee/bookmarks" ? THEME.accent : THEME.textSecondary }}>
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}><BookmarkIcon /></ListItemIcon>
              <ListItemText primary="Saved Sessions" primaryTypographyProps={{ fontSize: '14px' }} />
            </ListItemButton>

            <ListItemButton onClick={() => handleNavigation("/attendee/profile")} sx={{ borderRadius: "12px", mb: 0.8, color: location.pathname === "/attendee/profile" ? THEME.accent : THEME.textSecondary }}>
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}><MapIcon /></ListItemIcon>
              <ListItemText primary="Profile Settings" primaryTypographyProps={{ fontSize: '14px' }} />
            </ListItemButton>
          </List>
      </Drawer>

      {/* --- MAIN CONTENT AREA --- */}
      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: { xs: 2, sm: 3, md: 4 }, // Responsive padding
        mt: 8, 
        transition: '0.3s', 
        width: '100%',
        minWidth: 0 // Prevent content overflow in flexbox
      }}>
        <Outlet />
      </Box>
    </Box>
  );
}