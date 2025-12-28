import { Request, Response } from "express";
import { ProfileService } from "./profile.service";

export class ProfileController {
  static async getMe(req: Request, res: Response) {
    try {
      const profile = await ProfileService.getMyProfile(req.user!.userId);
      res.json({ success: true, data: profile });
    } catch (error: any) {
      res
        .status(error.statusCode || 500)
        .json({ success: false, message: error.message });
    }
  }

  static async updateMe(req: Request, res: Response) {
    try {
      const profile = await ProfileService.updateMyProfile(
        req.user!.userId,
        req.body
      );
      res.json({ success: true, data: profile });
    } catch (error: any) {
      res
        .status(error.statusCode || 500)
        .json({ success: false, message: error.message });
    }
  }

  static async getByUserId(req: Request, res: Response) {
    try {
      const profile = await ProfileService.getProfileByUserId(
        { userId: req.user!.userId, role: req.user!.role },
        req.params.userId
      );
      res.json({ success: true, data: profile });
    } catch (error: any) {
      res
        .status(error.statusCode || 500)
        .json({ success: false, message: error.message });
    }
  }
}
