// src/controllers/movieFlag.controller.ts
import { Request, Response } from "express";
import { AddFlagDto, MovieFlagService } from "./flag.service";
import { MovieFlagType } from "../../types/movie.type";

const movieFlagService = new MovieFlagService();

export class MovieFlagController {
  // Admin: Thêm flag
  async addFlag(req: Request, res: Response) {
    try {
      const data: AddFlagDto = req.body;
      const movie = await movieFlagService.addAdminFlag(data);

      res.status(201).json({
        success: true,
        data: movie,
        message: "Flag added successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error,
      });
    }
  }

  // Admin: Xóa flag
  async removeFlag(req: Request, res: Response) {
    try {
      const { movieId, flagType } = req.params;

      await movieFlagService.removeAdminFlag(
        movieId,
        flagType as MovieFlagType
      );

      res.json({
        success: true,
        message: "Flag removed successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error,
      });
    }
  }

  // Admin: Cập nhật flag
  async updateFlag(req: Request, res: Response) {
    try {
      const { movieId } = req.params;
      const updates = req.body;

      const movie = await movieFlagService.updateAdminFlag(
        movieId,
        updates.type,
        updates
      );

      res.json({
        success: true,
        data: movie,
        message: "Flag updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error,
      });
    }
  }

  // Admin/System: Trigger tính toán tự động
  async calculateSystemFlags(req: Request, res: Response) {
    try {
      // Có thể thêm authentication/authorization cho endpoint này
      await movieFlagService.calculateAndAssignSystemFlags();

      res.json({
        success: true,
        message: "System flags calculated and assigned",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error,
      });
    }
  }

  // Public: Lấy phim theo flag type
  async getMoviesByFlag(req: Request, res: Response) {
    try {
      const { flagType } = req.params;
      const { lang } = req.query;
      const { limit = "20", skip = "0", active = "true" } = req.query;

      const movies = await movieFlagService.getMoviesWithFlag(
        flagType as MovieFlagType,
        {
          limit: parseInt(limit as string),
          skip: parseInt(skip as string),
          onlyActive: active === "true",
          lang: lang as string,
        }
      );

      res.json({
        success: true,
        data: movies,
        count: movies.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error,
      });
    }
  }

  // Public: Lấy active flags của một phim
  async getMovieFlags(req: Request, res: Response) {
    try {
      const { movieId } = req.params;
      const flags = await movieFlagService.getActiveFlags(movieId);

      res.json({
        success: true,
        data: flags,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error,
      });
    }
  }
}
