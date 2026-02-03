// models/User.js
let mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  rollNo: {
    type: String, // only for users
  },
  Department: {
    type: String, // users & managers
  },
  semester: {
    type: String, // only for users
  },
  role: {
    type: String,
    enum: ["user", "manager", "admin"],
    default: "user",
  },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
