require("dotenv").config();
const express    = require("express");
const http       = require("http");
const { Server } = require("socket.io");
const cors       = require("cors");
const { supabase } = require("./middleware/auth");

const app    = express();
const server = http.createServer(app);

// ─── CORS ─────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || "http://localhost:3456",
  "null",          // file:// kaynağı
];
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
  credentials: true,
}));
app.use(express.json());

// ─── REST ROUTES ──────────────────────────────────────────────────
app.use("/api/auth",     require("./routes/auth"));
app.use("/api/jobs",     require("./routes/jobs"));
app.use("/api/matches",  require("./routes/matches"));
app.use("/api/messages", require("./routes/messages"));

app.get("/health", (_, res) => res.json({ ok: true, ts: new Date() }));

// ─── SOCKET.IO ────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
});

// Aktif sokete bağlı userId → socketId haritası
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🔌 Socket bağlandı:", socket.id);

  // Kullanıcı kimlik doğrulama
  socket.on("auth", async ({ token }) => {
    if (!token) return socket.disconnect();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return socket.disconnect();

    socket.userId = data.user.id;
    onlineUsers.set(socket.userId, socket.id);
    socket.emit("auth:ok", { userId: socket.userId });
    console.log("✅ Auth:", socket.userId);
  });

  // Match odasına katıl (mesajlaşma)
  socket.on("join:match", (matchId) => {
    socket.join(`match:${matchId}`);
    console.log(`📬 ${socket.userId} → match:${matchId}`);
  });

  // Mesaj gönder
  socket.on("message:send", async ({ matchId, content }) => {
    if (!socket.userId || !content?.trim()) return;

    // DB'ye kaydet
    const { data: msg, error } = await supabase
      .from("messages")
      .insert({
        match_id:    matchId,
        sender_id:   socket.userId,
        sender_type: "user",
        content:     content.trim(),
      })
      .select()
      .single();

    if (error) {
      socket.emit("message:error", { error: error.message });
      return;
    }

    // Odaya yayınla (göndericiye dahil)
    io.to(`match:${matchId}`).emit("message:new", msg);

    // Karşı taraf çevrimiçiyse anlık bildirim
    const { data: match } = await supabase
      .from("matches")
      .select("company_id, companies(owner_id)")
      .eq("id", matchId)
      .single();

    if (match?.companies?.owner_id) {
      const targetSocketId = onlineUsers.get(match.companies.owner_id);
      if (targetSocketId) {
        io.to(targetSocketId).emit("notification:new", {
          type:  "message",
          title: "Yeni mesaj",
          body:  content.trim().slice(0, 80),
          data:  { match_id: matchId },
        });
      }
    }
  });

  // Yazıyor durumu
  socket.on("typing:start", ({ matchId }) => {
    socket.to(`match:${matchId}`).emit("typing:start", { userId: socket.userId });
  });
  socket.on("typing:stop", ({ matchId }) => {
    socket.to(`match:${matchId}`).emit("typing:stop", { userId: socket.userId });
  });

  // Bağlantı koptu
  socket.on("disconnect", () => {
    if (socket.userId) onlineUsers.delete(socket.userId);
    console.log("❌ Ayrıldı:", socket.id);
  });
});

// ─── START ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`\n🚀 Matchwork Server → http://localhost:${PORT}`);
  console.log(`📡 Socket.io hazır`);
  console.log(`🗄️  Supabase: ${process.env.SUPABASE_URL || "(env yok)"}\n`);
});
