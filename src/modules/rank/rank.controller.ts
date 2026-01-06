import { Request, Response } from "express";
import { Types } from "mongoose";
import { ViewCounterModel } from "../../models/viewCounter.model";
import { MovieModel } from "../../models/movie.model";

export const getMoviesRanking = async (req: Request, res: Response) => {
  try {
    const {
      period = "week", // 'day', 'week', 'month', 'year', 'custom'
      from, // YYYY-MM-DD (dùng với period='custom')
      to, // YYYY-MM-DD (dùng với period='custom')
      limit = "20",
      genre,
      country,
      type,
      minRating = "0",
      maxRating = "10",
      sortBy = "views", // 'views', 'duration', 'rating'
      sortOrder = "desc", // 'asc', 'desc'
    } = req.query;

    // Parse limit
    const limitNum = parseInt(limit as string) || 20;

    // Xác định khoảng thời gian
    let startDate: Date;
    let endDate: Date = new Date();

    switch (period) {
      case "day":
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;

      case "week":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;

      case "month":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;

      case "year":
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;

      case "custom":
        if (!from || !to) {
          return res.status(400).json({
            success: false,
            message:
              "Thiếu tham số 'from' hoặc 'to' cho khoảng thời gian tùy chỉnh",
          });
        }
        startDate = new Date(from as string);
        endDate = new Date(to as string);
        break;

      default:
        return res.status(400).json({
          success: false,
          message:
            "Khoảng thời gian không hợp lệ. Chọn: day, week, month, year, custom",
        });
    }

    // Xây dựng pipeline aggregation
    const pipeline: any[] = [
      // Bước 1: Lọc view counters theo thời gian
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          viewType: { $in: ["movie", "episode"] },
        },
      },

      // Bước 2: Nhóm theo movieId để tính tổng
      {
        $group: {
          _id: "$movieId",
          totalViews: { $sum: "$count" },
          totalDuration: { $sum: "$watchDuration" },
          uniqueSessions: { $addToSet: "$sessionId" },
        },
      },

      // Bước 3: Tính số session unique
      {
        $addFields: {
          uniqueViewers: { $size: "$uniqueSessions" },
        },
      },

      // Bước 4: Lookup thông tin movie
      {
        $lookup: {
          from: "movies",
          let: { movieId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$movieId"] },
                isPublished: true,
              },
            },
            {
              $project: {
                title: 1,
                thumbnail: 1,
                poster: 1,
                banner: 1,
                backdrop: 1,
                type: 1,
                slug: 1,
                genres: 1,
                country: 1,
                year: 1,
                ratingAvg: 1,
                flags: 1,
                views: 1,
                totalViews: 1,
                dailyViews: 1,
                weeklyViews: 1,
                totalEpisodes: 1,
                description: 1,
              },
            },
          ],
          as: "movieInfo",
        },
      },

      // Bước 5: Unwind movieInfo
      {
        $unwind: {
          path: "$movieInfo",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Bước 6: Lọc theo các điều kiện bổ sung
      {
        $match: {
          movieInfo: { $ne: null },
        },
      },
    ];

    if (genre) {
      const genreId = new Types.ObjectId(genre as string);
      pipeline[5].$match["movieInfo.genres"] = genreId;
    }

    // Thêm điều kiện lọc country nếu có
    if (country) {
      pipeline[5].$match["movieInfo.country"] = country;
    }

    // Thêm điều kiện lọc type nếu có
    if (type) {
      pipeline[5].$match["movieInfo.type"] = type;
    }

    // Thêm điều kiện lọc rating nếu có
    pipeline[5].$match["movieInfo.ratingAvg"] = {
      $gte: parseFloat(minRating as string),
      $lte: parseFloat(maxRating as string),
    };

    // Bước 7: Sắp xếp
    let sortField = "totalViews";
    switch (sortBy) {
      case "duration":
        sortField = "totalDuration";
        break;
      case "rating":
        sortField = "movieInfo.ratingAvg";
        break;
      case "unique":
        sortField = "uniqueViewers";
        break;
    }

    pipeline.push({
      $sort: { [sortField]: sortOrder === "asc" ? 1 : -1 },
    });

    // Bước 8: Giới hạn kết quả
    pipeline.push({ $limit: limitNum });

    // Bước 9: Project final result
    pipeline.push({
      $project: {
        movieId: "$_id",
        totalViews: 1,
        totalDuration: 1,
        uniqueViewers: 1,
        views: "$movieInfo.views",
        title: "$movieInfo.title",
        thumbnail: "$movieInfo.thumbnail",
        poster: "$movieInfo.poster",
        type: "$movieInfo.type",
        slug: "$movieInfo.slug",
        genres: "$movieInfo.genres",
        country: "$movieInfo.country",
        year: "$movieInfo.year",
        rating: "$movieInfo.ratingAvg",
        flags: "$movieInfo.flags",
        storedViews: {
          total: "$movieInfo.totalViews",
          daily: "$movieInfo.dailyViews",
          weekly: "$movieInfo.weeklyViews",
        },
        totalEpisodes: "$movieInfo.totalEpisodes",
        description: "$movieInfo.description",
        // Tính toán metrics
        avgWatchTime: {
          $cond: [
            { $eq: ["$totalViews", 0] },
            0,
            { $divide: ["$totalDuration", "$totalViews"] },
          ],
        },
        engagementRate: {
          $cond: [
            { $eq: ["$uniqueViewers", 0] },
            0,
            { $divide: ["$totalViews", "$uniqueViewers"] },
          ],
        },
      },
    });

    // Thực hiện aggregation
    const ranking = await ViewCounterModel.aggregate(pipeline);

    // Populate genres nếu cần
    if (ranking.length > 0) {
      const populatedRanking = await MovieModel.populate(ranking, {
        path: "genres",
        select: "name slug",
      });

      res.json({
        success: true,
        data: {
          period: {
            name: period,
            startDate,
            endDate,
            isCustom: period === "custom",
          },
          filters: {
            genre: genre || null,
            country: country || null,
            type: type || null,
            rating: {
              min: minRating,
              max: maxRating,
            },
            sort: {
              by: sortBy,
              order: sortOrder,
            },
          },
          total: populatedRanking.length,
          ranking: populatedRanking,
        },
      });
    } else {
      res.json({
        success: true,
        data: {
          period: {
            name: period,
            startDate,
            endDate,
            isCustom: period === "custom",
          },
          total: 0,
          ranking: [],
        },
      });
    }
  } catch (error: any) {
    console.error("Error in getMoviesRanking:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy xếp hạng",
    });
  }
};

export const getGenresRanking = async (req: Request, res: Response) => {
  try {
    const { period = "month", limit = "10" } = req.query;

    // Xác định khoảng thời gian
    let startDate: Date;
    const endDate = new Date();

    switch (period) {
      case "day":
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "year":
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Khoảng thời gian không hợp lệ",
        });
    }

    const ranking = await ViewCounterModel.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          viewType: { $in: ["movie", "episode"] },
        },
      },
      {
        $lookup: {
          from: "movies",
          localField: "movieId",
          foreignField: "_id",
          as: "movie",
        },
      },
      { $unwind: "$movie" },
      { $match: { "movie.isPublished": true } },
      { $unwind: { path: "$movie.genres", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$movie.genres",
          totalViews: { $sum: "$count" },
          totalMovies: { $addToSet: "$movieId" },
          totalDuration: { $sum: "$watchDuration" },
        },
      },
      {
        $addFields: {
          movieCount: { $size: "$totalMovies" },
          avgViewsPerMovie: {
            $cond: [
              { $eq: ["$movieCount", 0] },
              0,
              { $divide: ["$totalViews", "$movieCount"] },
            ],
          },
        },
      },
      { $sort: { totalViews: -1 } },
      { $limit: parseInt(limit as string) || 10 },
      {
        $lookup: {
          from: "genres",
          localField: "_id",
          foreignField: "_id",
          as: "genreInfo",
        },
      },
      { $unwind: { path: "$genreInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          genreId: "$_id",
          genreName: "$genreInfo.name",
          genreSlug: "$genreInfo.slug",
          totalViews: 1,
          movieCount: 1,
          avgViewsPerMovie: 1,
          totalDuration: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        period,
        startDate,
        endDate,
        ranking,
      },
    });
  } catch (error: any) {
    console.error("Error in getGenresRanking:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy xếp hạng thể loại",
    });
  }
};

export const getCountriesRanking = async (req: Request, res: Response) => {
  try {
    const { period = "month", limit = "20" } = req.query;

    let startDate: Date;
    const endDate = new Date();

    switch (period) {
      case "day":
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "year":
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Khoảng thời gian không hợp lệ",
        });
    }

    const ranking = await ViewCounterModel.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          viewType: { $in: ["movie", "episode"] },
        },
      },
      {
        $lookup: {
          from: "movies",
          localField: "movieId",
          foreignField: "_id",
          as: "movie",
        },
      },
      { $unwind: "$movie" },
      {
        $match: {
          "movie.isPublished": true,
          "movie.country": { $ne: null },
        },
      },
      {
        $group: {
          _id: "$movie.country",
          totalViews: { $sum: "$count" },
          totalMovies: { $addToSet: "$movieId" },
          totalDuration: { $sum: "$watchDuration" },
        },
      },
      {
        $addFields: {
          movieCount: { $size: "$totalMovies" },
          avgViewsPerMovie: {
            $cond: [
              { $eq: ["$movieCount", 0] },
              0,
              { $divide: ["$totalViews", "$movieCount"] },
            ],
          },
        },
      },
      { $sort: { totalViews: -1 } },
      { $limit: parseInt(limit as string) || 20 },
      {
        $project: {
          country: "$_id",
          totalViews: 1,
          movieCount: 1,
          avgViewsPerMovie: 1,
          totalDuration: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        period,
        startDate,
        endDate,
        ranking,
      },
    });
  } catch (error: any) {
    console.error("Error in getCountriesRanking:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy xếp hạng quốc gia",
    });
  }
};
