const mongoose = require("mongoose");

const NOTIFICATION_TYPES = [
  "JOIN_REQUEST_RECEIVED",
  "JOIN_REQUEST_UPDATED",
  "ELECTION_APPLICATION_SUBMITTED",
  "ELECTION_APPLICATION_STATUS",
  "VOLUNTEER_REQUEST_RECEIVED",
  "VOLUNTEER_STATUS",
  "ADMIN_NEW_SOCIETY_PENDING",
  "ADMIN_NEW_STUDENT_REGISTERED",
  "SOCIETY_STATUS_BY_ADMIN",
];

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
