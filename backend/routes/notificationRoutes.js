const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const { listMine, markRead, markAllRead } = require("../controllers/notificationController");

router.post("/mark-all-read", verifyToken, markAllRead);
router.patch("/:id/read", verifyToken, markRead);
router.get("/", verifyToken, listMine);

module.exports = router;
