const SocietyModel = require("../models/societyModel");
const User = require("../models/users");
const Election = require("../models/Election");
const { notifyAllAdmins } = require("../utils/notifyUser");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function writePdfSection(doc, title, lines = []) {
  doc.fontSize(12).font("Helvetica-Bold").text(title, { underline: true });
  doc.moveDown(0.3);
  doc.font("Helvetica").fontSize(10);
  lines.forEach((line) => {
    doc.text(line || "—", { width: 500 });
    doc.moveDown(0.2);
  });
  doc.moveDown(0.6);
}

// Create Society
const createSociety = async (req, res) => {
  try {
    const {
      name,
      shortName,
      advisor,
      membersCount,
      email,
      phone,
      description,
      joinPolicy,
    } = req.body;

    if (!name || !shortName) {
      return res.status(400).json({
        success: false,
        message: "Name and Short Name are required.",
      });
    }

    // Automatically assign President as logged-in user
    const presidentRole = { name: "President", user: req.user.id };

    const newSociety = await SocietyModel.create({
      Creator: req.user.id,
      department: req.user.department,
      name,
      shortName,
      advisor,
      membersCount,
      email,
      phone,
      description,
      joinPolicy,
      roles: [presidentRole], // include president role
      image: req.file ? req.file.filename : null,
    });

    const creator = await User.findById(req.user.id).select("fullname email").lean().catch(() => null);
    const creatorLabel = creator?.fullname || creator?.email || "A manager";
    notifyAllAdmins(req, {
      type: "ADMIN_NEW_SOCIETY_PENDING",
      title: "New society pending review",
      message: `${creatorLabel} registered "${name}" (${shortName}). Approve it under Society requests.`,
      meta: { societyId: newSociety._id.toString(), creatorId: req.user.id },
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: "Society created successfully.",
      data: newSociety,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Update Society
const updateSociety = async (req, res) => {
  try {
    const { id } = req.params;

    const society = await SocietyModel.findById(id);
    if (!society) return res.status(404).json({ success: false, message: "Society not found." });

    // Check authorization
    if (society.Creator.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized." });

    const {
      name,
      shortName,
      advisor,
      membersCount,
      status,
      email,
      phone,
      description,
      joinPolicy,
      roles, // optional roles excluding President
    } = req.body;

    const isManager = String(req.user.role || "").toLowerCase() === "manager";

    // Update basic fields
    society.name = name || society.name;
    society.shortName = shortName || society.shortName;
    society.advisor = advisor || society.advisor;
    society.membersCount = membersCount || society.membersCount;
    if (!isManager && status && ["Active", "Inactive"].includes(status)) {
      society.status = status;
    }
    society.email = email || society.email;
    society.phone = phone || society.phone;
    society.description = description || society.description;
    society.joinPolicy = joinPolicy || society.joinPolicy;

    // Update roles
    if (roles) {
      const parsedRoles = Array.isArray(roles) ? roles : JSON.parse(roles);

      // Keep the existing President role
      const presidentRole = society.roles.find(r => r.name === "President");
      if (!presidentRole) {
        // Just in case somehow missing, add current user as President
        society.roles.push({ name: "President", user: req.user.id });
      }

      // Filter out President from parsed roles if someone accidentally included it
      const nonPresidentRoles = parsedRoles.filter(r => r.name !== "President");

      // Merge existing roles (except President) with new ones
      const updatedRoles = nonPresidentRoles.map(r => {
        const existingRole = society.roles.find(er => er.name === r.name);
        return {
          name: r.name,
          user: existingRole?.user || null, // preserve user if assigned
        };
      });

      // Keep President + updated non-president roles
      society.roles = [society.roles.find(r => r.name === "President"), ...updatedRoles];
    }

    // Update image if uploaded
    if (req.file) {
      if (society.image) {
        const oldPath = path.join(__dirname, "../uploads/", society.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      society.image = req.file.filename;
    }

    const updatedSociety = await society.save();

    return res.status(200).json({
      success: true,
      message: "Society updated successfully.",
      data: updatedSociety,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Delete Society
const deleteSociety = async (req, res) => {
  try {
    const { id } = req.params;

    const society = await SocietyModel.findById(id);
    if (!society) return res.status(404).json({ success: false, message: "Society not found." });

    if (society.Creator.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized." });

    await SocietyModel.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: "Society deleted successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get all societies
const getAllSocieties = async (req, res) => {
  try {
    const societies = await SocietyModel.find()
      .populate("Creator", "fullname email")
      .populate("roles.user", "fullname email");
    return res.status(200).json({ success: true, data: societies });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get my societies
const getMySocieties = async (req, res) => {
  try {
    const societies = await SocietyModel.find({ Creator: req.user.id })
      .populate("roles.user", "fullname");
    return res.status(200).json({ success: true, data: societies });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get society by ID
const getSocietiesByid = async (req, res) => {
  try {
    const society = await SocietyModel.findById(req.params.id)
      .populate("roles.user")
      .populate("members", "fullname Department department semester rollNo profileImage image email");
    if (!society) {
      return res.status(404).json({ success: false, message: "Society not found" });
    }
    return res.status(200).json({ success: true, data: society });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
// ✅ NEW: Get societies where user is a member
const getMemberSocieties = async (req, res) => {
  try {
    const societies = await SocietyModel.find({ 
      members: req.user.id  // ✅ Find societies where user ID is in members array
    })
    .populate("Creator", "fullname email department")  // Populate creator info
    .populate("roles.user", "fullname profileImage")    // Populate role assignments
    .populate("members", "fullname profileImage")       // Populate member list
    .sort({ createdAt: -1 });

    return res.status(200).json({ 
      success: true, 
      data: societies,
      count: societies.length 
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// ✅ OPTIONAL: Get society details with membership status for current user
const getSocietyWithMembership = async (req, res) => {
  try {
    const { id } = req.params;
    
    const society = await SocietyModel.findById(id)
      .populate("Creator", "fullname email department profileImage")
      .populate("roles.user", "fullname profileImage")
      .populate("members", "fullname profileImage department")
      .populate("joinRequests.user", "fullname profileImage");

    if (!society) {
      return res.status(404).json({ success: false, message: "Society not found" });
    }

    // ✅ Add membership status for current user
    const isMember = society.members.some(m => m._id.toString() === req.user.id);
    const isCreator = society.Creator._id.toString() === req.user.id;
    const pendingRequest = society.joinRequests.find(
      r => r.user?._id?.toString() === req.user.id && r.status === "Pending"
    );

    const societyWithStatus = society.toObject();
    societyWithStatus.currentUserStatus = {
      isMember,
      isCreator,
      hasPendingRequest: !!pendingRequest,
      canApply: !isMember && !pendingRequest && !isCreator
    };

    return res.status(200).json({ 
      success: true, 
      data: societyWithStatus 
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

const withdrawSocietyApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const society = await SocietyModel.findById(id);
    if (!society) {
      return res.status(404).json({ success: false, message: "Society not found" });
    }

    const pendingRequest = (society.joinRequests || []).find(
      (r) => String(r.user) === String(userId) && r.status === "Pending"
    );
    if (!pendingRequest) {
      return res.status(404).json({
        success: false,
        message: "No pending application found to withdraw",
      });
    }

    society.joinRequests = (society.joinRequests || []).filter(
      (r) => !(String(r.user) === String(userId) && r.status === "Pending")
    );
    await society.save();

    return res.status(200).json({
      success: true,
      message: "Application withdrawn successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const leaveSociety = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const society = await SocietyModel.findById(id);
    if (!society) {
      return res.status(404).json({ success: false, message: "Society not found" });
    }

    if (String(society.Creator) === String(userId)) {
      return res.status(400).json({
        success: false,
        message: "Society creator cannot leave the society",
      });
    }

    const roleLinked = (society.roles || []).find(
      (r) => r.user && String(r.user) === String(userId)
    );
    if (roleLinked) {
      return res.status(400).json({
        success: false,
        message: `You are assigned as ${roleLinked.name}. Ask manager to unassign this role first.`,
      });
    }

    const isMember = (society.members || []).some(
      (m) => String(m) === String(userId)
    );
    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: "You are not a member of this society",
      });
    }

    society.members = (society.members || []).filter(
      (m) => String(m) !== String(userId)
    );
    society.joinRequests = (society.joinRequests || []).filter(
      (reqItem) => String(reqItem.user) !== String(userId)
    );
    await society.save();

    return res.status(200).json({
      success: true,
      message: "You have left the society successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const removeSocietyMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const society = await SocietyModel.findById(id);
    if (!society) {
      return res.status(404).json({ success: false, message: "Society not found" });
    }

    if (String(society.Creator) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const isMember = (society.members || []).some(
      (m) => String(m) === String(memberId)
    );
    if (!isMember) {
      return res.status(404).json({ success: false, message: "Member not found in this society" });
    }

    const roleLinked = (society.roles || []).find(
      (r) => r.user && String(r.user) === String(memberId)
    );
    if (roleLinked) {
      return res.status(400).json({
        success: false,
        message: `Cannot remove member assigned as ${roleLinked.name}. Unassign role first.`,
      });
    }

    society.members = (society.members || []).filter(
      (m) => String(m) !== String(memberId)
    );
    // Keep membership/application history clean when a manager removes a member.
    // Remove this user's join request records for this society as well.
    society.joinRequests = (society.joinRequests || []).filter(
      (reqItem) => String(reqItem.user) !== String(memberId)
    );
    await society.save();

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const assignSocietyRoleMember = async (req, res) => {
  try {
    const { id, roleId } = req.params;
    const { userId } = req.body;

    const society = await SocietyModel.findById(id);
    if (!society) {
      return res.status(404).json({ success: false, message: "Society not found" });
    }

    if (String(society.Creator) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const role = (society.roles || []).id(roleId);
    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }

    const activeElectionForRole = await Election.findOne({
      societyId: society._id,
      roles: role.name,
      status: {
        $in: [
          "APPLICATIONS_OPEN",
          "APPLICATIONS_CLOSED",
          "CANDIDATES_FINALIZED",
          "VOTING_SCHEDULED",
          "VOTING_LIVE",
        ],
      },
    }).select("_id status");

    if (activeElectionForRole) {
      return res.status(400).json({
        success: false,
        message: `Cannot change "${role.name}" while an election is in progress`,
      });
    }

    if (!userId) {
      role.user = null;
      await society.save();
      return res.status(200).json({
        success: true,
        message: "Role unassigned successfully",
      });
    }

    const isMember = (society.members || []).some(
      (memberId) => String(memberId) === String(userId)
    );
    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: "Only society members can be assigned to a role",
      });
    }

    const alreadyAssignedRole = (society.roles || []).find(
      (r) =>
        String(r?._id) !== String(roleId) &&
        r.user &&
        String(r.user) === String(userId)
    );
    if (alreadyAssignedRole) {
      return res.status(400).json({
        success: false,
        message: `This user is already assigned to "${alreadyAssignedRole.name}"`,
      });
    }

    role.user = userId;
    await society.save();

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const downloadSocietyPdfManager = async (req, res) => {
  try {
    const society = await SocietyModel.findById(req.params.id)
      .populate("Creator", "fullname email Department role rollNo semester session")
      .populate("members", "fullname email Department department rollNo semester session role")
      .populate("roles.user", "fullname email Department department");

    if (!society) {
      return res.status(404).json({ success: false, message: "Society not found" });
    }

    const uid = String(req.user.id);
    const isCreator = society.Creator && String(society.Creator._id || society.Creator) === uid;
    const canManage = isCreator || (society.roles || []).some((r) => r.user && String(r.user._id || r.user) === uid);
    if (!canManage) {
      return res.status(403).json({ success: false, message: "Not authorized to download this report" });
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
    const pickDept = (u) => u?.Department || u?.department || "—";

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
        ? `Name: ${creator.fullname} | Email: ${creator.email} | Dept: ${pickDept(creator)} | Role: ${creator.role || "—"}`
        : "—",
    ]);

    writePdfSection(doc, "President", [
      president?.user
        ? `Name: ${president.user.fullname} | Email: ${president.user.email || "—"} | Dept: ${pickDept(president.user)}`
        : "Not assigned",
    ]);

    if (otherRoles.length) {
      doc.fontSize(12).font("Helvetica-Bold").text("Other role holders", { underline: true });
      doc.moveDown(0.3);
      doc.font("Helvetica").fontSize(10);
      otherRoles.forEach((r) => {
        const u = r.user;
        doc.text(`${r.name}: ${u ? `${u.fullname} (${u.email || "—"})` : "Vacant"}`, { width: 500 });
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
          `${i + 1}. ${m.fullname || "—"} | ${m.email || "—"} | Dept: ${pickDept(m)} | Roll: ${m.rollNo || "—"} | Semester: ${m.semester || "—"} | Session: ${m.session || "—"} | App role: ${m.role || "—"}`,
          { width: 500 }
        );
        doc.moveDown(0.25);
      });
    }

    doc.moveDown();
    doc.fontSize(9).fillColor("#6B7280").text(`Generated on ${new Date().toLocaleString()}`);
    doc.end();
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createSociety,
  updateSociety,
  deleteSociety,
  getAllSocieties,
  getMySocieties,
  getSocietiesByid,
  getMemberSocieties,        // ✅ NEW
  getSocietyWithMembership,
  withdrawSocietyApplication,
  leaveSociety,
  downloadSocietyPdfManager,
  removeSocietyMember,
  assignSocietyRoleMember,
};
