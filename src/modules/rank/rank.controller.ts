import { Request, Response } from "express";
import { rankService } from "./rank.service";
import { IRankFilter, RankPeriod, RankType } from "../../types/rank.type";
import { Types } from "mongoose";

export class RankController {
  /**
   * Lấy danh sách xếp hạng
   */
  async getRanks(req: Request, res: Response) {
    try {
      const {
        period = "weekly",
        type = "most_viewed",
        genre,
        country,
        year,
        limit = "20",
        page = "1",
        lang = "vi",
      } = req.query;

      const filter: IRankFilter = {
        period: period as RankPeriod,
        type: type as RankType,
        genre: genre ? new Types.ObjectId(genre as string) : undefined,
        country: country as string,
        year: year ? parseInt(year as string) : undefined,
        limit: parseInt(limit as string),
        page: parseInt(page as string),
        lang: lang as string,
      };

      const result = await rankService.getRanks(filter);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting ranks:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Lấy xếp hạng phim xem nhiều nhất
   */
  async getMostViewed(req: Request, res: Response) {
    try {
      const filter = this.buildFilterFromQuery(req.query);
      filter.type = RankType.MOST_VIEWED;

      const result = await rankService.getRanks(filter);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting most viewed ranks:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Lấy xếp hạng phim đánh giá cao nhất
   */
  async getTopRated(req: Request, res: Response) {
    try {
      const filter = this.buildFilterFromQuery(req.query);
      filter.type = RankType.TOP_RATED;

      const result = await rankService.getRanks(filter);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting top rated ranks:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Lấy xếp hạng phim mới nhất
   */
  async getNewest(req: Request, res: Response) {
    try {
      const filter = this.buildFilterFromQuery(req.query);
      filter.type = RankType.NEWEST;

      const result = await rankService.getRanks(filter);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting newest ranks:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Lấy xếp hạng phim trending
   */
  async getTrending(req: Request, res: Response) {
    try {
      const filter = this.buildFilterFromQuery(req.query);
      filter.type = RankType.TRENDING;

      const result = await rankService.getRanks(filter);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting trending ranks:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Lấy rank của một phim cụ thể
   */
  async getMovieRank(req: Request, res: Response) {
    try {
      const { movieId } = req.params;
      const { type = "most_viewed", period = "weekly" } = req.query;

      const result = await rankService.getMovieRank(
        movieId,
        type as RankType,
        period as RankPeriod
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Movie not found in rank",
        });
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting movie rank:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Helper: Build filter từ query parameters
   */
  private buildFilterFromQuery(query: any): IRankFilter {
    const {
      period = "weekly",
      genre,
      country,
      year,
      limit = "20",
      page = "1",
      lang = "vi",
    } = query;

    return {
      period: period as RankPeriod,
      genre: genre ? new Types.ObjectId(genre as string) : undefined,
      country: country as string,
      year: year ? parseInt(year as string) : undefined,
      limit: parseInt(limit as string),
      page: parseInt(page as string),
      lang: lang as string,
    };
  }
}

export const rankController = new RankController();
