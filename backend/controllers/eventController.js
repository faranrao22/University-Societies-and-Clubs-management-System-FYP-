const eventModel = require("../models/eventModel");
const societyModel = require("../models/societyModel");
const User = require("../models/users");
const { notifyUser } = require("../utils/notifyUser");
const fs = require("fs");
const path = require("path");

// ── Helper: safely parse JSON arrays from FormData ────────────────────────────
const parseArray = (value) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeRole = (value) => String(value || "").trim();
const inRoleSet = (value, roleSet) => roleSet.has(normalizeRole(value).toLowerCase());

// ─── Create Event ─────────────────────────────────────────────────────────────
const createEvent = async (req, res) => {
  try {
    const {
      title, organizer, description, startDateTime, endDateTime,
      venue, isVolunteerOpen, volunteerLimit, volunteerDeadline, category,
    } = req.body;

    const start = new Date(startDateTime);
    const end   = new Date(endDateTime);
    const now   = new Date();

    if (volunteerDeadline) {
      const deadline = new Date(volunteerDeadline);
      if (deadline < now)
        return res.status(400).json({ message: "Volunteer deadline cannot be in the past" });
    }

    const status =
      Math.abs(start.getTime() - now.getTime()) < 60 * 1000 ? "published" : "scheduled";

    const speakers    = parseArray(req.body.speakers);
    const hosts       = parseArray(req.body.hosts);
    const chiefGuests = parseArray(req.body.chiefGuests);
    const volunteerRoles = parseArray(req.body.volunteerRoles)
      .map((r) => String(r || "").trim())
      .filter(Boolean);

    const newEvent = new eventModel({
      title, creator: req.user.id, organizer, description,
      startDateTime: start, endDateTime: end, venue, status,
      image: req.file ? req.file.filename : null,
      isVolunteerOpen: isVolunteerOpen === "true" || isVolunteerOpen === true,
      volunteerLimit: volunteerLimit || 0,
      volunteerDeadline: volunteerDeadline || null,
      volunteerRoles,
      speakers, hosts, chiefGuests, category,
    });

    await newEvent.save();
    res.status(201).json({ success: true, message: "Event created successfully", data: newEvent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Update Event ─────────────────────────────────────────────────────────────
const updateEvent = async (req, res) => {
  try {
    const event = await eventModel.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.creator.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    const {
      title, organizer, description, startDateTime, endDateTime,
      venue, status, isVolunteerOpen, volunteerLimit, volunteerDeadline, category,
    } = req.body;

    const speakers    = parseArray(req.body.speakers);
    const hosts       = parseArray(req.body.hosts);
    const chiefGuests = parseArray(req.body.chiefGuests);
    const volunteerRoles = parseArray(req.body.volunteerRoles)
      .map((r) => String(r || "").trim())
      .filter(Boolean);

    const updates = {
      ...(title         && { title }),
      ...(organizer     && { organizer }),
      ...(description   && { description }),
      ...(startDateTime && { startDateTime: new Date(startDateTime) }),
      ...(endDateTime   && { endDateTime:   new Date(endDateTime) }),
      ...(venue         && { venue }),
      ...(status        && { status }),
      ...(category      && { category }),
      isVolunteerOpen: isVolunteerOpen === "true" || isVolunteerOpen === true,
      volunteerLimit:  volunteerLimit || 0,
      volunteerDeadline: volunteerDeadline || null,
      volunteerRoles,
      speakers, hosts, chiefGuests,
    };

    if (req.file) updates.image = req.file.filename;

    const updated = await eventModel.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.status(200).json({ success: true, message: "Event updated successfully", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Delete Event ─────────────────────────────────────────────────────────────
const deleteEvent = async (req, res) => {
  try {
    const event = await eventModel.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    const isAdmin = req.user.role === "admin";
    if (!isAdmin && event.creator.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized to delete this event" });

    if (event.image) {
      const imagePath = path.join(__dirname, "../uploads", event.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await eventModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get All Events ───────────────────────────────────────────────────────────
const getAllEvents = async (req, res) => {
  try {
    const { search, society, date, status } = req.query;
    let query = {};
    if (search)  query.title     = { $regex: search, $options: "i" };
    if (society) query.organizer = society;
    if (date) {
      const start = new Date(date);
      const end   = new Date(date);
      end.setDate(end.getDate() + 1);
      query.startDateTime = { $gte: start, $lt: end };
    }
    if (status) query.status = status;

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(60, Math.max(1, parseInt(req.query.limit, 10) || 60));
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      eventModel
        .find(query)
        .sort({ startDateTime: 1 })
        .skip(skip)
        .limit(limit)
        .populate("organizer", "name")
        .populate("creator", "fullname"),
      eventModel.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: events,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      total,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get Event By ID ──────────────────────────────────────────────────────────
const getEventbyid = async (req, res) => {
  try {
    const event = await eventModel.findById(req.params.id)
      .populate("organizer", "name").populate("creator", "fullname");
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Apply Volunteer ──────────────────────────────────────────────────────────
const applyVolunteer = async (req, res) => {
  try {
    const { motivation, skills, preferredRole, availability } = req.body;
    const event = await eventModel.findById(req.params.eventId).populate("organizer");
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!event.isVolunteerOpen)
      return res.status(400).json({ message: "Volunteer applications are closed for this event" });

    if (event.volunteerDeadline && new Date() > new Date(event.volunteerDeadline))
      return res.status(400).json({ message: "Volunteer registration deadline has passed" });

    const isMember = event.organizer.members.some((id) => id.toString() === req.user.id);
    if (!isMember)
      return res.status(403).json({ message: "You must be a member of this society to apply as a volunteer" });

    const alreadyApplied = event.volunteers.find((v) => v.user.toString() === req.user.id);
    if (alreadyApplied)
      return res.status(400).json({ message: "You have already applied for this event" });

    let parsedSkills = [];
    if (skills) {
      try { parsedSkills = Array.isArray(skills) ? skills : JSON.parse(skills); }
      catch { parsedSkills = [skills]; }
    }

    const approvedCount = event.volunteers.filter((v) => v.status === "approved").length;
    if (event.volunteerLimit > 0 && approvedCount >= event.volunteerLimit)
      return res.status(400).json({ message: "Volunteer limit already reached" });

    const normalizedPreferredRole = normalizeRole(preferredRole);
    const predefinedRoles = (event.volunteerRoles || [])
      .map(normalizeRole)
      .filter(Boolean);
    const predefinedRoleSet = new Set(predefinedRoles.map((r) => r.toLowerCase()));

    if (predefinedRoles.length > 0) {
      if (!normalizedPreferredRole) {
        return res.status(400).json({ message: "Please select a preferred role" });
      }
      if (!inRoleSet(normalizedPreferredRole, predefinedRoleSet)) {
        return res.status(400).json({ message: "Preferred role must be one of the event's defined roles" });
      }
    }

    event.volunteers.push({
      user: req.user.id, motivation: motivation || "",
      skills: parsedSkills, preferredRole: normalizedPreferredRole,
      availability: availability || "", status: "pending",
    });

    await event.save();

    if (event.creator) {
      const applicant = await User.findById(req.user.id).select("fullname").lean().catch(() => null);
      notifyUser(req, event.creator.toString(), {
        type: "VOLUNTEER_REQUEST_RECEIVED",
        title: "New event volunteer request",
        message: `${applicant?.fullname || "A member"} applied to volunteer for "${event.title}".`,
        meta: { eventId: event._id.toString() },
      }).catch(() => {});
    }

    return res.status(200).json({ success: true, message: "Application submitted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get Volunteer Requests (Creator only) ────────────────────────────────────
const getVolunteerRequests = async (req, res) => {
  try {
    const event = await eventModel
      .findOne({ _id: req.params.eventId, creator: req.user.id })
      .populate("volunteers.user", "fullname email");
    if (!event) return res.status(404).json({ message: "Event not found or unauthorized access" });
    res.json({ success: true, data: event.volunteers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Handle Volunteer Request ─────────────────────────────────────────────────
const handleVolunteerRequest = async (req, res) => {
  try {
    const { eventId, userId, action, role } = req.body;
    const event = await eventModel.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to manage volunteers for this event" });
    }
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const volunteer = event.volunteers.find((v) => v.user.toString() === userId);
    if (!volunteer) return res.status(404).json({ message: "Request not found" });
    if (volunteer.status !== "pending") {
      return res.status(400).json({ message: "Only pending applications can be updated" });
    }

    if (action === "approve") {
      const approvedCount = event.volunteers.filter((v) => v.status === "approved").length;
      if (event.volunteerLimit > 0 && approvedCount >= event.volunteerLimit)
        return res.status(400).json({ message: "Volunteer limit reached" });
      const normalizedRole = normalizeRole(role);
      const predefinedRoles = (event.volunteerRoles || [])
        .map(normalizeRole)
        .filter(Boolean);
      const predefinedRoleSet = new Set(predefinedRoles.map((r) => r.toLowerCase()));

      if (predefinedRoles.length > 0) {
        if (!normalizedRole) {
          return res.status(400).json({ message: "Assigned role is required" });
        }
        if (!inRoleSet(normalizedRole, predefinedRoleSet)) {
          return res.status(400).json({ message: "Assigned role must be one of the event's defined roles" });
        }
      } else if (!normalizedRole) {
        return res.status(400).json({ message: "Please provide a role before approval" });
      }

      volunteer.status     = "approved";
      volunteer.role       = normalizedRole;
      volunteer.approvedAt = new Date();
    } else if (action === "reject") {
      volunteer.status = "rejected";
    }

    await event.save();

    const approved = action === "approve";
    notifyUser(req, userId, {
      type: "VOLUNTEER_STATUS",
      title: approved ? "Volunteer application approved" : "Volunteer application rejected",
      message: `Your volunteer application for "${event.title}" was ${approved ? "approved" : "rejected"}.`,
      meta: { eventId: event._id.toString(), status: volunteer.status },
    }).catch(() => {});

    res.json({ success: true, message: `Volunteer ${action}ed successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Get My Events ────────────────────────────────────────────────────────────
const getMyEvents = async (req, res) => {
  try {
    const events = await eventModel
      .find({ creator: req.user.id }).sort({ startDateTime: 1 })
      .populate("organizer", "name");
    res.status(200).json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Remove Volunteer ─────────────────────────────────────────────────────────
const removeVolunteer = async (req, res) => {
  try {
    const { eventId, userId } = req.body;
    const event = await eventModel.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to manage volunteers for this event" });
    }
    event.volunteers = event.volunteers.filter((v) => v.user.toString() !== userId);
    await event.save();
    res.json({ success: true, message: "Volunteer removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Get My Volunteer Events ──────────────────────────────────────────────────
const getMyVolunteerEvents = async (req, res) => {
  try {
    // ✅ volunteers must be in select
    const events = await eventModel
      .find({ "volunteers.user": req.user.id })
      .populate("organizer", "name logo")
      .select("title venue startDateTime endDateTime image status isVolunteerOpen volunteers")
      .sort({ startDateTime: -1 });

    const transformed = events.map((event) => {
      const vol      = event.volunteers?.find((v) => v.user.toString() === req.user.id.toString());
      const eventObj = event.toObject();
      return {
        _id: eventObj._id, title: eventObj.title, venue: eventObj.venue,
        startDateTime: eventObj.startDateTime, endDateTime: eventObj.endDateTime,
        image: eventObj.image, status: eventObj.status, organizer: eventObj.organizer,
        applicationStatus: vol?.status    || "unknown",
        role:              vol?.role      || "Volunteer",
        appliedAt:         vol?.appliedAt,
        approvedAt:        vol?.approvedAt,
        rejectionReason:   vol?.rejectionReason,
      };
    });

    res.json({ success: true, count: transformed.length, data: transformed });
  } catch (err) {
    console.error("❌ getMyVolunteerEvents error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get Volunteer Status ─────────────────────────────────────────────────────
const getVolunteerStatus = async (req, res) => {
  try {
    const { eventId } = req.params;

    // ── DETAIL MODE ───────────────────────────────────────────────────────────
    if (eventId) {
      const event = await eventModel
        .findById(eventId)
        .populate("organizer", "name description contactEmail")
        .populate("creator",   "fullname email")
        // ✅ Pull profile fields needed for the volunteer ID card
        .populate("volunteers.user", "fullname email department semester profileImage");

      if (!event)
        return res.status(404).json({ success: false, message: "Event not found", mode: "single" });

      const volunteerEntry = event.volunteers?.find(
        (v) =>
          v.user?._id?.toString() === req.user.id.toString() ||
          v.user?.toString()       === req.user.id.toString()
      );

      if (!volunteerEntry)
        return res.status(404).json({
          success: false, message: "No volunteer application found for this event", mode: "single",
        });

      const now            = new Date();
      const eventStart     = new Date(event.startDateTime);
      const isEventOver    = now > eventStart;
      const daysUntilEvent = Math.ceil((eventStart - now) / (1000 * 60 * 60 * 24));

      return res.json({
        success: true, mode: "single",
        data: {
          event: {
            _id: event._id, title: event.title, description: event.description,
            venue: event.venue, startDateTime: event.startDateTime,
            endDateTime: event.endDateTime,
            image: event.image,           // ✅ event banner for card
            organizer: event.organizer,
            isVolunteerOpen: event.isVolunteerOpen,
            volunteerDeadline: event.volunteerDeadline,
          },
          application: {
            status:          volunteerEntry.status,
            role:            volunteerEntry.role            || "Volunteer",
            preferredRole:   volunteerEntry.preferredRole,
            motivation:      volunteerEntry.motivation,
            skills:          volunteerEntry.skills,
            availability:    volunteerEntry.availability,
            appliedAt:       volunteerEntry.appliedAt,
            approvedAt:      volunteerEntry.approvedAt,
            rejectionReason: volunteerEntry.rejectionReason,
            reviewedBy:      volunteerEntry.reviewedBy,
          },
          // ✅ Full user profile for ID card
          user: {
            fullname:     volunteerEntry.user?.fullname,
            email:        volunteerEntry.user?.email,
            department:   volunteerEntry.user?.department,
            semester:     volunteerEntry.user?.semester,
            profileImage: volunteerEntry.user?.profileImage,
          },
          meta: {
            isEventOver,
            daysUntilEvent:  isEventOver ? 0 : Math.max(0, daysUntilEvent),
            canWithdraw:     volunteerEntry.status === "pending" && !isEventOver,
            canDownloadCard: volunteerEntry.status === "approved",
          },
        },
      });
    }

    // ── LIST MODE ─────────────────────────────────────────────────────────────
    // ✅ volunteers in select so applicationStatus is populated
    const events = await eventModel
      .find({ "volunteers.user": req.user.id })
      .populate("organizer", "name logo")
      .select("title venue startDateTime endDateTime image status isVolunteerOpen volunteers")
      .sort({ startDateTime: -1 });

    const applications = events.map((event) => {
      const volunteerEntry = event.volunteers?.find(
        (v) =>
          v.user?.toString()       === req.user.id.toString() ||
          v.user?._id?.toString()  === req.user.id.toString()
      );
      return {
        event: {
          _id: event._id, title: event.title, venue: event.venue,
          startDateTime: event.startDateTime, endDateTime: event.endDateTime,
          image: event.image, status: event.status,
          isVolunteerOpen: event.isVolunteerOpen, organizer: event.organizer,
        },
        application: {
          status:          volunteerEntry?.status          || "unknown",
          role:            volunteerEntry?.role            || "Volunteer",
          preferredRole:   volunteerEntry?.preferredRole,
          appliedAt:       volunteerEntry?.appliedAt,
          approvedAt:      volunteerEntry?.approvedAt,
          rejectionReason: volunteerEntry?.rejectionReason,
          motivation:      volunteerEntry?.motivation,
        },
      };
    });

    return res.json({ success: true, mode: "list", count: applications.length, data: applications });
  } catch (err) {
    console.error("❌ getVolunteerStatus error:", err);
    res.status(500).json({ success: false, message: err.message, mode: req.params.eventId ? "single" : "list" });
  }
};

// ─── Get Approved Volunteers ──────────────────────────────────────────────────
const getApprovedVolunteers = async (req, res) => {
  try {
    const event = await eventModel
      .findById(req.params.eventId)
      .populate("volunteers.user", "fullname email");
    if (!event) return res.status(404).json({ message: "Event not found" });
    const approved = event.volunteers.filter((v) => v.status === "approved");
    res.json({ success: true, data: approved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createEvent, updateEvent, deleteEvent, getAllEvents, getMyEvents,
  getEventbyid, applyVolunteer, getVolunteerRequests, getVolunteerStatus,
  handleVolunteerRequest, removeVolunteer, getMyVolunteerEvents, getApprovedVolunteers,
};