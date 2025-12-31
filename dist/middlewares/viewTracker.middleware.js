"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackViewMiddleware = void 0;
const viewCounter_service_1 = __importDefault(require("../modules/viewCounter/viewCounter.service"));
const trackViewMiddleware = async (req, res, next) => {
    try {
        // Chỉ track các request GET đến movie/episode
        if (req.method === "GET") {
            const { movieId, episodeId } = req.params;
            if (movieId) {
                // Tạo sessionId từ IP + User-Agent
                const sessionId = `${req.ip}-${req.get("User-Agent")}`;
                // Gọi service để tăng view (async, không cần await)
                viewCounter_service_1.default
                    .incrementView(movieId, episodeId, sessionId, {
                    ipAddress: req.ip,
                    userAgent: req.get("User-Agent"),
                })
                    .catch((err) => console.error("Error tracking view:", err));
            }
        }
        next();
    }
    catch (error) {
        console.error("Error in trackViewMiddleware:", error);
        next();
    }
};
exports.trackViewMiddleware = trackViewMiddleware;
