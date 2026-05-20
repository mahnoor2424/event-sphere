import React, { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import axios from "axios";

import {
  Box, Drawer, CssBaseline, AppBar, Toolbar, List, Typography,
  Divider, ListItemButton, ListItemIcon, ListItemText,
  IconButton, Menu, MenuItem, Avatar, Collapse, Badge, InputBase, Tooltip,
  CircularProgress, Stack, useMediaQuery, useTheme
} from "@mui/material";

import {
  MessageOutlined as MessageIcon,
  DashboardOutlined as DashboardIcon,
  LayersOutlined as ExpoIcon,
  PeopleOutlined as PeopleIcon,
  CalendarMonthOutlined as ScheduleIcon,
  BarChartOutlined as AnalyticsIcon,
  KeyboardArrowDown,
  NotificationsNoneOutlined as NotificationIcon,
  LogoutOutlined as LogoutIcon,
  SearchOutlined as SearchIcon,
  PersonOutlined as PersonIcon,
  Verified as VerifiedIcon,
  MenuOutlined as MenuIcon,
  Circle as CircleIcon,
  Message as ChatIcon,
  CloseOutlined as CloseIcon

} from "@mui/icons-material";
import { Mic2Icon } from "lucide-react";

const drawerWidth = 260;
const THEME = {
  bg: "#05070A",
  sidebar: "#0A0D14",
  accent: "#38bdf8",
  textPrimary: "#F8FAFC",
  textSecondary: "#64748B",
  border: "rgba(255, 255, 255, 0.05)",
};

export default function DashboardLayout() {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));       // < 600px
  const isTablet = useMediaQuery(muiTheme.breakpoints.between("sm", "lg")); // 600–1200px
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up("lg"));         // > 1200px

  // Desktop: sidebar persistent open by default
  // Tablet/Mobile: sidebar closed by default (overlay/temporary)
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState({ name: "", email: "" });

  // Set initial drawer state based on screen size
  useEffect(() => {
    setOpen(isDesktop);
  }, [isDesktop]);

  // Close drawer on route change for mobile/tablet
  useEffect(() => {
    if (!isDesktop) setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data && data !== "undefined") {
      const parsed = JSON.parse(data);
      setUser({
        name: parsed.name || "Administrator",
        email: parsed.email || "admin@system.com"
      });
    } else {
      navigate("/login");
    }
  }, [location.pathname]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/notifications/admin");
      setNotifications(res.data);
    } catch (err) { console.error("Admin Notif API Error"); }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handleMarkAsRead = async () => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/mark-read-admin`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setNotifAnchor(null);
    } catch (err) { console.error(err); }
  };

  const handleToggle = (menu) => { setOpenMenu(openMenu === menu ? null : menu); };
  const handleLogout = () => { localStorage.clear(); window.location.href = "/login"; };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/admin" },
    {
      text: "Expo Management",
      icon: <ExpoIcon />,
      children: [
        { text: "Create Expo", path: "/admin/expo/create" },
        { text: "Manage Expo", path: "/admin/expo/manage" },
      ],
    },
     { 
    text: 'Support Chat', 
    icon: <ChatIcon />, 
    path: '/admin/support-chat' 
  },
    {
      text: "Announcement",
      icon: <Mic2Icon />,
      children: [
        { text: "Send Announcement", path: "/admin/notifications/send" },
        { text: "Activity Feed", path: "/admin/notifications/history" },
      ],
    },
    {
      text: "Exhibitor Management",
      icon: <PeopleIcon />,
      children: [
        { text: "All Exhibitors", path: "/admin/exhibitors" },
        { text: "Pending Requests", path: "/admin/exhibitors/requests" },
        { text: "Assigned Booths", path: "/admin/exhibitors/booths" },
        { text: "Staff & Passes", path: "/admin/exhibitors/passes" },
      ],
    },
    {
      text: "Schedule",
      icon: <ScheduleIcon />,
      children: [
        { text: "Create Schedule", path: "/admin/schedule/create" },
        { text: "Manage Schedule", path: "/admin/schedule/manage" },
      ],
    },
    {
      text: "Analytics",
      icon: <AnalyticsIcon />,
      children: [
        { text: "Overview", path: "/admin/analytics" },
        { text: "Live Stats", path: "/admin/analytics/live" },
        { text: "Reports", path: "/admin/analytics/reports" },
      ],
    },
    {
      text: "Verification Center",
      icon: <VerifiedIcon />,
      path: "/admin/verification",
      badge: "Action Required"
    },
  ];

  // Drawer variant: mobile/tablet = temporary (overlay), desktop = persistent
  const drawerVariant = isDesktop ? "persistent" : "temporary";

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Logo + Close button on mobile/tablet */}
      <Box sx={{ p: "20px 20px 16px", display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
  <Typography variant="h6" sx={{ fontFamily: "'Syne', sans-serif", color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: 0.5 }}>
    Event<span style={{ color: '#00c8f0' }}>Sphere</span>
  </Typography>
</Box>
        {/* Close icon only on mobile/tablet */}
        {!isDesktop && (
          <IconButton onClick={() => setOpen(false)} sx={{ color: THEME.textSecondary, p: 0.5 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <List sx={{ px: 1.5, flexGrow: 1, overflowY: 'auto' }}>
        {menuItems.map((item) => {
          const hasChildren = Boolean(item.children);
          const isExpanded = openMenu === item.text;
          const isActive = location.pathname === item.path || item.children?.some(c => c.path === location.pathname);

          return (
            <Box key={item.text} sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => hasChildren ? handleToggle(item.text) : navigate(item.path)}
                sx={{
                  borderRadius: "10px", py: 1,
                  color: isActive ? THEME.accent : THEME.textSecondary,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.03)", color: "#fff" }
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ "& .MuiTypography-root": { fontSize: "14px", fontWeight: isActive ? 600 : 400 } }}
                />
                {hasChildren && (
                  <KeyboardArrowDown sx={{ fontSize: 16, transform: isExpanded ? "rotate(180deg)" : "none", transition: "0.2s" }} />
                )}
              </ListItemButton>

              {hasChildren && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ mt: 0.5, ml: 2, borderLeft: `1px solid ${THEME.border}` }}>
                    {item.children.map((child) => (
                      <ListItemButton
                        key={child.text}
                        onClick={() => navigate(child.path)}
                        sx={{
                          py: 0.8, pl: 3, borderRadius: "0 8px 8px 0",
                          color: location.pathname === child.path ? THEME.accent : THEME.textSecondary,
                          "&:hover": { color: "#fff" }
                        }}
                      >
                        <ListItemText primary={child.text} sx={{ "& .MuiTypography-root": { fontSize: "13px" } }} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </Box>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", bgcolor: THEME.bg, minHeight: "100vh" }}>
      <CssBaseline />

      {/* ─── APPBAR ─── */}
      <AppBar
        position="fixed"
        sx={{
          // On desktop with open drawer: shift right. Otherwise full width.
          width: (isDesktop && open) ? `calc(100% - ${drawerWidth}px)` : "100%",
          ml: (isDesktop && open) ? `${drawerWidth}px` : 0,
          background: "rgba(5, 7, 10, 0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${THEME.border}`,
          zIndex: (theme) => theme.zIndex.drawer + (isDesktop ? 0 : 1), // On mobile stay above drawer overlay
          boxShadow: 'none',
          transition: 'width 0.3s, margin-left 0.3s',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1.5, sm: 3 }, minHeight: { xs: 56, sm: 64 } }}>

          {/* Left: Hamburger + Search */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 2 }, flex: 1, minWidth: 0 }}>
            <IconButton onClick={() => setOpen(!open)} sx={{ color: THEME.textSecondary, flexShrink: 0 }}>
              <MenuIcon />
            </IconButton>

            {/* Search bar — hidden on mobile, visible on sm+ */}
            <Box sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              bgcolor: 'rgba(255,255,255,0.03)',
              px: 2, py: 0.8,
              borderRadius: '12px',
              width: '100%',
              maxWidth: { sm: '260px', md: '350px' }
            }}>
              <SearchIcon sx={{ color: THEME.textSecondary, fontSize: 18, mr: 1, flexShrink: 0 }} />
              <InputBase placeholder="Search console..." sx={{ color: '#fff', fontSize: '13px', width: '100%' }} />
            </Box>

            {/* Mobile: search icon only */}
            <IconButton sx={{ display: { xs: 'flex', sm: 'none' }, color: THEME.textSecondary }}>
              <SearchIcon />
            </IconButton>
          </Box>

          {/* Right: Notifications + Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flexShrink: 0 }}>

            {/* Notification Bell */}
            <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)} sx={{ color: THEME.textSecondary }}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationIcon />
              </Badge>
            </IconButton>

            <Menu
              anchorEl={notifAnchor}
              open={Boolean(notifAnchor)}
              onClose={() => setNotifAnchor(null)}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1.5,
                    bgcolor: '#0A0D14',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#fff',
                    width: { xs: 'calc(100vw - 32px)', sm: 320 },
                    maxWidth: 320,
                    borderRadius: '16px',
                    backgroundImage: 'none',
                    overflow: 'hidden'
                  }
                }
              }}
              // On mobile anchor to top of screen, not element
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {/* Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="center"
                sx={{ p: 2, pb: 1.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ fontWeight: 800, fontSize: '13px' }}>Admin Alerts</Typography>
                  {unreadCount > 0 && (
                    <Box sx={{ bgcolor: 'rgba(56,189,248,0.15)', color: '#38bdf8', fontSize: '10px', fontWeight: 700, px: 1, py: 0.3, borderRadius: '20px' }}>
                      {unreadCount} new
                    </Box>
                  )}
                </Stack>
                <Typography onClick={handleMarkAsRead} sx={{ fontSize: '11px', color: '#38bdf8', cursor: 'pointer', fontWeight: 600 }}>
                  Mark all read
                </Typography>
              </Stack>

              {/* Items */}
              <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
                {notifications.length > 0 ? notifications.slice(0, 3).map(n => {
                  const isExpo = n.type === 'expo';
                  return (
                    <Box key={n._id} onClick={() => setNotifAnchor(null)}
                      sx={{ display: 'flex', gap: 1.2, px: 2, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'flex-start', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, bgcolor: isExpo ? 'rgba(139,92,246,0.1)' : 'rgba(56,189,248,0.1)' }}>
                        <Typography sx={{ fontSize: '14px' }}>{isExpo ? '📅' : '👤'}</Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ fontSize: '9px', fontWeight: 700, px: 0.8, py: 0.2, borderRadius: '4px', display: 'inline-block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5, bgcolor: isExpo ? 'rgba(139,92,246,0.1)' : 'rgba(56,189,248,0.1)', color: isExpo ? '#a78bfa' : '#38bdf8' }}>
                          {isExpo ? 'New Expo' : 'Booth Request'}
                        </Box>
                        <Typography sx={{ fontSize: '12px', color: n.isRead ? '#64748B' : '#F8FAFC', fontWeight: n.isRead ? 400 : 600, lineHeight: 1.5 }}>{n.message}</Typography>
                        <Typography sx={{ fontSize: '10px', color: '#64748B', mt: 0.4 }}>{new Date(n.createdAt).toLocaleTimeString()}</Typography>
                      </Box>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#38bdf8', mt: 0.6, flexShrink: 0, visibility: n.isRead ? 'hidden' : 'visible' }} />
                    </Box>
                  );
                }) : (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '12px', color: '#64748B' }}>No notifications</Typography>
                  </Box>
                )}
              </Box>

              {/* Footer */}
              <Box sx={{ p: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                <Typography
                  onClick={() => { setNotifAnchor(null); navigate('/admin/notifications/history'); }}
                  sx={{ fontSize: '12px', color: '#38bdf8', fontWeight: 700, cursor: 'pointer' }}
                >
                  View all activity →
                </Typography>
              </Box>
            </Menu>

            {/* Profile */}
            <Box
              onClick={(e) => setProfileAnchor(e.currentTarget)}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', p: 0.5, pl: { xs: 0.5, sm: 1 }, borderRadius: '12px', "&:hover": { bgcolor: 'rgba(255,255,255,0.05)' } }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: THEME.accent, color: '#000', fontSize: 13, fontWeight: 900 }}>
                {user.name ? user.name.charAt(0).toUpperCase() : "A"}
              </Avatar>
              {/* Name/email hidden on mobile */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Typography sx={{ fontSize: '12px', color: '#fff', fontWeight: 600, lineHeight: 1 }}>{user.name || "Administrator"}</Typography>
                <Typography sx={{ fontSize: '10px', color: THEME.textSecondary }}>{user.email}</Typography>
              </Box>
              <KeyboardArrowDown sx={{ fontSize: 16, color: THEME.textSecondary, display: { xs: 'none', sm: 'block' } }} />
            </Box>

            <Menu
              anchorEl={profileAnchor}
              open={Boolean(profileAnchor)}
              onClose={() => setProfileAnchor(null)}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1.5, bgcolor: THEME.sidebar, border: `1px solid ${THEME.border}`,
                    color: '#fff', width: 220, borderRadius: '16px', p: 1, backgroundImage: 'none'
                  }
                }
              }}
            >
              <MenuItem onClick={() => { setProfileAnchor(null); navigate('/admin/settings/profile'); }} sx={{ borderRadius: '8px', fontSize: '14px' }}>
                My Profile
              </MenuItem>
              <Divider sx={{ my: 1, borderColor: THEME.border }} />
              <MenuItem onClick={handleLogout} sx={{ borderRadius: '8px', gap: 1.5, color: '#f87171', fontSize: '14px', fontWeight: 600 }}>
                <LogoutIcon sx={{ fontSize: 20 }} /> Logout Account
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ─── SIDEBAR DRAWER ─── */}
      <Drawer
        variant={drawerVariant}
        anchor="left"
        open={open}
        onClose={() => setOpen(false)} // works for temporary (mobile/tablet)
        ModalProps={{ keepMounted: true }} // better mobile perf
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            bgcolor: THEME.sidebar,
            borderRight: `1px solid ${THEME.border}`,
            backgroundImage: 'none',
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* ─── MAIN CONTENT ─── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          pt: { xs: 9, sm: 10 }, // account for AppBar height
          // On desktop with open drawer, content is already shifted by flexbox
          // On mobile, content is always full width
          width: (isDesktop && open) ? `calc(100% - ${drawerWidth}px)` : '100%',
          minWidth: 0, // prevent flex overflow
          transition: 'width 0.3s',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}