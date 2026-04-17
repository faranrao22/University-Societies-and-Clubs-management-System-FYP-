const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const path = require("path");

// Routes
const societyRoutes = require("./routes/societyRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const memberShipRoutes = require("./routes/memberShipRoutes");
const electionRoutes = require("./routes/electionRoutes.js");
const eventRoutes = require("./routes/eventRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const notificationRoutes = require("./routes/notificationRoutes.js");
const contactRoutes = require("./routes/contactRoutes.js");
const jwt = require("jsonwebtoken");

// Cron Jobs
require("./cron/electionCron");
require("./cron/eventCron");

dotenv.config();

const app = express();

/* =============================
   CREATE HTTP SERVER
============================= */
const server = http.createServer(app);

/* =============================
   SOCKET.IO SETUP
============================= */
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

// Make io available in controllers
app.set("io", io);

function tokenFromCookieHeader(cookieHeader) {
  if (!cookieHeader || typeof cookieHeader !== "string") return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith("token=")) {
      return decodeURIComponent(trimmed.slice(6).trim());
    }
  }
  return null;
}

io.use((socket, next) => {
  socket.userId = null;
  try {
    const token = tokenFromCookieHeader(socket.handshake.headers.cookie);
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded?.id) socket.userId = String(decoded.id);
  } catch (_) {
    /* optional auth: still allow anonymous sockets (e.g. election rooms) */
  }
  next();
});

/* =============================
   SOCKET EVENTS (ROOM BASED)
============================= */
io.on("connection", (socket) => {
  console.log("🔵 User connected:", socket.id);

  if (socket.userId) {
    socket.join(`user:${socket.userId}`);
  }

  // Join election room
  socket.on("joinElection", (electionId) => {
    if (!electionId) return;
    socket.join(electionId.toString());
    console.log(`🟢 Socket ${socket.id} joined election room ${electionId}`);
  });

  // Leave election room (optional but good practice)
  socket.on("leaveElection", (electionId) => {
    socket.leave(electionId.toString());
    console.log(`🟡 Socket ${socket.id} left election room ${electionId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

/* =============================
   MIDDLEWARE
============================= */
app.use(express.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =============================
   ROUTES
============================= */
app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/societies", societyRoutes);
app.use("/api/memberShip", memberShipRoutes);
app.use("/api/election", electionRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

/* =============================
   DATABASE
============================= */
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("✅ DB Connected"))
  .catch((err) => console.log("❌ DB Connection Error:", err));

/* =============================
   START SERVER
============================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
