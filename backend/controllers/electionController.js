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
    const elections = await Election.find().sort({ createdAt: -1 });
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
}

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
    if (!election) return res.status(404).json({ success: false, message: "Election not found" });

    if (election.status !== "COMPLETED") {
      return res.status(403).json({ success: false, message: "Election must be completed to assign roles" });
    }

    // ✅ Check if roles are already assigned
    if (election.rolesAssigned) {
      return res.status(400).json({ success: false, message: "Roles have already been assigned for this election" });
    }

    const society = await Society.findById(election.societyId);
    if (!society) return res.status(404).json({ success: false, message: "Society not found" });

    // Assign roles based on votes
    for (const role of election.roles) {
      const candidatesForRole = election.candidates.filter(c => c.role === role);
      let maxVotes = -1;
      let winnerUserId = null;

      for (const candidate of candidatesForRole) {
        const votesCount = election.votes.filter(
          v => v.role === role && v.candidate.toString() === candidate.user.toString()
        ).length;

        if (votesCount > maxVotes) {
          maxVotes = votesCount;
          winnerUserId = candidate.user;
        }
      }

      if (winnerUserId) {
        const societyRole = society.roles.find(r => r.name === role);
        if (societyRole) societyRole.user = winnerUserId;
      }
    }

    // Mark election as roles assigned
    election.rolesAssigned = true;
    await election.save();
    await society.save();

    res.status(200).json({ success: true, message: "Roles assigned successfully", society });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
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
  scheduleElection

};

