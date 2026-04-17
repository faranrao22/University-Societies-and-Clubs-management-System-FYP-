const Election = require("../models/Election");
const Society = require("../models/societyModel");
const castVote = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { role, candidateId } = req.body;
    const userId = req.user.id;

    const election = await Election.findById(electionId).populate("societyId").populate("candidates.user", "fullname");
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

    // 1️⃣ Eligibility Check
    if (election.votingEligibility === "MEMBERS_ONLY" &&
      !election.societyId.members.includes(userId)) {
      return res.status(403).json({ success: false, message: "Only members can vote" });
    }

    // 2️⃣ Check if already voted FOR THIS ROLE
    const alreadyVotedForRole = election.votes.find(
      v => v.voter.toString() === userId.toString() && v.role === role
    );
    if (alreadyVotedForRole) {
      return res.status(400).json({
        success: false,
        message: `You have already cast a vote for the role: ${role}`
      });
    }

    // 3️⃣ Record vote
    election.votes.push({
      voter: userId,
      role: role,
      candidate: candidateId
    });

    await election.save();

    // 4️⃣ Emit updated results to all users in this election room
    const io = req.app.get("io");

    // Build updated results
    const updatedResults = {};
    for (const r of election.roles) {
      const candidatesForRole = election.candidates.filter(c => c.role === r);
      updatedResults[r] = candidatesForRole.map(c => {
        const votesCount = election.votes.filter(
          v => v.role === r && v.candidate.toString() === c.user._id.toString()
        ).length;
        return {
          candidateId: c.user._id,
          fullname: c.user.fullname,
          votes: votesCount,
        };
      });
    }

    // Emit to everyone in the election room
    io.to(election._id.toString()).emit("liveResultsUpdate", updatedResults);

    // 5️⃣ Send response
    res.status(200).json({
      success: true,
      message: `Vote for ${role} recorded successfully`,
      results: updatedResults // optional: return snapshot immediately
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