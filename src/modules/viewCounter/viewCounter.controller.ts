// controllers/view.controller.ts
import { Request, Response } from "express";
import { MovieModel } from "../../models/movie.model";
import viewCounterService from "./viewCounter.service";

export const incrementView = async (req: Request, res: Response) => {
  try {
    const {
      movieId,
      episodeId,
      sessionId,
      userId,
      watchDuration,
      viewType,
      ipAddress,
      userAgent,
      isUnique = true,
    } = req.body;

    // Validate required fields
    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: "movieId là bắt buộc",
      });
    }

    // Check if movie exists
    const movie = await MovieModel.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Phim không tồn tại",
      });
    }

    // Get client IP
    const clientIp =
      req.ip ||
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      ipAddress;

    // Increment view
    await viewCounterService.incrementView(movieId, {
      episodeId,
      sessionId,
      userId,
      watchDuration,
      viewType,
      ipAddress: clientIp as string,
      userAgent: userAgent || req.get("User-Agent"),
      isUnique,
    });

    // Get updated movie stats
    const stats = await viewCounterService.getMovieStats(movieId);

    res.json({
      success: true,
      message: "View đã được cập nhật",
      data: {
        movieId,
        totalViews: stats.totalViews,
        dailyViews: stats.dailyViews,
        weeklyViews: stats.weeklyViews,
      },
    });
  } catch (error: any) {
    console.error("Error in incrementView:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi cập nhật view",
    });
  }
};

export const getStatistics = async (req: Request, res: Response) => {
  try {
    const {
      movieId,
      episodeId,
      from,
      to,
      groupBy = "day",
      viewType,
    } = req.query;

    const stats = await viewCounterService.getStatistics({
      movieId: movieId as string,
      episodeId: episodeId as string,
      from: from ? new Date(from as string) : undefined,
      to: to ? new Date(to as string) : undefined,
      groupBy: groupBy as "day" | "week" | "month" | "year",
      viewType: viewType as string,
    });

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Error in getStatistics:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy thống kê",
    });
  }
};

export const getMovieStats = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu movieId",
      });
    }

    // Check if movie exists
    const movie = await MovieModel.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Phim không tồn tại",
      });
    }

    const stats = await viewCounterService.getMovieStats(movieId);

    res.json({
      success: true,
      data: {
        movieId,
        ...stats,
        title: movie.title,
        thumbnail: movie.thumbnail,
      },
    });
  } catch (error: any) {
    console.error("Error in getMovieStats:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy thống kê phim",
    });
  }
};

export const getTopMovies = async (req: Request, res: Response) => {
  try {
    const { limit = "10", period } = req.query;

    const topMovies = await viewCounterService.getTopMovies(
      parseInt(limit as string, 10),
      period as "day" | "week" | "month" | "year"
    );

    res.json({
      success: true,
      data: topMovies,
    });
  } catch (error: any) {
    console.error("Error in getTopMovies:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy top movies",
    });
  }
};

export const getTrendingMovies = async (req: Request, res: Response) => {
  try {
    const { limit = "20", period = "week" } = req.query;

    // Get trending movies by weekly views
    const trendingMovies = await MovieModel.find({
      isPublished: true,
      weeklyViews: { $gt: 0 },
    })
      .sort({ weeklyViews: -1, dailyViews: -1 })
      .limit(parseInt(limit as string, 10))
      .select(
        "title thumbnail type totalViews dailyViews weeklyViews flags slug"
      )
      .populate("genres", "name slug")
      .lean();

    // Format response
    const formattedMovies = trendingMovies.map((movie) => ({
      _id: movie._id,
      title: movie.title,
      thumbnail: movie.thumbnail,
      type: movie.type,
      slug: movie.slug,
      totalViews: movie.totalViews,
      dailyViews: movie.dailyViews,
      weeklyViews: movie.weeklyViews,
      genres: movie.genres,
      isTrending:
        movie.flags?.some(
          (flag: any) => flag.type === "trending" && !flag.endAt
        ) || false,
      isHot:
        movie.flags?.some((flag: any) => flag.type === "hot" && !flag.endAt) ||
        false,
    }));

    res.json({
      success: true,
      data: formattedMovies,
    });
  } catch (error: any) {
    console.error("Error in getTrendingMovies:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy trending movies",
    });
  }
};

export const getViewAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, groupBy = "day" } = req.query;

    const from = startDate
      ? new Date(startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = endDate ? new Date(endDate as string) : new Date();

    // Get overall statistics
    const overallStats = await viewCounterService.getStatistics({
      from,
      to,
      groupBy: groupBy as "day" | "week" | "month" | "year",
    });

    // Get top movies for the period
    const topMovies = await viewCounterService.getTopMovies(10, groupBy as any);

    // Get total views
    const totalViewsResult = await viewCounterService.getStatistics({
      from,
      to,
    });

    const totalViews = totalViewsResult[0]?.totalViews || 0;
    const totalDuration = totalViewsResult[0]?.totalDuration || 0;

    res.json({
      success: true,
      data: {
        period: {
          startDate: from,
          endDate: to,
          groupBy,
        },
        summary: {
          totalViews,
          totalDuration,
          averageViewsPerDay:
            groupBy === "day" && overallStats.length > 0
              ? Math.round(totalViews / overallStats.length)
              : 0,
        },
        timeline: overallStats,
        topMovies,
      },
    });
  } catch (error: any) {
    console.error("Error in getViewAnalytics:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy analytics",
    });
  }
};

export const manualUpdateMovieStats = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu movieId",
      });
    }

    const stats = await viewCounterService.getMovieStats(movieId);

    // Update movie stats in database
    await MovieModel.findByIdAndUpdate(movieId, {
      $set: {
        totalViews: stats.totalViews,
        dailyViews: stats.dailyViews,
        weeklyViews: stats.weeklyViews,
        lastTrendingUpdate: new Date(),
      },
    });

    res.json({
      success: true,
      message: "Đã cập nhật thống kê phim thủ công",
      data: stats,
    });
  } catch (error: any) {
    console.error("Error in manualUpdateMovieStats:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi cập nhật thống kê",
    });
  }
};

export const batchUpdateAllMovieStats = async (
  _req: Request,
  res: Response
) => {
  try {
    // Start batch update (this will run async)
    viewCounterService.batchUpdateMovieStats();

    res.json({
      success: true,
      message: "Đã bắt đầu cập nhật thống kê cho tất cả phim",
    });
  } catch (error: any) {
    console.error("Error in batchUpdateAllMovieStats:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi cập nhật thống kê hàng loạt",
    });
  }
};
