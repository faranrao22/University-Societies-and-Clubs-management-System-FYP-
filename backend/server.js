let express = require("express");
let mongoose = require("mongoose");
let cors = require("cors");
let dotenv = require("dotenv");
let societyRoutes = require("./routes/societyRoutes.js")
let authRoutes = require("./routes/authRoutes.js")
let memberShipRoutes = require("./routes/memberShipRoutes")
let electionRoutes = require("./routes/electionRoutes.js")
let eventRoutes = require("./routes/eventRoutes.js")
require("./cron/electionCron");


const cookieParser = require("cookie-parser");
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors(
  {
    origin: "http://localhost:5173",
    credentials: true,
  }
));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// parse cookies
app.use(cookieParser());
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/societies", societyRoutes);
app.use("/api/memberShip", memberShipRoutes);
app.use("/api/election",electionRoutes)
app.use('/api/event',eventRoutes)



// Connect to MongoDB
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log("DB Connection Error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server is running on port " + PORT));
