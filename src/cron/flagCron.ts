// src/cron/flagCron.ts
import cron, { CronJob } from "cron";
import { MovieFlagService } from "../modules/flag/flag.service";

const movieFlagService = new MovieFlagService();

// Chạy mỗi 1 giờ (vào phút 0)
const flagCronJob = new CronJob("0 * * * *", async () => {
  console.log("⏰ Running auto flag calculation cron job...");
  try {
    await movieFlagService.calculateAndAssignSystemFlags();
    console.log("✅ Auto flag calculation completed");
  } catch (error) {
    console.error("❌ Error in auto flag calculation:", error);
  }
});

export const startFlagCronJobs = () => {
  flagCronJob.start();
  console.log("🚀 Flag cron jobs started");
};
