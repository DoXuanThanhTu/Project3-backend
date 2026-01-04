// services/view.service.ts
import { Model, Types } from "mongoose";
import { MovieModel } from "../../models/movie.model";
import { ViewCounterModel } from "../../models/viewCounter.model";

interface IViewService {
  incrementView(
    movieId: string,
    options: {
      episodeId?: string;
      sessionId?: string;
      userId?: string;
      isUnique?: boolean;
      watchDuration?: number;
      viewType?: "movie" | "episode" | "trailer" | "preview";
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<void>;
  getStatistics(options: {
    movieId?: string;
    episodeId?: string;
    from?: Date;
    to?: Date;
    groupBy?: "day" | "week" | "month" | "year";
    viewType?: string;
  }): Promise<any[]>;
  getTopMovies(
    limit?: number,
    period?: "day" | "week" | "month" | "year"
  ): Promise<any[]>;
  getMovieStats(movieId: string): Promise<{
    totalViews: number;
    dailyViews: number;
    weeklyViews: number;
  }>;
  batchUpdateMovieStats(): Promise<void>;
}

class ViewService implements IViewService {
  private cache = new Map<string, number>();
  private sessionCache = new Map<
    string,
    { timestamp: number; movieId: string }
  >();
  private batchSize = 100;
  private updateInterval = 30000; // 30 seconds

  constructor() {
    // Auto batch update every 30 seconds
    setInterval(() => this.batchUpdateFromCache(), this.updateInterval);
    // Clean up old cache daily
    setInterval(() => this.cleanupOldCache(), 24 * 60 * 60 * 1000);
    // Update movie stats periodically
    setInterval(() => this.batchUpdateMovieStats(), 5 * 60 * 1000); // Every 5 minutes
  }

  async incrementView(
    movieId: string,
    options: {
      episodeId?: string;
      sessionId?: string;
      userId?: string;
      isUnique?: boolean;
      watchDuration?: number;
      viewType?: "movie" | "episode" | "trailer" | "preview";
      ipAddress?: string;
      userAgent?: string;
    } = {}
  ) {
    try {
      // Validate movie exists
      const movie = await MovieModel.findById(movieId);
      if (!movie) {
        console.error(`[VIEW] Movie ${movieId} not found`);
        return;
      }

      const dateKey = new Date().toISOString().split("T")[0];
      const viewType =
        options.viewType || (options.episodeId ? "episode" : "movie");

      // Check for unique view if sessionId provided
      if (options.isUnique !== false && options.sessionId) {
        const sessionKey = `${options.sessionId}:${movieId}:${
          options.episodeId || ""
        }`;

        // Check if session viewed in last 30 minutes
        if (this.hasRecentView(sessionKey)) {
          console.log(`[VIEW] Session already viewed recently, skipping`);
          return;
        }

        this.markSessionViewed(sessionKey, movieId);
      }

      // Create cache key
      const cacheKey = `${movieId}:${
        options.episodeId || ""
      }:${dateKey}:${viewType}`;

      // Increment count in cache
      const currentCount = this.cache.get(cacheKey) || 0;
      this.cache.set(cacheKey, currentCount + 1);

      // Update watch duration if provided
      if (options.watchDuration && options.watchDuration > 0) {
        const durationKey = `${cacheKey}:duration`;
        const currentDuration = this.cache.get(durationKey) || 0;
        this.cache.set(durationKey, currentDuration + options.watchDuration);
      }

      console.log(`[VIEW CACHE] ${cacheKey} = ${this.cache.get(cacheKey)}`);

      // Trigger batch update if cache is large enough
      if (this.cache.size >= this.batchSize) {
        await this.batchUpdateFromCache();
      }
    } catch (error) {
      console.error("Error incrementing view:", error);
    }
  }

  private hasRecentView(sessionKey: string): boolean {
    const sessionData = this.sessionCache.get(sessionKey);
    if (!sessionData) return false;

    // Check if viewed within last 30 minutes
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
    return sessionData.timestamp > thirtyMinutesAgo;
  }

  private markSessionViewed(sessionKey: string, movieId: string) {
    this.sessionCache.set(sessionKey, {
      timestamp: Date.now(),
      movieId,
    });

    // Auto remove after 30 minutes
    setTimeout(() => {
      this.sessionCache.delete(sessionKey);
    }, 30 * 60 * 1000);
  }

  async batchUpdateFromCache() {
    if (this.cache.size === 0) return;

    console.log(
      `[VIEW CACHE] Starting batch update with ${this.cache.size} items`
    );

    const updates: Promise<any>[] = [];
    const durationUpdates: Map<string, number> = new Map();

    for (const [key, count] of this.cache.entries()) {
      const [movieId, episodeId, dateStr, viewType] = key.split(":");

      if (!dateStr) continue;

      const date = new Date(dateStr);

      // Skip if count <= 0
      if (count <= 0) continue;

      // Handle duration updates
      if (key.endsWith(":duration")) {
        durationUpdates.set(key.replace(":duration", ""), count);
        continue;
      }

      const filter: any = {
        movieId: new Types.ObjectId(movieId),
        date,
        viewType: viewType || (episodeId ? "episode" : "movie"),
      };

      if (episodeId && episodeId !== "") {
        filter.episodeId = new Types.ObjectId(episodeId);
      } else {
        filter.episodeId = null;
      }
      updates.push(
        MovieModel.findByIdAndUpdate(movieId, { $inc: { views: count } })
      );
      updates.push(
        ViewCounterModel.findOneAndUpdate(
          filter,
          {
            $inc: { count },
            $setOnInsert: {
              movieId: new Types.ObjectId(movieId),
              episodeId: episodeId ? new Types.ObjectId(episodeId) : null,
              date,
              viewType: viewType || (episodeId ? "episode" : "movie"),
            },
          },
          { upsert: true, new: true }
        )
      );
    }

    // Handle duration updates
    for (const [key, duration] of durationUpdates.entries()) {
      const [movieId, episodeId, dateStr, viewType] = key.split(":");
      const date = new Date(dateStr);

      const filter: any = {
        movieId: new Types.ObjectId(movieId),
        date,
      };
      if (episodeId && episodeId !== "") {
        filter.episodeId = new Types.ObjectId(episodeId);
      }

      updates.push(
        ViewCounterModel.findOneAndUpdate(
          filter,
          { $inc: { watchDuration: duration } },
          { upsert: false }
        )
      );
    }

    try {
      await Promise.all(updates);
      console.log(`[VIEW CACHE] Batch update successful, clearing cache`);
      this.cache.clear();
    } catch (error) {
      console.error("Error in batch update:", error);
    }
  }

  async getMovieStats(movieId: string): Promise<{
    totalViews: number;
    dailyViews: number;
    weeklyViews: number;
  }> {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [dailyStats, weeklyStats, totalStats] = await Promise.all([
        // Daily views
        ViewCounterModel.aggregate([
          {
            $match: {
              movieId: new Types.ObjectId(movieId),
              date: { $gte: oneDayAgo },
              viewType: { $in: ["movie", "episode"] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$count" },
            },
          },
        ]),
        // Weekly views
        ViewCounterModel.aggregate([
          {
            $match: {
              movieId: new Types.ObjectId(movieId),
              date: { $gte: oneWeekAgo },
              viewType: { $in: ["movie", "episode"] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$count" },
            },
          },
        ]),
        // Total views
        ViewCounterModel.aggregate([
          {
            $match: {
              movieId: new Types.ObjectId(movieId),
              viewType: { $in: ["movie", "episode"] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$count" },
            },
          },
        ]),
      ]);

      // Calculate cache views
      let cacheDaily = 0;
      let cacheWeekly = 0;
      let cacheTotal = 0;

      for (const [key, count] of this.cache.entries()) {
        const [cachedMovieId] = key.split(":");
        if (cachedMovieId === movieId && !key.endsWith(":duration")) {
          cacheTotal += count;

          const [, , dateStr] = key.split(":");
          const cacheDate = new Date(dateStr);

          if (cacheDate >= oneDayAgo) {
            cacheDaily += count;
          }
          if (cacheDate >= oneWeekAgo) {
            cacheWeekly += count;
          }
        }
      }

      return {
        totalViews: (totalStats[0]?.total || 0) + cacheTotal,
        dailyViews: (dailyStats[0]?.total || 0) + cacheDaily,
        weeklyViews: (weeklyStats[0]?.total || 0) + cacheWeekly,
      };
    } catch (error) {
      console.error("Error getting movie stats:", error);
      return { totalViews: 0, dailyViews: 0, weeklyViews: 0 };
    }
  }

  async batchUpdateMovieStats(): Promise<void> {
    try {
      console.log("[VIEW] Updating movie stats batch...");

      // Get all movie IDs with recent views (last 7 days)
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const moviesWithRecentViews = await ViewCounterModel.aggregate([
        {
          $match: {
            date: { $gte: oneWeekAgo },
            viewType: { $in: ["movie", "episode"] },
          },
        },
        {
          $group: {
            _id: "$movieId",
          },
        },
      ]);

      const movieIds = moviesWithRecentViews.map((m) => m._id);

      // Update each movie's stats
      for (const movieId of movieIds) {
        try {
          const stats = await this.getMovieStats(movieId.toString());

          await MovieModel.findByIdAndUpdate(movieId, {
            $set: {
              totalViews: stats.totalViews,
              dailyViews: stats.dailyViews,
              weeklyViews: stats.weeklyViews,
              lastTrendingUpdate: new Date(),
            },
          });
        } catch (error) {
          console.error(`Error updating stats for movie ${movieId}:`, error);
        }
      }

      console.log(`[VIEW] Updated stats for ${movieIds.length} movies`);
    } catch (error) {
      console.error("Error in batchUpdateMovieStats:", error);
    }
  }

  async getStatistics(options: {
    movieId?: string;
    episodeId?: string;
    from?: Date;
    to?: Date;
    groupBy?: "day" | "week" | "month" | "year";
    viewType?: string;
  }) {
    const { movieId, episodeId, from, to, groupBy = "day", viewType } = options;

    const matchStage: any = {};

    if (movieId) matchStage.movieId = new Types.ObjectId(movieId);
    if (episodeId) matchStage.episodeId = new Types.ObjectId(episodeId);
    if (viewType) matchStage.viewType = viewType;

    if (from || to) {
      matchStage.date = {};
      if (from) matchStage.date.$gte = from;
      if (to) matchStage.date.$lte = to;
    }

    let groupStage: any;

    switch (groupBy) {
      case "day":
        groupStage = {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
              day: { $dayOfMonth: "$date" },
            },
            date: { $first: "$date" },
            totalViews: { $sum: "$count" },
            totalDuration: { $sum: "$watchDuration" },
            movieId: { $first: "$movieId" },
          },
        };
        break;

      case "month":
        groupStage = {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
            },
            month: {
              $first: { $dateToString: { format: "%Y-%m", date: "$date" } },
            },
            totalViews: { $sum: "$count" },
            totalDuration: { $sum: "$watchDuration" },
          },
        };
        break;

      default:
        groupStage = {
          $group: {
            _id: null,
            totalViews: { $sum: "$count" },
            totalDuration: { $sum: "$watchDuration" },
          },
        };
    }

    const pipeline: any[] = [
      { $match: matchStage },
      groupStage,
      { $sort: { date: -1 } },
    ];

    return await ViewCounterModel.aggregate(pipeline);
  }

  async getTopMovies(
    limit: number = 10,
    period?: "day" | "week" | "month" | "year"
  ) {
    const dateFilter: any = {};

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

      dateFilter.date = { $gte: startDate };
    }

    const pipeline: any[] = [
      { $match: { ...dateFilter, viewType: { $in: ["movie", "episode"] } } },
      {
        $group: {
          _id: "$movieId",
          totalViews: { $sum: "$count" },
          totalDuration: { $sum: "$watchDuration" },
        },
      },
      { $sort: { totalViews: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "movies",
          localField: "_id",
          foreignField: "_id",
          as: "movieInfo",
        },
      },
      { $unwind: "$movieInfo" },
      {
        $project: {
          movieId: "$_id",
          totalViews: 1,
          totalDuration: 1,
          title: "$movieInfo.title",
          thumbnail: "$movieInfo.thumbnail",
          type: "$movieInfo.type",
          flags: "$movieInfo.flags",
        },
      },
    ];

    return await ViewCounterModel.aggregate(pipeline);
  }

  private cleanupOldCache() {
    // Clean up session cache older than 1 hour
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    for (const [key, sessionData] of this.sessionCache.entries()) {
      if (sessionData.timestamp < oneHourAgo) {
        this.sessionCache.delete(key);
      }
    }

    console.log(
      `[VIEW CACHE] Cleaned up old session cache, remaining: ${this.sessionCache.size}`
    );
  }
}

export default new ViewService();
