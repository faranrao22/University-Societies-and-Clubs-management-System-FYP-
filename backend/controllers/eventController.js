const eventModel = require("../models/eventModel");

const createEvent = async (req, res) => {
  try {
    const { title, organizer, description, startDateTime, endDateTime, venue } = req.body;

    if (!title || !organizer || !description || !startDateTime || !endDateTime || !venue || !req.file) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const now = new Date();

    if (start < now) {
      return res.status(400).json({ message: "Start date/time cannot be in the past" });
    }

    if (end <= start) {
      return res.status(400).json({ message: "End date/time must be after start date/time" });
    }

    // Auto status
    const status = Math.abs(start.getTime() - now.getTime()) < 60 * 1000 ? "published" : "scheduled";

    const newEvent = new eventModel({
      title,
      creator: req.user.id,
      organizer,
      description,
      startDateTime: start,
      endDateTime: end,
      venue,
      status,
      image: req.file.filename,
    });

    await newEvent.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: newEvent,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const getMyEvents = async (req, res) => {
  try {
    // Fetch all events created by the logged-in user, sorted by start date ascending
    const events = await eventModel
      .find({ creator: req.user.id })
      .sort({ startDateTime: 1 }).populate("organizer", "name"); // ascending order

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const getEventbyid = async (req, res) => {
  try {
    const event = await eventModel.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = { createEvent, getMyEvents, getEventbyid };
