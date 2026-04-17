const cron = require("node-cron");
const Election = require("../models/Election");

// Runs every minute
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    console.log("⏳ Running Election Cron...");

    // ================================
    // 1️⃣ CLOSE APPLICATIONS + CLEAN DATA
    // ================================
    const elections = await Election.find({
      status: "APPLICATIONS_OPEN",
      applyDeadline: { $lte: now },
    });

    for (const election of elections) {
      // ✅ Remove rejected + inDispute
      const beforeCount = election.candidates.length;

      election.candidates = election.candidates.filter(
        (c) => c.status === "approved"
      );

      const afterCount = election.candidates.length;

      // ✅ Update status ONLY
      election.status = "APPLICATIONS_CLOSED";

      await election.save();

      console.log(
        `📌 Closed election ${election._id} | Removed ${
          beforeCount - afterCount
        } candidates`
      );
    }

    // ================================
    // 2️⃣ START VOTING
    // ================================
    const started = await Election.updateMany(
      {
        startDate: { $lte: now },
        endDate: { $gt: now },
        status: "VOTING_SCHEDULED",
      },
      { status: "VOTING_LIVE" }
    );

    if (started.modifiedCount > 0) {
      console.log(`🟢 Voting started: ${started.modifiedCount}`);
    }

    // ================================
    // 3️⃣ COMPLETE ELECTION
    // ================================
    const completed = await Election.updateMany(
      {
        endDate: { $lte: now },
        status: "VOTING_LIVE",
      },
      { status: "COMPLETED" }
    );

    if (completed.modifiedCount > 0) {
      console.log(`🏁 Elections completed: ${completed.modifiedCount}`);
    }

    console.log("✅ Cron cycle done\n");

  } catch (error) {
    console.error("❌ Cron error:", error.message);
  }
});