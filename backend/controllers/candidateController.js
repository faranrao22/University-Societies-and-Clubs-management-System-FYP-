const Election = require("../models/Election");
const Society = require("../models/societyModel");
const applyCandidate = async (req, res) => {
  try {
    const { electionId } = req.params;
    const userId = req.user.id;
    const { role, cnic } = req.body; // get CNIC from body

    if (!role || !cnic || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Role, CNIC, and picture are required",
      });
    }

    // 1️⃣ Find election
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // 2️⃣ Check apply deadline
    if (new Date() > election.applyDeadline) {
      return res.status(403).json({
        success: false,
        message: "Apply deadline has passed",
      });
    }

    // 3️⃣ Check if user already applied in THIS election
    const alreadyAppliedInThisElection = election.candidates.find(
      (c) => c.user.toString() === userId
    );

    if (alreadyAppliedInThisElection) {
      return res.status(400).json({
        success: false,
        message: "You have already applied in this election",
      });
    }

    // 4️⃣ Check if user applied in ANY OTHER active election
    const alreadyAppliedElsewhere = await Election.findOne({
      _id: { $ne: electionId },
      "candidates.user": userId,
      status: { $in: ["ANNOUNCED", "LIVE"] },
    });

    if (alreadyAppliedElsewhere) {
      return res.status(403).json({
        success: false,
        message:
          "You are already a candidate in another election and cannot apply in parallel",
      });
    }

    // 5️⃣ Check role validity
    if (!election.roles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to apply for this role",
      });
    }

    // 6️⃣ Apply candidate with CNIC and picture
    election.candidates.push({
      user: userId,
      role,
      cnic,
      image: req.file.filename, // assume upload middleware sets req.file
      approved: false, // keep default
    });

    await election.save();

    res.status(200).json({
      success: true,
      data: election,
      message: "Application submitted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const applicationStatus = async (req, res) => {
  try {
    const { electionId, candidateId } = req.params;
    const { status } = req.body;  // Fix: get status from body properly

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    // Fix: Fetch the election first
    const election = await Election.findById(electionId);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found"
      });
    }

    const candidate = election.candidates.id(candidateId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found"
      });
    }

    if (candidate.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Candidate has already been approved"
      });
    }

    candidate.status = status;
    await election.save();  // Fix: save election, not Election

    res.status(200).json({
      success: true,
      data: candidate,
      message: "Candidate status updated successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
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
module.exports = {
  applyCandidate,
  finalizeCandidates,
  applicationStatus,
  getUserElectionApplications,
  getCandidateDetails,
  getElectionCandidatesForVoting
};