const Notification = require("../models/notificationModel");
const User = require("../models/users");

/**
 * Persist a notification and push it in real time to the recipient's Socket.IO room (`user:<id>`).
 */
async function notifyUser(req, recipientId, { type, title, message, meta }) {
  if (!recipientId) return null;
  const rid = recipientId.toString();

  const doc = await Notification.create({
    recipient: rid,
    type,
    title,
    message: String(message || "").slice(0, 2000),
    meta: meta && typeof meta === "object" ? meta : {},
    read: false,
  });

  const io = req?.app?.get("io");
  if (io) {
    const plain = doc.toObject();
    io.to(`user:${rid}`).emit("notification:new", { notification: plain });
  }

  return doc;
}

/** One persisted notification per admin (each gets their own read state). */
async function notifyAllAdmins(req, payload) {
  const admins = await User.find({ role: "admin" }).select("_id").lean();
  await Promise.all(admins.map((a) => notifyUser(req, a._id, payload)));
}

module.exports = { notifyUser, notifyAllAdmins };
