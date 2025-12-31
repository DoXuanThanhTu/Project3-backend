"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankService = exports.RankService = void 0;
const moment_1 = __importDefault(require("moment"));
const viewCounter_model_1 = require("../../models/viewCounter.model");
const movie_model_1 = require("../../models/movie.model");
const rank_type_1 = require("../../types/rank.type");
class RankService {
    /**
     * Lấy danh sách xếp hạng phim
     */
    async getRanks(filter) {
        const { period = rank_type_1.RankPeriod.WEEKLY, type = rank_type_1.RankType.MOST_VIEWED, genre, country, year, limit = 20, page = 1, lang = "vi", } = filter;
        const skip = (page - 1) * limit;
        switch (type) {
            case rank_type_1.RankType.MOST_VIEWED:
                return this.getMostViewedRanks(period, {
                    genre,
                    country,
                    year,
                    limit,
                    page,
                    lang,
                });
            case rank_type_1.RankType.TOP_RATED:
                return this.getTopRatedRanks(period, {
                    genre,
                    country,
                    year,
                    limit,
                    page,
                    lang,
                });
            case rank_type_1.RankType.NEWEST:
                return this.getNewestRanks({ genre, country, year, limit, page, lang });
            case rank_type_1.RankType.TRENDING:
                return this.getTrendingRanks(period, {
                    genre,
                    country,
                    year,
                    limit,
                    page,
                    lang,
                });
            default:
                return this.getMostViewedRanks(period, {
                    genre,
                    country,
                    year,
                    limit,
                    page,
                    lang,
                });
        }
    }
    /**
     * Xếp hạng phim xem nhiều nhất
     */
    async getMostViewedRanks(period, filter) {
        const { genre, country, year, limit = 24, page = 1, lang = "vi" } = filter;
        const skip = (page - 1) * limit;
        // Xác định khoảng thời gian
        const dateFilter = this.getDateFilter(period);
        // Pipeline cho ViewCounter
        const viewPipeline = [
            {
                $match: {
                    date: dateFilter,
                    viewType: { $in: ["movie", "episode"] }, // Tính cả view movie và episode
                },
            },
            {
                $group: {
                    _id: "$movieId",
                    viewCount: { $sum: "$count" },
                },
            },
            { $sort: { viewCount: -1 } },
            { $skip: skip },
            { $limit: limit },
        ];
        const viewCounts = await viewCounter_model_1.ViewCounterModel.aggregate(viewPipeline);
        const movieIds = viewCounts.map((v) => v._id);
        // Lấy thông tin chi tiết phim
        const movies = await this.getMovieDetails(movieIds, {
            genre,
            country,
            year,
            lang,
        });
        // Gán viewCount và rank
        const rankedMovies = movies.map((movie, index) => {
            const viewData = viewCounts.find((v) => v._id.equals(movie._id));
            return {
                ...this.formatMovieForRank(movie, lang),
                rank: skip + index + 1,
                viewCount: viewData?.viewCount || 0,
            };
        });
        // Đếm tổng số phim (có thể cần tối ưu cho phân trang)
        const totalPipeline = [
            {
                $match: {
                    date: dateFilter,
                    viewType: { $in: ["movie", "episode"] },
                },
            },
            { $group: { _id: "$movieId" } },
            { $count: "total" },
        ];
        const totalResult = await viewCounter_model_1.ViewCounterModel.aggregate(totalPipeline);
        const total = totalResult[0]?.total || 0;
        return {
            period,
            type: rank_type_1.RankType.MOST_VIEWED,
            date: new Date(),
            movies: rankedMovies,
            total,
            page,
            limit,
            hasNextPage: page * limit < total,
        };
    }
    /**
     * Xếp hạng phim đánh giá cao nhất
     */
    async getTopRatedRanks(period, filter) {
        const { genre, country, year, limit = 24, page = 1, lang = "vi" } = filter;
        const skip = (page - 1) * limit;
        const query = { isPublished: true, ratingAvg: { $gt: 0 } };
        if (genre)
            query.genres = genre;
        if (country)
            query.country = country;
        if (year)
            query.year = year;
        // Nếu có period, lọc phim mới trong kỳ
        if (period !== rank_type_1.RankPeriod.ALL_TIME) {
            const dateFilter = this.getDateFilter(period);
            query.createdAt = { $gte: dateFilter.$gte };
        }
        const [movies, total] = await Promise.all([
            movie_model_1.MovieModel.find(query)
                .sort({ ratingAvg: -1, views: -1 })
                .skip(skip)
                .limit(limit)
                .populate("genres", "name")
                .lean(),
            movie_model_1.MovieModel.countDocuments(query),
        ]);
        const rankedMovies = movies.map((movie, index) => ({
            ...this.formatMovieForRank(movie, lang),
            rank: skip + index + 1,
        }));
        return {
            period,
            type: rank_type_1.RankType.TOP_RATED,
            date: new Date(),
            movies: rankedMovies,
            total,
            page,
            limit,
            hasNextPage: page * limit < total,
        };
    }
    /**
     * Xếp hạng phim mới nhất
     */
    async getNewestRanks(filter) {
        const { genre, country, year, limit = 24, page = 1, lang = "vi" } = filter;
        const skip = (page - 1) * limit;
        const query = { isPublished: true };
        if (genre)
            query.genres = genre;
        if (country)
            query.country = country;
        if (year)
            query.year = year;
        const [movies, total] = await Promise.all([
            movie_model_1.MovieModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("genres", "name")
                .lean(),
            movie_model_1.MovieModel.countDocuments(query),
        ]);
        const rankedMovies = movies.map((movie, index) => ({
            ...this.formatMovieForRank(movie, lang),
            rank: skip + index + 1,
        }));
        return {
            period: rank_type_1.RankPeriod.ALL_TIME,
            type: rank_type_1.RankType.NEWEST,
            date: new Date(),
            movies: rankedMovies,
            total,
            page,
            limit,
            hasNextPage: page * limit < total,
        };
    }
    /**
     * Xếp hạng phim trending (kết hợp view và rating)
     */
    async getTrendingRanks(period, filter) {
        const { genre, country, year, limit = 24, page = 1, lang = "vi" } = filter;
        const skip = (page - 1) * limit;
        const dateFilter = this.getDateFilter(period);
        // Lấy view count trong kỳ
        const viewPipeline = [
            {
                $match: {
                    date: dateFilter,
                    viewType: { $in: ["movie", "episode"] },
                },
            },
            {
                $group: {
                    _id: "$movieId",
                    viewCount: { $sum: "$count" },
                },
            },
        ];
        const viewCounts = await viewCounter_model_1.ViewCounterModel.aggregate(viewPipeline);
        // Lấy danh sách phim
        const query = {
            isPublished: true,
            _id: { $in: viewCounts.map((v) => v._id) },
        };
        if (genre)
            query.genres = genre;
        if (country)
            query.country = country;
        if (year)
            query.year = year;
        const movies = await movie_model_1.MovieModel.find(query)
            .populate("genres", "name")
            .lean();
        // Tính điểm trending (công thức đơn giản: viewCount * ratingAvg)
        const moviesWithScore = movies.map((movie) => {
            const viewData = viewCounts.find((v) => v._id.equals(movie._id));
            const viewCount = viewData?.viewCount || 0;
            const score = viewCount * (movie.ratingAvg || 1);
            return {
                movie,
                score,
                viewCount,
            };
        });
        // Sắp xếp theo score
        moviesWithScore.sort((a, b) => b.score - a.score);
        const paginatedMovies = moviesWithScore.slice(skip, skip + limit);
        const rankedMovies = paginatedMovies.map((item, index) => ({
            ...this.formatMovieForRank(item.movie, lang),
            rank: skip + index + 1,
            viewCount: item.viewCount,
        }));
        return {
            period,
            type: rank_type_1.RankType.TRENDING,
            date: new Date(),
            movies: rankedMovies,
            total: moviesWithScore.length,
            page,
            limit,
            hasNextPage: page * limit < moviesWithScore.length,
        };
    }
    /**
     * Lấy thông tin chi tiết phim với filter
     */
    async getMovieDetails(movieIds, filter) {
        const query = {
            _id: { $in: movieIds },
            isPublished: true,
        };
        if (filter.genre)
            query.genres = filter.genre;
        if (filter.country)
            query.country = filter.country;
        if (filter.year)
            query.year = filter.year;
        return movie_model_1.MovieModel.find(query).populate("genres", "name").lean();
    }
    /**
     * Format movie object cho response rank
     */
    formatMovieForRank(movie, lang) {
        return {
            _id: movie._id,
            title: movie.title?.get(lang) ||
                movie.title?.get(movie.defaultLang) ||
                "No title",
            poster: movie.poster,
            thumbnail: movie.thumbnail,
            ratingAvg: movie.ratingAvg || 0,
            views: movie.views || 0,
            year: movie.year,
            country: movie.country,
            type: movie.type,
            rank: 0, // Will be set later
        };
    }
    /**
     * Tạo filter date dựa trên period
     */
    getDateFilter(period) {
        const now = (0, moment_1.default)();
        switch (period) {
            case rank_type_1.RankPeriod.DAILY:
                return {
                    $gte: now.startOf("day").toDate(),
                    $lte: now.endOf("day").toDate(),
                };
            case rank_type_1.RankPeriod.WEEKLY:
                return {
                    $gte: now.startOf("week").toDate(),
                    $lte: now.endOf("week").toDate(),
                };
            case rank_type_1.RankPeriod.MONTHLY:
                return {
                    $gte: now.startOf("month").toDate(),
                    $lte: now.endOf("month").toDate(),
                };
            case rank_type_1.RankPeriod.YEARLY:
                return {
                    $gte: now.startOf("year").toDate(),
                    $lte: now.endOf("year").toDate(),
                };
            case rank_type_1.RankPeriod.ALL_TIME:
                return { $exists: true };
            default:
                return {
                    $gte: now.startOf("week").toDate(),
                    $lte: now.endOf("week").toDate(),
                };
        }
    }
    /**
     * Cập nhật view count cho movie (helper method)
     */
    async updateMovieViewCount(movieId) {
        await movie_model_1.MovieModel.findByIdAndUpdate(movieId, { $inc: { views: 1 } });
    }
    /**
     * Lấy rank của một phim cụ thể
     */
    async getMovieRank(movieId, type = rank_type_1.RankType.MOST_VIEWED, period = rank_type_1.RankPeriod.WEEKLY) {
        const ranks = await this.getRanks({
            type,
            period,
            limit: 1000, // Lấy nhiều để tìm rank
        });
        const movieRank = ranks.movies.findIndex((m) => m._id.toString() === movieId.toString());
        if (movieRank === -1)
            return null;
        return {
            rank: movieRank + 1,
            total: ranks.total,
        };
    }
}
exports.RankService = RankService;
exports.rankService = new RankService();
