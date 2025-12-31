"use strict";
// services/view.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
const movie_model_1 = require("../../models/movie.model");
const viewCounter_model_1 = require("../../models/viewCounter.model");
class ViewService {
    constructor() {
        this.cache = new Map();
        this.sessionCache = new Map(); // Để check unique view
        this.batchSize = 100; // Kích thước batch update
        this.updateInterval = 30000; // 30 giây update một lần
        // Tự động batch update mỗi 30 giây
        setInterval(() => this.batchUpdateFromCache(), this.updateInterval);
        // Xóa cache cũ mỗi ngày
        setInterval(() => this.cleanupOldCache(), 24 * 60 * 60 * 1000);
    }
    // Tăng view với kiểm tra duplicate
    async incrementView(movieId, episodeId, sessionId, options = {}) {
        try {
            const dateKey = new Date().toISOString().split("T")[0];
            const viewType = options.viewType || (episodeId ? "episode" : "movie");
            // Tạo cache key
            const cacheKey = `${movieId}:${episodeId || ""}:${dateKey}:${viewType}`;
            // Kiểm tra unique view nếu có sessionId
            if (options.isUnique !== false && sessionId) {
                const sessionKey = `${sessionId}:${movieId}:${episodeId || ""}`;
                // Nếu session đã xem trong vòng 30 phút thì không tính
                if (this.hasRecentView(sessionKey)) {
                    console.log(`[VIEW] Session ${sessionId} đã xem gần đây, không tính view`);
                    return;
                }
                // Đánh dấu session đã xem
                this.markSessionViewed(sessionKey);
            }
            // Tăng count trong cache
            const currentCount = this.cache.get(cacheKey) || 0;
            this.cache.set(cacheKey, currentCount + 1);
            // Cập nhật watch duration nếu có
            if (options.watchDuration && options.watchDuration > 0) {
                const durationKey = `${cacheKey}:duration`;
                const currentDuration = this.cache.get(durationKey) || 0;
                this.cache.set(durationKey, currentDuration + options.watchDuration);
            }
            console.log(`[VIEW CACHE] ${cacheKey} = ${this.cache.get(cacheKey)}`);
            // Trigger batch update nếu cache đủ lớn
            if (this.cache.size >= this.batchSize) {
                await this.batchUpdateFromCache();
            }
        }
        catch (error) {
            console.error("Error incrementing view:", error);
        }
    }
    // Kiểm tra session đã xem gần đây chưa
    hasRecentView(sessionKey) {
        return this.sessionCache.has(sessionKey);
    }
    // Đánh dấu session đã xem
    markSessionViewed(sessionKey) {
        this.sessionCache.set(sessionKey, new Set([Date.now().toString()]));
        // Tự động xóa sau 30 phút
        setTimeout(() => {
            this.sessionCache.delete(sessionKey);
        }, 30 * 60 * 1000);
    }
    // Batch update từ cache vào database
    async batchUpdateFromCache() {
        if (this.cache.size === 0)
            return;
        console.log(`[VIEW CACHE] Bắt đầu batch update với ${this.cache.size} items`);
        const updates = [];
        const durationUpdates = new Map();
        for (const [key, count] of this.cache.entries()) {
            const [movieId, episodeId, dateStr, viewType] = key.split(":");
            if (!dateStr)
                continue;
            const date = new Date(dateStr);
            // Chỉ update nếu count > 0
            if (count <= 0)
                continue;
            // Check if it's a duration update
            if (key.endsWith(":duration")) {
                durationUpdates.set(key.replace(":duration", ""), count);
                continue;
            }
            const filter = {
                movieId,
                date,
                viewType: viewType || (episodeId ? "episode" : "movie"),
            };
            if (episodeId && episodeId !== "") {
                filter.episodeId = episodeId;
            }
            else {
                filter.episodeId = null;
            }
            updates.push(viewCounter_model_1.ViewCounterModel.findOneAndUpdate(filter, {
                $inc: { count },
                $setOnInsert: {
                    movieId,
                    episodeId: episodeId || null,
                    date,
                    viewType: viewType || (episodeId ? "episode" : "movie"),
                },
            }, { upsert: true, new: true }));
        }
        // Xử lý duration updates
        for (const [key, duration] of durationUpdates.entries()) {
            const [movieId, episodeId, dateStr, viewType] = key.split(":");
            const date = new Date(dateStr);
            const filter = { movieId, date };
            if (episodeId && episodeId !== "")
                filter.episodeId = episodeId;
            updates.push(viewCounter_model_1.ViewCounterModel.findOneAndUpdate(filter, { $inc: { watchDuration: duration } }, { upsert: false }));
        }
        try {
            await Promise.all(updates);
            console.log(`[VIEW CACHE] Batch update thành công, xóa cache`);
            // Cập nhật tổng view vào Movie model
            await this.updateMovieTotalViews();
            this.cache.clear();
        }
        catch (error) {
            console.error("Error in batch update:", error);
        }
    }
    // Cập nhật tổng view vào Movie model
    async updateMovieTotalViews() {
        try {
            // Lấy tất cả movieId từ cache
            const movieIds = new Set();
            for (const key of this.cache.keys()) {
                const [movieId] = key.split(":");
                if (movieId)
                    movieIds.add(movieId);
            }
            for (const movieId of movieIds) {
                // Tính tổng view của movie
                const totalViews = await this.getTotalViewsByMovie(movieId);
                // Update vào Movie model
                await movie_model_1.MovieModel.findByIdAndUpdate(movieId, {
                    $set: { views: totalViews },
                });
            }
        }
        catch (error) {
            console.error("Error updating movie total views:", error);
        }
    }
    // Lấy tổng view của movie
    async getTotalViewsByMovie(movieId) {
        try {
            // Tính từ database
            const dbResult = await viewCounter_model_1.ViewCounterModel.aggregate([
                {
                    $match: {
                        movieId: movieId,
                        viewType: { $in: ["movie", "episode"] }, // Chỉ tính view phim và tập
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$count" },
                    },
                },
            ]);
            const dbTotal = dbResult.length > 0 ? dbResult[0].total : 0;
            // Tính từ cache
            let cacheTotal = 0;
            for (const [key, count] of this.cache.entries()) {
                const [cachedMovieId] = key.split(":");
                if (cachedMovieId === movieId && !key.endsWith(":duration")) {
                    cacheTotal += count;
                }
            }
            return dbTotal + cacheTotal;
        }
        catch (error) {
            console.error("Error getting total views:", error);
            return 0;
        }
    }
    // Thống kê chi tiết
    async getStatistics(options) {
        const { movieId, episodeId, from, to, groupBy = "day", viewType } = options;
        const matchStage = {};
        if (movieId)
            matchStage.movieId = movieId;
        if (episodeId)
            matchStage.episodeId = episodeId;
        if (viewType)
            matchStage.viewType = viewType;
        if (from || to) {
            matchStage.date = {};
            if (from)
                matchStage.date.$gte = from;
            if (to)
                matchStage.date.$lte = to;
        }
        let groupStage;
        switch (groupBy) {
            case "day":
                groupStage = {
                    $group: {
                        _id: {
                            year: { $year: "$date" },
                            month: { $month: "$date" },
                            day: { $dayOfMonth: "$date" },
                        },
                        date: { $first: "$date" },
                        totalViews: { $sum: "$count" },
                        totalDuration: { $sum: "$watchDuration" },
                        movieId: { $first: "$movieId" },
                    },
                };
                break;
            case "month":
                groupStage = {
                    $group: {
                        _id: {
                            year: { $year: "$date" },
                            month: { $month: "$date" },
                        },
                        month: {
                            $first: { $dateToString: { format: "%Y-%m", date: "$date" } },
                        },
                        totalViews: { $sum: "$count" },
                        totalDuration: { $sum: "$watchDuration" },
                    },
                };
                break;
            default:
                groupStage = {
                    $group: {
                        _id: null,
                        totalViews: { $sum: "$count" },
                        totalDuration: { $sum: "$watchDuration" },
                    },
                };
        }
        const pipeline = [
            { $match: matchStage },
            groupStage,
            { $sort: { date: -1 } },
        ];
        return await viewCounter_model_1.ViewCounterModel.aggregate(pipeline);
    }
    // Top movies theo view
    async getTopMovies(limit = 10, period) {
        const dateFilter = {};
        if (period) {
            const now = new Date();
            let startDate = new Date();
            switch (period) {
                case "day":
                    startDate.setDate(now.getDate() - 1);
                    break;
                case "week":
                    startDate.setDate(now.getDate() - 7);
                    break;
                case "month":
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                case "year":
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
            }
            dateFilter.date = { $gte: startDate };
        }
        const pipeline = [
            { $match: dateFilter },
            {
                $group: {
                    _id: "$movieId",
                    totalViews: { $sum: "$count" },
                    totalDuration: { $sum: "$watchDuration" },
                },
            },
            { $sort: { totalViews: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: "movies",
                    localField: "_id",
                    foreignField: "_id",
                    as: "movieInfo",
                },
            },
            { $unwind: "$movieInfo" },
            {
                $project: {
                    movieId: "$_id",
                    totalViews: 1,
                    totalDuration: 1,
                    title: "$movieInfo.title",
                    thumbnail: "$movieInfo.thumbnail",
                    type: "$movieInfo.type",
                },
            },
        ];
        return await viewCounter_model_1.ViewCounterModel.aggregate(pipeline);
    }
    // Cleanup old cache
    cleanupOldCache() {
        // Xóa session cache cũ (trên 1 giờ)
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        for (const [key, timestamps] of this.sessionCache.entries()) {
            const newestTimestamp = Math.max(...Array.from(timestamps).map((t) => parseInt(t)));
            if (newestTimestamp < oneHourAgo) {
                this.sessionCache.delete(key);
            }
        }
        console.log(`[VIEW CACHE] Cleaned up old session cache, remaining: ${this.sessionCache.size}`);
    }
}
exports.default = new ViewService();
