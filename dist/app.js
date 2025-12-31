"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_route_1 = __importDefault(require("./modules/auth/auth.route"));
const flag_route_1 = __importDefault(require("./modules/flag/flag.route"));
const user_route_1 = __importDefault(require("./modules/user/user.route"));
const error_middleware_1 = require("./middlewares/error.middleware");
const rateLimit_middleware_1 = require("./middlewares/rateLimit.middleware");
const movie_route_1 = __importDefault(require("./modules/movie/movie.route"));
const genre_route_1 = __importDefault(require("./modules/genre/genre.route"));
const person_route_1 = __importDefault(require("./modules/person/person.route"));
const franchise_route_1 = __importDefault(require("./modules/franchise/franchise.route"));
const comment_route_1 = __importDefault(require("./modules/comment/comment.route"));
const episode_route_1 = __importDefault(require("./modules/episode/episode.route"));
const server_route_1 = __importDefault(require("./modules/server/server.route"));
const rank_route_1 = __importDefault(require("./modules/rank/rank.route"));
const profile_route_1 = __importDefault(require("./modules/profile/profile.route"));
const app = (0, express_1.default)();
const allowedOrigins = ["http://localhost:8000", "http://localhost:3000"];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Cho phép request không có origin (curl, Postman, server-to-server)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true); // ✅ Cho phép
        }
        return callback(new Error("Not allowed by CORS")); // ❌ Chặn
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(rateLimit_middleware_1.globalRateLimit);
app.use("/api/auth", auth_route_1.default);
app.use("/api/profile", profile_route_1.default);
app.use("/api/flag", flag_route_1.default);
app.use("/api/user", user_route_1.default);
app.use("/api/movie", movie_route_1.default);
app.use("/api/genre", genre_route_1.default);
app.use("/api/person", person_route_1.default);
app.use("/api/franchise", franchise_route_1.default);
app.use("/api/comment", comment_route_1.default);
app.use("/api/episode", episode_route_1.default);
app.use("/api/server", server_route_1.default);
app.use("/api/rank", rank_route_1.default);
app.use("/health", (_, res) => {
    res.json({ success: true, message: "Server is healthy" });
});
// startFlagCronJobs();
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
