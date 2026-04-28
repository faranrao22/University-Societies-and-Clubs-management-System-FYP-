const mongoose = require("mongoose");

const personSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    designation: { type: String, default: "" },
    bio: { type: String, default: "" },
  },
  { _id: false }
);

// ✅ NEW: Volunteer Sub Schema
const volunteerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Admin assigns this AFTER approval
    role: {
      type: String,
      default: null,
    },

    // User selects this while applying
    preferredRole: {
      type: String,
      default: "",
    },

    // Application details
    motivation: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    availability: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    creator: {
      ref: "User",
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    organizer: {
      ref: "Society",
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    description: { type: String, required: true },

    startDateTime: {
      type: Date,
      required: true,
    },

    endDateTime: {
      type: Date,
      required: true,
    },

    venue: { type: String, required: true },

    status: {
      type: String,
      enum: ["scheduled", "published", "postponed", "cancelled", "completed"],
      default: "scheduled",
    },

    image: {
      type: String,
      required: true,
    },
   category: {
  type: String,
  enum: [
    "Technical",
    "Workshop",
    "Seminar",
    "Sports",
    "Cultural",
    "Competition",
    "Hackathon",
    "Social",
    "Career",
    "Other"
  ],
  required: true,
},

    // ── People ──────────────────────────────────────────────
    chiefGuests: {
      type: [personSchema],
      default: [],
    },

    speakers: {
      type: [personSchema],
      default: [],
    },

    hosts: {
      type: [personSchema],
      default: [],
    },

    // ── Volunteer Settings ───────────────────────────────────
    isVolunteerOpen: {
      type: Boolean,
      default: false,
    },

    volunteerDeadline: {
      type: Date,
      default: null,
    },

    volunteerLimit: {
      type: Number,
      default: 0,
    },
    volunteerRoles: {
      type: [String],
      default: [],
    },

    // ✅ UPDATED volunteers array
    volunteers: {
      type: [volunteerSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", eventSchema);