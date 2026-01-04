import { Request, Response } from "express";
import { Types } from "mongoose";
import favoriteService from "./favorite.service";

export const addFavorite = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.body;
    const userId = (req as any).user?.userId;

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

    const result = await favoriteService.addFavorite(userId, movieId);

    res.status(201).json(result);
  } catch (error: any) {
    console.error("Error in addFavorite:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to add favorite",
    });
  }
};

export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;
    const userId = (req as any).user?.userId;

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

    const result = await favoriteService.removeFavorite(userId, movieId);

    res.json(result);
  } catch (error: any) {
    console.error("Error in removeFavorite:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to remove favorite",
    });
  }
};

export const getMyFavorites = async (req: Request, res: Response) => {
  try {
    console.log(req.user);

    const userId = (req as any).user?.userId;
    const { page = "1", limit = "20" } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const result = await favoriteService.getUserFavorites(
      userId,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(result);
  } catch (error: any) {
    console.error("Error in getMyFavorites:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get favorites",
    });
  }
};

export const checkFavorite = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;
    const userId = (req as any).user?.userId;

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

    const isFavorite = await favoriteService.checkIfFavorite(userId, movieId);

    res.json({
      success: true,
      data: {
        isFavorite,
        movieId,
        userId,
      },
    });
  } catch (error: any) {
    console.error("Error in checkFavorite:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to check favorite",
    });
  }
};

export const getFavoriteCount = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: "movieId is required",
      });
    }

    const count = await favoriteService.getFavoriteCount(movieId);

    res.json({
      success: true,
      data: {
        movieId,
        count,
      },
    });
  } catch (error: any) {
    console.error("Error in getFavoriteCount:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get favorite count",
    });
  }
};

export const getMostFavorited = async (req: Request, res: Response) => {
  try {
    const { limit = "10", period } = req.query;

    const result = await favoriteService.getMostFavoritedMovies(
      parseInt(limit as string),
      period as any
    );

    res.json(result);
  } catch (error: any) {
    console.error("Error in getMostFavorited:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get most favorited movies",
    });
  }
};

export const getUsersWhoFavorited = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;
    const { page = "1", limit = "20" } = req.query;

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: "movieId is required",
      });
    }

    const result = await favoriteService.getUsersWhoFavorited(
      movieId,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(result);
  } catch (error: any) {
    console.error("Error in getUsersWhoFavorited:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get users who favorited",
    });
  }
};

export const getFavoriteStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    const result = await favoriteService.getFavoriteStats(userId);

    res.json(result);
  } catch (error: any) {
    console.error("Error in getFavoriteStats:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get favorite stats",
    });
  }
};

export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.body;
    const userId = (req as any).user?.userId;

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

    // Kiểm tra xem đã favorite chưa
    const isFavorite = await favoriteService.checkIfFavorite(userId, movieId);

    let result;
    if (isFavorite) {
      // Nếu đã favorite thì xóa
      result = await favoriteService.removeFavorite(userId, movieId);
      result.message = "Đã xóa khỏi danh sách yêu thích";
    } else {
      // Nếu chưa thì thêm
      result = await favoriteService.addFavorite(userId, movieId);
      result.message = "Đã thêm vào danh sách yêu thích";
    }

    // Thêm trạng thái hiện tại vào response
    result.data = {
      ...result.data,
      isFavorite: !isFavorite,
    };

    res.json(result);
  } catch (error: any) {
    console.error("Error in toggleFavorite:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to toggle favorite",
    });
  }
};
