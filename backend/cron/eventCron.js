const cron = require("node-cron");
const eventModel = require("../models/eventModel");

/**
 * Mark past events as completed and flip scheduled events to published once they start.
 * Runs every 5 minutes (lighter than election cron which runs every minute).
 */
cron.schedule("*/5 * * * *", async () => {
  try {
    const now = new Date();

    const completed = await eventModel.updateMany(
      {
        endDateTime: { $lt: now },
        status: { $nin: ["cancelled", "completed"] },
      },
      { $set: { status: "completed" } }
    );
    if (completed.modifiedCount > 0) {
      console.log(`[eventCron] Marked ${completed.modifiedCount} event(s) completed (end time passed).`);
    }

    const published = await eventModel.updateMany(
      {
        status: "scheduled",
        startDateTime: { $lte: now },
      },
      { $set: { status: "published" } }
    );
    if (published.modifiedCount > 0) {
      console.log(`[eventCron] Published ${published.modifiedCount} scheduled event(s) (start time reached).`);
    }
  } catch (err) {
    console.error("[eventCron]", err.message);
  }
});
