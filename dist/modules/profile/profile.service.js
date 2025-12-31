"use strict";
// services/profile.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const favorite_schema_1 = require("../../models/favorite.schema");
const review_model_1 = require("../../models/review.model");
const user_model_1 = require("../../models/user.model");
const watchHistory_model_1 = require("../../models/watchHistory.model");
class ProfileService {
    // User Profile Services
    static async getUserProfile(userId) {
        return await user_model_1.UserModel.findById(userId).select("-password").lean();
    }
    static async updateUserProfile(userId, updateData) {
        const user = await user_model_1.UserModel.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true }).select("-password");
        return user;
    }
    static async updateUserPreferences(userId, preferences) {
        const user = await user_model_1.UserModel.findByIdAndUpdate(userId, { $set: { preferences } }, { new: true }).select("-password");
        return user?.preferences;
    }
    static async getUserStats(userId) {
        const user = await user_model_1.UserModel.findById(userId)
            .select("stats level points")
            .lean();
        if (!user)
            return null;
        const watchHistoryStats = await watchHistory_model_1.WatchHistoryModel.aggregate([
            { $match: { userId: user._id } },
            {
                $group: {
                    _id: null,
                    totalWatched: { $sum: 1 },
                    totalHours: { $sum: { $divide: ["$duration", 60] } },
                },
            },
        ]);
        return {
            stats: {
                ...user.stats,
                totalWatched: watchHistoryStats[0]?.totalWatched || user.stats?.totalWatched || 0,
                totalHours: Math.round(watchHistoryStats[0]?.totalHours || user.stats?.totalHours || 0),
            },
            level: user.level,
            points: user.points,
        };
    }
    static async addUserAchievement(userId, achievement) {
        const user = await user_model_1.UserModel.findById(userId);
        if (!user)
            return null;
        const exists = user.achievements?.some((a) => a.name === achievement.name);
        if (exists)
            throw new Error("Achievement already exists");
        const updatedUser = await user_model_1.UserModel.findByIdAndUpdate(userId, {
            $push: {
                achievements: {
                    ...achievement,
                    achievedAt: new Date(),
                },
            },
        }, { new: true }).select("-password");
        return updatedUser?.achievements;
    }
    // Watch History Services
    static async getWatchHistory(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [history, total] = await Promise.all([
            watchHistory_model_1.WatchHistoryModel.find({ userId })
                .sort({ watchedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            watchHistory_model_1.WatchHistoryModel.countDocuments({ userId }),
        ]);
        return {
            data: history,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    static async addOrUpdateWatchHistory(userId, historyData) {
        const existing = await watchHistory_model_1.WatchHistoryModel.findOne({
            userId,
            "movie.id": historyData.movie.id,
        });
        if (existing) {
            const updated = await watchHistory_model_1.WatchHistoryModel.findOneAndUpdate({ _id: existing._id }, {
                $set: {
                    progress: historyData.progress,
                    watchedAt: new Date(),
                },
            }, { new: true });
            return updated;
        }
        const history = await watchHistory_model_1.WatchHistoryModel.create({
            userId,
            ...historyData,
            watchedAt: new Date(),
        });
        await user_model_1.UserModel.findByIdAndUpdate(userId, {
            $inc: {
                "stats.totalWatched": 1,
                "stats.totalHours": Math.ceil(historyData.duration / 60),
            },
        });
        return history;
    }
    // Favorite Services
    static async getFavorites(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [favorites, total] = await Promise.all([
            favorite_schema_1.FavoriteModel.find({ userId })
                .sort({ addedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            favorite_schema_1.FavoriteModel.countDocuments({ userId }),
        ]);
        return {
            data: favorites,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    static async toggleFavorite(userId, favoriteData) {
        const existing = await favorite_schema_1.FavoriteModel.findOne({
            userId,
            movieId: favoriteData.movieId,
        });
        if (existing) {
            await favorite_schema_1.FavoriteModel.deleteOne({ _id: existing._id });
            await user_model_1.UserModel.findByIdAndUpdate(userId, {
                $inc: { "stats.favorites": -1 },
            });
            return { isFavorite: false, message: "Removed from favorites" };
        }
        const favorite = await favorite_schema_1.FavoriteModel.create({
            userId,
            ...favoriteData,
            addedAt: new Date(),
        });
        await user_model_1.UserModel.findByIdAndUpdate(userId, {
            $inc: { "stats.favorites": 1 },
        });
        return { isFavorite: true, favorite, message: "Added to favorites" };
    }
    // Review Services
    static async getReviews(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [reviews, total] = await Promise.all([
            review_model_1.ReviewModel.find({ userId })
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            review_model_1.ReviewModel.countDocuments({ userId }),
        ]);
        return {
            data: reviews,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    static async createOrUpdateReview(userId, reviewData) {
        const existing = await review_model_1.ReviewModel.findOne({
            userId,
            movieId: reviewData.movieId,
        });
        if (existing) {
            const review = await review_model_1.ReviewModel.findOneAndUpdate({ _id: existing._id }, {
                $set: {
                    rating: reviewData.rating,
                    comment: reviewData.comment,
                    date: new Date(),
                },
            }, { new: true });
            return { review, isNew: false };
        }
        const review = await review_model_1.ReviewModel.create({
            userId,
            ...reviewData,
            date: new Date(),
        });
        await user_model_1.UserModel.findByIdAndUpdate(userId, {
            $inc: { "stats.reviews": 1 },
        });
        return { review, isNew: true };
    }
    static async deleteReview(userId, reviewId) {
        const review = await review_model_1.ReviewModel.findOneAndDelete({
            _id: reviewId,
            userId,
        });
        if (!review)
            return null;
        await user_model_1.UserModel.findByIdAndUpdate(userId, {
            $inc: { "stats.reviews": -1 },
        });
        return review;
    }
}
exports.ProfileService = ProfileService;
