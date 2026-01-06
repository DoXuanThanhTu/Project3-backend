// src/services/movieFlag.service.ts

import { Types } from "mongoose";
import { MovieFlagType } from "../../types/movie.type";
import { MovieModel } from "../../models/movie.model";
import { getLocalizedValue, getLocalizedValueMap } from "../../utils/i18n.util";

export interface AddFlagDto {
  movieId: string;
  type: MovieFlagType;
  startAt?: Date;
  endAt?: Date | null;
  metadata?: {
    reason?: string;
    priority?: number;
  };
}

export interface SystemFlagConfig {
  trending: {
    threshold: number;
    maxItems: number;
    durationHours: number;
  };
  hot: {
    threshold: number;
    maxItems: number;
    durationHours: number;
  };
  featured: {
    criteria: "rating" | "views" | "combo";
    maxItems: number;
    durationHours: number;
  };
}

export class MovieFlagService {
  private systemConfig: SystemFlagConfig = {
    trending: {
      threshold: 0.3, // Tăng 30% so với ngày trước
      maxItems: 10,
      durationHours: 24,
    },
    hot: {
      threshold: 10000, // 10k views trong tuần
      maxItems: 20,
      durationHours: 168, // 7 ngày
    },
    featured: {
      criteria: "combo",
      maxItems: 5,
      durationHours: 72, // 3 ngày
    },
  };

  // ===== ADMIN FLAGS =====
  async addAdminFlag(data: AddFlagDto) {
    const { movieId, type, startAt, endAt, metadata } = data;

    const flag = {
      type,
      source: "admin" as const,
      startAt: startAt || new Date(),
      endAt: endAt || null,
      metadata: {
        ...metadata,
        score: 1000, // Điểm cao cho admin flags
      },
    };

    return await MovieModel.findByIdAndUpdate(
      movieId,
      {
        $push: { flags: flag },
        $set: { [`flags.${type}`]: true }, // Optional: có thể thêm field boolean riêng
      },
      { new: true }
    );
  }

  async removeAdminFlag(movieId: string, flagType: MovieFlagType) {
    return await MovieModel.findByIdAndUpdate(
      movieId,
      {
        $pull: {
          flags: {
            type: flagType,
            source: "admin",
          },
        },
      },
      { new: true }
    );
  }

  async updateAdminFlag(
    movieId: string,
    flagType: MovieFlagType,
    updates: Partial<AddFlagDto>
  ) {
    // Xóa flag cũ và thêm flag mới
    await this.removeAdminFlag(movieId, flagType);
    return await this.addAdminFlag({
      movieId,
      type: flagType,
      ...updates,
    });
  }

  // ===== SYSTEM AUTO FLAGS =====
  async calculateAndAssignSystemFlags() {
    console.log("🔄 Calculating system flags...");

    // 1. Tính trending flags (tăng đột biến trong 24h)
    await this.calculateTrendingFlags();

    // 2. Tính hot flags (lượt xem cao trong tuần)
    await this.calculateHotFlags();

    // 3. Tính featured flags (rating + lượt xem cao)
    await this.calculateFeaturedFlags();

    // 4. Xóa flags đã hết hạn
    await this.cleanExpiredFlags();

    console.log("✅ System flags updated");
  }

  private async calculateTrendingFlags() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Lấy phim có dailyViews tăng đột biến
    const movies = await MovieModel.aggregate([
      {
        $match: {
          dailyViews: { $gt: 100 }, // Ít nhất 100 views
          lastTrendingUpdate: { $lt: yesterday },
        },
      },
      {
        $addFields: {
          trendingScore: {
            $cond: [
              { $eq: ["$dailyViews", 0] },
              0,
              { $divide: ["$dailyViews", { $max: [1, "$weeklyViews"] }] },
            ],
          },
        },
      },
      {
        $match: {
          trendingScore: { $gt: this.systemConfig.trending.threshold },
        },
      },
      { $sort: { trendingScore: -1 } },
      { $limit: this.systemConfig.trending.maxItems },
    ]);

    // Gán flag trending
    for (const movie of movies) {
      const endAt = new Date();
      endAt.setHours(
        endAt.getHours() + this.systemConfig.trending.durationHours
      );

      await this.addSystemFlag({
        movieId: movie._id.toString(),
        type: MovieFlagType.TRENDING,
        endAt,
        score: movie.trendingScore,
      });

      // Cập nhật thời gian tính trending lần cuối
      await MovieModel.findByIdAndUpdate(movie._id, {
        lastTrendingUpdate: new Date(),
      });
    }
  }

  private async calculateHotFlags() {
    const movies = await MovieModel.aggregate([
      {
        $match: {
          weeklyViews: { $gte: this.systemConfig.hot.threshold },
          isPublished: true,
        },
      },
      {
        $addFields: {
          hotScore: {
            $add: [
              { $multiply: ["$weeklyViews", 0.5] },
              { $multiply: ["$likes", 2] },
              { $multiply: ["$comments", 3] },
              { $multiply: ["$favorites", 5] },
            ],
          },
        },
      },
      { $sort: { hotScore: -1 } },
      { $limit: this.systemConfig.hot.maxItems },
    ]);

    for (const movie of movies) {
      const endAt = new Date();
      endAt.setHours(endAt.getHours() + this.systemConfig.hot.durationHours);

      await this.addSystemFlag({
        movieId: movie._id.toString(),
        type: MovieFlagType.HOT,
        endAt,
        score: movie.hotScore,
      });
    }
  }

  private async calculateFeaturedFlags() {
    const movies = await MovieModel.aggregate([
      {
        $match: {
          ratingAvg: { $gte: 4.0 },
          views: { $gte: 5000 },
          isPublished: true,
        },
      },
      {
        $addFields: {
          featuredScore: {
            $add: [
              { $multiply: ["$ratingAvg", 1000] },
              { $multiply: ["$views", 0.1] },
              { $multiply: ["$likes", 10] },
            ],
          },
        },
      },
      { $sort: { featuredScore: -1 } },
      { $limit: this.systemConfig.featured.maxItems },
    ]);

    for (const movie of movies) {
      const endAt = new Date();
      endAt.setHours(
        endAt.getHours() + this.systemConfig.featured.durationHours
      );

      await this.addSystemFlag({
        movieId: movie._id.toString(),
        type: MovieFlagType.FEATURED,
        endAt,
        score: movie.featuredScore,
      });
    }
  }

  private async addSystemFlag(data: {
    movieId: string;
    type: MovieFlagType;
    endAt: Date;
    score: number;
  }) {
    // Xóa flag system cũ cùng loại
    await MovieModel.findByIdAndUpdate(data.movieId, {
      $pull: {
        flags: {
          type: data.type,
          source: "system",
        },
      },
    });

    // Thêm flag mới
    const flag = {
      type: data.type,
      source: "system" as const,
      startAt: new Date(),
      endAt: data.endAt,
      metadata: {
        score: data.score,
      },
    };

    await MovieModel.findByIdAndUpdate(data.movieId, {
      $push: { flags: flag },
    });
  }

  private async cleanExpiredFlags() {
    const now = new Date();

    await MovieModel.updateMany(
      {},
      {
        $pull: {
          flags: {
            endAt: { $ne: null, $lt: now },
          },
        },
      }
    );
  }

  // ===== QUERY METHODS =====
  async getMoviesWithFlag(
    flagType: MovieFlagType,
    options: {
      limit?: number;
      skip?: number;
      onlyActive?: boolean;
      lang?: string;
    } = {}
  ) {
    const { limit = 20, skip = 0, onlyActive = true, lang = "vi" } = options;
    const now = new Date();

    const query: any = {
      "flags.type": flagType,
    };

    if (onlyActive) {
      query["flags"] = {
        $elemMatch: {
          type: flagType,
          $or: [{ endAt: null }, { endAt: { $gte: now } }],
        },
      };
    }

    const movies = await MovieModel.find(query)
      .sort({ "flags.metadata.score": -1, "flags.metadata.priority": -1 })
      .skip(skip)
      .limit(limit)
      .populate("genres")
      .populate("director");
    const data = movies.map((m) => ({
      id: m.id,
      dailyViews: 0,
      weeklyViews: 0,
      likes: 0,
      favorites: 0,
      shares: 0,
      comments: 0,
      title: getLocalizedValueMap(m.title, lang, m.defaultLang),
      slug: getLocalizedValueMap(m.slug, lang, m.defaultLang),
      description: getLocalizedValueMap(m.description, lang, m.defaultLang),
      genres:
        m.genres?.map((g: any) => ({
          id: g._id,
          title: getLocalizedValueMap(g.title, lang as string, m.defaultLang),
          slug: getLocalizedValueMap(g.slug, lang as string, m.defaultLang),
        })) || [],
      poster: m.poster,
      thumbnail: m.thumbnail,
      banner: m.banner,
      type: m.type,
      ratingAvg: m.ratingAvg,
      views: m.views,
      totalEpisodes: m.totalEpisodes,
      currentEpisode: m.currentEpisode,
    }));

    return data;
  }

  async getActiveFlags(movieId: string) {
    const movie = await MovieModel.findById(movieId);
    if (!movie) return [];

    const now = new Date();
    return movie.flags.filter(
      (flag) => flag.endAt === null || flag.endAt >= now
    );
  }
}
