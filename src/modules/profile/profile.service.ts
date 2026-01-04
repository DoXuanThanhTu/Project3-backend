// services/profile.service.ts

import { FavoriteModel } from "../../models/favorite.schema";
import { ReviewModel } from "../../models/review.model";
import { UserModel } from "../../models/user.model";
import { WatchHistoryModel } from "../../models/watchHistory.model";
import {
  IAchievement,
  IReview,
  IUserPreference,
  IWatchHistory,
} from "../../types/test.type";

export class ProfileService {
  static async getMe(userId: string) {
    return await UserModel.findById(userId).select("-password").lean();
  }

  static async getUserProfile(userId: string) {
    return await UserModel.findById(userId).select("-password").lean();
  }

  static async updateUserProfile(
    userId: string,
    updateData: Partial<{
      displayName: string;
      phone: string;
      avatar: string;
      coverImage: string;
    }>
  ) {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    return user;
  }

  static async updateUserPreferences(
    userId: string,
    preferences: IUserPreference
  ) {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { preferences } },
      { new: true }
    ).select("-password");

    return user?.preferences;
  }

  static async getUserStats(userId: string) {
    const user = await UserModel.findById(userId)
      .select("stats level points")
      .lean();

    if (!user) return null;

    const watchHistoryStats = await WatchHistoryModel.aggregate([
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
        totalWatched:
          watchHistoryStats[0]?.totalWatched || user.stats?.totalWatched || 0,
        totalHours: Math.round(
          watchHistoryStats[0]?.totalHours || user.stats?.totalHours || 0
        ),
      },
      level: user.level,
      points: user.points,
    };
  }

  static async addUserAchievement(
    userId: string,
    achievement: Omit<IAchievement, "_id" | "achievedAt">
  ) {
    const user = await UserModel.findById(userId);
    if (!user) return null;

    const exists = user.achievements?.some((a) => a.name === achievement.name);
    if (exists) throw new Error("Achievement already exists");

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        $push: {
          achievements: {
            ...achievement,
            achievedAt: new Date(),
          },
        },
      },
      { new: true }
    ).select("-password");

    return updatedUser?.achievements;
  }

  // Watch History Services
  static async getWatchHistory(
    userId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      WatchHistoryModel.find({ userId })
        .sort({ watchedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      WatchHistoryModel.countDocuments({ userId }),
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

  // static async addOrUpdateWatchHistory(
  //   userId: string,
  //   historyData: Omit<IWatchHistory, "_id" | "userId" | "watchedAt">
  // ) {
  //   const existing = await WatchHistoryModel.findOne({
  //     userId,
  //     "movie.id": historyData.movie.id,
  //   });

  //   if (existing) {
  //     const updated = await WatchHistoryModel.findOneAndUpdate(
  //       { _id: existing._id },
  //       {
  //         $set: {
  //           progress: historyData.progress,
  //           watchedAt: new Date(),
  //         },
  //       },
  //       { new: true }
  //     );
  //     return updated;
  //   }

  //   const history = await WatchHistoryModel.create({
  //     userId,
  //     ...historyData,
  //   });

  //   await UserModel.findByIdAndUpdate(userId, {
  //     $inc: {
  //       "stats.totalWatched": 1,
  //       "stats.totalHours": Math.ceil(historyData.duration / 60),
  //     },
  //   });

  //   return history;
  // }

  // Favorite Services
  static async getFavorites(
    userId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      FavoriteModel.find({ userId })
        .sort({ addedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FavoriteModel.countDocuments({ userId }),
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

  static async toggleFavorite(
    userId: string,
    favoriteData: { movieId: string; movie: any }
  ) {
    const existing = await FavoriteModel.findOne({
      userId,
      movieId: favoriteData.movieId,
    });

    if (existing) {
      await FavoriteModel.deleteOne({ _id: existing._id });
      await UserModel.findByIdAndUpdate(userId, {
        $inc: { "stats.favorites": -1 },
      });
      return { isFavorite: false, message: "Removed from favorites" };
    }

    const favorite = await FavoriteModel.create({
      userId,
      ...favoriteData,
    });

    await UserModel.findByIdAndUpdate(userId, {
      $inc: { "stats.favorites": 1 },
    });

    return { isFavorite: true, favorite, message: "Added to favorites" };
  }

  // Review Services
  static async getReviews(
    userId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      ReviewModel.find({ userId })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ReviewModel.countDocuments({ userId }),
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

  static async createOrUpdateReview(
    userId: string,
    reviewData: Omit<IReview, "_id" | "userId" | "date">
  ) {
    const existing = await ReviewModel.findOne({
      userId,
      movieId: reviewData.movieId,
    });

    if (existing) {
      const review = await ReviewModel.findOneAndUpdate(
        { _id: existing._id },
        {
          $set: {
            rating: reviewData.rating,
            comment: reviewData.comment,
            date: new Date(),
          },
        },
        { new: true }
      );
      return { review, isNew: false };
    }

    const review = await ReviewModel.create({
      userId,
      ...reviewData,
      date: new Date(),
    });

    await UserModel.findByIdAndUpdate(userId, {
      $inc: { "stats.reviews": 1 },
    });

    return { review, isNew: true };
  }

  static async deleteReview(userId: string, reviewId: string) {
    const review = await ReviewModel.findOneAndDelete({
      _id: reviewId,
      userId,
    });

    if (!review) return null;

    await UserModel.findByIdAndUpdate(userId, {
      $inc: { "stats.reviews": -1 },
    });

    return review;
  }
}
