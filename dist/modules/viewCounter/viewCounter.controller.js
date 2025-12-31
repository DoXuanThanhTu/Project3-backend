"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopMovies = exports.getMovieTotalViews = exports.getStatistics = exports.incrementView = void 0;
const viewCounter_service_1 = __importDefault(require("./viewCounter.service"));
const incrementView = async (req, res) => {
    try {
        const { movieId, episodeId, sessionId, watchDuration, viewType, ipAddress, userAgent, } = req.body;
        if (!movieId) {
            return res.status(400).json({
                success: false,
                message: "movieId là bắt buộc",
            });
        }
        // Kiểm tra IP để tránh spam (có thể thêm rate limiting)
        const clientIp = req.ip || ipAddress;
        await viewCounter_service_1.default.incrementView(movieId, episodeId, sessionId, {
            watchDuration,
            viewType,
            ipAddress: clientIp,
            userAgent: userAgent || req.get("User-Agent"),
        });
        // Lấy tổng view hiện tại
        const totalViews = await viewCounter_service_1.default.getTotalViewsByMovie(movieId);
        res.json({
            success: true,
            message: "View đã được cập nhật",
            data: { totalViews },
        });
    }
    catch (error) {
        console.error("Error in incrementView:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Lỗi khi cập nhật view",
        });
    }
};
exports.incrementView = incrementView;
const getStatistics = async (req, res) => {
    try {
        const { movieId, episodeId, from, to, groupBy, viewType } = req.query;
        const stats = await viewCounter_service_1.default.getStatistics({
            movieId: movieId,
            episodeId: episodeId,
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
            groupBy: groupBy,
            viewType: viewType,
        });
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        console.error("Error in getStatistics:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Lỗi khi lấy thống kê",
        });
    }
};
exports.getStatistics = getStatistics;
const getMovieTotalViews = async (req, res) => {
    try {
        const { movieId } = req.params;
        if (!movieId) {
            return res.status(400).json({
                success: false,
                message: "Thiếu movieId",
            });
        }
        const totalViews = await viewCounter_service_1.default.getTotalViewsByMovie(movieId);
        res.json({
            success: true,
            data: {
                movieId,
                totalViews,
            },
        });
    }
    catch (error) {
        console.error("Error in getMovieTotalViews:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Lỗi khi lấy tổng view",
        });
    }
};
exports.getMovieTotalViews = getMovieTotalViews;
const getTopMovies = async (req, res) => {
    try {
        const { limit = "10", period } = req.query;
        const topMovies = await viewCounter_service_1.default.getTopMovies(parseInt(limit), period);
        res.json({
            success: true,
            data: topMovies,
        });
    }
    catch (error) {
        console.error("Error in getTopMovies:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Lỗi khi lấy top movies",
        });
    }
};
exports.getTopMovies = getTopMovies;
