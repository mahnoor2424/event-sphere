import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const T = {
  bg: "#05070A", paper: "#0A0D14", accent: "#38bdf8",
  border: "rgba(255,255,255,0.07)", text: "#F8FAFC",
  muted: "#64748B", myMsg: "#0369a1", theirMsg: "#1E293B",
};

const fmtTime = (ts) =>
  ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

export default function ExhibitorSupport({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [convId,   setConvId]   = useState(null);
  const [adminId,  setAdminId]  = useState(null);
  const [text,     setText]     = useState("");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const socket    = useRef(null);
  const scrollRef = useRef(null);
  const convIdRef = useRef(null);

  // currentUser ko localStorage se bhi lo agar prop nahi mila
  const user = currentUser || JSON.parse(localStorage.getItem("user") || "{}");
  const myId = String(user?._id || user?.id || "");

  useEffect(() => { convIdRef.current = convId; }, [convId]);

  // ── Socket setup ─────────────────────────────
  useEffect(() => {
    if (!myId) return;

    socket.current = io("http://localhost:5000");
    socket.current.emit("addUser", myId);

    socket.current.on("getMessage", (data) => {
      console.log("Exhibitor got message:", data); // debug
      if (String(data.conversationId) === String(convIdRef.current)) {
        setMessages((prev) => [
          ...prev,
          { sender: data.senderId, text: data.text, createdAt: Date.now() },
        ]);
      }
    });

    socket.current.on("connect", () => {
      console.log("Exhibitor socket connected:", socket.current.id);
      // Reconnect pe dobara register karo
      socket.current.emit("addUser", myId);
    });

    return () => socket.current?.disconnect();
  }, [myId]);

  // ── Init: admin dhundo → conversation banao → messages lo ─────
  useEffect(() => {
    if (!myId) return;

    const init = async () => {
      setLoading(true);
      setError("");
      try {
        // Step 1: Admin ID lo
        const { data: adminData } = await axios.get("http://localhost:5000/api/auth/get-admin-id");
        const aId = String(adminData._id);

        // FIX: Agar current user khud admin hai toh exhibitor view nahi dikhana
        if (aId === myId) {
          setError("Admin account se exhibitor support nahi dekh sakte.");
          setLoading(false);
          return;
        }

        setAdminId(aId);
        console.log("Admin ID:", aId, "My ID:", myId); // debug

        // Step 2: Conversation banao ya lo
        const { data: conv } = await axios.post("http://localhost:5000/api/chat/conversation", {
          senderId: myId,
          receiverId: aId,
        });
        console.log("Conversation:", conv._id); // debug
        setConvId(conv._id);

        // Step 3: Messages lo
        const { data: msgs } = await axios.get(`http://localhost:5000/api/chat/messages/${conv._id}`);
        setMessages(msgs || []);
      } catch (err) {
        console.error("ExhibitorSupport init error:", err);
        setError("Connection error. Server check karein.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [myId]);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send ─────────────────────────────────────
  const handleSend = async () => {
    const msg = text.trim();
    if (!msg || !adminId) return;

    // FIX: convId check karo pehle
    if (!convId) {
      console.error("convId abhi null hai — ruko");
      return;
    }

    setText("");

    // Optimistic UI
    setMessages((prev) => [...prev, { sender: myId, text: msg, createdAt: Date.now(), _opt: true }]);

    // Socket emit
    console.log("Sending via socket:", { conversationId: convId, senderId: myId, receiverId: adminId }); // debug
    socket.current?.emit("sendMessage", {
      conversationId: convId,
      senderId: myId,
      receiverId: adminId,
      text: msg,
    });

    // DB save
    try {
      const { data: saved } = await axios.post("http://localhost:5000/api/chat/message", {
        conversationId: convId,
        sender: myId,
        text: msg,
      });
      setMessages((prev) => {
        const copy = [...prev];
        const idx  = copy.findLastIndex((m) => m._opt);
        if (idx !== -1) copy[idx] = saved;
        return copy;
      });
    } catch (err) {
      console.error("Message save error:", err);
      setMessages((prev) => prev.filter((m) => !m._opt));
    }
  };

  // ── Render ───────────────────────────────────
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"88vh", background:T.bg, borderRadius:16, border:`1px solid ${T.border}`, margin:16, overflow:"hidden", fontFamily:"Inter,sans-serif" }}>

      {/* Header */}
      <div style={{ padding:"14px 20px", background:T.paper, borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:38, height:38, borderRadius:"50%", background:"#0369a1", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div>
          <p style={{ margin:0, color:T.text, fontWeight:700, fontSize:15 }}>Official Support</p>
          <p style={{ margin:0, color:T.muted, fontSize:11 }}>
            {loading ? "● Connecting..." : convId ? "● Connected" : "● Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:20, display:"flex", flexDirection:"column", gap:10 }}>
        {error ? (
          <p style={{ margin:"auto", color:"#f87171", fontSize:13 }}>{error}</p>
        ) : loading ? (
          <p style={{ margin:"auto", color:T.muted, fontSize:13 }}>Connecting to support…</p>
        ) : messages.length === 0 ? (
          <p style={{ margin:"auto", color:T.muted, fontSize:13 }}>No messages yet. Ask us anything! 👋</p>
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

      {/* Input — FIX: disabled jab loading ya convId null ho */}
      <div style={{ padding:"14px 20px", background:T.paper, borderTop:`1px solid ${T.border}`, display:"flex", gap:10 }}>
        <input
          style={{ flex:1, background:T.bg, border:`1px solid ${T.border}`, borderRadius:12, padding:"10px 16px", color:T.text, fontSize:14, outline:"none", fontFamily:"inherit", opacity:(loading || !convId) ? 0.5 : 1 }}
          placeholder={loading ? "Connecting to support..." : !convId ? "Please wait..." : "Type your message…"}
          value={text}
          disabled={loading || !convId}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || !convId || loading}
          style={{ width:42, height:42, borderRadius:12, background:(text.trim() && convId && !loading) ? T.accent : T.muted, border:"none", cursor:(text.trim() && convId && !loading) ? "pointer" : "not-allowed", display:"flex", alignItems:"center", justifyContent:"center" }}
        >
          <svg width="18" height="18" fill="none" stroke="#000" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}