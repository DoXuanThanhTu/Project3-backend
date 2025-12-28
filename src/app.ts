import express from "express";
import cors from "cors";
import authRoute from "./modules/auth/auth.route";
import profileRoute from "./modules/profile/profile.route";
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
const app = express();
app.use(cors());
app.use(express.json());
app.use(globalRateLimit);

app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);
app.use("/api/user", userRoute);
app.use("/api/movie", movieRoute);
app.use("/api/genre", gerneRoute);
app.use("/api/person", personRoute);
app.use("/api/franchise", franchiseRoute);
app.use("/api/comment", commentRoute);
app.use("/api/episode", episodeRoute);
app.use("/api/server", serverRoute);
app.use("/health", (_, res) => {
  res.json({ success: true, message: "Server is healthy" });
});

app.use(errorMiddleware);

export default app;
