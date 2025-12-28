// controllers/view.controller.ts
import { Request, Response } from "express";
import viewCounterService from "./viewCounter.service";

export const incrementView = async (req: Request, res: Response) => {
  try {
    const {
      movieId,
      episodeId,
      sessionId,
      watchDuration,
      viewType,
      ipAddress,
      userAgent,
    } = req.body;

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: "movieId là bắt buộc",
      });
    }

    // Kiểm tra IP để tránh spam (có thể thêm rate limiting)
    const clientIp = req.ip || ipAddress;

    await viewCounterService.incrementView(movieId, episodeId, sessionId, {
      watchDuration,
      viewType,
      ipAddress: clientIp,
      userAgent: userAgent || req.get("User-Agent"),
    });

    // Lấy tổng view hiện tại
    const totalViews = await viewCounterService.getTotalViewsByMovie(movieId);

    res.json({
      success: true,
      message: "View đã được cập nhật",
      data: { totalViews },
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
    const { movieId, episodeId, from, to, groupBy, viewType } = req.query;

    const stats = await viewCounterService.getStatistics({
      movieId: movieId as string,
      episodeId: episodeId as string,
      from: from ? new Date(from as string) : undefined,
      to: to ? new Date(to as string) : undefined,
      groupBy: groupBy as any,
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

export const getMovieTotalViews = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu movieId",
      });
    }

    const totalViews = await viewCounterService.getTotalViewsByMovie(movieId);

    res.json({
      success: true,
      data: {
        movieId,
        totalViews,
      },
    });
  } catch (error: any) {
    console.error("Error in getMovieTotalViews:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy tổng view",
    });
  }
};

export const getTopMovies = async (req: Request, res: Response) => {
  try {
    const { limit = "10", period } = req.query;

    const topMovies = await viewCounterService.getTopMovies(
      parseInt(limit as string),
      period as any
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
