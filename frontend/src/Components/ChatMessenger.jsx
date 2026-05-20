import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import {
  Box, TextField, IconButton, Typography, Avatar,
  InputAdornment, Stack, Chip, CircularProgress
} from "@mui/material";
import { Send, Search, User, ArrowLeft, MoreVertical } from "lucide-react";

// ─── THEME ───────────────────────────────────────────────────────────────────
const T = {
  bg:           "#080A0C",
  paper:        "#0E1116",
  paperAlt:     "#131820",
  accent:       "#00b8d1",
  accentDim:    "rgba(0,184,209,0.10)",
  accentBorder: "rgba(0,184,209,0.25)",
  border:       "rgba(255,255,255,0.06)",
  text:         "#E8EAF0",
  muted:        "#4A5568",
  green:        "#22C55E",
  greenDim:     "rgba(34,197,94,0.1)",
  purple:       "#a78bfa",
  purpleDim:    "rgba(167,139,250,0.10)",
  purpleBorder: "rgba(167,139,250,0.25)",
  admin:        "#F87171",
  adminDim:     "rgba(248,113,113,0.1)",
  adminBorder:  "rgba(248,113,113,0.25)",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString()
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { day: "2-digit", month: "short" });
};

// Role ke hisaab se avatar color
const getAvatarStyle = (role) => {
  if (role === "exhibitor") return { bgcolor: T.accentDim,  color: T.accent  };
  if (role === "admin")     return { bgcolor: T.adminDim,   color: T.admin   };
  if (role === "exhibitor-peer") return { bgcolor: T.purpleDim, color: T.purple };
  return                           { bgcolor: T.greenDim,   color: T.green   };
};

// ─── TAB CONFIG per logged-in role ───────────────────────────────────────────
const getTabsForRole = (myRole) => {
  if (myRole === "exhibitor") return [
    { key: "attendee",  label: "Attendees",  color: T.green,  dim: T.greenDim,  border: "rgba(34,197,94,0.25)"  },
    { key: "exhibitor", label: "Exhibitors", color: T.purple, dim: T.purpleDim, border: T.purpleBorder          },
    
  ];
  if (myRole === "attendee") return [
    { key: "exhibitor", label: "Exhibitors", color: T.accent, dim: T.accentDim, border: T.accentBorder },
  ];
  
  return [];
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ChatMessenger({ currentUser }) {
  const location = useLocation();
  const [conversations,   setConversations]   = useState([]);
  const [currentChat,     setCurrentChat]     = useState(null);
  const [messages,        setMessages]        = useState([]);
  const [newMessage,      setNewMessage]      = useState("");
  const [arrivalMessage,  setArrivalMessage]  = useState(null);
  const [onlineUsers,     setOnlineUsers]     = useState([]);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [loading,         setLoading]         = useState(false);
  const [activeTab,       setActiveTab]       = useState(null); // set after role loads

  const socket    = useRef(null);
  const scrollRef = useRef(null);

  const myId   = currentUser?.id   || currentUser?._id;
  const myRole = currentUser?.role || "";

  const tabs = getTabsForRole(myRole);

  // Set default tab once role is known
  useEffect(() => {
    if (tabs.length > 0 && !activeTab) setActiveTab(tabs[0].key);
  }, [myRole]);

  // ── 1. SOCKET ─────────────────────────────────────────────────────────────
  useEffect(() => {
    socket.current = io("http://localhost:5000");
    socket.current.on("getMessage", (data) => {
      setArrivalMessage({ sender: data.senderId, text: data.text, createdAt: new Date().toISOString() });
    });
    socket.current.on("getUsers", (users) => {
      setOnlineUsers(users.map((u) => u.userId));
    });
    return () => socket.current.disconnect();
  }, []);

  useEffect(() => {
    if (myId && socket.current) socket.current.emit("addUser", myId);
  }, [myId]);

  useEffect(() => {
    if (!arrivalMessage || !currentChat) return;
    const memberIds = currentChat.members.map((m) => (typeof m === "object" ? m._id : m));
    if (memberIds.includes(arrivalMessage.sender))
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  // ── 2. FETCH ──────────────────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    if (!myId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/conversations/${myId}`);
      setConversations(res.data);
    } catch (err) { console.error(err); }
  }, [myId]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    const targetId = location.state?.currentChatId;
    if (targetId && conversations.length > 0) {
      const found = conversations.find((c) => c._id === targetId);
      if (found) setCurrentChat(found);
    }
  }, [location.state, conversations]);

  useEffect(() => {
    if (!currentChat) return;
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/chat/messages/${currentChat._id}`);
        setMessages(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchMessages();
  }, [currentChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── 3. ACTIONS ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !currentChat) return;
    const receiverId = currentChat.members
      .map((m) => (typeof m === "object" ? m._id : m))
      .find((id) => id !== myId);
    socket.current.emit("sendMessage", { senderId: myId, receiverId, text: newMessage });
    try {
      const res = await axios.post("http://localhost:5000/api/chat/message", {
        conversationId: currentChat._id, sender: myId, text: newMessage,
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
      fetchConversations();
    } catch (err) { console.error(err); }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  // ── 4. HELPERS ────────────────────────────────────────────────────────────
  const getPartner     = (conv) => conv?.members?.find((m) => (typeof m === "object" ? m._id : m) !== myId);
  const getPartnerName = (conv) => getPartner(conv)?.name || "Unknown User";
  const getPartnerRole = (conv) => getPartner(conv)?.role || "user";
  const isOnline       = (conv) => {
    const p = getPartner(conv);
    return onlineUsers.includes(typeof p === "object" ? p?._id : p);
  };

  // ── 5. TAB FILTER ─────────────────────────────────────────────────────────
  const tabFiltered = conversations.filter((c) => {
    const partnerRole = getPartnerRole(c);
    return partnerRole === activeTab;
  });

  const searchFiltered = tabFiltered.filter((c) => {
    const name = getPartnerName(c).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  // Active tab config
  const activeTabConfig = tabs.find((t) => t.key === activeTab) || tabs[0];

  // ── 6. RENDER ─────────────────────────────────────────────────────────────
  return (
    <Box sx={{
      height: "calc(100vh - 110px)", display: "flex", bgcolor: T.bg,
      overflow: "hidden", borderRadius: "24px", border: `1px solid ${T.border}`,
      m: { xs: 1, md: 2 },
    }}>

      {/* ── SIDEBAR ── */}
      <Box sx={{
        width: { xs: currentChat ? "0px" : "100%", md: "380px" },
        display: { xs: currentChat ? "none" : "flex", md: "flex" },
        flexDirection: "column", borderRight: `1px solid ${T.border}`, bgcolor: T.paper,
      }}>

        {/* Header + Search */}
        <Box sx={{ p: 2.5, pb: 1.5, borderBottom: `1px solid ${T.border}` }}>
          <Typography sx={{ fontWeight: 900, fontSize: "20px", color: T.text, mb: 1.5 }}>
            Messages
          </Typography>
          <TextField
            fullWidth placeholder="Search by name..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} size="small"
            InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} color={T.muted} /></InputAdornment> }}
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: T.bg, borderRadius: "12px", color: T.text, "& fieldset": { borderColor: T.border } } }}
          />
        </Box>

        {/* ── TABS ── */}
        <Box sx={{ display: "flex", gap: 1, p: 1.5, borderBottom: `1px solid ${T.border}`, flexWrap: "wrap" }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = conversations.filter((c) => getPartnerRole(c) === tab.key).length;
            return (
              <Box
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setCurrentChat(null); }}
                sx={{
                  display: "flex", alignItems: "center", gap: 0.8,
                  px: 1.5, py: 0.8, borderRadius: "10px", cursor: "pointer",
                  bgcolor: isActive ? tab.dim : "transparent",
                  border: `1px solid ${isActive ? tab.border : T.border}`,
                  transition: "all 0.15s",
                  "&:hover": { bgcolor: tab.dim, borderColor: tab.border },
                }}
              >
                <Typography sx={{ fontSize: "12px", fontWeight: 700, color: isActive ? tab.color : T.muted }}>
                  {tab.label}
                </Typography>
                <Box sx={{
                  minWidth: 18, height: 18, borderRadius: "6px", px: 0.6,
                  bgcolor: isActive ? tab.color : T.border,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Typography sx={{ fontSize: "10px", fontWeight: 800, color: isActive ? "#000" : T.muted }}>
                    {count}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* ── CONVERSATION LIST ── */}
        <Box sx={{ flex: 1, overflowY: "auto", "&::-webkit-scrollbar": { width: "3px" }, "&::-webkit-scrollbar-thumb": { bgcolor: T.border } }}>
          {searchFiltered.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8, color: T.muted }}>
              <Typography sx={{ fontSize: "13px" }}>No conversations found</Typography>
            </Box>
          ) : (
            searchFiltered.map((conv) => {
              const partner  = getPartner(conv);
              const role     = getPartnerRole(conv);
              const isActive = currentChat?._id === conv._id;
              const online   = isOnline(conv);
              const avStyle  = getAvatarStyle(role);

              return (
                <Box key={conv._id} onClick={() => setCurrentChat(conv)} sx={{
                  p: 2, display: "flex", alignItems: "center", gap: 1.5,
                  cursor: "pointer",
                  bgcolor: isActive ? T.accentDim : "transparent",
                  borderLeft: isActive ? `3px solid ${activeTabConfig?.color || T.accent}` : "3px solid transparent",
                  transition: "0.15s",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
                }}>

                  {/* Avatar with online dot */}
                  <Box sx={{ position: "relative", flexShrink: 0 }}>
                    <Avatar sx={{ ...avStyle, width: 44, height: 44, fontWeight: 700, fontSize: "14px", border: `1px solid ${T.border}` }}>
                      {getInitials(partner?.name)}
                    </Avatar>
                    {online && (
                      <Box sx={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: "50%", bgcolor: T.green, border: `2px solid ${T.paper}` }} />
                    )}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontWeight: 700, color: T.text, fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }}>
                        {partner?.name}
                      </Typography>
                      <Typography sx={{ fontSize: "10px", color: T.muted, flexShrink: 0 }}>
                        {formatTime(conv.updatedAt)}
                      </Typography>
                    </Stack>

                    {conv.expoId?.title && (
                      <Typography sx={{ fontSize: "10px", color: T.muted, mt: 0.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        @ {conv.expoId.title}
                      </Typography>
                    )}

                    <Typography sx={{ fontSize: "12px", color: T.muted, mt: 0.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {conv.lastMessage?.text || "Click to start chatting..."}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </Box>

      {/* ── CHAT WINDOW ── */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: T.bg }}>
        {currentChat ? (
          <>
            {/* Header */}
            <Box sx={{ p: 2, px: 3, bgcolor: T.paper, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton onClick={() => setCurrentChat(null)} sx={{ display: { md: "none" }, color: T.text }}>
                <ArrowLeft />
              </IconButton>
              <Avatar sx={{ ...getAvatarStyle(getPartnerRole(currentChat)), border: `1px solid ${T.border}` }}>
                {getInitials(getPartnerName(currentChat))}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 800, color: T.text, fontSize: "16px" }}>
                  {getPartnerName(currentChat)}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{
                    fontSize: "11px", fontWeight: 900, textTransform: "uppercase",
                    color: getPartnerRole(currentChat) === "exhibitor" ? T.accent
                         : getPartnerRole(currentChat) === "admin"     ? T.admin
                         : T.green,
                  }}>
                    {getPartnerRole(currentChat)}
                  </Typography>
                  <Typography sx={{ fontSize: "11px", color: T.muted }}>•</Typography>
                  <Typography sx={{ fontSize: "12px", color: isOnline(currentChat) ? T.green : T.muted }}>
                    {isOnline(currentChat) ? "Active Now" : "Offline"}
                  </Typography>
                </Stack>
              </Box>
              <IconButton sx={{ ml: "auto", color: T.muted, border: `1px solid ${T.border}`, borderRadius: "8px", p: "6px" }}>
                <MoreVertical size={18} />
              </IconButton>
            </Box>

            {/* Messages */}
            <Box sx={{
              flex: 1, overflowY: "auto", p: 3, display: "flex", flexDirection: "column", gap: 1.5,
              backgroundImage: `radial-gradient(circle at 2px 2px, ${T.border} 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}>
              {loading ? (
                <Box sx={{ m: "auto" }}><CircularProgress size={28} sx={{ color: T.accent }} /></Box>
              ) : (
                messages.map((m, i) => {
                  const isMine = (m.sender?._id || m.sender) === myId;
                  return (
                    <Box key={i} sx={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                      <Box sx={{
                        p: 1.8, px: 2.2,
                        borderRadius: isMine ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                        bgcolor: isMine ? T.accent : T.paperAlt,
                        color: isMine ? "#000" : T.text,
                        border: isMine ? "none" : `1px solid ${T.border}`,
                      }}>
                        <Typography sx={{ fontSize: "14px", lineHeight: 1.5 }}>{m.text}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: "10px", color: T.muted, mt: 0.5, textAlign: isMine ? "right" : "left" }}>
                        {formatTime(m.createdAt)}
                      </Typography>
                    </Box>
                  );
                })
              )}
              <div ref={scrollRef} />
            </Box>

            {/* Input */}
            <Box sx={{ p: 2.5, bgcolor: T.paper, borderTop: `1px solid ${T.border}`, display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                fullWidth multiline maxRows={4} placeholder="Write your message..."
                value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleKeyDown}
                sx={{ "& .MuiOutlinedInput-root": { bgcolor: T.bg, color: T.text, borderRadius: "18px", px: 2, "& fieldset": { borderColor: T.border } } }}
              />
              <IconButton
                onClick={handleSubmit} disabled={!newMessage.trim()}
                sx={{ bgcolor: T.accent, color: "#000", width: 50, height: 50, "&:hover": { bgcolor: "#009db3" }, "&:disabled": { bgcolor: T.border, color: T.muted } }}
              >
                <Send size={22} />
              </IconButton>
            </Box>
          </>
        ) : (
          /* Empty State */
          <Box sx={{ m: "auto", textAlign: "center", p: 4 }}>
            <Box sx={{ width: 80, height: 80, bgcolor: T.accentDim, borderRadius: "30%", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3, border: `1px solid ${T.accentBorder}` }}>
              <User size={40} color={T.accent} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: T.text, mb: 1 }}>Select a Chat</Typography>
            <Typography sx={{ color: T.muted, maxWidth: 300, mx: "auto" }}>
              Choose a conversation from the sidebar to get started.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}