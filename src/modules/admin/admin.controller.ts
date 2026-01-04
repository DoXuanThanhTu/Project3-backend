import { AdminService } from "./admin.service";
import { Request, Response } from "express";

export class AdminController {
  static async getMovieStats(req: Request, res: Response) {
    const stats = await AdminService.getMovieStats();
    res.json({ success: true, data: stats });
  }
}
