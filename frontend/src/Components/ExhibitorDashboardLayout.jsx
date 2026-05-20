import React, { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import axios from "axios";
import { Headset as SupportIcon } from "lucide-react"; 
import {
  Box, Drawer, CssBaseline, AppBar, Toolbar, List, Typography, 
  Divider, ListItemButton, ListItemIcon, ListItemText, 
  IconButton, Menu, MenuItem, Avatar, Collapse, Badge, CircularProgress, Stack,
  useMediaQuery, useTheme
} from "@mui/material";

import { CalendarPlus } from 'lucide-react';

// Icons
import DashboardIcon from "@mui/icons-material/SpaceDashboardOutlined";
import JoinExpoIcon from "@mui/icons-material/RocketLaunchOutlined"; 
import ProfileIcon from "@mui/icons-material/BusinessOutlined"; 
import BoothIcon from "@mui/icons-material/GridOnOutlined"; 
import MessageIcon from "@mui/icons-material/ForumOutlined"; 
import ScheduleIcon from "@mui/icons-material/CalendarMonthOutlined"; 
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import NotificationIcon from "@mui/icons-material/NotificationsNoneOutlined";
import LogoutIcon from "@mui/icons-material/PowerSettingsNewOutlined";
import MenuIcon from "@mui/icons-material/SegmentOutlined";
import CircleIcon from "@mui/icons-material/Circle";
import CollaborationIcon from "@mui/icons-material/HandshakeOutlined";
import CalendarIcon from "@mui/icons-material/EventAvailableOutlined";
import { Report } from "@mui/icons-material";

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

export default function ExhibitorDashboardLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Mobile par sidebar initially band rahega
  const [open, setOpen] = useState(!isMobile);
  const [openMenu, setOpenMenu] = useState(null); 
  const [profileAnchor, setProfileAnchor] = useState(null); 
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData._id || userData.id;

  // Screen size change hone par sidebar adjust karna
  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/notifications/exhibitor/${userId}`);
      setNotifications(res.data);
    } catch (err) { console.error("Notif Error"); }
  };

  useEffect(() => { 
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 20000); 
    return () => clearInterval(timer);
  }, [userId]);

  const handleMarkAsRead = async () => {
    setNotifAnchor(null);
    try {
      await axios.put(`http://localhost:5000/api/notifications/mark-read/${userId}`);
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  const handleToggle = (menu) => { setOpenMenu(openMenu === menu ? null : menu); };
  
  const handleLogout = () => { localStorage.clear(); window.location.href = "/login"; };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) setOpen(false); // Mobile par click karte hi drawer band ho jaye
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const displayNotifs = notifications.slice(0, 3); 

  const menuItems = [
    { text: "Overview", icon: <DashboardIcon />, path: "/exhibitor" },
    { text: "Notifications", icon: <NotificationIcon />, path: "/exhibitor/notifications" },
    { text: "Join New Expo", icon: <JoinExpoIcon />, path: "/exhibitor/register-expo" },
    {
      text: "Company Branding",
      icon: <ProfileIcon />,
      children: [
        { text: "Update Profile", path: "/exhibitor/profile/edit" },
        { text: "Documents", path: "/exhibitor/profile/documents" },
      ],
    },
    {
      text: "Booth Management",
      icon: <BoothIcon />,
      children: [
        { text: " View Assigned Spaces", path: "/exhibitor/booth/my-space" },
        { text: " Setup My Shop", path: "/exhibitor/booth-selection" },
        { text: " Manage Showcases", path: "/exhibitor/booth/manage" },      
        { text: " Staff Management", path: "/exhibitor/booth/staff" },
      ],
    },
    {
      text: "Analytical Report",
      icon: <Report size={20} color={THEME.accent} />,
      path: "/exhibitor/manage-events" 
    },
    { text: "Collaboration Hub", icon: <CollaborationIcon sx={{ color: THEME.accent }} />, path: "/exhibitor/neighbors" },
    { text: "Manage Appointments", icon: <CalendarIcon />, path: "/exhibitor/appointments" },
    { text: "Messages", icon: <MessageIcon />, path: "/exhibitor/messages" },
    { text: "Expo Schedule", icon: <ScheduleIcon />, path: "/exhibitor/schedule" },
    { 
    text: 'Help & Support', 
    path: '/exhibitor/support', 
    icon: <SupportIcon  /> 
  },

  ];

  return (
    <Box sx={{ display: "flex", bgcolor: THEME.bg, minHeight: "100vh" }}>
      <CssBaseline />
      
      <style>{`
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0A0D14; }
        ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: ${THEME.accent}; }
      `}</style>  

      <AppBar position="fixed" sx={{ 
        width: { md: open ? `calc(100% - ${drawerWidth}px)` : "100%" }, 
        ml: { md: open ? `${drawerWidth}px` : 0 }, 
        background: "rgba(10, 13, 20, 0.8)", 
        backdropFilter: "blur(12px)", 
        borderBottom: `1px solid ${THEME.border}`, 
        zIndex: 1100, boxShadow: 'none', transition: '0.3s'
      }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <IconButton onClick={() => setOpen(!open)} sx={{ color: THEME.textSecondary }}><MenuIcon /></IconButton>
            <Typography sx={{ 
              color: THEME.accent, fontWeight: 800, fontSize: { xs: '0.65rem', sm: '0.8rem' }, 
              letterSpacing: 1.5, textTransform: 'uppercase',
              display: { xs: 'none', sm: 'block' } // Very small screens par text hide
            }}>
                Exhibitor Console
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)} sx={{ color: THEME.textSecondary }}>
              <Badge badgeContent={unreadCount} color="error"><NotificationIcon /></Badge>
            </IconButton>

            <Menu 
              anchorEl={notifAnchor} open={Boolean(notifAnchor)} onClose={() => setNotifAnchor(null)}
              slotProps={{ paper: { sx: { mt: 1.5, bgcolor: '#0A0D14', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', width: { xs: 280, sm: 320 }, borderRadius: '16px', backgroundImage: 'none', overflow: 'hidden' } } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Typography sx={{ fontWeight: 800, fontSize: '12px' }}>Notifications</Typography>
                <Typography onClick={handleMarkAsRead} sx={{ fontSize: '11px', color: '#00b8d1', cursor: 'pointer', fontWeight: 600 }}>Mark read</Typography>
              </Stack>
              <Box>
                {displayNotifs.length > 0 ? displayNotifs.map(n => (
                  <Box key={n._id} onClick={() => { setNotifAnchor(null); handleNavigate('/exhibitor/notifications'); }}
                    sx={{ display: 'flex', gap: 1.2, px: 2, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'flex-start', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: n.type === 'approval' ? 'rgba(16,185,129,0.1)' : 'rgba(139,92,246,0.1)' }}>
                      <Typography sx={{ fontSize: '14px' }}>{n.type === 'approval' ? '✓' : '📅'}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                       <Typography sx={{ fontSize: '11px', color: n.isRead ? '#64748B' : '#F8FAFC', fontWeight: n.isRead ? 400 : 600 }}>{n.message}</Typography>
                    </Box>
                  </Box>
                )) : <Box sx={{ py: 4, textAlign: 'center' }}><Typography sx={{ fontSize: '12px', color: '#64748B' }}>No notifications</Typography></Box>}
              </Box>
            </Menu>

            {/* PROFILE SECTION */}
            <Box onClick={(e) => setProfileAnchor(e.currentTarget)} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', p: 0.5, px: { xs: 0.5, sm: 1.5 }, borderRadius: '12px', "&:hover": { bgcolor: 'rgba(255,255,255,0.03)' } }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: THEME.accent, color: '#000', fontSize: 13, fontWeight: 900 }}>{userData.name?.charAt(0).toUpperCase()}</Avatar>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Typography sx={{ fontSize: '12px', color: '#fff', fontWeight: 700, lineHeight: 1 }}>{userData.name}</Typography>
                <Typography sx={{ fontSize: '10px', color: THEME.textSecondary }}>{userData.email}</Typography>
              </Box>
            </Box>

            <Menu anchorEl={profileAnchor} open={Boolean(profileAnchor)} onClose={() => setProfileAnchor(null)} 
              slotProps={{ paper: { sx: { mt: 1.5, bgcolor: THEME.sidebar, border: `1px solid ${THEME.border}`, color: '#fff', width: 200, borderRadius: '16px', p: 1, backgroundImage: 'none' } } }}>
              <MenuItem onClick={() => { setProfileAnchor(null); handleNavigate('/exhibitor/profile/edit'); }} sx={{ borderRadius: '8px', fontSize: '14px' }}>Profile</MenuItem>
              <Divider sx={{ borderColor: THEME.border, my: 1 }} />
              <MenuItem onClick={handleLogout} sx={{ color: '#f87171', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}><LogoutIcon sx={{ fontSize: 18, mr: 1.5 }} /> Sign Out</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer 
        variant={isMobile ? "temporary" : "persistent"} 
        anchor="left" 
        open={open} 
        onClose={() => setOpen(false)}
        sx={{ 
          width: drawerWidth, 
          "& .MuiDrawer-paper": { width: drawerWidth, bgcolor: THEME.sidebar, borderRight: `1px solid ${THEME.border}`, backgroundImage: 'none', boxSizing: 'border-box' } 
        }}>
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

          <List sx={{ px: 2, pb: 5 }}>
            {menuItems.map((item) => {
                const hasChildren = Boolean(item.children);
                const isActive = location.pathname === item.path || item.children?.some(c => c.path === location.pathname);
                return (
                    <Box key={item.text} sx={{ mb: 0.5 }}>
                        <ListItemButton onClick={() => hasChildren ? handleToggle(item.text) : handleNavigate(item.path)}
                          sx={{ borderRadius: "12px", py: 1.2, color: isActive ? THEME.accent : THEME.textSecondary, bgcolor: isActive && !hasChildren ? THEME.accentHover : "transparent" }}>
                          <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>{item.icon}</ListItemIcon>
                          <ListItemText primary={item.text} sx={{ "& .MuiTypography-root": { fontSize: '14px', fontWeight: isActive ? 700 : 500 } }} />
                          {hasChildren && <KeyboardArrowDown sx={{ fontSize: 12, transform: openMenu === item.text ? "rotate(180deg)" : "none", transition: "0.2s" }} />}
                        </ListItemButton>
                        {hasChildren && (
                        <Collapse in={openMenu === item.text} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding sx={{ ml: 2, borderLeft: `1px solid ${THEME.border}`, mt: 0.5 }}>
                              {item.children.map((child) => (
                                <ListItemButton key={child.text} onClick={() => handleNavigate(child.path)}
                                  sx={{ pl: 4, py: 1, borderRadius: "0 12px 12px 0", color: location.pathname === child.path ? THEME.accent : THEME.textSecondary }}>
                                  <ListItemText primary={<Typography sx={{ fontSize: "13px", fontWeight: location.pathname === child.path ? 700 : 400 }}>{child.text}</Typography>} />
                                </ListItemButton>
                              ))}
                            </List>
                        </Collapse>
                        )}
                    </Box>
                );
            })}
          </List>
      </Drawer>

      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: { xs: 2, sm: 3, md: 4 }, 
        mt: 8, 
        width: '100%', 
        overflowX: 'hidden' 
      }}>
        <Outlet />
      </Box>
    </Box>
  );
}