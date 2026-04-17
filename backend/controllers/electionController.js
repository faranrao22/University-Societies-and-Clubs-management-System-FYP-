const Election = require("../models/Election");
const Society = require("../models/societyModel");

const createElection = async (req, res) => {
  try {
    const { societyId, title, roles, votingEligibility, applicationEligibility } = req.body;

    const society = await Society.findById(societyId);
    if (!society) {
      return res.status(404).json({
        success: false,
        message: "Society not found",
      });
    }
  // ✅ NEW CHECK: prevent duplicate active elections
    const existingElection = await Election.findOne({
      societyId,
      status: {
        $in: [
          "DRAFT",
          "APPLICATIONS_OPEN",
          "APPLICATIONS_CLOSED",
          "CANDIDATES_FINALIZED",
          "VOTING_SCHEDULED",
          "VOTING_LIVE"
        ]
      }
    });

    if (existingElection) {
      return res.status(400).json({
        success: false,
        message: "This society already has an active election",
      });
    }
    // Only allow roles that exist in society
    const societyRoleNames = society.roles.map(r => r.name);
    const validRoles = roles.filter(r => societyRoleNames.includes(r));

    // Create draft election
    const election = await Election.create({
      societyId,
      title,
      roles: validRoles,
      votingEligibility,
      applicationEligibility,
      status: "DRAFT",
      rolesAssigned: false
    });

    res.status(200).json({
      success: true,
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
const scheduleElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "Start date must be before end date",
      });
    }

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    if (election.status !== "CANDIDATES_FINALIZED") {
      return res.status(403).json({
        success: false,
        message: "Election must be in CANDIDATES_FINALIZED status to schedule",
      });
    }

    election.startDate = start;
    election.endDate = end;

    const now = new Date();

    // ✅ Decide status based on start date
    if (start <= now && end > now) {
      election.status = "VOTING_LIVE"; // Start immediately
    } else {
      election.status = "VOTING_SCHEDULED"; // Schedule for future
    }

    await election.save();

    res.status(200).json({
      success: true,
      data: election,
      message: `Election ${election.status === "VOTING_LIVE" ? "is now LIVE" : "scheduled successfully"}`,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const openApplications = async (req, res) => {
  try {
    const { electionId } = req.params
    const { applyDeadline } = req.body

    const election = await Election.findById(electionId)
    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found"
      })
    }
    if (election.status !== "DRAFT") {
      return res.status(403).json({
        success: false,
        message: "Election is not in draft status"
      })
    }
    if (!applyDeadline) {
      return res.status(400).json({
        success: false,
        message: "Apply deadline is required"
      })
    }
    election.applyDeadline = new Date(applyDeadline)
    election.status = "APPLICATIONS_OPEN"
    await election.save()
    res.status(200).json({
      success: true,
      data: election,
      message: "Applications are now open!"
    })

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    })

  }
}

const getUserElections = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get societies created by user
    const societies = await Society.find({ Creator: userId }).select("_id name");
    if (!societies.length) {
      return res.status(200).json({ success: true, data: [] });
    }

    const societyIds = societies.map(s => s._id);

    // Fetch all elections for these societies, regardless of status
    const elections = await Election.find({
      societyId: { $in: societyIds }
    })
      .populate("candidates.user", "fullname email")
      .populate("societyId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: elections,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const getSocietyElections = async (req, res) => {
  try {
    const { societyId } = req.params;

    const elections = await Election.find({ societyId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: elections,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const getElections = async (req, res) => {
  try {
    const elections = await Election.find()
      .populate("societyId", "name") // 🔥 THIS FIXES EVERYTHING
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: elections,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const MANAGER_ELECTION_STATUSES = [
  "DRAFT",
  "APPLICATIONS_OPEN",
  "APPLICATIONS_CLOSED",
  "CANDIDATES_FINALIZED",
  "VOTING_SCHEDULED",
  "VOTING_LIVE",
  "COMPLETED",
];

/** PATCH status and/or applyDeadline for an election the user manages (society Creator). */
const patchManagerElection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { electionId } = req.params;
    const { status, applyDeadline } = req.body;

    if (status === undefined && applyDeadline === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one of: status, applyDeadline",
      });
    }

    const societies = await Society.find({ Creator: userId }).select("_id");
    const allowedSocietyIds = new Set(societies.map((s) => s._id.toString()));

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    if (!allowedSocietyIds.has(election.societyId.toString())) {
      return res.status(403).json({
        success: false,
        message: "You can only manage elections for societies you created",
      });
    }

    if (status !== undefined && status !== null) {
      if (!MANAGER_ELECTION_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Allowed: ${MANAGER_ELECTION_STATUSES.join(", ")}`,
        });
      }
      election.status = status;
    }

    if (applyDeadline !== undefined) {
      if (applyDeadline === null || applyDeadline === "") {
        election.applyDeadline = undefined;
      } else {
        const d = new Date(applyDeadline);
        if (Number.isNaN(d.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid applyDeadline date",
          });
        }
        election.applyDeadline = d;
      }
    }

    await election.save();

    const updated = await Election.findById(election._id)
      .populate("societyId", "name")
      .populate("candidates.user", "fullname email");

    res.status(200).json({
      success: true,
      data: updated,
      message: "Election updated",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getElectionById = async (req, res) => {
  try {
    const { electionId } = req.params;

    // Fetch the election with all details
    const election = await Election.findById(electionId)
      .populate("societyId", "name") // Include society name
      .populate("candidates.user", "fullname email"); // Optional: show existing candidates

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    res.status(200).json({
      success: true,
      data: election,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const assignSocietyRolesFromElection = async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    if (election.status !== "COMPLETED") {
      return res.status(403).json({
        success: false,
        message: "Election must be completed",
      });
    }

    if (election.rolesAssigned) {
      return res.status(400).json({
        success: false,
        message: "Roles already assigned",
      });
    }

    const society = await Society.findById(election.societyId);
    if (!society) {
      return res.status(404).json({
        success: false,
        message: "Society not found",
      });
    }

    // 🔥 RESET winners array
    election.winners = [];

    // 🔥 Process each role
    for (const role of election.roles) {
      const voteCounter = {};

      // 1️⃣ Initialize candidates for this role
      for (const candidate of election.candidates) {
        if (candidate.role === role) {
          voteCounter[candidate.user.toString()] = 0;
        }
      }

      // 2️⃣ Count votes
      for (const vote of election.votes) {
        if (
          vote.role === role &&
          voteCounter[vote.candidate.toString()] !== undefined
        ) {
          voteCounter[vote.candidate.toString()]++;
        }
      }

      const candidateIds = Object.keys(voteCounter);
      if (!candidateIds.length) continue;

      // 3️⃣ Find max votes
      let maxVotes = -1;
      for (const id of candidateIds) {
        if (voteCounter[id] > maxVotes) {
          maxVotes = voteCounter[id];
        }
      }

      // 4️⃣ Get top candidates (tie handling)
      const topCandidates = candidateIds.filter(
        (id) => voteCounter[id] === maxVotes
      );

      // 5️⃣ Pick random winner (tie-break)
      const winner =
        topCandidates[Math.floor(Math.random() * topCandidates.length)];

      // 6️⃣ Save winner in ELECTION (NEW FIX)
      election.winners.push({
        role,
        user: winner,
      });

      // 7️⃣ Assign role in SOCIETY
      const societyRole = society.roles.find((r) => r.name === role);
      if (societyRole) {
        societyRole.user = winner;
      }
    }

    // 8️⃣ Mark as assigned
    election.rolesAssigned = true;

    await election.save();
    await society.save();

    return res.status(200).json({
      success: true,
      message: "Roles assigned successfully",
      winners: election.winners, // optional but useful for frontend
      society,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getLiveElectionResults = async (req, res) => {
  try {
    const electionId = req.params.electionId;

    // CHANGE: Allow both LIVE and COMPLETED statuses
    const election = await Election.findOne({
      _id: electionId,
      status: { $in: ["VOTING_LIVE"] }
    }).populate("candidates.user", "fullname email")
      .populate("societyId", "name")

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election results not available or election not found",
      });
    }

    const results = {};
    for (const role of election.roles) {
      const candidatesForRole = election.candidates.filter(c => c.role === role);
      results[role] = candidatesForRole.map(candidate => {
        const voteCount = election.votes.filter(
          v => v.role === role && v.candidate.toString() === candidate.user._id.toString()
        ).length;

        return {
          candidateId: candidate.user._id,
          fullname: candidate.user.fullname,
          votes: voteCount,
        };
      });
    }

    res.status(200).json({
      success: true,
      electionId: election._id,
      title: election.title,
      status: election.status, // Pass the status to frontend
      societyName: election.societyId?.name || null, // ✅ ADD THIS
      results,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// controllers/finalResultsController.js
const getFinalResults = async (req, res) => {
  try {
    const electionId = req.params.electionId;

    // Only COMPLETED elections
    const election = await Election.findOne({
      _id: electionId,
      status: "COMPLETED",
    }).populate("candidates.user", "fullname email  Department semester")
      .populate("societyId", "name")

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found or not completed yet",
      });
    }

    const results = {};

    for (const role of election.roles) {
      const candidatesForRole = election.candidates.filter(c => c.role === role);

      results[role] = candidatesForRole.map(c => {
        // Safe candidate ID
        const candidateId = c.user?._id || c._id;

        // Safe name
        const fullname = c.user?.fullname || "Deleted User / Unknown";

        // Count votes safely
        const votes = election.votes.filter(
          v => v.role === role && v.candidate?.toString() === candidateId.toString()
        ).length;

        return {
          candidateId: candidateId.toString(),
          fullname,
          email: c.user?.email || null,
          image: c.image || null,
          Department: c.user?.Department || null,
          votes,
          semester: c.user?.semester || null
        };
      });
    }

    res.status(200).json({
      success: true,
      electionId: election._id,
      title: election.title,
      societyName: election.societyId?.name || null, // ✅ ADD THIS

      status: election.status,
      results,
    });
    console.log("Final Results Sent:", {
      electionId: election._id,
      title: election.title,
      status: election.status,
      societyName: election.societyId?.name || null, // ✅ ADD THIS
      results,
    });
  } catch (err) {
    console.error("Final Results Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};




module.exports = {
  createElection,
  openApplications,
  getUserElections,
  getSocietyElections,
  getElections,
  getElectionById,
  assignSocietyRolesFromElection,
  scheduleElection,
  getLiveElectionResults,
  getFinalResults,
  patchManagerElection,
};

