const express = require("express");
const { submitContactMessage } = require("../controllers/contactMessageController");

const router = express.Router();

router.post("/messages", submitContactMessage);

module.exports = router;
