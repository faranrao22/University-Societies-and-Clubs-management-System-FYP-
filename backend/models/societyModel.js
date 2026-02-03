const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Role name, e.g., "President"
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Assigned user ID
});

const societySchema = new mongoose.Schema({
  Creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who created this society
  department: { type: String }, // Optional department info
  name: { type: String, required: true },
  shortName: { type: String },
  advisor: { type: String },
  membersCount: { type: Number },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  email: { type: String },
  phone: { type: String },
  description: { type: String },
  joinPolicy: { type: String, enum: ["DEPARTMENT_ONLY", "OPEN"] },
  image: { type: String },
  joinRequests: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
      },
      requestedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  roles: {
    type: [roleSchema],
    validate: {
      validator: function (v) {
        // Ensure there is always a President
        return v.some(role => role.name === "President" && role.user);
      },
      message: "A society must have a President assigned.",
    },
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.models.Society || mongoose.model("Society", societySchema);
