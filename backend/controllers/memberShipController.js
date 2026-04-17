let SocietyModel = require("../models/societyModel");
const User = require("../models/users");
const { notifyUser } = require("../utils/notifyUser");

const requestToJoinSociety = async (req, res) => {
    try {
        // 1. Extract the new fields from the request body
        const { reason, skills, experience, availability } = req.body;

        // 🔹 Check if user is logged in and has 'user' role
        if (!req.user || req.user.role !== "user") {
            return res.status(403).json({
                success: false,
                message: "Only students with  can join societies",
            });
        }

        // 🔹 Validate required form fields
        if (!reason || reason.length < 20) {
            return res.status(400).json({
                success: false,
                message: "Please provide a detailed reason (minimum 20 characters).",
            });
        }

        // 🔹 Find society
        const society = await SocietyModel.findById(req.params.id);
        if (!society) {
            return res.status(404).json({ success: false, message: "Society not found" });
        }

        // 🔒 Apply creator-defined policy
        switch (society.joinPolicy) {
            case "DEPARTMENT_ONLY":
                // Make sure your middleware/auth attaches 'Department' to req.user
                if (society.department !== req.user.department) {
                    return res.status(403).json({
                        success: false,
                        message: `This society is restricted to ${society.department} students only.`,
                    });
                }
                break;
            case "OPEN":
                break;
            default:
                return res.status(400).json({ success: false, message: "Invalid join policy" });
        }

        // 🔹 Prevent duplicate membership
        if (society.members.includes(req.user.id)) {
            return res.status(400).json({ success: false, message: "You are already a member of this society." });
        }

        // 🔹 Prevent duplicate requests
        const alreadyRequested = society.joinRequests.find(
            (r) => r.user.toString() === req.user.id && r.status === "Pending"
        );
        if (alreadyRequested) {
            return res.status(400).json({ success: false, message: "You already have a pending request." });
        }

        // 🔹 Push request with all form data
        society.joinRequests.push({
            user: req.user.id,
            reason: reason,
            skills: skills || "Not specified",
            experience: experience || "None",
            availability: availability || "Not specified",
            requestedAt: new Date()
        });

        await society.save();

        const lastReq = society.joinRequests[society.joinRequests.length - 1];
        const applicant = await User.findById(req.user.id).select("fullname").lean().catch(() => null);
        const applicantName = applicant?.fullname || "A student";
        notifyUser(req, society.Creator, {
            type: "JOIN_REQUEST_RECEIVED",
            title: "New society join request",
            message: `${applicantName} requested to join "${society.name}".`,
            meta: {
                societyId: society._id.toString(),
                requestId: lastReq?._id?.toString(),
            },
        }).catch(() => {});

        res.status(200).json({
            success: true,
            message: "Application submitted successfully! The manager will review it soon.",
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
// Get all join requests for societies managed by the logged-in manager
const getManagerJoinRequests = async (req, res) => {
    try {
        // 1. Find societies created by this manager
        // 2. Populate user info with ALL the new fields from User.js
        const societies = await SocietyModel.find({ Creator: req.user.id })
            .populate(
                "joinRequests.user",
                "fullname email Department rollNo semester profileImage studentCardFront studentCardBack isGraduated session"
            );

        // 3. Map through societies and their requests
        const allRequests = societies.flatMap(society =>
            society.joinRequests.map(request => ({
                // --- Request Metadata ---
                requestId: request._id,
                societyId: society._id,
                societyName: society.name,
                status: request.status,
                requestedAt: request.requestedAt,

                // --- Application Content (From Society Schema) ---
                applicationDetails: {
                    reason: request.reason,
                    skills: request.skills,
                    experience: request.experience,
                    availability: request.availability
                },

                // --- Full User Profile (From User Schema via Populate) ---
                studentProfile: request.user
            }))
        );

        // Sort: Newest first
        allRequests.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

        res.status(200).json({
            success: true,
            count: allRequests.length,
            data: allRequests,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update the status of a join request (Approve / Reject)
const updateJoinRequestStatus = async (req, res) => {
    try {
        const { requestId } = req.params; // ID of the join request
        const { status } = req.body; // "Approved" or "Rejected"

        if (!["Approved", "Rejected"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }
        console.log("requestId:", requestId);
        // Find the society that contains this join request and belongs to the logged-in manager
        const society = await SocietyModel.findOne({
            Creator: req.user.id,
            "joinRequests._id": requestId,
        });

        if (!society) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        // Find the specific request
        const request = society.joinRequests.id(requestId);
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        // Update status
        request.status = status;

        // If approved, also add user to members array (optional)
        if (status === "Approved" && !society.members.includes(request.user)) {
            society.members.push(request.user);
        }

        await society.save();

        const studentId = request.user?.toString?.() || request.user;
        notifyUser(req, studentId, {
            type: "JOIN_REQUEST_UPDATED",
            title: status === "Approved" ? "Join request approved" : "Join request rejected",
            message: `Your request to join "${society.name}" was ${status.toLowerCase()}.`,
            meta: {
                societyId: society._id.toString(),
                requestId: requestId.toString(),
                status,
            },
        }).catch(() => {});

        res.status(200).json({
            success: true,
            message: `Request ${status.toLowerCase()} successfully`,
            data: request,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
// Get all members of a society (manager only)
const getSocietyMembers = async (req, res) => {
    try {
        const { societyId } = req.params;

        const society = await SocietyModel.findOne({
            _id: societyId,
            Creator: req.user.id // Security: Only the creator can view the member list
        }).populate(
            "members", 
            "fullname email Department rollNo semester profileImage session studentCardFront studentCardBack isGraduated"
        );

        if (!society) {
            return res.status(404).json({
                success: false,
                message: "Society not found or unauthorized"
            });
        }

        res.status(200).json({
            success: true,
            data: society.members
        });
        
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
const getMyApplicationStatus = async (req, res) => {
    try {
        // 🔹 Validate user
        if (!req.user || req.user.role !== "user") {
            return res.status(403).json({
                success: false,
                message: "Only students can view their applications",
            });
        }

        // 🔹 Find all societies where user has a join request OR is already a member
        const societies = await SocietyModel.find({
            $or: [
                { "joinRequests.user": req.user.id },
                { members: req.user.id }
            ]
        })
        .populate("Creator", "fullname email department profileImage")
        .populate("roles.user", "fullname profileImage")
        .sort({ createdAt: -1 });

        // 🔹 Format response with application details
        const applications = societies.map(society => {
            // Find user's specific request (if any)
            const request = society.joinRequests.find(
                r => r.user?.toString() === req.user.id
            );

            // Check membership status
            const isMember = society.members.some(m => m.toString() === req.user.id);
            const isCreator = society.Creator._id.toString() === req.user.id;

            return {
                society: {
                    _id: society._id,
                    name: society.name,
                    shortName: society.shortName,
                    image: society.image,
                    department: society.department,
                    status: society.status,
                    joinPolicy: society.joinPolicy,
                    creator: society.Creator
                },
                application: request ? {
                    _id: request._id,
                    status: request.status, // "Pending" | "Approved" | "Rejected"
                    reason: request.reason,
                    skills: request.skills,
                    experience: request.experience,
                    availability: request.availability,
                    requestedAt: request.requestedAt,
                    updatedAt: request.updatedAt,
                    // ✅ Action hints for frontend
                    canWithdraw: request.status === "Pending",
                    canReapply: request.status === "Rejected" && !isMember
                } : null,
                membershipStatus: {
                    isMember,
                    isCreator,
                    joinedAt: isMember ? society.members.find(m => m.toString() === req.user.id)?._id : null // optional
                },
                // ✅ Quick status badge for UI
                displayStatus: isMember 
                    ? "Member" 
                    : request?.status || "Not Applied"
            };
        });

        // 🔹 Separate by status for easy filtering
        const summary = {
            total: applications.length,
            pending: applications.filter(a => a.application?.status === "Pending").length,
            approved: applications.filter(a => a.application?.status === "Approved" || a.membershipStatus.isMember).length,
            rejected: applications.filter(a => a.application?.status === "Rejected").length,
            notApplied: applications.filter(a => !a.application && !a.membershipStatus.isMember).length
        };

        return res.status(200).json({
            success: true,
            data: applications,
            summary,
            count: applications.length
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
module.exports = {
    requestToJoinSociety,
    getManagerJoinRequests,
    updateJoinRequestStatus,
    getSocietyMembers,
    getMyApplicationStatus
};
