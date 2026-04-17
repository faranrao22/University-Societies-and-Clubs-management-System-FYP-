const SocietyModel = require("../models/societyModel");
const User = require("../models/users");
const { notifyAllAdmins } = require("../utils/notifyUser");
const fs = require("fs");
const path = require("path");

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
  .populate("roles.user"); // populate all fields
console.log(JSON.stringify(society.roles, null, 2));

      console.log("Fetched Society:", society.name, society.roles); // Debug log
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

module.exports = {
  createSociety,
  updateSociety,
  deleteSociety,
  getAllSocieties,
  getMySocieties,
  getSocietiesByid,
  getMemberSocieties,        // ✅ NEW
  getSocietyWithMembership
};
