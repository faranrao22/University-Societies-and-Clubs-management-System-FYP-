const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");
const {
  getAdminContactMessages,
  adminDeleteContactMessage,
} = require("../controllers/contactMessageController");
const {
  getDashboardStats,
  getAdminSocietyDetail,
  updateSocietyStatus,
  getSocietyEvents,
  adminDeleteEvent,
  downloadSocietyPdf,
  getAdminEvents,
  getAdminEventById,
  downloadEventPdf,
  getAdminElections,
  getAdminElectionById,
  downloadElectionPdf,
  adminDeleteElection,
  getAdminUserById,
  downloadUserPdf,
  createUserByAdmin,
  getAdminSocietyPosts,
  adminDeleteSocietyPost,
} = require("../controllers/adminController");

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.post("/users", createUserByAdmin);
router.get("/users/:id/pdf", downloadUserPdf);
router.get("/users/:id", getAdminUserById);
router.get("/stats", getDashboardStats);
router.get("/events", getAdminEvents);
router.get("/events/:id/pdf", downloadEventPdf);
router.get("/events/:id", getAdminEventById);
router.get("/elections", getAdminElections);
router.get("/elections/:id/pdf", downloadElectionPdf);
router.get("/elections/:id", getAdminElectionById);
router.delete("/elections/:id", adminDeleteElection);
router.get("/societies/:id", getAdminSocietyDetail);
router.patch("/societies/:id/status", updateSocietyStatus);
router.get("/societies/:id/events", getSocietyEvents);
router.get("/societies/:id/pdf", downloadSocietyPdf);
router.delete("/events/:id", adminDeleteEvent);
router.get("/society-posts", getAdminSocietyPosts);
router.delete("/society-posts/:postId", adminDeleteSocietyPost);
router.get("/contact-messages", getAdminContactMessages);
router.delete("/contact-messages/:id", adminDeleteContactMessage);

module.exports = router;
