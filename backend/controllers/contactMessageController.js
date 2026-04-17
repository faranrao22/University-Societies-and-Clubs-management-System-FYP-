const ContactMessage = require("../models/contactMessageModel");

function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

const submitContactMessage = async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const message = String(req.body?.message || "").trim();

    if (!name || name.length < 2) {
      return res.status(400).json({ success: false, message: "Please enter your name." });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }
    if (!message || message.length < 10) {
      return res.status(400).json({ success: false, message: "Message must be at least 10 characters." });
    }

    const doc = await ContactMessage.create({ name, email, message });
    return res.status(201).json({
      success: true,
      message: "Thank you — we have received your message.",
      id: doc._id,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: Object.values(err.errors).map((e) => e.message).join(" ") });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAdminContactMessages = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      ContactMessage.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ContactMessage.countDocuments(),
    ]);
    return res.status(200).json({
      success: true,
      data,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      total,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const adminDeleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ContactMessage.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Message not found" });
    return res.status(200).json({ success: true, message: "Message deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  submitContactMessage,
  getAdminContactMessages,
  adminDeleteContactMessage,
};
