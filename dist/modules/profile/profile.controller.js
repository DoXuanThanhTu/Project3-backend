"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = void 0;
const profile_service_1 = require("./profile.service");
const http_error_1 = require("../../errors/http.error");
const role_type_1 = require("../../types/role.type");
class ProfileController {
    // Lấy profile user
    static async getUserProfile(req, res) {
        try {
            const { userId } = req.params;
            const user = await profile_service_1.ProfileService.getUserProfile(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json(user);
        }
        catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }
    // Cập nhật profile
    static async updateProfile(req, res) {
        try {
            const { userId } = req.params;
            if (userId === req.user?.userId || req.user?.role === role_type_1.Role.ADMIN) {
                const { displayName, phone, avatar, coverImage } = req.body;
                const updateData = {};
                if (displayName !== undefined)
                    updateData.displayName = displayName;
                if (phone !== undefined)
                    updateData.phone = phone;
                if (avatar !== undefined)
                    updateData.avatar = avatar;
                if (coverImage !== undefined)
                    updateData.coverImage = coverImage;
                const user = await profile_service_1.ProfileService.updateUserProfile(userId, updateData);
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                res.json(user);
            }
            throw new http_error_1.UnauthorizedError();
        }
        catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }
    // Cập nhật preferences
    static async updatePreferences(req, res) {
        try {
            const { userId } = req.params;
            if (userId === req.user?.userId || req.user?.role === role_type_1.Role.ADMIN) {
                const preferences = req.body;
                const result = await profile_service_1.ProfileService.updateUserPreferences(userId, preferences);
                if (!result) {
                    return res.status(404).json({ message: "User not found" });
                }
                res.json(result);
            }
            throw new http_error_1.UnauthorizedError();
        }
        catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }
    // Lấy lịch sử xem
    static async getWatchHistory(req, res) {
        try {
            const { userId } = req.params;
            if (userId === req.user?.userId || req.user?.role === role_type_1.Role.ADMIN) {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const result = await profile_service_1.ProfileService.getWatchHistory(userId, page, limit);
                res.json(result);
            }
            throw new http_error_1.UnauthorizedError();
        }
        catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }
    // Thêm/Xóa lịch sử xem
    static async addWatchHistory(req, res) {
        try {
            const { userId } = req.params;
            if (userId === req.user?.userId || req.user?.role === role_type_1.Role.ADMIN) {
                const historyData = req.body;
                const result = await profile_service_1.ProfileService.addOrUpdateWatchHistory(userId, historyData);
                res.status(201).json(result);
            }
            throw new http_error_1.UnauthorizedError();
        }
        catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }
    // Lấy danh sách yêu thích
    static async getFavorites(req, res) {
        try {
            const { userId } = req.params;
            if (userId === req.user?.userId || req.user?.role === role_type_1.Role.ADMIN) {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const result = await profile_service_1.ProfileService.getFavorites(userId, page, limit);
                res.json(result);
            }
            throw new http_error_1.UnauthorizedError();
        }
        catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }
    // Thêm/Xóa yêu thích
    static async toggleFavorite(req, res) {
        try {
            const { userId } = req.params;
            if (userId === req.user?.userId || req.user?.role === role_type_1.Role.ADMIN) {
                const favoriteData = req.body;
                const result = await profile_service_1.ProfileService.toggleFavorite(userId, favoriteData);
                res.status(result.isFavorite ? 201 : 200).json(result);
            }
            throw new http_error_1.UnauthorizedError();
        }
        catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }
    // Lấy danh sách reviews
    static async getReviews(req, res) {
        try {
            const { userId } = req.params;
            if (userId === req.user?.userId || req.user?.role === role_type_1.Role.ADMIN) {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const result = await profile_service_1.ProfileService.getReviews(userId, page, limit);
                res.json(result);
            }
            throw new http_error_1.UnauthorizedError();
        }
        catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }
    // Tạo/Update review
    static async createOrUpdateReview(req, res) {
        try {
            const { userId } = req.params;
            const reviewData = req.body;
            const result = await profile_service_1.ProfileService.createOrUpdateReview(userId, reviewData);
            res.status(result.isNew ? 201 : 200).json(result.review);
        }
        catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }
    // Xóa review
    static async deleteReview(req, res) {
        try {
            const { userId, reviewId } = req.params;
            if (userId === req.user?.userId || req.user?.role === role_type_1.Role.ADMIN) {
                const result = await profile_service_1.ProfileService.deleteReview(userId, reviewId);
                if (!result) {
                    return res.status(404).json({ message: "Review not found" });
                }
                res.json({ message: "Review deleted successfully" });
            }
            throw new http_error_1.UnauthorizedError();
        }
        catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }
    // Thêm achievement
    static async addAchievement(req, res) {
        try {
            const { userId } = req.params;
            if (userId === req.user?.userId || req.user?.role === role_type_1.Role.ADMIN) {
                const achievement = req.body;
                const result = await profile_service_1.ProfileService.addUserAchievement(userId, achievement);
                if (!result) {
                    return res.status(404).json({ message: "User not found" });
                }
                res.json(result);
            }
            throw new http_error_1.UnauthorizedError();
        }
        catch (error) {
            if (error.message === "Achievement already exists") {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: "Server error", error });
        }
    }
    // Lấy thống kê
    static async getStats(req, res) {
        try {
            const { userId } = req.params;
            const result = await profile_service_1.ProfileService.getUserStats(userId);
            if (!result) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }
}
exports.ProfileController = ProfileController;
