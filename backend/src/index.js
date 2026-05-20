// ══════════════════════════════════════════════════════════
// server.js — Sirf Socket.io wala hissa replace karo
// Baaki sab same rahega
// ══════════════════════════════════════════════════════════

var express = require("express");
var cors    = require("cors");
var http    = require("http");
var { Server } = require("socket.io");

require('./routes/cronJobs');
require("./Models/connections");

var app    = express();
var server = http.createServer(app);
var io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"]
  },
});

// ── Middlewares ─────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ══════════════════════════════════════════════════════════
// SOCKET.IO — FIXED VERSION
// Problem tha: receiverId match nahi ho raha tha kyunki
// onlineUsers mein userId string tha lekin receiverId 
// ObjectId ya alag format mein aata tha
// ══════════════════════════════════════════════════════════
let onlineUsers = [];

const getUser = (userId) => {
  // IMPORTANT: dono ko string mein compare karo
  return onlineUsers.find((user) => user.userId === String(userId));
};

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // User register karna
  socket.on("addUser", (userId) => {
    const id = String(userId); // Hamesha string
    // Duplicate connection remove karo
    onlineUsers = onlineUsers.filter((u) => u.userId !== id);
    onlineUsers.push({ userId: id, socketId: socket.id });
    
    console.log("👥 Online Users:", onlineUsers.map(u => u.userId));
    io.emit("getUsers", onlineUsers);
  });

  // ── MESSAGE SEND — YEH SABSE IMPORTANT FIX HAI ──
  socket.on("sendMessage", ({ senderId, receiverId, text, conversationId }) => {
    console.log(`📨 Message from ${senderId} to ${receiverId}, convId: ${conversationId}`);
    
    // String mein convert karke dhoondo
    const receiver = getUser(String(receiverId));
    
    if (receiver) {
      // ✅ FIXED: conversationId ab bhi emit ho raha hai
      // Pehle sirf senderId aur text tha — isliye frontend match nahi kar pa raha tha
      io.to(receiver.socketId).emit("getMessage", {
        senderId: String(senderId),
        receiverId: String(receiverId),
        text,
        conversationId: String(conversationId), // ← YEH LINE ZAROORI HAI
      });
      console.log(`✅ Delivered to ${receiverId} (socket: ${receiver.socketId})`);
    } else {
      console.log(`⚠️  User ${receiverId} offline — message DB mein save hoga`);
    }
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);
    io.emit("getUsers", onlineUsers);
    console.log("❌ Disconnected:", socket.id);
  });
});

// ── Routes ──────────────────────────────────────────────
var authRoutes         = require("./routes/authRoutes");
var notificationRoutes = require("./routes/notificationRoutes");
var meetingRoutes      = require("./routes/meetingRoutes");
var expoRoutes         = require("./routes/expoRoutes");
var scheduleRoutes     = require("./routes/scheduleRoutes");
var analyticsRoutes    = require("./routes/analyticsRoutes");
var eventRoutes        = require("./routes/eventRoutes");
var ChatRoutes         = require("./routes/ChatRoutes");
var auth               = require("./middleware/authMiddleware");

app.use("/api/auth",          authRoutes);
app.use("/api/expo",          expoRoutes);
app.use("/api/meetings",      meetingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/schedule",      scheduleRoutes);
app.use("/api/analytics",     analyticsRoutes);
app.use("/api/events",        eventRoutes);
app.use("/api/chat",          ChatRoutes);

app.get("/", (req, res) => res.send("✅ Server Running with Socket.io"));

// Role routes
app.get("/admin",     auth.authMiddleware, auth.checkRole(["admin"]),                        (req, res) => res.send("Admin Dashboard"));
app.get("/exhibitor", auth.authMiddleware, auth.checkRole(["exhibitor"]),                    (req, res) => res.send("Exhibitor Panel"));
app.get("/attendee",  auth.authMiddleware, auth.checkRole(["admin","exhibitor","attendee"]), (req, res) => res.send("Common Dashboard"));

server.listen(5000, () => console.log("🚀 Server running on port 5000"));