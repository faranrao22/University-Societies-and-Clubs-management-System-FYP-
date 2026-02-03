const cron = require("node-cron");
const Election = require("../models/Election");

// Runs every minute
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    // Start elections automatically if startDate <= now < endDate and status is VOTING_SCHEDULED
    await Election.updateMany(
      {
        startDate: { $lte: now },
        endDate: { $gt: now },
        status: "VOTING_SCHEDULED",
      },
      { status: "VOTING_LIVE" }
    );

    // Complete elections automatically if endDate <= now and status is VOTING_LIVE
    await Election.updateMany(
      {
        endDate: { $lte: now },
        status: "VOTING_LIVE",
      },
      { status: "COMPLETED" }
    );

    console.log("Election status auto-updated");
  } catch (error) {
    console.error("Election cron error:", error.message);
  }
});
