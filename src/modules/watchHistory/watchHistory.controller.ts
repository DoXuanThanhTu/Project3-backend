import { Request, Response } from "express";
import watchHistoryService from "./watchHistory.service";

export const addWatchHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const {
      movieId,
      episodeId,
      currentTime,
      duration,
      watchDuration,
      percentage,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: "movieId is required",
      });
    }

    if (!episodeId) {
      return res.status(400).json({
        success: false,
        message: "episodeId is required",
      });
    }

    const result = await watchHistoryService.addOrUpdateWatchHistory(
      userId,
      movieId,
      episodeId,
      { currentTime, duration, watchDuration, percentage }
    );

    res.status(201).json(result);
  } catch (error: any) {
    console.error("Error in addWatchHistory:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to add watch history",
    });
  }
};

export const getMyWatchHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const {
      page = "1",
      limit = "20",
      sortBy = "lastWatchedAt",
      sortOrder = "desc",
      movieType,
      genre,
      fromDate,
      toDate,
    } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const result = await watchHistoryService.getUserWatchHistory(userId, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
      movieType: movieType as string,
      genre: genre as string,
      fromDate: fromDate ? new Date(fromDate as string) : undefined,
      toDate: toDate ? new Date(toDate as string) : undefined,
    });

    res.json(result);
  } catch (error: any) {
    console.error("Error in getMyWatchHistory:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get watch history",
    });
  }
};

export const getRecentHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { limit = "10" } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const result = await watchHistoryService.getRecentWatchHistory(
      userId,
      parseInt(limit as string)
    );

    res.json(result);
  } catch (error: any) {
    console.error("Error in getRecentHistory:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get recent history",
    });
  }
};

export const getMovieHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { movieId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: "movieId is required",
      });
    }

    const result = await watchHistoryService.getWatchHistoryByMovie(
      userId,
      movieId
    );

    res.json(result);
  } catch (error: any) {
    console.error("Error in getMovieHistory:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get movie history",
    });
  }
};

export const deleteWatchHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { historyId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!historyId) {
      return res.status(400).json({
        success: false,
        message: "historyId is required",
      });
    }

    const result = await watchHistoryService.removeFromHistory(
      userId,
      historyId
    );

    res.json(result);
  } catch (error: any) {
    console.error("Error in deleteWatchHistory:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to delete watch history",
    });
  }
};

export const clearAllHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const result = await watchHistoryService.clearUserHistory(userId);

    res.json(result);
  } catch (error: any) {
    console.error("Error in clearAllHistory:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to clear all history",
    });
  }
};

export const getHistoryStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const result = await watchHistoryService.getHistoryStats(userId);

    res.json(result);
  } catch (error: any) {
    console.error("Error in getHistoryStats:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get history stats",
    });
  }
};

export const getContinueWatching = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { limit = "10" } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const result = await watchHistoryService.getContinueWatching(
      userId,
      parseInt(limit as string)
    );

    res.json(result);
  } catch (error: any) {
    console.error("Error in getContinueWatching:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get continue watching",
    });
  }
};

export const getWatchProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { movieId } = req.params;
    const { episodeId } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: "movieId is required",
      });
    }

    const result = await watchHistoryService.getWatchProgress(
      userId,
      movieId,
      episodeId as string
    );

    res.json(result);
  } catch (error: any) {
    console.error("Error in getWatchProgress:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get watch progress",
    });
  }
};

export const getMostWatchedGenres = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const result = await watchHistoryService.getMostWatchedGenres(userId);

    res.json(result);
  } catch (error: any) {
    console.error("Error in getMostWatchedGenres:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get most watched genres",
    });
  }
};
