import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Box, Typography, Paper, Stack, Avatar
} from "@mui/material";
import { 
  CampaignOutlined as BroadcastIcon,
  VerifiedUserOutlined as AdminIcon,
  NotificationsActiveOutlined as AlertIcon,
  DoneAll as ReadIcon,
  CalendarMonthOutlined as EventIcon
} from "@mui/icons-material";
import axios from "axios";

const THEME = {
  bg: "#05070A",
  sidebar: "#0A0D14",
  chatBg: "#05070A",
  accent: "#00b8d1",
  border: "rgba(255, 255, 255, 0.08)",
  textSecondary: "#94A3B8"
};

export default function NotificationPage({ role }) {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const scrollRef = useRef(null);
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user._id || user.id;

  // ✅ BUG FIX: fetchUrl → markUrl
  const markMessagesAsSeen = async (currentNotifs) => {
    const hasUnread = currentNotifs.some(n => !n.isRead);
    if (hasUnread) {
      try {
        let markUrl = "";
        if (role === 'admin') markUrl = "http://localhost:5000/api/notifications/mark-read-admin";
        else if (role === 'attendee') markUrl = `http://localhost:5000/api/notifications/mark-read-attendee/${userId}`;
        else markUrl = `http://localhost:5000/api/notifications/mark-read-exhibitor/${userId}`;

        await axios.put(markUrl);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (err) {
        console.error("Mark read error:", err);
      }
    }
  };

  const fetchNotifications = async () => {
    if (!userId) return;
    let fetchUrl = "";
    if (role === 'admin') fetchUrl = "http://localhost:5000/api/notifications/admin";
    else if (role === 'attendee') fetchUrl = `http://localhost:5000/api/notifications/attendee/${userId}`;
    else fetchUrl = `http://localhost:5000/api/notifications/exhibitor/${userId}`;
    
    try {
      const res = await axios.get(fetchUrl);
      setNotifications(res.data);
      if (Array.isArray(res.data) && res.data.length > 0) {
        markMessagesAsSeen(res.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [role, userId]);

  // ✅ 3 types ka filtering
  const sortedNotifs = useMemo(() => {
    let filtered = notifications;
    if (activeTab === "broadcast") 
      filtered = notifications.filter(n => n.senderRole === 'admin' || n.type === 'broadcast');
    if (activeTab === "exhibitor") 
      filtered = notifications.filter(n => n.senderRole === 'exhibitor');
    if (activeTab === "event") 
      filtered = notifications.filter(n => n.type === 'event_reminder');
    
    return [...filtered].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [notifications, activeTab]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sortedNotifs]);

  // ✅ Type ke hisaab se color/label
  const getMsgStyle = (n) => {
    if (n.senderRole === 'admin' || n.type === 'broadcast') 
      return { color: '#f87171', bg: 'rgba(248,113,113,0.06)', border: '#f8717155', label: 'Official Admin', avatar: 'A' };
    if (n.type === 'event_reminder') 
      return { color: '#4ade80', bg: 'rgba(74,222,128,0.06)', border: '#4ade8055', label: 'Event Reminder', avatar: 'Ev' };
    return { color: '#a78bfa', bg: 'rgba(167,139,250,0.06)', border: '#a78bfa55', label: 'Exhibitor', avatar: 'Ex' };
  };

  return (
    <Box sx={{ 
      display: 'flex', height: 'calc(100vh - 140px)', bgcolor: THEME.bg, 
      borderRadius: '24px', overflow: 'hidden', border: `1px solid ${THEME.border}`, mt: 2
    }}>
      
      {/* SIDEBAR */}
      <Box sx={{ 
        width: { xs: 80, md: 280 }, bgcolor: THEME.sidebar, 
        borderRight: `1px solid ${THEME.border}`, display: 'flex', flexDirection: 'column'
      }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 900, fontSize: '1.2rem', display: { xs: 'none', md: 'block' } }}>
            Inbox
          </Typography>
        </Box>

        <Stack spacing={1} sx={{ px: 2 }}>
          <ChatTab icon={<AlertIcon />} label="All Messages" active={activeTab === 'all'} 
            onClick={() => setActiveTab('all')} 
            count={notifications.filter(n => !n.isRead).length} 
          />
          <ChatTab icon={<BroadcastIcon />} label="Admin Broadcasts" active={activeTab === 'broadcast'} 
            onClick={() => setActiveTab('broadcast')} 
            count={notifications.filter(n => !n.isRead && (n.senderRole === 'admin' || n.type === 'broadcast')).length}
          />
          <ChatTab icon={<AdminIcon />} label="Exhibitor Updates" active={activeTab === 'exhibitor'} 
            onClick={() => setActiveTab('exhibitor')} 
            count={notifications.filter(n => !n.isRead && n.senderRole === 'exhibitor').length}
          />
          {/* ✅ New: Event Reminder Tab */}
          <ChatTab icon={<EventIcon />} label="Upcoming Events" active={activeTab === 'event'} 
            onClick={() => setActiveTab('event')} 
            count={notifications.filter(n => !n.isRead && n.type === 'event_reminder').length}
          />
        </Stack>
      </Box>

      {/* CHAT AREA */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: THEME.chatBg }}>
        
        <Box sx={{ p: 2.5, px: 3, borderBottom: `1px solid ${THEME.border}`, display: 'flex', alignItems: 'center', bgcolor: THEME.sidebar }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: THEME.accent, color: '#000', fontWeight: 900 }}>E</Avatar>
            <Box>
              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '15px' }}>EventSphere Assistant</Typography>
              <Typography sx={{ color: '#4ade80', fontSize: '11px', fontWeight: 700 }}>● Live Updates</Typography>
            </Box>
          </Stack>
        </Box>

        <Box ref={scrollRef} sx={{ 
          flex: 1, p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2,
          "&::-webkit-scrollbar": { width: '5px' },
          "&::-webkit-scrollbar-thumb": { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '10px' }
        }}>
          <Box sx={{ flexGrow: 1 }} />

          {sortedNotifs.length > 0 ? sortedNotifs.map((n) => {
            const style = getMsgStyle(n);
            return (
              <Box key={n._id} sx={{ maxWidth: '85%', alignSelf: 'flex-start', animation: 'chatFadeIn 0.3s ease-out' }}>
                <Stack direction="row" spacing={1.5} alignItems="flex-end">
                  <Avatar sx={{ width: 32, height: 32, fontSize: '11px', bgcolor: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
                    {style.avatar}
                  </Avatar>
                  <Box>
                    <Paper sx={{ 
                      p: 2, bgcolor: n.isRead ? 'rgba(255,255,255,0.02)' : style.bg,
                      border: `1px solid ${n.isRead ? THEME.border : style.border}`,
                      borderRadius: '20px 20px 20px 4px', boxShadow: 'none'
                    }}>
                      <Typography sx={{ fontSize: '10px', fontWeight: 900, color: style.color, mb: 0.5, textTransform: 'uppercase' }}>
                        {style.label}
                      </Typography>
                      <Typography sx={{ color: '#fff', fontSize: '14px', lineHeight: 1.5 }}>
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
            );
          }) : (
            <Box sx={{ py: 10, textAlign: 'center', opacity: 0.3 }}>
              <Typography sx={{ color: '#fff' }}>No notifications in your inbox.</Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ p: 2, bgcolor: THEME.sidebar, textAlign: 'center', borderTop: `1px solid ${THEME.border}` }}>
          <Typography sx={{ color: THEME.textSecondary, fontSize: '11px' }}>
            This is a read-only channel for official event updates.
          </Typography>
        </Box>
      </Box>

      <style>{`
        @keyframes chatFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
}

function ChatTab({ icon, label, active, onClick, count }) {
  return (
    <Box onClick={onClick} sx={{ 
      display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'space-between' },
      p: 1.8, px: 2, borderRadius: '15px', cursor: 'pointer',
      bgcolor: active ? 'rgba(0, 184, 209, 0.1)' : 'transparent',
      color: active ? THEME.accent : THEME.textSecondary,
      "&:hover": { bgcolor: 'rgba(255,255,255,0.03)', color: '#fff' },
      transition: '0.2s'
    }}>
      <Stack direction="row" spacing={2} alignItems="center">
        {React.cloneElement(icon, { sx: { fontSize: 22 } })}
        <Typography sx={{ fontSize: '14px', fontWeight: active ? 800 : 500, display: { xs: 'none', md: 'block' } }}>
          {label}
        </Typography>
      </Stack>
      {count > 0 && (
        <Box sx={{ 
          bgcolor: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 900, 
          minWidth: 20, height: 20, px: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px'
        }}>
          {count}
        </Box>
      )}
    </Box>
  );
}