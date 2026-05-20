import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { Box, TextField, IconButton, Typography, Avatar, InputAdornment, Stack, CircularProgress, Divider, Badge } from "@mui/material";
import { Send, Search, Users, ArrowLeft, Zap, Building2, Circle } from "lucide-react";

const T = {
  bg: "#05070A",
  paper: "#0A0D14",
  paperAlt: "#111827",
  accent: "#a78bfa", // Purple theme for Networking
  accentDim: "rgba(167,139,250,0.1)",
  border: "rgba(255,255,255,0.06)",
  text: "#E8EAF0",
  muted: "#94A3B8",
  green: "#22C55E",
};

// --- Helpers ---
const getInitials = (name = "") => 
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "EX";

const formatMsgTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
};

export default function NetworkingMessenger({ currentUser }) {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const socket = useRef(null);
  const scrollRef = useRef(null);
  const myId = currentUser?.id || currentUser?._id;

  // 1. Socket Setup
  useEffect(() => {
    socket.current = io("http://localhost:5000");
    socket.current.on("getMessage", (data) => {
      setArrivalMessage({ 
        sender: data.senderId, 
        text: data.text, 
        createdAt: new Date().toISOString() 
      });
    });
    socket.current.on("getUsers", (users) => setOnlineUsers(users.map((u) => u.userId)));
    return () => socket.current.disconnect();
  }, []);

  useEffect(() => { if (myId) socket.current.emit("addUser", myId); }, [myId]);
const handleMessage = async (neighbor, expoId) => {
  const receiverId = neighbor.exhibitorId?._id || neighbor.exhibitorId;
  if (!receiverId) {
    alert("This neighbor profile is not active.");
    return;
  }
  setStartingChat(neighbor.id);
  try {
    const res = await axios.post("http://localhost:5000/api/chat/conversation", {
      senderId: userId, 
      receiverId, 
      expoId: expoId 
    });
    
    // Yahan path networking wala rakhein jo App.jsx mein hai
    navigate("/exhibitor/networking-messages", { state: { currentChatId: res.data._id } });
    
  } catch (err) {
    alert("Could not start conversation.");
  } finally { setStartingChat(null); }
};
  // Handle incoming message real-time
  useEffect(() => {
    if (arrivalMessage) {
      // Agar wahi chat khuli hai toh message add karo
      if (currentChat?.members.some(m => (m._id || m) === arrivalMessage.sender)) {
        setMessages((prev) => [...prev, arrivalMessage]);
      }
      // List ko refresh karo taake naya message sidebar mein dikhe
      fetchConversations();
    }
  }, [arrivalMessage]);

  // 2. Fetch Conversations (Exhibitor to Exhibitor only)
  const fetchConversations = useCallback(async () => {
    if (!myId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/conversations/${myId}`);
      // Filter: Sirf exhibitors ko dikhana hai business hub mein
      const exhibitorChats = res.data.filter(conv => {
        const partner = conv.members.find(m => (m._id || m) !== myId);
        return partner?.role === "exhibitor";
      });
      
      // Sorting: Latest message wali chat sabse upar
      exhibitorChats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      
      setConversations(exhibitorChats);

      // Auto-open if coming from Neighbors Page
      const targetId = location.state?.currentChatId;
      if (targetId && !currentChat) {
        const found = exhibitorChats.find(c => c._id === targetId);
        if (found) setCurrentChat(found);
      }
    } catch (err) { console.error("Conv fetch error", err); }
  }, [myId, location.state, currentChat]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // 3. Fetch Messages when chat selected
  useEffect(() => {
    if (!currentChat) return;
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/chat/messages/${currentChat._id}`);
        setMessages(res.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchMessages();
  }, [currentChat]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSubmit = async () => {
    if (!newMessage.trim() || !currentChat) return;
    const partner = currentChat.members.find(m => (m._id || m) !== myId);
    const receiverId = partner._id || partner;

    socket.current.emit("sendMessage", { senderId: myId, receiverId, text: newMessage });
    
    try {
      const res = await axios.post("http://localhost:5000/api/chat/message", {
        conversationId: currentChat._id, sender: myId, text: newMessage,
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
      fetchConversations(); // Sidebar update
    } catch (err) { console.error(err); }
  };

  const getPartner = (conv) => conv?.members?.find(m => (m._id || m) !== myId);

  return (
    <Box sx={{ height: "calc(100vh - 120px)", display: "flex", bgcolor: T.bg, borderRadius: "24px", border: `1px solid ${T.border}`, m: 2, overflow: "hidden" }}>
      
      {/* --- Sidebar --- */}
      <Box sx={{ 
        width: { xs: currentChat ? 0 : "100%", md: "380px" }, 
        display: { xs: currentChat ? "none" : "flex", md: "flex" }, 
        flexDirection: "column", bgcolor: T.paper, borderRight: `1px solid ${T.border}` 
      }}>
        <Box sx={{ p: 3, pb: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
            <Box sx={{ bgcolor: T.accentDim, p: 1, borderRadius: '12px' }}><Zap size={20} color={T.accent} fill={T.accent} /></Box>
            <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "22px" }}>Exhibitor Hub</Typography>
          </Stack>
          <TextField
            fullWidth size="small" placeholder="Search neighbors..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18} color={T.muted} /></InputAdornment> }}
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: T.bg, borderRadius: "14px", color: "#fff", "& fieldset": { borderColor: T.border } } }}
          />
        </Box>
        
        <Box sx={{ flex: 1, overflowY: "auto", px: 2 }}>
          <Typography sx={{ color: T.muted, fontSize: '11px', fontWeight: 800, px: 1, mb: 1, mt: 2 }}>RECENT COLLABORATIONS</Typography>
          {conversations.filter(c => getPartner(c)?.name.toLowerCase().includes(searchQuery.toLowerCase())).map((conv) => {
            const partner = getPartner(conv);
            const isActive = currentChat?._id === conv._id;
            const isOnline = onlineUsers.includes(partner._id || partner);

            return (
              <Box key={conv._id} onClick={() => setCurrentChat(conv)} sx={{ 
                p: 2, mb: 1, borderRadius: '18px', display: "flex", alignItems: "center", gap: 2, cursor: "pointer", 
                bgcolor: isActive ? T.accentDim : "transparent", 
                border: isActive ? `1px solid ${T.accent}44` : "1px solid transparent",
                "&:hover": { bgcolor: "rgba(255,255,255,0.03)" } 
              }}>
                <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} 
                  badgeContent={isOnline ? <Circle size={10} fill={T.green} color={T.green} /> : null}>
                  <Avatar sx={{ width: 50, height: 50, bgcolor: T.paperAlt, color: T.accent, border: `1px solid ${T.border}`, fontWeight: 800, fontSize: '16px' }}>
                    {getInitials(partner?.name)}
                  </Avatar>
                </Badge>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "15px" }}>{partner?.name}</Typography>
                    <Typography sx={{ color: T.muted, fontSize: "10px" }}>{formatMsgTime(conv.updatedAt)}</Typography>
                  </Stack>
                  <Typography sx={{ color: T.muted, fontSize: "13px", noWrap: true, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mt: 0.3 }}>
                    {conv.lastMessage?.text || "No messages yet"}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* --- Chat Window --- */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: '#06080C' }}>
        {currentChat ? (
          <>
            {/* Header */}
            <Box sx={{ p: 2, px: 4, borderBottom: `1px solid ${T.border}`, bgcolor: T.paper, display: "flex", alignItems: "center", justifyContent: 'space-between' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <IconButton onClick={() => setCurrentChat(null)} sx={{ display: { md: "none" }, color: "#fff" }}><ArrowLeft /></IconButton>
                <Avatar sx={{ bgcolor: T.accent, color: "#000", fontWeight: 800, width: 45, height: 45 }}>{getInitials(getPartner(currentChat)?.name)}</Avatar>
                <Box>
                  <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: '16px' }}>{getPartner(currentChat)?.name}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Building2 size={12} color={T.accent} />
                    <Typography sx={{ color: T.accent, fontSize: '11px', fontWeight: 800 }}>{getPartner(currentChat)?.organization || "Exhibitor Partner"}</Typography>
                  </Stack>
                </Box>
              </Stack>
              <Chip label={onlineUsers.includes(getPartner(currentChat)?._id) ? "Online" : "Offline"} size="small" 
                sx={{ bgcolor: onlineUsers.includes(getPartner(currentChat)?._id) ? 'rgba(34,197,94,0.1)' : 'transparent', color: onlineUsers.includes(getPartner(currentChat)?._id) ? T.green : T.muted, border: `1px solid ${T.border}` }} />
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, overflowY: "auto", p: 4, display: "flex", flexDirection: "column", gap: 2 }}>
              {loading ? <CircularProgress sx={{ m: "auto", color: T.accent }} /> : messages.map((m, i) => {
                const isMine = (m.sender?._id || m.sender) === myId;
                return (
                  <Box key={i} sx={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                    <Box sx={{ 
                      p: 2, px: 2.5, borderRadius: isMine ? "22px 22px 4px 22px" : "22px 22px 22px 4px", 
                      bgcolor: isMine ? T.accent : T.paperAlt, 
                      color: isMine ? "#000" : "#fff",
                      boxShadow: isMine ? `0 4px 15px ${T.accent}22` : 'none',
                    }}>
                      <Typography sx={{ fontSize: "14.5px", lineHeight: 1.5 }}>{m.text}</Typography>
                    </Box>
                    <Typography sx={{ color: T.muted, fontSize: '10px', mt: 0.8, textAlign: isMine ? 'right' : 'left', fontWeight: 600 }}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                );
              })}
              <div ref={scrollRef} />
            </Box>

            {/* Footer Input */}
            <Box sx={{ p: 3, px: 4, bgcolor: T.paper, borderTop: `1px solid ${T.border}` }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField 
                  fullWidth multiline maxRows={4} placeholder="Type a professional message..." 
                  value={newMessage} onChange={(e) => setNewMessage(e.target.value)} 
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSubmit())} 
                  sx={{ "& .MuiOutlinedInput-root": { bgcolor: T.bg, color: "#fff", borderRadius: "18px", px: 2, "& fieldset": { borderColor: T.border } } }} 
                />
                <IconButton onClick={handleSubmit} disabled={!newMessage.trim()} 
                  sx={{ bgcolor: T.accent, color: "#000", width: 56, height: 56, "&:hover": { bgcolor: "#fff" }, "&:disabled": { opacity: 0.2 } }}>
                  <Send size={24} />
                </IconButton>
              </Stack>
            </Box>
          </>
        ) : (
          /* Empty State */
          <Box sx={{ m: "auto", textAlign: "center", p: 4 }}>
            <Box sx={{ width: 120, height: 120, bgcolor: T.accentDim, borderRadius: "40px", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 4, border: `1px solid ${T.accent}22` }}>
              <Users size={60} color={T.accent} />
            </Box>
            <Typography variant="h4" sx={{ color: "#fff", fontWeight: 900, mb: 1.5 }}>Business Networking</Typography>
            <Typography sx={{ color: T.muted, maxWidth: 450, mx: "auto", fontSize: '15px' }}>
              Select a fellow exhibitor from the sidebar to start discussing collaborations and business opportunities.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}