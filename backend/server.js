const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");

const societyRoutes = require("./routes/societyRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const memberShipRoutes = require("./routes/memberShipRoutes");
const electionRoutes = require("./routes/electionRoutes.js");
const eventRoutes = require("./routes/eventRoutes.js");

require("./cron/electionCron");

dotenv.config();

const app = express();

/* ---------- Middleware ---------- */
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://YOUR-FRONTEND.vercel.app"
    ],
    credentials: true
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cookieParser());

/* ---------- Routes ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/societies", societyRoutes);
app.use("/api/memberShip", memberShipRoutes);
app.use("/api/election", electionRoutes);
app.use("/api/event", eventRoutes);

/* ---------- DB Connection ---------- */
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("✅ DB Connected"))
  .catch((err) => console.log("❌ DB Connection Error:", err));

/* ---------- Export for Vercel ---------- */
module.exports = app;
