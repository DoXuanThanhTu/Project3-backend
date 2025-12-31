"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieService = void 0;
const http_error_1 = require("../../errors/http.error");
const movie_model_1 = require("../../models/movie.model");
const genre_model_1 = require("../../models/genre.model");
class MovieService {
    // ===== USER =====
    static async getPublishedMovies() {
        return movie_model_1.MovieModel.find({ isPublished: true })
            .sort({ createdAt: -1 })
            .populate("franchiseId")
            .populate("genres")
            .populate("director");
    }
    static async getMovieBySlug(slug, lang) {
        const movie = await movie_model_1.MovieModel.findOne({
            [`slug.${lang}`]: slug,
            isPublished: true,
        })
            .populate("genres")
            .populate("franchiseId", "name _id")
            .populate("cast")
            .populate("director");
        if (!movie)
            throw new http_error_1.NotFoundError("Movie not found");
        // tăng view
        movie.views += 1;
        await movie.save();
        return movie;
    }
    static async getMoviesByGenreSlug(genreSlug, options) {
        const { page = 1, limit = 24, sort_field = "updatedAt", sort_type = "desc", country, year, lang = "vi", } = options;
        // Tìm thể loại dựa trên slug
        const genre = await genre_model_1.GenreModel.findOne({
            [`slug.${lang}`]: genreSlug,
            isActive: true,
        });
        if (!genre) {
            throw new http_error_1.NotFoundError("Genre not found");
        }
        // Xây dựng query
        const query = {
            isPublished: true,
            genres: genre._id, // Tìm phim có chứa genre này
        };
        // Lọc theo quốc gia nếu có
        if (country) {
            const countries = country.split(",").map((c) => c.trim());
            query.country = { $in: countries };
        }
        // Lọc theo năm nếu có
        if (year) {
            query.year = parseInt(year);
        }
        // Xử lý sắp xếp
        let sortOption = {};
        const sortFieldMap = {
            "modified.time": "updatedAt",
            year: "year",
            _id: "_id",
        };
        const dbSortField = sortFieldMap[sort_field] || "updatedAt";
        sortOption[dbSortField] = sort_type === "asc" ? 1 : -1;
        // Tính toán phân trang
        const skip = (page - 1) * limit;
        // Thực hiện query
        const [movies, total] = await Promise.all([
            movie_model_1.MovieModel.find(query)
                .skip(skip)
                .limit(limit)
                .sort(sortOption)
                .populate("genres")
                .populate("director"),
            movie_model_1.MovieModel.countDocuments(query),
        ]);
        return {
            movies,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            genre,
        };
    }
    static async searchMovies(keyword, options) {
        const { page = 1, limit = 24, sort_field = "updatedAt", sort_type = "desc", country, year, lang = "vi", } = options;
        // Xây dựng query tìm kiếm
        const query = {
            isPublished: true,
        };
        // Tìm kiếm theo tên (tìm trong title của ngôn ngữ hiện tại và default)
        if (keyword) {
            query.$or = [
                {
                    $expr: {
                        $gt: [
                            {
                                $size: {
                                    $filter: {
                                        input: { $objectToArray: "$title" },
                                        as: "t",
                                        cond: {
                                            $regexMatch: {
                                                input: "$$t.v",
                                                regex: keyword,
                                                options: "i",
                                            },
                                        },
                                    },
                                },
                            },
                            0,
                        ],
                    },
                },
                {
                    $expr: {
                        $gt: [
                            {
                                $size: {
                                    $filter: {
                                        input: { $objectToArray: "$slug" },
                                        as: "s",
                                        cond: {
                                            $regexMatch: {
                                                input: "$$s.v",
                                                regex: keyword,
                                                options: "i",
                                            },
                                        },
                                    },
                                },
                            },
                            0,
                        ],
                    },
                },
            ];
        }
        // Lọc theo quốc gia nếu có
        if (country) {
            const countries = country.split(",").map((c) => c.trim());
            query.country = { $in: countries };
        }
        // Lọc theo năm nếu có
        if (year) {
            query.year = parseInt(year);
        }
        // Xử lý sắp xếp
        let sortOption = {};
        const sortFieldMap = {
            "modified.time": "updatedAt",
            year: "year",
            _id: "_id",
            relevance: "score", // Thêm sắp xếp theo độ liên quan
        };
        const dbSortField = sortFieldMap[sort_field] || "updatedAt";
        // Nếu tìm kiếm và sắp xếp theo relevance, thêm text score
        if (sort_field === "relevance" && keyword) {
            query.$text = { $search: keyword };
            sortOption.score = { $meta: "textScore" };
        }
        else {
            sortOption[dbSortField] = sort_type === "asc" ? 1 : -1;
        }
        const skip = (page - 1) * limit;
        // Nếu có text search, dùng aggregation để có text score
        if (keyword && query.$text) {
            const aggregation = [
                { $match: query },
                { $sort: sortOption },
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: "genres",
                        localField: "genres",
                        foreignField: "_id",
                        as: "genres",
                    },
                },
                {
                    $lookup: {
                        from: "people",
                        localField: "director",
                        foreignField: "_id",
                        as: "director",
                    },
                },
                { $unwind: { path: "$director", preserveNullAndEmptyArrays: true } },
            ];
            const [movies, totalResult] = await Promise.all([
                movie_model_1.MovieModel.aggregate(aggregation),
                movie_model_1.MovieModel.countDocuments(query),
            ]);
            return {
                movies,
                pagination: {
                    page,
                    limit,
                    total: totalResult,
                    totalPages: Math.ceil(totalResult / limit),
                },
                keyword,
            };
        }
        else {
            // Tìm kiếm thông thường
            const [movies, total] = await Promise.all([
                movie_model_1.MovieModel.find(query)
                    .skip(skip)
                    .limit(limit)
                    .sort(sortOption)
                    .populate("genres")
                    .populate("director"),
                movie_model_1.MovieModel.countDocuments(query),
            ]);
            return {
                movies,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
                keyword,
            };
        }
    }
    static async getMoviesByFranchise(franchiseId, lang = "vi") {
        const movies = await movie_model_1.MovieModel.find({
            isPublished: true,
            franchiseId,
        })
            .sort({ createdAt: -1 })
            .populate("franchiseId", "name _id")
            .populate("genres");
        // .populate("director");
        return movies;
    }
    // ===== ADMIN =====
    static async getAllMovies() {
        return movie_model_1.MovieModel.find()
            .sort({ createdAt: -1 })
            .populate("franchiseId", "_id name")
            .populate("genres", "_id name ");
    }
    static async createMovie(data) {
        return movie_model_1.MovieModel.create(data);
    }
    static async updateMovie(id, data) {
        const movie = await movie_model_1.MovieModel.findByIdAndUpdate(id, data, {
            new: true,
        });
        if (!movie)
            throw new http_error_1.NotFoundError("Movie not found");
        return movie;
    }
    static async deleteMovie(id) {
        const movie = await movie_model_1.MovieModel.findByIdAndDelete(id);
        if (!movie)
            throw new http_error_1.NotFoundError("Movie not found");
    }
}
exports.MovieService = MovieService;
