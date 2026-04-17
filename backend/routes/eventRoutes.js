// routes/eventRoutes.js
const express = require("express");
const {
  createEvent, getMyEvents, getEventbyid, getAllEvents,
  applyVolunteer, getVolunteerRequests, updateEvent,
  handleVolunteerRequest, removeVolunteer, getMyVolunteerEvents,
  getApprovedVolunteers, deleteEvent, getVolunteerStatus,
} = require("../controllers/eventController");

const upload      = require("../middleware/uploadMiddleware");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

// ── EVENT CRUD ────────────────────────────────────────────────────────────────
router.post("/create",     verifyToken, upload.single("image"), createEvent);
router.get("/allevents",   getAllEvents);
router.get("/Eventbyid/:id", getEventbyid);
router.get("/myevents",    verifyToken, getMyEvents);
router.delete("/delete/:id", verifyToken, deleteEvent);
router.put("/update/:id",  verifyToken, upload.single("image"), updateEvent);

// ── VOLUNTEER APPLICATIONS (user-facing) ──────────────────────────────────────
router.post("/VolunteerApplication/:eventId", verifyToken, applyVolunteer);

// ✅ List mode  → GET /volunteer/status
// ✅ Detail mode → GET /volunteer/status/:eventId
// No-param route MUST be declared before the param route
router.get("/volunteer/status",          verifyToken, getVolunteerStatus);
router.get("/volunteer/status/:eventId", verifyToken, getVolunteerStatus);

router.get("/volunteer/my-events", verifyToken, getMyVolunteerEvents);

// ── VOLUNTEER MANAGEMENT (organizer-facing) ───────────────────────────────────
router.get("/volunteer/requests/:eventId", verifyToken, getVolunteerRequests);
router.post("/volunteer/handle",           verifyToken, handleVolunteerRequest);
router.get("/volunteer/approved/:eventId", verifyToken, getApprovedVolunteers);
router.delete("/volunteer/remove",         verifyToken, removeVolunteer);

module.exports = router;