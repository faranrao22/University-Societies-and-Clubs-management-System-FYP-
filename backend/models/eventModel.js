const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
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
        required: true
    },
    endDateTime: {
        type: Date,
        required: true
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
});

module.exports = mongoose.model("Event", eventSchema);
