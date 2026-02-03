const express = require("express");
const { createEvent, getMyEvents, getEventbyid } = require("../controllers/eventController");
const upload = require("../middleware/uploadMiddleware");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();

router.post('/create',verifyToken,upload.single("image"),createEvent)
router.get('/myevents',verifyToken,getMyEvents)
router.get('/Eventbyid/:id',getEventbyid)

module.exports=router