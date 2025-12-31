"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieFlagController = void 0;
const flag_service_1 = require("./flag.service");
const movieFlagService = new flag_service_1.MovieFlagService();
class MovieFlagController {
    // Admin: Thêm flag
    async addFlag(req, res) {
        try {
            const data = req.body;
            const movie = await movieFlagService.addAdminFlag(data);
            res.status(201).json({
                success: true,
                data: movie,
                message: "Flag added successfully",
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error,
            });
        }
    }
    // Admin: Xóa flag
    async removeFlag(req, res) {
        try {
            const { movieId, flagType } = req.params;
            await movieFlagService.removeAdminFlag(movieId, flagType);
            res.json({
                success: true,
                message: "Flag removed successfully",
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error,
            });
        }
    }
    // Admin: Cập nhật flag
    async updateFlag(req, res) {
        try {
            const { movieId } = req.params;
            const updates = req.body;
            const movie = await movieFlagService.updateAdminFlag(movieId, updates.type, updates);
            res.json({
                success: true,
                data: movie,
                message: "Flag updated successfully",
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error,
            });
        }
    }
    // Admin/System: Trigger tính toán tự động
    async calculateSystemFlags(req, res) {
        try {
            // Có thể thêm authentication/authorization cho endpoint này
            await movieFlagService.calculateAndAssignSystemFlags();
            res.json({
                success: true,
                message: "System flags calculated and assigned",
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error,
            });
        }
    }
    // Public: Lấy phim theo flag type
    async getMoviesByFlag(req, res) {
        try {
            const { flagType } = req.params;
            const { lang } = req.query;
            const { limit = "20", skip = "0", active = "true" } = req.query;
            const movies = await movieFlagService.getMoviesWithFlag(flagType, {
                limit: parseInt(limit),
                skip: parseInt(skip),
                onlyActive: active === "true",
                lang: lang,
            });
            res.json({
                success: true,
                data: movies,
                count: movies.length,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error,
            });
        }
    }
    // Public: Lấy active flags của một phim
    async getMovieFlags(req, res) {
        try {
            const { movieId } = req.params;
            const flags = await movieFlagService.getActiveFlags(movieId);
            res.json({
                success: true,
                data: flags,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error,
            });
        }
    }
}
exports.MovieFlagController = MovieFlagController;
