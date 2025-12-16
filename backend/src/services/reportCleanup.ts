import Report from "../models/Report";

/**
 * Cleanup service for auto-deleting resolved reports after 7 days
 */

const RESOLVED_REPORT_RETENTION_DAYS = 7;

/**
 * Delete reports that were resolved more than 7 days ago
 */
export const cleanupResolvedReports = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(
      sevenDaysAgo.getDate() - RESOLVED_REPORT_RETENTION_DAYS
    );

    const result = await Report.deleteMany({
      status: "resolved",
      resolvedAt: { $lt: sevenDaysAgo },
    });

    if (result.deletedCount > 0) {
      console.log(
        `[Report Cleanup] Deleted ${result.deletedCount} resolved reports older than ${RESOLVED_REPORT_RETENTION_DAYS} days`
      );
    }

    return result;
  } catch (error) {
    console.error(
      "[Report Cleanup] Error cleaning up resolved reports:",
      error
    );
    throw error;
  }
};

/**
 * Schedule automatic cleanup of resolved reports
 * Runs every 24 hours
 */
export const scheduleReportCleanup = () => {
  // Run cleanup immediately on server start
  cleanupResolvedReports().catch(console.error);

  // Schedule cleanup to run every 24 hours
  const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const intervalId = setInterval(() => {
    cleanupResolvedReports().catch(console.error);
  }, CLEANUP_INTERVAL);

  // Allow the interval to be cleared if needed
  return intervalId;
};
