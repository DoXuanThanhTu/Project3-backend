// controllers/profile.controller.ts
import { Request, Response } from "express";
import { ProfileService } from "./profile.service";
import { UnauthorizedError } from "../../errors/http.error";
import { Role } from "../../types/role.type";

export class ProfileController {
  // Lấy profile user
  static async getMe(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await ProfileService.getUserProfile(userId);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error });
    }
  }

  static async getUserProfile(req: Request, res: Response) {
    try {
      const s = req.header;
      console.log(req.header);
      const { userId } = req.params;
      const user = await ProfileService.getUserProfile(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }

  // Cập nhật profile
  static async updateProfile(req: Request, res: Response) {
    try {
      if (!req.user) throw new UnauthorizedError();
      // const { userId } = req.params;
      // const { displayName, phone, avatar, coverImage } = req.body;

      // const updateData: any = {};
      // if (displayName !== undefined) updateData.displayName = displayName;
      // if (phone !== undefined) updateData.phone = phone;
      // if (avatar !== undefined) updateData.avatar = avatar;
      // if (coverImage !== undefined) updateData.coverImage = coverImage;

      const user = await ProfileService.updateUserProfile(
        req.user.userId,
        req.body
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }

  // Cập nhật preferences
  static async updatePreferences(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError();
      }
      if (userId === req.user?.userId || req.user?.role === Role.ADMIN) {
        const preferences = req.body;

        const result = await ProfileService.updateUserPreferences(
          userId,
          preferences
        );

        if (!result) {
          return res.status(404).json({ message: "User not found" });
        }

        res.json(result);
      }
      throw new UnauthorizedError();
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }

  // Lấy lịch sử xem
  static async getWatchHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError();
      }
      if (userId === req.user?.userId || req.user?.role === Role.ADMIN) {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const result = await ProfileService.getWatchHistory(
          userId,
          page,
          limit
        );
        res.json(result);
      }
      throw new UnauthorizedError();
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }

  // Thêm/Xóa lịch sử xem
  // static async addWatchHistory(req: Request, res: Response) {
  //   try {
  //     const { userId } = req.params;
  //     if (userId === req.user?.userId || req.user?.role === Role.ADMIN) {
  //       const historyData = req.body;

  //       const result = await ProfileService.addOrUpdateWatchHistory(
  //         userId,
  //         historyData
  //       );
  //       res.status(201).json(result);
  //     }
  //     throw new UnauthorizedError();
  //   } catch (error) {
  //     res.status(500).json({ message: "Server error", error });
  //   }
  // }

  // Lấy danh sách yêu thích
  static async getFavorites(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError();
      }
      if (userId === req.user?.userId || req.user?.role === Role.ADMIN) {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const result = await ProfileService.getFavorites(userId, page, limit);
        res.json(result);
      }
      throw new UnauthorizedError();
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }

  // Thêm/Xóa yêu thích
  static async toggleFavorite(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError();
      }

      const favoriteData = req.body;
      const result = await ProfileService.toggleFavorite(userId, favoriteData);
      res.status(result.isFavorite ? 201 : 200).json(result);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }

  // Lấy danh sách reviews
  static async getReviews(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      if (userId === req.user?.userId || req.user?.role === Role.ADMIN) {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const result = await ProfileService.getReviews(userId, page, limit);
        res.json(result);
      }
      throw new UnauthorizedError();
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }

  // Tạo/Update review
  static async createOrUpdateReview(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const reviewData = req.body;

      const result = await ProfileService.createOrUpdateReview(
        userId,
        reviewData
      );
      res.status(result.isNew ? 201 : 200).json(result.review);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }

  // Xóa review
  static async deleteReview(req: Request, res: Response) {
    try {
      const { userId, reviewId } = req.params;
      if (userId === req.user?.userId || req.user?.role === Role.ADMIN) {
        const result = await ProfileService.deleteReview(userId, reviewId);

        if (!result) {
          return res.status(404).json({ message: "Review not found" });
        }

        res.json({ message: "Review deleted successfully" });
      }
      throw new UnauthorizedError();
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }

  // Thêm achievement
  static async addAchievement(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      if (userId === req.user?.userId || req.user?.role === Role.ADMIN) {
        const achievement = req.body;

        const result = await ProfileService.addUserAchievement(
          userId,
          achievement
        );

        if (!result) {
          return res.status(404).json({ message: "User not found" });
        }

        res.json(result);
      }
      throw new UnauthorizedError();
    } catch (error: any) {
      if (error.message === "Achievement already exists") {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Server error", error });
    }
  }

  // Lấy thống kê
  static async getStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const result = await ProfileService.getUserStats(userId);

      if (!result) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
}
