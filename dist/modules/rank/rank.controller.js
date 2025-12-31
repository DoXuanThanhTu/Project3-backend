"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankController = exports.RankController = void 0;
const rank_service_1 = require("./rank.service");
const rank_type_1 = require("../../types/rank.type");
const mongoose_1 = require("mongoose");
class RankController {
    /**
     * Lấy danh sách xếp hạng
     */
    async getRanks(req, res) {
        try {
            const { period = "weekly", type = "most_viewed", genre, country, year, limit = "20", page = "1", lang = "vi", } = req.query;
            const filter = {
                period: period,
                type: type,
                genre: genre ? new mongoose_1.Types.ObjectId(genre) : undefined,
                country: country,
                year: year ? parseInt(year) : undefined,
                limit: parseInt(limit),
                page: parseInt(page),
                lang: lang,
            };
            const result = await rank_service_1.rankService.getRanks(filter);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error("Error getting ranks:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    /**
     * Lấy xếp hạng phim xem nhiều nhất
     */
    async getMostViewed(req, res) {
        try {
            const filter = this.buildFilterFromQuery(req.query);
            filter.type = rank_type_1.RankType.MOST_VIEWED;
            const result = await rank_service_1.rankService.getRanks(filter);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error("Error getting most viewed ranks:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    /**
     * Lấy xếp hạng phim đánh giá cao nhất
     */
    async getTopRated(req, res) {
        try {
            const filter = this.buildFilterFromQuery(req.query);
            filter.type = rank_type_1.RankType.TOP_RATED;
            const result = await rank_service_1.rankService.getRanks(filter);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error("Error getting top rated ranks:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    /**
     * Lấy xếp hạng phim mới nhất
     */
    async getNewest(req, res) {
        try {
            const filter = this.buildFilterFromQuery(req.query);
            filter.type = rank_type_1.RankType.NEWEST;
            const result = await rank_service_1.rankService.getRanks(filter);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error("Error getting newest ranks:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    /**
     * Lấy xếp hạng phim trending
     */
    async getTrending(req, res) {
        try {
            const filter = this.buildFilterFromQuery(req.query);
            filter.type = rank_type_1.RankType.TRENDING;
            const result = await rank_service_1.rankService.getRanks(filter);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error("Error getting trending ranks:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    /**
     * Lấy rank của một phim cụ thể
     */
    async getMovieRank(req, res) {
        try {
            const { movieId } = req.params;
            const { type = "most_viewed", period = "weekly" } = req.query;
            const result = await rank_service_1.rankService.getMovieRank(movieId, type, period);
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Movie not found in rank",
                });
            }
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error("Error getting movie rank:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    /**
     * Helper: Build filter từ query parameters
     */
    buildFilterFromQuery(query) {
        const { period = "weekly", genre, country, year, limit = "20", page = "1", lang = "vi", } = query;
        return {
            period: period,
            genre: genre ? new mongoose_1.Types.ObjectId(genre) : undefined,
            country: country,
            year: year ? parseInt(year) : undefined,
            limit: parseInt(limit),
            page: parseInt(page),
            lang: lang,
        };
    }
}
exports.RankController = RankController;
exports.rankController = new RankController();
