import { Types } from "mongoose";
import { UserModel } from "../../models/user.model";
import { MovieModel } from "../../models/movie.model";
import { WatchHistoryModel } from "../../models/watchHistory.model";
import { EpisodeModel } from "../../models/episode.model";

interface IWatchHistoryService {
  addOrUpdateWatchHistory(
    userId: string,
    movieId: string,
    episodeId: string,
    data?: {
      currentTime?: number;
      duration?: number;
      watchDuration?: number;
      percentage?: number;
    }
  ): Promise<any>;

  getUserWatchHistory(
    userId: string,
    options?: {
      page?: number;
      limit?: number;
      sortBy?: "updatedAt" | "createdAt" | "lastWatchedAt";
      sortOrder?: "asc" | "desc";
      movieType?: string;
      genre?: string;
      fromDate?: Date;
      toDate?: Date;
    }
  ): Promise<any>;

  getRecentWatchHistory(userId: string, limit?: number): Promise<any>;

  getWatchHistoryByMovie(userId: string, movieId: string): Promise<any>;

  removeFromHistory(userId: string, watchHistoryId: string): Promise<any>;

  clearUserHistory(userId: string): Promise<any>;

  getHistoryStats(userId: string): Promise<any>;

  getContinueWatching(userId: string, limit?: number): Promise<any>;

  getMostWatchedGenres(userId: string): Promise<any>;

  getWatchProgress(
    userId: string,
    movieId: string,
    episodeId?: string
  ): Promise<any>;
}

class WatchHistoryService implements IWatchHistoryService {
  // Thêm hoặc cập nhật lịch sử xem
  async addOrUpdateWatchHistory(
    userId: string,
    movieId: string,
    episodeId: string,
    data: {
      currentTime?: number;
      duration?: number;
      watchDuration?: number;
      percentage?: number;
    } = {}
  ): Promise<any> {
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

      // Kiểm tra episode tồn tại (nếu có)
      let episode = null;
      if (episodeId) {
        episode = await EpisodeModel.findById(episodeId);
        if (!episode) {
          throw new Error("Episode not found");
        }
      }

      // Tính toán phần trăm đã xem
      let watchedPercentage = data.percentage;
      if (
        data.currentTime !== undefined &&
        data.duration !== undefined &&
        data.duration > 0
      ) {
        watchedPercentage = (data.currentTime / data.duration) * 100;
      }

      // Kiểm tra xem đã có lịch sử xem cho movie này chưa
      const existingHistory = await WatchHistoryModel.findOne({
        userId: new Types.ObjectId(userId),
        movieId: new Types.ObjectId(movieId),
      } as any);

      if (existingHistory) {
        // Cập nhật lịch sử xem
        const updatedHistory = await WatchHistoryModel.findOneAndUpdate(
          {
            userId: new Types.ObjectId(userId),
            movieId: new Types.ObjectId(movieId),
          } as any,
          {
            $set: {
              episodeId: episodeId
                ? new Types.ObjectId(episodeId)
                : existingHistory.episodeId,
              duration: data.duration || existingHistory.duration || 0,
              lastWatchedAt: new Date(),
            },
            $inc: { watchCount: 1 },
          },
          { new: true, upsert: false }
        );

        // Cập nhật thống kê user
        await UserModel.findByIdAndUpdate(userId, {
          $inc: { "stats.totalWatched": 1 },
        });

        return {
          success: true,
          message: "Đã cập nhật lịch sử xem",
          data: updatedHistory,
          action: "updated",
        };
      } else {
        // Tạo lịch sử xem mới
        const newHistory = await WatchHistoryModel.create({
          userId: new Types.ObjectId(userId),
          movieId: new Types.ObjectId(movieId),
          episodeId: episodeId ? new Types.ObjectId(episodeId) : undefined,
          currentTime: data.currentTime || 0,
          duration: data.duration || 0,
          watchDuration: data.watchDuration || 0,
          watchedPercentage: watchedPercentage || 0,
          lastWatchedAt: new Date(),
          watchCount: 1,
        });

        // Cập nhật thống kê user
        await UserModel.findByIdAndUpdate(userId, {
          $inc: {
            "stats.totalWatched": 1,
            "stats.totalHours": data.watchDuration
              ? data.watchDuration / 3600
              : 0,
          },
        });

        return {
          success: true,
          message: "Đã thêm vào lịch sử xem",
          data: newHistory,
          action: "created",
        };
      }
    } catch (error: any) {
      console.error("Error adding/updating watch history:", error);
      throw error;
    }
  }

  // Lấy lịch sử xem của user
  async getUserWatchHistory(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      sortBy?: "updatedAt" | "createdAt" | "lastWatchedAt";
      sortOrder?: "asc" | "desc";
      movieType?: string;
      genre?: string;
      fromDate?: Date;
      toDate?: Date;
    } = {}
  ): Promise<any> {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = "lastWatchedAt",
        sortOrder = "desc",
        movieType,
        genre,
        fromDate,
        toDate,
      } = options;

      const skip = (page - 1) * limit;

      // Xây dựng query
      const query: any = { userId: new Types.ObjectId(userId) };

      if (fromDate || toDate) {
        query.lastWatchedAt = {};
        if (fromDate) query.lastWatchedAt.$gte = fromDate;
        if (toDate) query.lastWatchedAt.$lte = toDate;
      }

      // Xây dựng aggregation pipeline
      const pipeline: any[] = [
        { $match: query },
        {
          $lookup: {
            from: "movies",
            localField: "movieId",
            foreignField: "_id",
            as: "movie",
          },
        },
        { $unwind: "$movie" },
        {
          $match: {
            "movie.isPublished": true,
          },
        },
      ];

      // Thêm điều kiện lọc theo movie type
      if (movieType) {
        pipeline.push({
          $match: {
            "movie.type": movieType,
          },
        });
      }

      // Thêm điều kiện lọc theo genre
      if (genre) {
        pipeline.push({
          $lookup: {
            from: "genres",
            localField: "movie.genres",
            foreignField: "_id",
            as: "movieGenres",
          },
        });
        pipeline.push({
          $match: {
            "movieGenres._id": new Types.ObjectId(genre),
          },
        });
      }

      // Thêm sort và pagination
      pipeline.push(
        { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } },
        { $skip: skip },
        { $limit: limit }
      );

      // Project kết quả cuối cùng
      pipeline.push({
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
          totalEpisodes: "$movie.totalEpisodes",
          currentEpisode: "$movie.currentEpisode",
          episodeId: "$episodeId",
          currentTime: "$currentTime",
          duration: "$duration",
          watchDuration: "$watchDuration",
          watchedPercentage: "$watchedPercentage",
          lastWatchedAt: "$lastWatchedAt",
          watchCount: "$watchCount",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
        },
      });

      // Thực hiện aggregation để lấy data
      const history = await WatchHistoryModel.aggregate(pipeline);

      // Lấy tổng số bản ghi (có điều kiện lọc)
      const countPipeline = [...pipeline.slice(0, -4)]; // Bỏ sort, skip, limit, project
      countPipeline.push({ $count: "total" });
      const countResult = await WatchHistoryModel.aggregate(countPipeline);
      const total = countResult.length > 0 ? countResult[0].total : 0;

      // Populate genres và episode thông tin nếu có episodeId
      const historyWithEpisodes = await Promise.all(
        history.map(async (item) => {
          // Populate genres cho movie
          const populatedItem = await MovieModel.populate(item, {
            path: "genres",
            select: "name slug",
          });

          // Populate episode thông tin nếu có episodeId
          if (item.episodeId) {
            const episode = await EpisodeModel.findById(item.episodeId)
              .select("title number thumbnail duration")
              .lean();
            return { ...populatedItem, episode };
          }
          return populatedItem;
        })
      );

      return {
        success: true,
        data: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          history: historyWithEpisodes,
        },
      };
    } catch (error: any) {
      console.error("Error getting user watch history:", error);
      throw error;
    }
  }

  // Lấy lịch sử xem gần đây
  async getRecentWatchHistory(
    userId: string,
    limit: number = 10
  ): Promise<any> {
    try {
      const recentHistory = await WatchHistoryModel.aggregate([
        { $match: { userId: new Types.ObjectId(userId) } },
        { $sort: { lastWatchedAt: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: "movies",
            localField: "movieId",
            foreignField: "_id",
            as: "movie",
          },
        },
        { $unwind: "$movie" },
        {
          $match: {
            "movie.isPublished": true,
          },
        },
        {
          $lookup: {
            from: "episodes",
            localField: "episodeId",
            foreignField: "_id",
            as: "episode",
          },
        },
        { $unwind: { path: "$episode", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            movieId: "$movie._id",
            title: "$movie.title",
            thumbnail: "$movie.thumbnail",
            type: "$movie.type",
            slug: "$movie.slug",
            genres: "$movie.genres",
            episodeId: 1,
            episode: {
              title: "$episode.title",
              number: "$episode.number",
              thumbnail: "$episode.thumbnail",
            },
            currentTime: 1,
            duration: 1,
            watchedPercentage: 1,
            lastWatchedAt: 1,
          },
        },
      ]);

      // Populate genres
      const populatedHistory = await MovieModel.populate(recentHistory, {
        path: "genres",
        select: "name slug",
      });

      return {
        success: true,
        data: populatedHistory,
      };
    } catch (error: any) {
      console.error("Error getting recent watch history:", error);
      throw error;
    }
  }

  // Lấy lịch sử xem của một phim cụ thể
  async getWatchHistoryByMovie(userId: string, movieId: string): Promise<any> {
    try {
      const history = await WatchHistoryModel.findOne({
        userId: new Types.ObjectId(userId),
        movieId: new Types.ObjectId(movieId),
      } as any)
        .populate({
          path: "movieId",
          select: "title thumbnail type slug genres",
        })
        .populate({
          path: "episodeId",
          select: "title number thumbnail duration",
        })
        .lean();

      if (!history) {
        return {
          success: false,
          message: "No watch history found for this movie",
          data: null,
        };
      }

      return {
        success: true,
        data: history,
      };
    } catch (error: any) {
      console.error("Error getting watch history by movie:", error);
      throw error;
    }
  }

  // Xóa một mục khỏi lịch sử xem
  async removeFromHistory(
    userId: string,
    watchHistoryId: string
  ): Promise<any> {
    try {
      const deletedHistory = await WatchHistoryModel.findOneAndDelete({
        _id: new Types.ObjectId(watchHistoryId),
        userId: new Types.ObjectId(userId),
      } as any);

      if (!deletedHistory) {
        throw new Error("Watch history not found or access denied");
      }

      // Giảm thống kê user
      await UserModel.findByIdAndUpdate(userId, {
        $inc: { "stats.totalWatched": -1 },
      });

      return {
        success: true,
        message: "Đã xóa khỏi lịch sử xem",
        data: deletedHistory,
      };
    } catch (error: any) {
      console.error("Error removing from watch history:", error);
      throw error;
    }
  }

  // Xóa toàn bộ lịch sử xem của user
  async clearUserHistory(userId: string): Promise<any> {
    try {
      const result = await WatchHistoryModel.deleteMany({
        userId: new Types.ObjectId(userId),
      } as any);

      // Reset thống kê user
      await UserModel.findByIdAndUpdate(userId, {
        $set: { "stats.totalWatched": 0, "stats.totalHours": 0 },
      });

      return {
        success: true,
        message: "Đã xóa toàn bộ lịch sử xem",
        data: { deletedCount: result.deletedCount },
      };
    } catch (error: any) {
      console.error("Error clearing user watch history:", error);
      throw error;
    }
  }

  // Lấy thống kê lịch sử xem
  async getHistoryStats(userId: string): Promise<any> {
    try {
      const stats = await WatchHistoryModel.aggregate([
        { $match: { userId: new Types.ObjectId(userId) } },
        {
          $lookup: {
            from: "movies",
            localField: "movieId",
            foreignField: "_id",
            as: "movie",
          },
        },
        { $unwind: "$movie" },
        {
          $group: {
            _id: null,
            totalWatched: { $sum: 1 },
            totalDuration: { $sum: "$watchDuration" },
            uniqueMovies: { $addToSet: "$movieId" },
            totalGenres: { $addToSet: "$movie.genres" },
            byType: {
              $push: {
                type: "$movie.type",
                count: 1,
                duration: "$watchDuration",
              },
            },
            byMonth: {
              $push: {
                month: { $month: "$lastWatchedAt" },
                year: { $year: "$lastWatchedAt" },
                count: 1,
              },
            },
          },
        },
        {
          $project: {
            totalWatched: 1,
            totalHours: { $divide: ["$totalDuration", 3600] },
            uniqueMovieCount: { $size: "$uniqueMovies" },
            // Thống kê theo thể loại
            genreStats: {
              $map: {
                input: { $setUnion: "$totalGenres" },
                as: "genre",
                in: {
                  genreId: "$$genre",
                  count: {
                    $size: {
                      $filter: {
                        input: "$totalGenres",
                        as: "g",
                        cond: { $eq: ["$$g", "$$genre"] },
                      },
                    },
                  },
                },
              },
            },
            // Thống kê theo loại phim
            typeStats: {
              $reduce: {
                input: "$byType",
                initialValue: [],
                in: {
                  $concatArrays: [
                    "$$value",
                    [
                      {
                        type: "$$this.type",
                        count: "$$this.count",
                        totalDuration: "$$this.duration",
                      },
                    ],
                  ],
                },
              },
            },
            // Thống kê theo tháng
            monthlyStats: {
              $reduce: {
                input: "$byMonth",
                initialValue: [],
                in: {
                  $concatArrays: [
                    "$$value",
                    [
                      {
                        month: "$$this.month",
                        year: "$$this.year",
                        count: "$$this.count",
                      },
                    ],
                  ],
                },
              },
            },
          },
        },
      ]);

      // Lấy 10 phim xem gần đây nhất
      const recentWatched = await this.getRecentWatchHistory(userId, 10);

      // Lấy thể loại yêu thích
      const favoriteGenres = await this.getMostWatchedGenres(userId);

      return {
        success: true,
        data: {
          summary: stats[0] || {
            totalWatched: 0,
            totalHours: 0,
            uniqueMovieCount: 0,
          },
          recentWatched: recentWatched.data,
          favoriteGenres: favoriteGenres.data,
        },
      };
    } catch (error: any) {
      console.error("Error getting history stats:", error);
      throw error;
    }
  }

  // Lấy danh sách "Tiếp tục xem" (các phim đang xem dở)
  async getContinueWatching(userId: string, limit: number = 10): Promise<any> {
    try {
      const continueWatching = await WatchHistoryModel.aggregate([
        { $match: { userId: new Types.ObjectId(userId) } },
        // Chỉ lấy những phim chưa xem hết (dưới 90%)
        { $match: { watchedPercentage: { $lt: 90 } } },
        { $sort: { lastWatchedAt: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: "movies",
            localField: "movieId",
            foreignField: "_id",
            as: "movie",
          },
        },
        { $unwind: "$movie" },
        {
          $match: {
            "movie.isPublished": true,
          },
        },
        {
          $lookup: {
            from: "episodes",
            localField: "episodeId",
            foreignField: "_id",
            as: "episode",
          },
        },
        { $unwind: { path: "$episode", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            movieId: "$movie._id",
            title: "$movie.title",
            thumbnail: "$movie.thumbnail",
            poster: "$movie.poster",
            type: "$movie.type",
            slug: "$movie.slug",
            genres: "$movie.genres",
            episodeId: 1,
            episode: {
              title: "$episode.title",
              number: "$episode.number",
              thumbnail: "$episode.thumbnail",
            },
            currentTime: 1,
            duration: 1,
            watchedPercentage: 1,
            lastWatchedAt: 1,
            continueFrom: {
              $cond: [{ $gt: ["$currentTime", 0] }, "$currentTime", 0],
            },
          },
        },
      ]);

      // Populate genres
      const populatedResults = await MovieModel.populate(continueWatching, {
        path: "genres",
        select: "name slug",
      });

      return {
        success: true,
        data: populatedResults,
      };
    } catch (error: any) {
      console.error("Error getting continue watching:", error);
      throw error;
    }
  }

  // Lấy thể loại xem nhiều nhất
  async getMostWatchedGenres(userId: string): Promise<any> {
    try {
      const genreStats = await WatchHistoryModel.aggregate([
        { $match: { userId: new Types.ObjectId(userId) } },
        {
          $lookup: {
            from: "movies",
            localField: "movieId",
            foreignField: "_id",
            as: "movie",
          },
        },
        { $unwind: "$movie" },
        { $unwind: "$movie.genres" },
        {
          $group: {
            _id: "$movie.genres",
            watchCount: { $sum: 1 },
            totalDuration: { $sum: "$watchDuration" },
          },
        },
        { $sort: { watchCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "genres",
            localField: "_id",
            foreignField: "_id",
            as: "genreInfo",
          },
        },
        { $unwind: "$genreInfo" },
        {
          $project: {
            genreId: "$_id",
            genreName: "$genreInfo.name",
            genreSlug: "$genreInfo.slug",
            watchCount: 1,
            totalDuration: 1,
            averageDuration: { $divide: ["$totalDuration", "$watchCount"] },
          },
        },
      ]);

      return {
        success: true,
        data: genreStats,
      };
    } catch (error: any) {
      console.error("Error getting most watched genres:", error);
      throw error;
    }
  }

  // Lấy tiến độ xem của một phim/tập
  async getWatchProgress(
    userId: string,
    movieId: string,
    episodeId?: string
  ): Promise<any> {
    try {
      const query: any = {
        userId: new Types.ObjectId(userId),
        movieId: new Types.ObjectId(movieId),
      };

      if (episodeId) {
        query.episodeId = new Types.ObjectId(episodeId);
      }

      const progress = await WatchHistoryModel.findOne(query)
        .select("currentTime duration watchedPercentage lastWatchedAt")
        .lean();

      return {
        success: true,
        data: progress || {
          currentTime: 0,
          duration: 0,
          watchedPercentage: 0,
          lastWatchedAt: null,
        },
      };
    } catch (error: any) {
      console.error("Error getting watch progress:", error);
      throw error;
    }
  }
}

export default new WatchHistoryService();
