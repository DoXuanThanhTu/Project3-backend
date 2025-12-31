"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startFlagCronJobs = void 0;
// src/cron/flagCron.ts
const cron_1 = require("cron");
const flag_service_1 = require("../modules/flag/flag.service");
const movieFlagService = new flag_service_1.MovieFlagService();
// Chạy mỗi 6 giờ
const flagCronJob = new cron_1.CronJob("*/2 * * * *", async () => {
    console.log("⏰ Running auto flag calculation cron job...");
    try {
        await movieFlagService.calculateAndAssignSystemFlags();
        console.log("✅ Auto flag calculation completed");
    }
    catch (error) {
        console.error("❌ Error in auto flag calculation:", error);
    }
});
const startFlagCronJobs = () => {
    flagCronJob.start();
    console.log("🚀 Flag cron jobs started");
};
exports.startFlagCronJobs = startFlagCronJobs;
