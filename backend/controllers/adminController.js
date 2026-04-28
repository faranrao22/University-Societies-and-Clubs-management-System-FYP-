const PDFDocument = require("pdfkit");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const User = require("../models/users");
const SocietyModel = require("../models/societyModel");
const { notifyUser } = require("../utils/notifyUser");
const eventModel = require("../models/eventModel");
const Election = require("../models/Election");
const SocietyPost = require("../models/societyPostModel");

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      managers,
      admins,
      students,
      societies,
      activeSocieties,
      events,
      elections,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "manager" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "user" }),
      SocietyModel.countDocuments(),
      SocietyModel.countDocuments({ status: "Active" }),
      eventModel.countDocuments(),
      Election.countDocuments(),
    ]);

    const pendingAgg = await SocietyModel.aggregate([
      { $unwind: "$joinRequests" },
      { $match: { "joinRequests.status": "Pending" } },
      { $count: "count" },
    ]);
    const pendingJoinRequests = pendingAgg[0]?.count || 0;

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        managers,
        admins,
        students,
        societies,
        activeSocieties,
        inactiveSocieties: societies - activeSocieties,
        events,
        elections,
        pendingJoinRequests,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAdminSocietyDetail = async (req, res) => {
  try {
    const society = await SocietyModel.findById(req.params.id)
      .populate("Creator", "fullname email Department role")
      .populate("members", "fullname email Department rollNo semester session role")
      .populate("roles.user", "fullname email Department")
      .populate("joinRequests.user", "fullname email Department");

    if (!society) {
      return res.status(404).json({ success: false, message: "Society not found" });
    }

    return res.status(200).json({ success: true, data: society });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateSocietyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be Active or Inactive" });
    }

    const society = await SocietyModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("Creator", "fullname email");

    if (!society) {
      return res.status(404).json({ success: false, message: "Society not found" });
    }

    const creatorId = society.Creator?._id?.toString?.() || society.Creator?.toString?.();
    if (creatorId) {
      notifyUser(req, creatorId, {
        type: "SOCIETY_STATUS_BY_ADMIN",
        title: `Society is now ${status}`,
        message: `"${society.name}" was set to ${status} by an administrator.`,
        meta: { societyId: society._id.toString(), status },
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      message: "Society status updated",
      data: society,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getSocietyEvents = async (req, res) => {
  try {
    const events = await eventModel
      .find({ organizer: req.params.id })
      .populate("creator", "fullname email")
      .sort({ startDateTime: -1 });

    return res.status(200).json({ success: true, data: events });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const adminDeleteEvent = async (req, res) => {
  try {
    const event = await eventModel.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    if (event.image) {
      const imagePath = path.join(__dirname, "../uploads", event.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await eventModel.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Event deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const writePdfSection = (doc, title, lines) => {
  doc.fontSize(12).font("Helvetica-Bold").text(title, { underline: true });
  doc.moveDown(0.3);
  doc.font("Helvetica").fontSize(10);
  lines.forEach((line) => {
    doc.text(line || "—", { width: 500 });
    doc.moveDown(0.2);
  });
  doc.moveDown(0.6);
};

const downloadSocietyPdf = async (req, res) => {
  try {
    const society = await SocietyModel.findById(req.params.id)
      .populate("Creator", "fullname email Department role rollNo semester session")
      .populate("members", "fullname email Department rollNo semester session role")
      .populate("roles.user", "fullname email Department")
      .populate("joinRequests.user", "fullname email Department");

    if (!society) {
      return res.status(404).json({ success: false, message: "Society not found" });
    }

    const safeName = (society.name || "society").replace(/[^\w\s-]/g, "").slice(0, 80);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}-report.pdf"`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(18).font("Helvetica-Bold").text("Society report", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(society.name || "", { align: "center" });
    doc.moveDown(1.5);

    const president = society.roles?.find((r) => r.name === "President");
    const otherRoles = (society.roles || []).filter((r) => r.name !== "President");

    writePdfSection(doc, "General", [
      `Short name: ${society.shortName || "—"}`,
      `Status: ${society.status || "—"}`,
      `Department: ${society.department || "—"}`,
      `Advisor: ${society.advisor || "—"}`,
      `Email: ${society.email || "—"}`,
      `Phone: ${society.phone || "—"}`,
      `Join policy: ${society.joinPolicy || "—"}`,
      `Members count (recorded): ${society.membersCount ?? "—"}`,
      `Description: ${society.description || "—"}`,
    ]);

    const creator = society.Creator;
    writePdfSection(doc, "Creator / primary contact", [
      creator
        ? `Name: ${creator.fullname} | Email: ${creator.email} | Dept: ${creator.Department || "—"} | Role: ${creator.role}`
        : "—",
    ]);

    writePdfSection(doc, "President", [
      president?.user
        ? `Name: ${president.user.fullname} | Email: ${president.user.email || "—"} | Dept: ${president.user.Department || "—"}`
        : "Not assigned",
    ]);

    if (otherRoles.length) {
      doc.fontSize(12).font("Helvetica-Bold").text("Other role holders", { underline: true });
      doc.moveDown(0.3);
      doc.font("Helvetica").fontSize(10);
      otherRoles.forEach((r) => {
        const u = r.user;
        doc.text(
          `${r.name}: ${u ? `${u.fullname} (${u.email || ""})` : "Vacant"}`,
          { width: 500 }
        );
        doc.moveDown(0.2);
      });
      doc.moveDown(0.6);
    }

    doc.fontSize(12).font("Helvetica-Bold").text("Members (full list)", { underline: true });
    doc.moveDown(0.4);
    doc.font("Helvetica").fontSize(9);
    const members = society.members || [];
    if (!members.length) {
      doc.text("No members recorded.");
    } else {
      members.forEach((m, i) => {
        doc.text(
          `${i + 1}. ${m.fullname} | ${m.email} | Dept: ${m.Department || "—"} | Roll: ${m.rollNo || "—"} | Semester: ${m.semester || "—"} | Session: ${m.session || "—"} | App role: ${m.role || "—"}`,
          { width: 500 }
        );
        doc.moveDown(0.25);
      });
    }

    doc.addPage();
    doc.fontSize(12).font("Helvetica-Bold").text("Join requests (summary)", { underline: true });
    doc.moveDown(0.4);
    doc.font("Helvetica").fontSize(9);
    const jr = society.joinRequests || [];
    if (!jr.length) {
      doc.text("No join requests.");
    } else {
      jr.forEach((reqRow, i) => {
        const u = reqRow.user;
        doc.text(
          `${i + 1}. User: ${u ? u.fullname : "—"} | Status: ${reqRow.status} | Reason: ${reqRow.reason || "—"} | Skills: ${reqRow.skills || "—"} | Experience: ${reqRow.experience || "—"}`,
          { width: 500 }
        );
        doc.moveDown(0.3);
      });
    }

    doc.end();
  } catch (err) {
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};

const fmtWhen = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return "—";
  }
};

const getAdminEvents = async (req, res) => {
  try {
    const events = await eventModel
      .find()
      .sort({ startDateTime: -1 })
      .populate("organizer", "name shortName status")
      .populate("creator", "fullname email");

    return res.status(200).json({ success: true, data: events });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAdminEventById = async (req, res) => {
  try {
    const event = await eventModel
      .findById(req.params.id)
      .populate(
        "organizer",
        "name shortName email phone description status department advisor joinPolicy"
      )
      .populate("creator", "fullname email Department rollNo semester session role")
      .populate("volunteers.user", "fullname email Department rollNo semester session role");

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    return res.status(200).json({ success: true, data: event });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const pdfPeopleBlock = (doc, label, people) => {
  doc.fontSize(11).font("Helvetica-Bold").text(label, { underline: true });
  doc.moveDown(0.25);
  doc.font("Helvetica").fontSize(9);
  if (!people || !people.length) {
    doc.text("None listed.");
  } else {
    people.forEach((p, i) => {
      doc.text(
        `${i + 1}. ${p.name || "—"} | ${p.designation || "—"} | ${p.bio || ""}`.trim(),
        { width: 500 }
      );
      doc.moveDown(0.2);
    });
  }
  doc.moveDown(0.5);
};

const downloadEventPdf = async (req, res) => {
  try {
    const event = await eventModel
      .findById(req.params.id)
      .populate(
        "organizer",
        "name shortName email phone description status department advisor"
      )
      .populate("creator", "fullname email Department rollNo semester session role")
      .populate("volunteers.user", "fullname email Department rollNo semester session role");

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const org = event.organizer;
    const creator = event.creator;
    const safeTitle = (event.title || "event").replace(/[^\w\s-]/g, "").slice(0, 72);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}-details.pdf"`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(18).font("Helvetica-Bold").text("Event report", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(14).text(event.title || "", { align: "center" });
    doc.moveDown(1.2);

    doc.fontSize(11).font("Helvetica-Bold").text("Summary", { underline: true });
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(10);
    [
      `Category: ${event.category || "—"}`,
      `Status: ${event.status || "—"}`,
      `Venue: ${event.venue || "—"}`,
      `Starts: ${fmtWhen(event.startDateTime)}`,
      `Ends: ${fmtWhen(event.endDateTime)}`,
      `Created: ${fmtWhen(event.createdAt)}`,
      `Last updated: ${fmtWhen(event.updatedAt)}`,
      `Flyer / image file: ${event.image || "—"}`,
    ].forEach((line) => {
      doc.text(line, { width: 500 });
      doc.moveDown(0.15);
    });
    doc.moveDown(0.6);

    doc.fontSize(11).font("Helvetica-Bold").text("Description", { underline: true });
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(10).text(event.description || "—", { width: 500 });
    doc.moveDown(0.8);

    doc.fontSize(11).font("Helvetica-Bold").text("Organizing society", { underline: true });
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(10);
    if (org) {
      [
        `Name: ${org.name || "—"}`,
        `Short name: ${org.shortName || "—"}`,
        `Status: ${org.status || "—"}`,
        `Department: ${org.department || "—"}`,
        `Advisor: ${org.advisor || "—"}`,
        `Email: ${org.email || "—"}`,
        `Phone: ${org.phone || "—"}`,
        `Description: ${org.description || "—"}`,
      ].forEach((line) => {
        doc.text(line, { width: 500 });
        doc.moveDown(0.15);
      });
    } else {
      doc.text("—");
    }
    doc.moveDown(0.6);

    doc.fontSize(11).font("Helvetica-Bold").text("Event creator (account)", { underline: true });
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(10);
    if (creator) {
      doc.text(
        `${creator.fullname} | ${creator.email} | Dept: ${creator.Department || "—"} | Role: ${creator.role || "—"} | Roll: ${creator.rollNo || "—"} | Semester: ${creator.semester || "—"} | Session: ${creator.session || "—"}`,
        { width: 500 }
      );
    } else {
      doc.text("—");
    }
    doc.moveDown(0.8);

    doc.fontSize(11).font("Helvetica-Bold").text("Volunteer programme", { underline: true });
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(10);
    [
      `Open for applications: ${event.isVolunteerOpen ? "Yes" : "No"}`,
      `Volunteer limit: ${event.volunteerLimit ?? 0}`,
      `Deadline: ${fmtWhen(event.volunteerDeadline)}`,
    ].forEach((line) => {
      doc.text(line, { width: 500 });
      doc.moveDown(0.15);
    });
    doc.moveDown(0.4);

    pdfPeopleBlock(doc, "Chief guests", event.chiefGuests);
    pdfPeopleBlock(doc, "Speakers", event.speakers);
    pdfPeopleBlock(doc, "Hosts", event.hosts);

    doc.addPage();
    doc.fontSize(12).font("Helvetica-Bold").text("Volunteer applications", { underline: true });
    doc.moveDown(0.4);
    doc.font("Helvetica").fontSize(9);
    const vols = event.volunteers || [];
    if (!vols.length) {
      doc.text("No volunteer applications.");
    } else {
      vols.forEach((v, i) => {
        const u = v.user;
        doc.text(
          `${i + 1}. Status: ${v.status} | Applied: ${fmtWhen(v.appliedAt)}`,
          { width: 500 }
        );
        doc.moveDown(0.15);
        if (u) {
          doc.text(
            `   Applicant: ${u.fullname} | ${u.email} | Dept: ${u.Department || "—"} | Roll: ${u.rollNo || "—"}`,
            { width: 500 }
          );
        }
        doc.moveDown(0.1);
        doc.text(`   Preferred role: ${v.preferredRole || "—"} | Assigned role: ${v.role || "—"}`, {
          width: 500,
        });
        doc.moveDown(0.1);
        doc.text(`   Motivation: ${v.motivation || "—"}`, { width: 500 });
        doc.moveDown(0.1);
        doc.text(
          `   Skills: ${Array.isArray(v.skills) ? v.skills.join(", ") : v.skills || "—"}`,
          { width: 500 }
        );
        doc.moveDown(0.1);
        doc.text(`   Availability: ${v.availability || "—"}`, { width: 500 });
        doc.moveDown(0.35);
      });
    }

    doc.end();
  } catch (err) {
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};

const getAdminElections = async (req, res) => {
  try {
    const elections = await Election.find()
      .populate("societyId", "name shortName status")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: elections });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAdminElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id)
      .populate("societyId", "name shortName status email phone department description advisor")
      .populate("candidates.user", "fullname email Department rollNo semester session role")
      .populate("votes.voter", "fullname email Department rollNo")
      .populate("votes.candidate", "fullname email Department")
      .populate("winners.user", "fullname email Department");

    if (!election) {
      return res.status(404).json({ success: false, message: "Election not found" });
    }

    return res.status(200).json({ success: true, data: election });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const adminDeleteElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ success: false, message: "Election not found" });
    }

    const uploadsDir = path.join(__dirname, "../uploads");
    for (const c of election.candidates || []) {
      if (c.image) {
        const p = path.join(uploadsDir, c.image);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
    }

    await Election.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Election deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const downloadElectionPdf = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id)
      .populate("societyId", "name shortName status email phone department description")
      .populate("candidates.user", "fullname email Department rollNo semester session role")
      .populate("votes.voter", "fullname email Department rollNo")
      .populate("votes.candidate", "fullname email Department")
      .populate("winners.user", "fullname email Department");

    if (!election) {
      return res.status(404).json({ success: false, message: "Election not found" });
    }

    const soc = election.societyId;
    const safeTitle = (election.title || "election").replace(/[^\w\s-]/g, "").slice(0, 72);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}-election-report.pdf"`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(18).font("Helvetica-Bold").text("Election report", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(14).text(election.title || "", { align: "center" });
    doc.moveDown(1);

    doc.fontSize(11).font("Helvetica-Bold").text("Summary", { underline: true });
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(10);
    [
      `Status: ${election.status || "—"}`,
      `Roles contested: ${(election.roles || []).join(", ") || "—"}`,
      `Application eligibility: ${election.applicationEligibility || "—"}`,
      `Voting eligibility: ${election.votingEligibility || "—"}`,
      `Roles assigned flag: ${election.rolesAssigned === true ? "Yes" : election.rolesAssigned === false ? "No" : "—"}`,
      `Apply deadline: ${fmtWhen(election.applyDeadline)}`,
      `Voting start: ${fmtWhen(election.startDate)}`,
      `Voting end: ${fmtWhen(election.endDate)}`,
      `Created: ${fmtWhen(election.createdAt)}`,
      `Updated: ${fmtWhen(election.updatedAt)}`,
    ].forEach((line) => {
      doc.text(line, { width: 500 });
      doc.moveDown(0.12);
    });
    doc.moveDown(0.5);

    doc.fontSize(11).font("Helvetica-Bold").text("Society", { underline: true });
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(10);
    if (soc) {
      [
        `Name: ${soc.name || "—"}`,
        `Short name: ${soc.shortName || "—"}`,
        `Status: ${soc.status || "—"}`,
        `Department: ${soc.department || "—"}`,
        `Email: ${soc.email || "—"}`,
        `Phone: ${soc.phone || "—"}`,
        `Description: ${soc.description || "—"}`,
      ].forEach((line) => {
        doc.text(line, { width: 500 });
        doc.moveDown(0.12);
      });
    } else {
      doc.text("—");
    }
    doc.moveDown(0.6);

    doc.fontSize(12).font("Helvetica-Bold").text("Candidates", { underline: true });
    doc.moveDown(0.35);
    doc.font("Helvetica").fontSize(9);
    const cands = election.candidates || [];
    if (!cands.length) {
      doc.text("No candidates.");
    } else {
      cands.forEach((c, i) => {
        const u = c.user;
        doc.text(
          `${i + 1}. Role: ${c.role} | Status: ${c.status} | CNIC: ${c.cnic || "—"} | Image file: ${c.image || "—"}`,
          { width: 500 }
        );
        doc.moveDown(0.1);
        if (u) {
          doc.text(
            `   User: ${u.fullname} | ${u.email} | Dept: ${u.Department || "—"} | Roll: ${u.rollNo || "—"} | Sem: ${u.semester || "—"} | Session: ${u.session || "—"}`,
            { width: 500 }
          );
        }
        doc.moveDown(0.1);
        doc.text(`   Reason / notes: ${c.reason || "—"}`, { width: 500 });
        doc.moveDown(0.28);
      });
    }
    doc.moveDown(0.4);

    doc.fontSize(12).font("Helvetica-Bold").text("Cast votes", { underline: true });
    doc.moveDown(0.35);
    doc.font("Helvetica").fontSize(8);
    const votes = election.votes || [];
    if (!votes.length) {
      doc.text("No votes recorded.");
    } else {
      votes.forEach((v, i) => {
        const voter = v.voter;
        const cand = v.candidate;
        doc.text(
          `${i + 1}. Role: ${v.role} | Voter: ${voter ? `${voter.fullname} (${voter.email})` : "—"} | Candidate: ${cand ? `${cand.fullname} (${cand.email})` : "—"}`,
          { width: 500 }
        );
        doc.moveDown(0.22);
      });
    }
    doc.moveDown(0.4);

    doc.fontSize(12).font("Helvetica-Bold").text("Winners", { underline: true });
    doc.moveDown(0.35);
    doc.font("Helvetica").fontSize(10);
    const wins = election.winners || [];
    if (!wins.length) {
      doc.text("None recorded.");
    } else {
      wins.forEach((w, i) => {
        const u = w.user;
        doc.text(
          `${i + 1}. Role: ${w.role} | ${u ? `${u.fullname} (${u.email})` : "—"}`,
          { width: 500 }
        );
        doc.moveDown(0.2);
      });
    }

    doc.end();
  } catch (err) {
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};

const sameId = (a, b) => {
  if (!a || !b) return false;
  const idA = (a._id ?? a).toString();
  const idB = (b._id ?? b).toString();
  return idA === idB;
};

async function buildAdminUserReport(userId) {
  const user = await User.findById(userId).select("-password").lean();
  if (!user) return null;

  const [
    memberSocieties,
    createdSocieties,
    roleSocieties,
    joinRequestSocieties,
    eventsCreated,
    volunteerEvents,
    electionsCandidate,
    electionsVoter,
    electionsWon,
  ] = await Promise.all([
    SocietyModel.find({ members: userId })
      .select(
        "name shortName status department email phone description joinPolicy membersCount createdAt Creator"
      )
      .populate("Creator", "fullname email")
      .lean(),
    SocietyModel.find({ Creator: userId })
      .select("name shortName status department email phone description joinPolicy createdAt")
      .lean(),
    SocietyModel.find({ "roles.user": userId })
      .select("name shortName status roles")
      .lean(),
    SocietyModel.find({ "joinRequests.user": userId })
      .select("name shortName status joinRequests")
      .lean(),
    eventModel
      .find({ creator: userId })
      .select("title status category venue startDateTime endDateTime createdAt")
      .populate("organizer", "name shortName")
      .lean(),
    eventModel
      .find({ "volunteers.user": userId })
      .select("title status venue startDateTime endDateTime organizer volunteers")
      .populate("organizer", "name shortName")
      .lean(),
    Election.find({ "candidates.user": userId })
      .select("title status societyId roles applyDeadline startDate endDate candidates createdAt")
      .populate("societyId", "name shortName")
      .populate("candidates.user", "fullname email Department rollNo semester session")
      .lean(),
    Election.find({ "votes.voter": userId })
      .select("title status societyId votes createdAt")
      .populate("societyId", "name shortName")
      .populate("votes.voter", "fullname email")
      .populate("votes.candidate", "fullname email")
      .lean(),
    Election.find({ "winners.user": userId })
      .select("title status societyId winners createdAt")
      .populate("societyId", "name shortName")
      .populate("winners.user", "fullname email Department")
      .lean(),
  ]);

  const societyRoles = [];
  for (const s of roleSocieties) {
    for (const r of s.roles || []) {
      if (sameId(r.user, userId)) {
        societyRoles.push({
          society: {
            _id: s._id,
            name: s.name,
            shortName: s.shortName,
            status: s.status,
          },
          roleName: r.name,
        });
      }
    }
  }

  const joinRequestHistory = [];
  for (const s of joinRequestSocieties) {
    for (const jr of s.joinRequests || []) {
      if (sameId(jr.user, userId)) {
        joinRequestHistory.push({
          society: {
            _id: s._id,
            name: s.name,
            shortName: s.shortName,
            status: s.status,
          },
          requestStatus: jr.status,
          reason: jr.reason,
          skills: jr.skills,
          experience: jr.experience,
          portfolioLink: jr.portfolioLink,
          requestedAt: jr.requestedAt,
        });
      }
    }
  }

  const volunteerParticipation = volunteerEvents.map((ev) => {
    const v = (ev.volunteers || []).find((x) => sameId(x.user, userId));
    return {
      event: {
        _id: ev._id,
        title: ev.title,
        status: ev.status,
        venue: ev.venue,
        startDateTime: ev.startDateTime,
        endDateTime: ev.endDateTime,
      },
      organizer: ev.organizer,
      application: v
        ? {
            status: v.status,
            preferredRole: v.preferredRole,
            role: v.role,
            motivation: v.motivation,
            skills: v.skills,
            availability: v.availability,
            appliedAt: v.appliedAt,
          }
        : null,
    };
  });

  const electionApplications = electionsCandidate.map((e) => ({
    election: {
      _id: e._id,
      title: e.title,
      status: e.status,
      societyId: e.societyId,
      roles: e.roles,
      applyDeadline: e.applyDeadline,
      startDate: e.startDate,
      endDate: e.endDate,
      createdAt: e.createdAt,
    },
    candidacies: (e.candidates || []).filter((c) => sameId(c.user, userId)),
  }));

  const votesCast = electionsVoter.map((e) => ({
    election: {
      _id: e._id,
      title: e.title,
      status: e.status,
      societyId: e.societyId,
      createdAt: e.createdAt,
    },
    votes: (e.votes || []).filter((v) => sameId(v.voter, userId)),
  }));

  const electionWins = electionsWon.map((e) => ({
    election: {
      _id: e._id,
      title: e.title,
      status: e.status,
      societyId: e.societyId,
      createdAt: e.createdAt,
    },
    wins: (e.winners || []).filter((w) => sameId(w.user, userId)),
  }));

  return {
    profile: user,
    societiesMemberOf: memberSocieties,
    societiesCreated: createdSocieties,
    societyRoles,
    joinRequestHistory,
    eventsCreated,
    volunteerParticipation,
    electionApplications,
    votesCast,
    electionWins,
  };
}

const getAdminUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const data = await buildAdminUserReport(id);
    if (!data) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const downloadUserPdf = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const report = await buildAdminUserReport(id);
    if (!report) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const u = report.profile;
    const safeName = (u.fullname || "user").replace(/[^\w\s-]/g, "").slice(0, 60);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}-profile-report.pdf"`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(18).font("Helvetica-Bold").text("User profile report", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(13).text(u.fullname || "", { align: "center" });
    doc.moveDown(1);

    doc.fontSize(11).font("Helvetica-Bold").text("Account", { underline: true });
    doc.moveDown(0.25);
    doc.font("Helvetica").fontSize(9);
    [
      `Email: ${u.email || "—"}`,
      `Role: ${u.role || "—"}`,
      `Department: ${u.Department || "—"}`,
      `Roll no.: ${u.rollNo || "—"}`,
      `Semester: ${u.semester || "—"}`,
      `Session: ${u.session || "—"}`,
      `Graduated: ${u.isGraduated ? "Yes" : "No"}`,
      `Profile image file: ${u.profileImage || "—"}`,
      `Student card (front): ${u.studentCardFront || "—"}`,
      `Student card (back): ${u.studentCardBack || "—"}`,
      `Account created: ${fmtWhen(u.createdAt)}`,
      `Last updated: ${fmtWhen(u.updatedAt)}`,
    ].forEach((line) => {
      doc.text(line, { width: 500 });
      doc.moveDown(0.12);
    });
    doc.moveDown(0.5);

    doc.fontSize(12).font("Helvetica-Bold").text("Societies — member", { underline: true });
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(9);
    if (!report.societiesMemberOf.length) doc.text("None.");
    else {
      report.societiesMemberOf.forEach((s, i) => {
        doc.text(
          `${i + 1}. ${s.name} (${s.shortName || "—"}) | Status: ${s.status} | Dept: ${s.department || "—"} | Creator: ${s.Creator?.fullname || "—"}`,
          { width: 500 }
        );
        doc.moveDown(0.18);
      });
    }
    doc.moveDown(0.4);

    doc.fontSize(12).font("Helvetica-Bold").text("Societies — created (manager)", { underline: true });
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(9);
    if (!report.societiesCreated.length) doc.text("None.");
    else {
      report.societiesCreated.forEach((s, i) => {
        doc.text(`${i + 1}. ${s.name} | ${s.status} | ${s.department || "—"}`, { width: 500 });
        doc.moveDown(0.18);
      });
    }
    doc.moveDown(0.4);

    doc.fontSize(12).font("Helvetica-Bold").text("Society role assignments", { underline: true });
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(9);
    if (!report.societyRoles.length) doc.text("None.");
    else {
      report.societyRoles.forEach((row, i) => {
        doc.text(`${i + 1}. ${row.society.name} — ${row.roleName}`, { width: 500 });
        doc.moveDown(0.15);
      });
    }
    doc.moveDown(0.4);

    doc.fontSize(12).font("Helvetica-Bold").text("Society join requests (by this user)", { underline: true });
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(9);
    if (!report.joinRequestHistory.length) doc.text("None.");
    else {
      report.joinRequestHistory.forEach((row, i) => {
        doc.text(
          `${i + 1}. ${row.society.name} | Request: ${row.requestStatus} | ${fmtWhen(row.requestedAt)}`,
          { width: 500 }
        );
        doc.moveDown(0.1);
        doc.text(`   Reason: ${row.reason || "—"} | Skills: ${row.skills || "—"} | Exp: ${row.experience || "—"}`, {
          width: 500,
        });
        doc.moveDown(0.2);
      });
    }
    doc.moveDown(0.4);

    doc.fontSize(12).font("Helvetica-Bold").text("Events created", { underline: true });
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(9);
    if (!report.eventsCreated.length) doc.text("None.");
    else {
      report.eventsCreated.forEach((ev, i) => {
        doc.text(
          `${i + 1}. ${ev.title} | ${ev.status} | Society: ${ev.organizer?.name || "—"} | ${fmtWhen(ev.startDateTime)}`,
          { width: 500 }
        );
        doc.moveDown(0.15);
      });
    }
    doc.moveDown(0.4);

    doc.fontSize(12).font("Helvetica-Bold").text("Event volunteer participation", { underline: true });
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(9);
    if (!report.volunteerParticipation.length) doc.text("None.");
    else {
      report.volunteerParticipation.forEach((row, i) => {
        const a = row.application;
        doc.text(
          `${i + 1}. ${row.event.title} | App status: ${a?.status || "—"} | Event: ${row.event.status} | ${fmtWhen(row.event.startDateTime)}`,
          { width: 500 }
        );
        if (a) {
          doc.moveDown(0.08);
          doc.text(
            `   Motivation: ${a.motivation || "—"} | Skills: ${Array.isArray(a.skills) ? a.skills.join(", ") : a.skills || "—"}`,
            { width: 500 }
          );
        }
        doc.moveDown(0.18);
      });
    }
    doc.moveDown(0.4);

    doc.addPage();
    doc.fontSize(12).font("Helvetica-Bold").text("Election candidacies", { underline: true });
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(9);
    let ec = 0;
    for (const block of report.electionApplications) {
      for (const c of block.candidacies) {
        ec += 1;
        const candUser = c.user;
        doc.text(
          `${ec}. ${block.election.title} | Society: ${block.election.societyId?.name || "—"} | Role: ${c.role} | Candidate status: ${c.status}`,
          { width: 500 }
        );
        doc.moveDown(0.08);
        doc.text(`   CNIC: ${c.cnic || "—"} | Reason: ${c.reason || "—"} | Image: ${c.image || "—"}`, { width: 500 });
        if (candUser && typeof candUser === "object") {
          doc.moveDown(0.06);
          doc.text(
            `   User record: ${candUser.fullname} | ${candUser.email} | Dept: ${candUser.Department || "—"}`,
            { width: 500 }
          );
        }
        doc.moveDown(0.2);
      }
    }
    if (!ec) doc.text("None.");

    doc.moveDown(0.4);
    doc.fontSize(12).font("Helvetica-Bold").text("Votes cast in elections", { underline: true });
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(9);
    let vc = 0;
    for (const block of report.votesCast) {
      for (const v of block.votes) {
        vc += 1;
        const cand = v.candidate;
        doc.text(
          `${vc}. ${block.election.title} | Role: ${v.role} | For: ${cand && cand.fullname ? cand.fullname : "—"}`,
          { width: 500 }
        );
        doc.moveDown(0.15);
      }
    }
    if (!vc) doc.text("None.");

    doc.moveDown(0.4);
    doc.fontSize(12).font("Helvetica-Bold").text("Election wins", { underline: true });
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(9);
    if (!report.electionWins.length) doc.text("None.");
    else {
      for (const block of report.electionWins) {
        for (const w of block.wins) {
          doc.text(
            `${block.election.title} — Won role: ${w.role} | ${w.user?.fullname || "—"}`,
            { width: 500 }
          );
          doc.moveDown(0.15);
        }
      }
    }

    doc.end();
  } catch (err) {
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};

const ADMIN_CREATABLE_ROLES = ["user", "manager", "admin"];

const createUserByAdmin = async (req, res) => {
  try {
    const { fullname, email, password, Department, role, rollNo, semester, sessionStart, sessionEnd } = req.body;

    if (!fullname || !email || !password || !Department) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, password and department are required",
      });
    }

    const userRole = (role || "user").toString().toLowerCase().trim();
    if (!ADMIN_CREATABLE_ROLES.includes(userRole)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const emailNorm = email.toLowerCase().trim();
    const existing = await User.findOne({ email: emailNorm });
    if (existing) {
      return res.status(400).json({ success: false, message: "An account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      fullname: fullname.trim(),
      email: emailNorm,
      password: hashedPassword,
      Department,
      role: userRole,
    };

    if (userRole === "user") {
      const start = (sessionStart || "").trim();
      const end = (sessionEnd || "").trim();
      if (!rollNo || !semester || !start || !end) {
        return res.status(400).json({
          success: false,
          message: "Roll number, semester, session start and session end are required for student accounts",
        });
      }
      if (end < start) {
        return res.status(400).json({
          success: false,
          message: "Session end date must be on or after the session start date",
        });
      }
      userData.rollNo = rollNo;
      userData.semester = semester;
      userData.sessionStart = start;
      userData.sessionEnd = end;
      userData.session = `${start} — ${end}`;
    }

    const created = await User.create(userData);
    const safe = created.toObject();
    delete safe.password;
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: safe,
    });
  } catch (err) {
    console.error("ADMIN_CREATE_USER:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

const getAdminSocietyPosts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      SocietyPost.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("society", "name status department")
        .populate("author", "fullname email role"),
      SocietyPost.countDocuments(),
    ]);
    return res.status(200).json({
      success: true,
      data: items,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      total,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const adminDeleteSocietyPost = async (req, res) => {
  try {
    const post = await SocietyPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });
    if (post.image) {
      const imagePath = path.join(__dirname, "../uploads", post.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    await SocietyPost.findByIdAndDelete(req.params.postId);
    return res.status(200).json({ success: true, message: "Post deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDashboardStats,
  getAdminSocietyDetail,
  updateSocietyStatus,
  getSocietyEvents,
  adminDeleteEvent,
  downloadSocietyPdf,
  getAdminEvents,
  getAdminEventById,
  downloadEventPdf,
  getAdminElections,
  getAdminElectionById,
  downloadElectionPdf,
  adminDeleteElection,
  getAdminUserById,
  downloadUserPdf,
  createUserByAdmin,
  getAdminSocietyPosts,
  adminDeleteSocietyPost,
};
