import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Box, Typography, Paper, Stack, Divider, Avatar, 
  IconButton, Badge, Tooltip, Chip 
} from "@mui/material";
import { 
  CampaignOutlined as BroadcastIcon,
  VerifiedUserOutlined as AdminIcon,
  NotificationsActiveOutlined as AlertIcon,
  MoreVertOutlined as MenuIcon,
  DoneAll as ReadIcon
} from "@mui/icons-material";
import axios from "axios";

const THEME = {
  bg: "#05070A",
  sidebar: "#0D1117",
  chatBg: "#05070A",
  accent: "#38bdf8",
  border: "rgba(255, 255, 255, 0.08)",
  textSecondary: "#94A3B8"
};

export default function NotificationPage({ role }) {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const scrollRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user._id || user.id;

 // 1. Mark as Seen logic ko update karein
const markMessagesAsSeen = async (currentNotifs) => {
    const hasUnread = currentNotifs.some(n => !n.isRead);
    if (!hasUnread) return;

    try {
        let markUrl = "";
        if (role === 'admin') {
            markUrl = "http://localhost:5000/api/notifications/mark-read-admin";
        } else if (role === 'exhibitor') {
            markUrl = `http://localhost:5000/api/notifications/mark-read-exhibitor/${userId}`;
        } else if (role === 'attendee') {
            markUrl = `http://localhost:5000/api/notifications/mark-read-attendee/${userId}`;
        }

        if (markUrl) {
            await axios.put(markUrl);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        }
    } catch (err) {
        console.error("Mark read error:", err);
    }
};

// 2. Fetch logic mein Attendee ka case bhi handle kar lein
const fetchNotifications = async () => {
    if (!userId) return;
    
    let fetchUrl = "";
    if (role === 'admin') {
        fetchUrl = "http://localhost:5000/api/notifications/admin";
    } else if (role === 'exhibitor') {
        fetchUrl = `http://localhost:5000/api/notifications/exhibitor/${userId}`;
    } else {
        fetchUrl = `http://localhost:5000/api/notifications/attendee/${userId}`;
    }
    
    try {
        const res = await axios.get(fetchUrl);
        setNotifications(res.data);
        if(Array.isArray(res.data) && res.data.length > 0) {
            markMessagesAsSeen(res.data);
        }
    } catch (err) {
        console.error("Fetch error:", err);
    }
};

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [role, userId]);

  // 3. Filtering + Sorting (Hamesha purane upar, naye niche)
  const sortedNotifs = useMemo(() => {
    let filtered = notifications;
    if (activeTab === "broadcast") filtered = notifications.filter(n => n.type === 'broadcast');
    if (activeTab === "system") filtered = notifications.filter(n => n.type !== 'broadcast');
    
    // Sort by date: Oldest First (top), Newest Last (bottom)
    return [...filtered].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [notifications, activeTab]);

  // 4. Auto Scroll to Bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sortedNotifs]); 

  return (
    <Box sx={{ 
      display: 'flex', 
      height: 'calc(100vh - 120px)', 
      bgcolor: THEME.bg, 
      borderRadius: '24px', 
      overflow: 'hidden', 
      border: `1px solid ${THEME.border}` 
    }}>
      
      {/* SIDEBAR */}
      <Box sx={{ 
        width: { xs: 80, md: 300 }, 
        bgcolor: THEME.sidebar, 
        borderRight: `1px solid ${THEME.border}`,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 900, display: { xs: 'none', md: 'block' } }}>
            Messenger
          </Typography>
        </Box>

        <Stack spacing={1} sx={{ px: 2 }}>
          <ChatTab 
            icon={<AlertIcon />} 
            label="All Activity" 
            active={activeTab === 'all'} 
            onClick={() => setActiveTab('all')} 
            count={notifications.filter(n => !n.isRead).length} 
          />
          <ChatTab 
            icon={<BroadcastIcon />} 
            label="Broadcasts" 
            active={activeTab === 'broadcast'} 
            onClick={() => setActiveTab('broadcast')} 
            count={notifications.filter(n => !n.isRead && n.type === 'broadcast').length}
          />
          <ChatTab 
            icon={<AdminIcon />} 
            label="System Logs" 
            active={activeTab === 'system'} 
            onClick={() => setActiveTab('system')} 
            count={notifications.filter(n => !n.isRead && n.type !== 'broadcast').length}
          />
        </Stack>
      </Box>

      {/* CHAT AREA */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: THEME.chatBg }}>
        
        {/* Header */}
        <Box sx={{ 
          p: 2, px: 3, 
          borderBottom: `1px solid ${THEME.border}`, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: THEME.sidebar
        }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: THEME.accent, color: '#000', fontWeight: 900 }}>S</Avatar>
            <Box>
              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '15px' }}>System Messenger</Typography>
              <Typography sx={{ color: '#4ade80', fontSize: '11px', fontWeight: 700 }}>● Online</Typography>
            </Box>
          </Stack>
        </Box>

        {/* Scrollable Messages Area */}
        <Box 
          ref={scrollRef}
          sx={{ 
            flex: 1, 
            p: 3, 
            overflowY: 'auto', 
            display: 'flex', 
            flexDirection: 'column', // Top to bottom flow
            gap: 2,
            scrollBehavior: 'smooth',
            "&::-webkit-scrollbar": { width: '5px' },
            "&::-webkit-scrollbar-thumb": { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '10px' }
          }}
        >
          {/* Spacer to push messages down if they are few */}
          <Box sx={{ flexGrow: 1 }} />

          {sortedNotifs.length > 0 ? sortedNotifs.map((n) => (
            <Box key={n._id} sx={{ 
                maxWidth: '80%', 
                alignSelf: 'flex-start',
                animation: 'chatFadeIn 0.3s ease-out'
            }}>
              <Stack direction="row" spacing={1.5} alignItems="flex-end">
                <Avatar sx={{ width: 28, height: 28, fontSize: '10px', bgcolor: 'rgba(255,255,255,0.05)', border: `1px solid ${THEME.border}` }}>
                    {n.type === 'broadcast' ? <BroadcastIcon sx={{ fontSize: 16 }} /> : "S"}
                </Avatar>
                
                <Box>
                  <Paper sx={{ 
                    p: 2, 
                    bgcolor: n.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(56, 189, 248, 0.08)', 
                    border: `1px solid ${n.isRead ? THEME.border : THEME.accent + '44'}`,
                    borderRadius: '18px 18px 18px 4px',
                  }}>
                    <Typography sx={{ color: '#fff', fontSize: '14px' }}>
                      {n.message}
                    </Typography>
                  </Paper>
                  
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5, ml: 1 }}>
                    <Typography sx={{ color: THEME.textSecondary, fontSize: '10px' }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                    <ReadIcon sx={{ fontSize: 14, color: n.isRead ? THEME.accent : THEME.textSecondary }} />
                  </Stack>
                </Box>
              </Stack>
            </Box>
          )) : (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                <Typography sx={{ color: '#fff' }}>No history found.</Typography>
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ p: 1.5, bgcolor: THEME.sidebar, textAlign: 'center', borderTop: `1px solid ${THEME.border}` }}>
            <Typography sx={{ color: THEME.textSecondary, fontSize: '11px' }}>
                System-only channel. Replies are disabled.
            </Typography>
        </Box>
      </Box>

      <style>
        {`
          @keyframes chatFadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </Box>
  );
}

function ChatTab({ icon, label, active, onClick, count }) {
  return (
    <Box 
      onClick={onClick}
      sx={{ 
        display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'space-between' },
        p: 1.5, px: 2, borderRadius: '12px', cursor: 'pointer',
        bgcolor: active ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
        color: active ? THEME.accent : THEME.textSecondary,
        "&:hover": { bgcolor: 'rgba(255,255,255,0.03)' }
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        {React.cloneElement(icon, { sx: { fontSize: 20 } })}
        <Typography sx={{ fontSize: '14px', fontWeight: active ? 800 : 500, display: { xs: 'none', md: 'block' } }}>
          {label}
        </Typography>
      </Stack>
      {count > 0 && (
        <Box sx={{ 
            bgcolor: '#f87171', color: '#fff', fontSize: '10px', fontWeight: 900, 
            width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%'
        }}>
            {count}
        </Box>
      )}
    </Box>
  );
}