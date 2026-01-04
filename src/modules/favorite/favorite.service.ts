import { Types } from "mongoose";
import { UserModel } from "../../models/user.model";
import { MovieModel } from "../../models/movie.model";
import { FavoriteModel } from "../../models/favorite.schema";

interface IFavoriteService {
  addFavorite(userId: string, movieId: string): Promise<any>;
  removeFavorite(userId: string, movieId: string): Promise<any>;
  getUserFavorites(userId: string, page?: number, limit?: number): Promise<any>;
  checkIfFavorite(userId: string, movieId: string): Promise<boolean>;
  getFavoriteCount(movieId: string): Promise<number>;
  getMostFavoritedMovies(
    limit?: number,
    period?: "day" | "week" | "month" | "year"
  ): Promise<any>;
}

class FavoriteService implements IFavoriteService {
  // Thêm phim vào danh sách yêu thích
  async addFavorite(userId: string, movieId: string): Promise<any> {
    try {
      // Kiểm tra user tồn tại
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Kiểm tra movie tồn tại và đã publish
      const movie = await MovieModel.findById(movieId);
      if (!movie) {
        throw new Error("Movie not found");
      }

      if (!movie.isPublished) {
        throw new Error("Movie is not published");
      }

      // Kiểm tra đã favorite chưa
      const existingFavorite = await FavoriteModel.findOne({
        userId: new Types.ObjectId(userId),
        movieId: new Types.ObjectId(movieId),
      });

      if (existingFavorite) {
        throw new Error("Movie already in favorites");
      }

      // Tạo favorite mới
      const favorite = await FavoriteModel.create({
        userId: new Types.ObjectId(userId),
        movieId: new Types.ObjectId(movieId),
      });

      // Cập nhật số lượt favorite trong MovieModel
      await MovieModel.findByIdAndUpdate(movieId, {
        $inc: { favorites: 1 },
      });

      // Cập nhật số lượt favorite trong UserModel
      await UserModel.findByIdAndUpdate(userId, {
        $inc: { "stats.favorites": 1 },
      });

      return {
        success: true,
        message: "Đã thêm vào danh sách yêu thích",
        data: favorite,
      };
    } catch (error: any) {
      console.error("Error adding favorite:", error);
      throw error;
    }
  }

  // Xóa phim khỏi danh sách yêu thích
  async removeFavorite(userId: string, movieId: string): Promise<any> {
    try {
      const favorite = await FavoriteModel.findOneAndDelete({
        userId: new Types.ObjectId(userId),
        movieId: new Types.ObjectId(movieId),
      });

      if (!favorite) {
        throw new Error("Favorite not found");
      }

      // Giảm số lượt favorite trong MovieModel
      await MovieModel.findByIdAndUpdate(movieId, {
        $inc: { favorites: -1 },
      });

      // Giảm số lượt favorite trong UserModel
      await UserModel.findByIdAndUpdate(userId, {
        $inc: { "stats.favorites": -1 },
      });

      return {
        success: true,
        message: "Đã xóa khỏi danh sách yêu thích",
        data: favorite,
      };
    } catch (error: any) {
      console.error("Error removing favorite:", error);
      throw error;
    }
  }

  // Lấy danh sách phim yêu thích của user
  async getUserFavorites(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    try {
      const skip = (page - 1) * limit;

      // Lấy tổng số favorite
      const total = await FavoriteModel.countDocuments({
        userId: new Types.ObjectId(userId),
      });

      // Lấy danh sách favorite với thông tin movie
      const favorites = await FavoriteModel.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
        {
          $lookup: {
            from: "movies",
            localField: "movieId",
            foreignField: "_id",
            as: "movie",
          },
        },
        {
          $unwind: "$movie",
        },
        {
          $match: {
            "movie.isPublished": true,
          },
        },
        {
          $project: {
            _id: 1,
            movieId: "$movie._id",
            title: "$movie.title",
            thumbnail: "$movie.thumbnail",
            poster: "$movie.poster",
            banner: "$movie.banner",
            type: "$movie.type",
            slug: "$movie.slug",
            genres: "$movie.genres",
            year: "$movie.year",
            country: "$movie.country",
            ratingAvg: "$movie.ratingAvg",
            totalViews: "$movie.totalViews",
            favorites: "$movie.favorites",
            addedAt: "$createdAt",
          },
        },
      ]);

      // Populate genres
      const populatedFavorites = await MovieModel.populate(favorites, {
        path: "genres",
        select: "name slug",
      });

      return {
        success: true,
        data: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          favorites: populatedFavorites,
        },
      };
    } catch (error: any) {
      console.error("Error getting user favorites:", error);
      throw error;
    }
  }

  // Kiểm tra xem phim có trong danh sách yêu thích không
  async checkIfFavorite(userId: string, movieId: string): Promise<boolean> {
    try {
      const favorite = await FavoriteModel.findOne({
        userId: new Types.ObjectId(userId),
        movieId: new Types.ObjectId(movieId),
      });

      return !!favorite;
    } catch (error: any) {
      console.error("Error checking favorite:", error);
      throw error;
    }
  }

  // Đếm số lượt favorite của một phim
  async getFavoriteCount(movieId: string): Promise<number> {
    try {
      const count = await FavoriteModel.countDocuments({
        movieId: new Types.ObjectId(movieId),
      });

      return count;
    } catch (error: any) {
      console.error("Error getting favorite count:", error);
      throw error;
    }
  }

  // Lấy danh sách phim được yêu thích nhiều nhất
  async getMostFavoritedMovies(
    limit: number = 10,
    period?: "day" | "week" | "month" | "year"
  ): Promise<any> {
    try {
      let matchStage: any = {};

      if (period) {
        const now = new Date();
        let startDate = new Date();

        switch (period) {
          case "day":
            startDate.setDate(now.getDate() - 1);
            break;
          case "week":
            startDate.setDate(now.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(now.getMonth() - 1);
            break;
          case "year":
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }

        matchStage.createdAt = { $gte: startDate };
      }

      const mostFavorited = await FavoriteModel.aggregate([
        {
          $match: matchStage,
        },
        {
          $group: {
            _id: "$movieId",
            count: { $sum: 1 },
            lastAdded: { $max: "$createdAt" },
          },
        },
        {
          $sort: { count: -1, lastAdded: -1 },
        },
        {
          $limit: limit,
        },
        {
          $lookup: {
            from: "movies",
            localField: "_id",
            foreignField: "_id",
            as: "movie",
          },
        },
        {
          $unwind: "$movie",
        },
        {
          $match: {
            "movie.isPublished": true,
          },
        },
        {
          $project: {
            movieId: "$_id",
            title: "$movie.title",
            thumbnail: "$movie.thumbnail",
            poster: "$movie.poster",
            type: "$movie.type",
            slug: "$movie.slug",
            genres: "$movie.genres",
            ratingAvg: "$movie.ratingAvg",
            totalViews: "$movie.totalViews",
            favorites: "$movie.favorites",
            favoriteCount: "$count",
            lastAdded: 1,
          },
        },
      ]);

      // Populate genres
      const populatedResults = await MovieModel.populate(mostFavorited, {
        path: "genres",
        select: "name slug",
      });

      return {
        success: true,
        data: populatedResults,
      };
    } catch (error: any) {
      console.error("Error getting most favorited movies:", error);
      throw error;
    }
  }

  // Lấy danh sách user đã favorite một phim
  async getUsersWhoFavorited(
    movieId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    try {
      const skip = (page - 1) * limit;

      const total = await FavoriteModel.countDocuments({
        movieId: new Types.ObjectId(movieId),
      });

      const favorites = await FavoriteModel.find({
        movieId: new Types.ObjectId(movieId),
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "userId",
          select: "displayName avatar email role level points stats",
        })
        .lean();

      return {
        success: true,
        data: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          users: favorites.map((f) => f.userId),
        },
      };
    } catch (error: any) {
      console.error("Error getting users who favorited:", error);
      throw error;
    }
  }

  // Lấy số liệu thống kê về favorite
  async getFavoriteStats(userId?: string): Promise<any> {
    try {
      const pipeline: any[] = [
        {
          $group: {
            _id: null,
            totalFavorites: { $sum: 1 },
            uniqueMovies: { $addToSet: "$movieId" },
            uniqueUsers: { $addToSet: "$userId" },
          },
        },
        {
          $project: {
            totalFavorites: 1,
            uniqueMovieCount: { $size: "$uniqueMovies" },
            uniqueUserCount: { $size: "$uniqueUsers" },
            avgFavoritesPerUser: {
              $cond: [
                { $eq: [{ $size: "$uniqueUsers" }, 0] },
                0,
                { $divide: ["$totalFavorites", { $size: "$uniqueUsers" }] },
              ],
            },
          },
        },
      ];

      if (userId) {
        pipeline.unshift({
          $match: {
            userId: new Types.ObjectId(userId),
          },
        });
      }

      const stats = await FavoriteModel.aggregate(pipeline);

      return {
        success: true,
        data: stats[0] || {
          totalFavorites: 0,
          uniqueMovieCount: 0,
          uniqueUserCount: 0,
          avgFavoritesPerUser: 0,
        },
      };
    } catch (error: any) {
      console.error("Error getting favorite stats:", error);
      throw error;
    }
  }
}

export default new FavoriteService();
