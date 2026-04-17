const mongoose = require("mongoose");

const societyPostSchema = new mongoose.Schema(
  {
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    image: { type: String, default: null },
  },
  { timestamps: true }
);

societyPostSchema.index({ createdAt: -1 });
societyPostSchema.index({ society: 1, createdAt: -1 });

module.exports =
  mongoose.models.SocietyPost || mongoose.model("SocietyPost", societyPostSchema);
