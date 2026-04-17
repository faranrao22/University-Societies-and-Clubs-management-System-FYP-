const Election = require("../models/Election");
const Society = require("../models/societyModel");
const User = require("../models/users");
const { notifyUser } = require("../utils/notifyUser");
const applyCandidate = async (req, res) => {
  try {
    const { electionId } = req.params;
    const userId = req.user.id;
    const { role, cnic } = req.body;

    // 1️⃣ Block non-users from token
    if (!req.user.role || req.user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Only users with the 'user' role can apply for this election",
      });
    }

    // 2️⃣ Validate required fields
    if (!role || !cnic || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Role, CNIC, and picture are required",
      });
    }

    // 3️⃣ Find election and user
    const election = await Election.findById(electionId).populate("societyId");
    const user = await User.findById(userId).select("role");

    if (!election) return res.status(404).json({ success: false, message: "Election not found" });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // 4️⃣ Double-check role from DB
    if (user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Only users with the 'user' role can apply for this election",
      });
    }

    // 5️⃣ Election must be open for applications
    if (election.status !== "APPLICATIONS_OPEN") {
      return res.status(403).json({
        success: false,
        message: `Applications are not open. Current election status: ${election.status}`,
      });
    }

    // 6️⃣ Check apply deadline
    if (election.applyDeadline && new Date() > new Date(election.applyDeadline)) {
      return res.status(403).json({
        success: false,
        message: "Apply deadline has passed",
      });
    }

    // 7️⃣ Check applicationEligibility
    if (election.applicationEligibility === "MEMBERS_ONLY") {
      const isMember = election.societyId.members.some(
        (memberId) => memberId.toString() === userId.toString()
      );
      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: "Only society members can apply for this election",
        });
      }
    }

    // 8️⃣ Check if already applied in THIS election
    const existingApplication = election.candidates.find(
      (c) => c.user.toString() === userId.toString()
    );

    if (existingApplication) {
      // ❌ block if NOT inDispute
      if (existingApplication.status !== "inDispute") {
        return res.status(400).json({
          success: false,
          message: "You have already applied in this election",
        });
      }

      // ✅ allow re-apply if inDispute
      existingApplication.role = role;
      existingApplication.cnic = cnic;
      existingApplication.image = req.file.filename;
      existingApplication.status = "pending";

      await election.save();

      notifyElectionManagerNewApplication(req, election, userId, role).catch(() => {});

      return res.status(200).json({
        success: true,
        message: "Re-application submitted successfully",
        data: election,
      });
    }

    // 9️⃣ Check if already a candidate in another active election
    const alreadyAppliedElsewhere = await Election.findOne({
      _id: { $ne: electionId },
      "candidates.user": userId,
      status: {
        $in: ["APPLICATIONS_OPEN", "APPLICATIONS_CLOSED", "CANDIDATES_FINALIZED", "VOTING_SCHEDULED", "VOTING_LIVE"],
      },
    });
    if (alreadyAppliedElsewhere) {
      return res.status(403).json({
        success: false,
        message: "You are already a candidate in another active election",
      });
    }

    // 🔟 Validate role exists in this election
    const roleExists = election.roles.includes(role);
    if (!roleExists) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Available roles: ${election.roles.join(", ")}`,
      });
    }

    // 1️⃣1️⃣ Push candidate
    election.candidates.push({
      user: userId,
      role,
      cnic,
      image: req.file.filename,
      status: "pending",
    });

    await election.save();

    notifyElectionManagerNewApplication(req, election, userId, role).catch(() => {});

    res.status(200).json({
      success: true,
      message: "Application submitted successfully",
      data: election,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const applicationStatus = async (req, res) => {
  try {
    const { electionId, candidateId } = req.params;
    const { status, reason } = req.body;

    // ✅ Validate status
    const allowedStatuses = ["approved", "rejected", "inDispute"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // ✅ Find election
    const election = await Election.findById(electionId);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // ✅ Find candidate
    const candidate = election.candidates.id(candidateId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // 🚨 BUSINESS RULES (IMPORTANT FIX)

    // ❌ Prevent re-approval after final approval
    if (candidate.status === "approved" && status !== "inDispute") {
      return res.status(400).json({
        success: false,
        message: "Approved candidate cannot be modified",
      });
    }

    // ❌ Prevent duplicate same status
    if (candidate.status === status) {
      return res.status(400).json({
        success: false,
        message: `Candidate is already ${status}`,
      });
    }

    // ✅ Update status
    candidate.status = status;

    // ✅ OPTIONAL: store reason (useful for rejection/dispute)
    if (reason) {
      candidate.reason = reason;
    }

    // 💾 Save election
    await election.save();

    const statusLabel =
      status === "inDispute" ? "marked in dispute" :
      status === "approved" ? "approved" : "rejected";
    const reasonSuffix = reason ? ` Note: ${String(reason).slice(0, 300)}` : "";
    notifyUser(req, candidate.user.toString(), {
      type: "ELECTION_APPLICATION_STATUS",
      title: `Election application ${statusLabel}`,
      message: `Your application for "${election.title}" was ${statusLabel}.${reasonSuffix}`,
      meta: {
        electionId: election._id.toString(),
        candidateId: candidate._id.toString(),
        status,
      },
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      data: candidate,
      message: "Candidate status updated successfully",
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
// Controller to finalize an election
const finalizeCandidates = async (req, res) => {
  try {
    const { electionId } = req.params;

    // 1️⃣ Fetch the election with candidates
    const election = await Election.findById(electionId);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // 2️⃣ Check if at least one candidate is approved
    const hasApprovedCandidate = election.candidates.some(
      (c) => c.status === "approved"
    );

    if (!hasApprovedCandidate) {
      return res.status(400).json({
        success: false,
        message: "Cannot finalize election. No candidate has been approved yet.",
      });
    }

    // 3️⃣ Update election status
    election.status = "CANDIDATES_FINALIZED";
    await election.save();

    res.status(200).json({
      success: true,
      message: "Election finalized successfully",
      data: election,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const getElectionCandidatesForVoting = async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findById(electionId)
      .populate("candidates.user", "fullname") // remove extra space
      .select("roles candidates status");

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Voting allowed only when LIVE
    if (election.status !== "VOTING_LIVE") {
      return res.status(403).json({
        success: false,
        message: "Election is not live yet",
      });
    }

    const candidatesByRole = {};

    // Initialize roles
    election.roles.forEach(role => {
      candidatesByRole[role] = [];
    });

    // Group approved candidates by role
    election.candidates.forEach(candidate => {
      if (candidate.status === "approved" && candidate.user) {
        const roleKey = candidate.role?.trim();
        if (roleKey && candidatesByRole[roleKey]) {
          candidatesByRole[roleKey].push({
            candidateId: candidate.user._id,
            name: candidate.user.fullname,
            image: candidate.image,
          });
        }
      }
    });


    res.status(200).json({
      success: true,
      data: candidatesByRole,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const getUserElectionApplications = async (req, res) => {
  try {
    const userId = req.user.id; // logged-in user

    // 1️⃣ Get all societies created by this user
    const societies = await Society.find({ Creator: userId }).select("_id name");
    const societyIds = societies.map(s => s._id);

    if (!societyIds.length) {
      return res.status(404).json({
        success: false,
        message: "No societies found for this user",
      });
    }

    // 2️⃣ Find elections in these societies with status APPLICATIONS_OPEN or APPLICATIONS_CLOSED
    const elections = await Election.find({
      societyId: { $in: societyIds },
      status: { $in: ["APPLICATIONS_OPEN", "APPLICATIONS_CLOSED"] },
    })
      .populate("candidates.user", "fullname email")
      .populate("societyId", "name") // include society name
      .select("title status candidates societyId"); // select only required fields

    if (!elections.length) {
      return res.status(404).json({
        success: false,
        message: "No elections with open or closed applications found",
      });
    }

    // 3️⃣ Map data for frontend
    const data = elections.map(election => ({
      electionId: election._id,
      electionTitle: election.title,
      electionStatus: election.status,
      society: election.societyId.name,
      candidates: election.candidates.map(candidate => ({
        candidateId: candidate._id,
        fullname: candidate.user.fullname,
        email: candidate.user.email,
        role: candidate.role,
        cnic: candidate.cnic,
        image: candidate.image,
        applicationStatus: candidate.status, // pending / approved / rejected
      })),
    }));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getCandidateDetails = async (req, res) => {
  try {
    const { candidateId } = req.params;

    const election = await Election.findOne({
      "candidates._id": candidateId
    })
      .populate("candidates.user", "fullname email");

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    const candidate = election.candidates.id(candidateId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        fullname: candidate.user.fullname,
        email: candidate.user.email,
        image: candidate.image,
        cnic: candidate.cnic,
        status: candidate.status
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const getUserApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // ✅ DEBUG: Log the user ID and its type
    console.log("🔍 Fetching applications for userId:", userId, "Type:", typeof userId);

    // Find all elections where user has applied as a candidate
    const elections = await Election.find({
      "candidates.user": userId  // ✅ This should match ObjectId or string
    })
    .populate("societyId", "name shortName image")
    .populate("candidates.user", "fullname profileImage")
    .select("title societyId candidates status startDate endDate")
    .sort({ createdAt: -1 });

    // ✅ DEBUG: Log query results
    console.log("📊 Elections found:", elections.length);
    elections.forEach((elec, idx) => {
      console.log(`  [${idx}] Election: ${elec.title}, Candidates: ${elec.candidates.length}`);
      elec.candidates.forEach((c, cIdx) => {
        console.log(`    Candidate ${cIdx}: user=${c.user}, role=${c.role}, status=${c.status}`);
      });
    });

    // Extract only the candidate entries for this user
    const applications = elections.map(election => {
      const candidate = election.candidates.find(c => {
        // ✅ Robust comparison: handle ObjectId, string, and populated user
        const candidateUserId = c.user?._id?.toString() || c.user?.toString() || c.user;
        return candidateUserId === userId.toString();
      });
      
      if (!candidate) return null;
      
      return {
        _id: candidate._id,
        election: {
          _id: election._id,
          title: election.title,
          society: election.societyId,
          status: election.status,
          startDate: election.startDate,
          endDate: election.endDate
        },
        role: candidate.role,
        cnic: candidate.cnic,
        image: candidate.image,
        status: candidate.status,
        reason: candidate.reason || null,
        appliedAt: candidate._id.getTimestamp(),
        updatedAt: candidate.updatedAt || election.updatedAt
      };
    }).filter(app => app !== null);

    // ✅ DEBUG: Final result
    console.log("✅ Applications extracted:", applications.length);

    return res.status(200).json({
      success: true,
       data: applications,
      count: applications.length
    });

  } catch (err) {
    console.error("❌ Error fetching user applications:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch applications"
    });
  }
};

const getUserParticipatedElections = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1️⃣ Find elections where user is candidate OR voter
    const elections = await Election.find({
      $or: [
        { "candidates.user": userId },
        { "votes.voter": userId }
      ]
    })
    // ✅ Populate winners with user details
    .populate("societyId", "name")
    .populate("candidates.user", "fullname profileImage")
    .populate("winners.user", "fullname profileImage")
    .sort({ createdAt: -1 });

    if (!elections.length) {
      return res.status(200).json({
        success: true,
         data:[],
        message: "No participated elections found",
      });
    }

    // 2️⃣ Format response
    const resultData = elections.map((election) => {
      // 🔹 Check if user is candidate
      const candidate = election.candidates?.find(
        (c) => c.user && c.user._id?.toString() === userId.toString()
      );

      // 🔹 Check if user voted
      const hasVoted = election.votes?.some(
        (v) => v.voter?.toString() === userId.toString()
      );

      // 🔹 Prepare results (ONLY if completed or live)
      let results = null;
      let winners = null;

      if (election.status === "COMPLETED" || election.status === "VOTING_LIVE") {
        results = {};
        winners = {};

        election.roles?.forEach((role) => {
          const candidatesForRole = election.candidates?.filter(c => c.role === role) || [];
          
          // Calculate votes for each candidate in this role
          results[role] = candidatesForRole.map((c) => {
            const voteCount = election.votes?.filter(
              (v) => v.role === role && v.candidate?.toString() === c.user?._id?.toString()
            ).length || 0;

            return {
              candidateId: c.user?._id,
              name: c.user?.fullname || "Unknown",
              profileImage: c.user?.profileImage,
              votes: voteCount,
              isYou: c.user?._id?.toString() === userId.toString(),
            };
          }).sort((a, b) => b.votes - a.votes);

          // ✅ Find winner(s) for this role from winners array
          const roleWinners = election.winners?.filter(w => w.role === role) || [];
          if (roleWinners.length > 0) {
            winners[role] = roleWinners.map(w => ({
              userId: w.user?._id,
              name: w.user?.fullname || "Unknown",
              profileImage: w.user?.profileImage,
              isYou: w.user?._id?.toString() === userId.toString(),
            }));
          }
        });
      }

      return {
        electionId: election._id,
        title: election.title,
        society: election.societyId?.name || null,
        status: election.status,
        startDate: election.startDate,
        endDate: election.endDate,
        applyDeadline: election.applyDeadline,

        // 🔥 Participation info
        participatedAs: candidate ? "candidate" : hasVoted ? "voter" : "unknown",
        candidateStatus: candidate?.status || null,
        roleApplied: candidate?.role || null,

        // 🔥 Results & Winners
        results,
        winners,
      };
    });

    // ✅ FIXED: Correct JSON structure with "data" key
    return res.status(200).json({
      success: true,
       resultData,  // ✅ Correct: key name + value
      count: resultData.length,
    });

  } catch (err) {
    console.error("❌ Error fetching participated elections:", err);
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === "development" ? err.message : "Server error",
    });
  }
};

async function notifyElectionManagerNewApplication(req, election, userId, role) {
  const soc = election.societyId;
  const managerId = soc?.Creator ? soc.Creator.toString() : null;
  if (!managerId) return;
  const applicant = await User.findById(userId).select("fullname").lean().catch(() => null);
  const name = applicant?.fullname || "A student";
  const societyId = soc._id ? soc._id.toString() : String(soc);
  await notifyUser(req, managerId, {
    type: "ELECTION_APPLICATION_SUBMITTED",
    title: "New election application",
    message: `${name} applied for "${election.title}" (${role}).`,
    meta: {
      electionId: election._id.toString(),
      societyId,
    },
  });
}

module.exports = {
  applyCandidate,
  finalizeCandidates,
  applicationStatus,
  getUserElectionApplications,
  getCandidateDetails,
  getElectionCandidatesForVoting,
  getUserApplications,
  getUserParticipatedElections
};