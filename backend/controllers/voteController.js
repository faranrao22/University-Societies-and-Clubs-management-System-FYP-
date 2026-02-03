const Election = require("../models/Election");
const Society = require("../models/societyModel");
const castVote = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { role, candidateId } = req.body;
    const userId = req.user.id;

    const election = await Election.findById(electionId).populate("societyId");
    if (!election) {
      return res.status(404).json({ success: false, message: "Election not found" });
    }

    // ✅ Check if election is live
    const now = new Date();
    if (
      election.status !== "VOTING_LIVE" &&
      !(election.startDate && election.endDate && now >= election.startDate && now <= election.endDate)
    ) {
      return res.status(403).json({ success: false, message: "Election is not live" });
    }

    // 1. Eligibility Check
    if (election.votingEligibility === "MEMBERS_ONLY" &&
      !election.societyId.members.includes(userId)) {
      return res.status(403).json({ success: false, message: "Only members can vote" });
    }

    // 2. Check if already voted FOR THIS SPECIFIC ROLE
    const alreadyVotedForRole = election.votes.find(
      v => v.voter.toString() === userId.toString() && v.role === role
    );
    if (alreadyVotedForRole) {
      return res.status(400).json({
        success: false,
        message: `You have already cast a vote for the role: ${role}`
      });
    }

    // 3. Record vote
    election.votes.push({
      voter: userId,
      role: role,
      candidate: candidateId
    });

    await election.save();

    res.status(200).json({
      success: true,
      message: `Vote for ${role} recorded successfully`
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getElectionResult = async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findById(electionId)
      .populate("candidates.user", "fullname")
      .populate("votes.voter", "fullname");

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // You can still return results even if not completed
    const results = {};

    election.roles.forEach(role => {
      const candidatesForRole = election.candidates.filter(
        c => c.role === role
      );

      results[role] = candidatesForRole.map(candidate => {
        const votesCount = election.votes.filter(
          v => v.candidate.toString() === candidate.user._id.toString()
        ).length;

        return {
          candidateId: candidate.user.id,
          name: candidate.user.fullname,
          votes: votesCount,
        };
      });
    });

    res.status(200).json({
      success: true,
      data: results,
      election: {
        status: election.status, // <-- added status here
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
  castVote,
  getElectionResult
};