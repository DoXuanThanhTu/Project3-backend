import express from "express";
import cors from "cors";
import authRoute from "./modules/auth/auth.route";
import flagRoute from "./modules/flag/flag.route";
import userRoute from "./modules/user/user.route";
import { errorMiddleware } from "./middlewares/error.middleware";
import { globalRateLimit } from "./middlewares/rateLimit.middleware";
import movieRoute from "./modules/movie/movie.route";
import gerneRoute from "./modules/genre/genre.route";
import personRoute from "./modules/person/person.route";
import franchiseRoute from "./modules/franchise/franchise.route";
import commentRoute from "./modules/comment/comment.route";
import episodeRoute from "./modules/episode/episode.route";
import serverRoute from "./modules/server/server.route";
import rankRoute from "./modules/rank/rank.route";
import profileRoute from "./modules/profile/profile.route";

import { startFlagCronJobs } from "./cron/flagCron";

const app = express();
const allowedOrigins = [
  "http://localhost:8000",
  "http://localhost:3000",
  "https://movie-website-mytus.netlify.app/",
  "https://movie-website-mytus.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép request không có origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true); // ✅ Cho phép
      }

      return callback(new Error("Not allowed by CORS")); // ❌ Chặn
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(express.json());
app.use(globalRateLimit);

app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);
app.use("/api/flag", flagRoute);
app.use("/api/user", userRoute);
app.use("/api/movie", movieRoute);
app.use("/api/genre", gerneRoute);
app.use("/api/person", personRoute);
app.use("/api/franchise", franchiseRoute);
app.use("/api/comment", commentRoute);
app.use("/api/episode", episodeRoute);
app.use("/api/server", serverRoute);
app.use("/api/rank", rankRoute);

app.use("/health", (_, res) => {
  res.json({ success: true, message: "Server is healthy" });
});
// startFlagCronJobs();

app.use(errorMiddleware);

export default app;
