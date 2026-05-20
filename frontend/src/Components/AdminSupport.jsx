import React, { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const T = {
  bg: "#05070A", paper: "#0A0D14", accent: "#38bdf8",
  border: "rgba(255,255,255,0.07)", text: "#F8FAFC",
  muted: "#64748B", myMsg: "#0369a1", theirMsg: "#1E293B", online: "#22c55e",
};

const fmtTime = (ts) =>
  ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

const COLORS = ["#0369a1","#7c3aed","#be185d","#b45309","#047857","#dc2626"];
const getColor = (str = "") => COLORS[(str.charCodeAt(0) || 0) % COLORS.length];

export default function AdminSupport({ currentUser }) {
  const [conversations, setConversations] = useState([]);
  const [activeConv,    setActiveConv]    = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [text,          setText]          = useState("");
  const [loading,       setLoading]       = useState(false);
  const [unread,        setUnread]        = useState({});
  const [onlineUsers,   setOnlineUsers]   = useState([]);

  const socket    = useRef(null);
  const scrollRef = useRef(null);
  const activeRef = useRef(null);

  // currentUser ko localStorage se bhi lo agar prop nahi mila
  const user = currentUser || JSON.parse(localStorage.getItem("user") || "{}");
  const myId = String(user?._id || user?.id || "");

  useEffect(() => { activeRef.current = activeConv; }, [activeConv]);

  // ── Conversations fetch ───────────────────────
  const fetchConvs = useCallback(async () => {
    if (!myId) return;
    try {
      const { data } = await axios.get(`http://localhost:5000/api/chat/conversations/${myId}`);
      const sorted = (data || []).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setConversations(sorted);

      // FIX: Agar koi conversation active nahi hai toh pehli auto-select karo
      if (sorted.length > 0 && !activeRef.current) {
        setActiveConv(sorted[0]);
      }
    } catch (err) {
      console.error("AdminSupport fetchConvs error:", err);
    }
  }, [myId]);

  // ── Socket + initial load ─────────────────────
  useEffect(() => {
    if (!myId) return;

    socket.current = io("http://localhost:5000");
    socket.current.emit("addUser", myId);

    socket.current.on("connect", () => {
      console.log("Admin socket connected:", socket.current.id);
      socket.current.emit("addUser", myId); // reconnect pe dobara register
    });

    socket.current.on("getUsers", (users) => {
      console.log("Online users:", users); // debug
      setOnlineUsers(users);
    });

    socket.current.on("getMessage", (data) => {
      console.log("Admin received getMessage:", data); // debug — yeh print ho raha hai?

      const incomingId = String(data.conversationId);
      const activeId   = String(activeRef.current?._id || "");

      console.log("incomingId:", incomingId, "activeId:", activeId, "match:", incomingId === activeId); // debug

      if (incomingId === activeId) {
        // Active conversation mein message seedha show karo
        setMessages((prev) => [
          ...prev,
          { sender: data.senderId, text: data.text, createdAt: Date.now() },
        ]);
      } else {
        // Doosri conversation — unread badge lagao
        setUnread((prev) => ({ ...prev, [incomingId]: (prev[incomingId] || 0) + 1 }));

        // FIX: Agar koi conversation active nahi thi toh incoming wali auto-select karo
        if (!activeRef.current) {
          fetchConvs();
        }
      }

      // Sidebar refresh (throttle karna chahiye production mein)
      fetchConvs();
    });

    fetchConvs();
    return () => socket.current?.disconnect();
  }, [myId, fetchConvs]);

  // ── Messages fetch jab conversation select ho ─
  useEffect(() => {
    if (!activeConv?._id) return;
    const fetchMsgs = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`http://localhost:5000/api/chat/messages/${activeConv._id}`);
        setMessages(data || []);
        // Unread clear karo
        setUnread((prev) => { const n = { ...prev }; delete n[activeConv._id]; return n; });
      } catch (err) {
        console.error("AdminSupport fetchMsgs error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMsgs();
  }, [activeConv]);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Partner helpers ───────────────────────────
  const getPartner     = (conv) => conv?.members?.find((m) => String(m._id || m) !== myId);
  const getPartnerName = (conv) => { const p = getPartner(conv); return p?.name || p?.organization || p?.email || "Exhibitor"; };
  const isOnline       = (conv) => { const p = getPartner(conv); return onlineUsers.some((u) => u.userId === String(p?._id || p || "")); };

  // ── Send ─────────────────────────────────────
  const handleSend = async () => {
    const msg = text.trim();
    if (!msg || !activeConv) return;

    const partner    = getPartner(activeConv);
    const receiverId = String(partner?._id || partner);
    setText("");

    // Optimistic UI
    setMessages((prev) => [...prev, { sender: myId, text: msg, createdAt: Date.now(), _opt: true }]);

    // Socket emit
    console.log("Admin sending:", { conversationId: activeConv._id, senderId: myId, receiverId }); // debug
    socket.current?.emit("sendMessage", {
      conversationId: activeConv._id,
      senderId: myId,
      receiverId,
      text: msg,
    });

    // DB save
    try {
      const { data: saved } = await axios.post("http://localhost:5000/api/chat/message", {
        conversationId: activeConv._id,
        sender: myId,
        text: msg,
      });
      setMessages((prev) => {
        const copy = [...prev];
        const idx  = copy.findLastIndex((m) => m._opt);
        if (idx !== -1) copy[idx] = saved;
        return copy;
      });
      fetchConvs();
    } catch (err) {
      console.error("Message save error:", err);
      setMessages((prev) => prev.filter((m) => !m._opt));
    }
  };

  // ── Render ───────────────────────────────────
  return (
    <div style={{ display:"flex", height:"88vh", background:T.bg, borderRadius:16, border:`1px solid ${T.border}`, margin:16, overflow:"hidden", fontFamily:"Inter,sans-serif" }}>

      {/* ── SIDEBAR ─────────────────────────────── */}
      <div style={{ width:300, borderRight:`1px solid ${T.border}`, background:T.paper, display:"flex", flexDirection:"column", flexShrink:0 }}>

        {/* Sidebar Header */}
        <div style={{ padding:"16px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:10 }}>
          <svg width="18" height="18" fill="none" stroke={T.accent} strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
            <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
          </svg>
          <p style={{ margin:0, color:T.text, fontWeight:800, fontSize:15 }}>Support Inbox</p>
          {conversations.length > 0 && (
            <span style={{ marginLeft:"auto", background:T.accent, color:"#000", borderRadius:20, fontSize:11, fontWeight:700, padding:"2px 8px" }}>
              {conversations.length}
            </span>
          )}
        </div>

        {/* Conversation List */}
        <div style={{ flex:1, overflowY:"auto" }}>
          {conversations.length === 0 ? (
            <p style={{ textAlign:"center", color:T.muted, fontSize:13, marginTop:40 }}>No conversations yet</p>
          ) : conversations.map((conv) => {
            const name    = getPartnerName(conv);
            const partner = getPartner(conv);
            const active  = activeConv?._id === conv._id;
            const online  = isOnline(conv);
            const badge   = unread[conv._id] || 0;

            return (
              <div
                key={conv._id}
                onClick={() => setActiveConv(conv)}
                style={{ padding:"12px 16px", cursor:"pointer", background:active?"rgba(56,189,248,0.08)":"transparent", borderLeft:`3px solid ${active?T.accent:"transparent"}`, display:"flex", alignItems:"center", gap:12, borderBottom:`1px solid ${T.border}` }}
              >
                {/* Avatar */}
                <div style={{ position:"relative", width:40, height:40, borderRadius:"50%", background:getColor(name), display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:16, flexShrink:0 }}>
                  {name.charAt(0).toUpperCase()}
                  {online && <div style={{ position:"absolute", bottom:0, right:0, width:10, height:10, borderRadius:"50%", background:T.online, border:`2px solid ${T.paper}` }} />}
                </div>
                {/* Info */}
                <div style={{ flex:1, overflow:"hidden" }}>
                  <p style={{ margin:0, color:T.text, fontSize:13, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{name}</p>
                  <p style={{ margin:"2px 0 0", color:T.muted, fontSize:11, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{partner?.email || "—"}</p>
                </div>
                {/* Unread Badge */}
                {badge > 0 && (
                  <span style={{ background:T.accent, color:"#000", borderRadius:"50%", width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800 }}>
                    {badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CHAT PANEL ──────────────────────────── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
        {!activeConv ? (
          <div style={{ margin:"auto", textAlign:"center", color:T.muted }}>
            <svg width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" style={{ marginBottom:12 }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p style={{ margin:0, fontSize:14 }}>Select a conversation from the sidebar</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding:"14px 20px", background:T.paper, borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ position:"relative", width:38, height:38, borderRadius:"50%", background:getColor(getPartnerName(activeConv)), display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700 }}>
                {getPartnerName(activeConv).charAt(0).toUpperCase()}
                {isOnline(activeConv) && <div style={{ position:"absolute", bottom:0, right:0, width:10, height:10, borderRadius:"50%", background:T.online, border:`2px solid ${T.paper}` }} />}
              </div>
              <div>
                <p style={{ margin:0, color:T.text, fontWeight:700, fontSize:15 }}>{getPartnerName(activeConv)}</p>
                <p style={{ margin:0, color:isOnline(activeConv)?T.online:T.muted, fontSize:11 }}>
                  {isOnline(activeConv) ? "● Online" : "● Offline"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex:1, overflowY:"auto", padding:20, display:"flex", flexDirection:"column", gap:10 }}>
              {loading ? (
                <p style={{ margin:"auto", color:T.muted, fontSize:13 }}>Loading messages…</p>
              ) : messages.length === 0 ? (
                <p style={{ margin:"auto", color:T.muted, fontSize:13 }}>No messages yet.</p>
              ) : messages.map((m, i) => {
                const isMine = String(m.sender?._id || m.sender) === myId;
                return (
                  <div key={m._id || i} style={{ alignSelf:isMine?"flex-end":"flex-start", maxWidth:"70%" }}>
                    <div style={{ padding:"10px 14px", borderRadius:isMine?"18px 18px 4px 18px":"18px 18px 18px 4px", background:isMine?T.myMsg:T.theirMsg, color:"#fff", fontSize:13.5, lineHeight:1.5, wordBreak:"break-word" }}>
                      {m.text}
                    </div>
                    <div style={{ fontSize:10, color:T.muted, marginTop:3, textAlign:isMine?"right":"left" }}>
                      {fmtTime(m.createdAt)}
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div style={{ padding:"14px 20px", background:T.paper, borderTop:`1px solid ${T.border}`, display:"flex", gap:10 }}>
              <input
                style={{ flex:1, background:T.bg, border:`1px solid ${T.border}`, borderRadius:12, padding:"10px 16px", color:T.text, fontSize:14, outline:"none", fontFamily:"inherit" }}
                placeholder="Reply to exhibitor…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              />
              <button
                onClick={handleSend}
                disabled={!text.trim()}
                style={{ width:42, height:42, borderRadius:12, background:text.trim()?T.accent:T.muted, border:"none", cursor:text.trim()?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center" }}
              >
                <svg width="18" height="18" fill="none" stroke="#000" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}