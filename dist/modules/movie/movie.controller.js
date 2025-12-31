"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieController = void 0;
const movie_service_1 = require("./movie.service");
const episode_model_1 = require("../../models/episode.model");
const movie_model_1 = require("../../models/movie.model");
class MovieController {
    // ===== USER =====
    static async getPublished(req, res) {
        try {
            const { page = 1, limit = 24, sort_field = "updatedAt", sort_type = "desc", country, year, lang = "vi", } = req.query;
            const result = await movie_service_1.MovieService.getPublishedMovies({
                page: parseInt(page),
                limit: parseInt(limit),
                sort_field: sort_field,
                sort_type: sort_type,
                country: country,
                year: year,
                lang: lang,
            });
            res.json({
                success: true,
                data: result.movies,
            });
        }
        catch (error) {
            console.error("Error in getPublished:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    static async getMovieByFranchise(req, res) {
        try {
            const { franchiseId } = req.params;
            const lang = req.query.lang || "vi";
            const movies = await movie_service_1.MovieService.getMoviesByFranchise(franchiseId, lang);
            res.json({ success: true, data: movies });
        }
        catch (error) {
            console.error("Error in getMovieByFranchise:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }
    static async getDetail(req, res) {
        try {
            const { slug } = req.params;
            const lang = req.query.lang || "vi";
            const movie = await movie_service_1.MovieService.getMovieBySlug(slug, lang);
            const data = {
                id: movie._id,
                title: movie.title,
                slug: movie.slug,
                description: movie.description,
                poster: movie.poster,
                thumbnail: movie.thumbnail,
                banner: movie.banner,
                backdrop: movie.backdrop,
                trailerUrl: movie.trailerUrl,
                type: movie.type,
                // year: movie.relasedYear,
                country: movie.country,
                // duration: movie.duration,
                currentEpisode: movie.currentEpisode,
                totalEpisodes: movie.totalEpisodes,
                // seasonOrLabel: movie.seasonOrLabel,
                rating: movie.ratingAvg,
                views: movie.views,
                isPublished: movie.isPublished,
                // createdAt: movie.createdAt,
                // updatedAt: movie.updatedAt,
                // franchise: movie.franchiseId
                //   ? {
                //       id: movie.franchiseId._id,
                //       name: movie.franchiseId.name,
                //     }
                //   : null,
                genres: movie.genres?.map((g) => ({
                    id: g._id,
                    name: g.name,
                    slug: g.slug,
                })) || [],
                cast: movie.cast || [],
                // director: movie.director
                //   ? {
                //       id: movie.director._id,
                //       name: movie.director.name,
                //     }
                //   : null,
                // flags: movie.flag || [],
            };
            res.json({
                success: true,
                data,
            });
        }
        catch (error) {
            if (error.message === "Movie not found") {
                return res.status(404).json({
                    success: false,
                    message: "Movie not found",
                });
            }
            console.error("Error in getDetail:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    static async getByGenre(req, res) {
        try {
            const { slug } = req.params;
            const { page = 1, limit = 24, sort_field = "updatedAt", sort_type = "desc", country, year, lang = "vi", } = req.query;
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 24;
            if (pageNum < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Page must be greater than 0",
                });
            }
            if (limitNum < 1 || limitNum > 100) {
                return res.status(400).json({
                    success: false,
                    message: "Limit must be between 1 and 100",
                });
            }
            const result = await movie_service_1.MovieService.getMoviesByGenreSlug(slug, {
                page: pageNum,
                limit: limitNum,
                sort_field: sort_field,
                sort_type: sort_type,
                country: country,
                year: year,
                lang: lang,
            });
            const data = result.movies.map((movie) => ({
                id: movie._id,
                title: movie.title,
                slug: movie.slug,
                description: movie.description,
                poster: movie.poster,
                thumbnail: movie.thumbnail,
                banner: movie.banner,
                backdrop: movie.backdrop,
                trailerUrl: movie.trailerUrl,
                type: movie.type,
                year: movie.relasedYear,
                country: movie.country,
                duration: movie.duration,
                currentEpisode: movie.currentEpisode,
                totalEpisodes: movie.totalEpisodes,
                seasonOrLabel: movie.seasonOrLabel,
                rating: movie.ratingAvg,
                views: movie.views,
                isPublished: movie.isPublished,
                franchise: movie.franchiseId
                    ? {
                        id: movie.franchiseId._id,
                        title: movie.franchiseId.title,
                    }
                    : null,
                genres: movie.genres?.map((g) => ({
                    id: g._id,
                    title: g.title,
                    slug: g.slug,
                })) || [],
                cast: movie.cast || [],
                director: movie.director
                    ? {
                        id: movie.director._id,
                        name: movie.director.name,
                    }
                    : null,
                flags: movie.flag || [],
            }));
            const genreInfo = {
                id: result.genre._id,
                title: result.genre.title,
                slug: result.genre.slug,
                description: result.genre.description,
            };
            res.json({
                success: true,
                data,
                // genre: genreInfo,
                pagination: result.pagination,
            });
        }
        catch (error) {
            if (error.message === "Genre not found") {
                return res.status(404).json({
                    success: false,
                    message: "Genre not found",
                });
            }
            console.error("Error in getByGenre:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    static async searchMovies(req, res) {
        try {
            const { keyword } = req.params;
            const { page = 1, limit = 24, sort_field = "updatedAt", sort_type = "desc", country, year, lang = "vi", } = req.query;
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 24;
            if (pageNum < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Page must be greater than 0",
                });
            }
            if (limitNum < 1 || limitNum > 100) {
                return res.status(400).json({
                    success: false,
                    message: "Limit must be between 1 and 100",
                });
            }
            if (!keyword || keyword.trim() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Search keyword is required",
                });
            }
            const result = await movie_service_1.MovieService.searchMovies(keyword, {
                page: pageNum,
                limit: limitNum,
                sort_field: sort_field,
                sort_type: sort_type,
                country: country,
                year: year,
                lang: lang,
            });
            const data = result.movies.map((movie) => ({
                id: movie._id,
                title: movie.title,
                slug: movie.slug,
                description: movie.description,
                poster: movie.poster,
                thumbnail: movie.thumbnail,
                banner: movie.banner,
                backdrop: movie.backdrop,
                trailerUrl: movie.trailerUrl,
                type: movie.type,
                year: movie.relasedYear,
                country: movie.country,
                duration: movie.duration,
                currentEpisode: movie.currentEpisode,
                totalEpisodes: movie.totalEpisodes,
                seasonOrLabel: movie.seasonOrLabel,
                rating: movie.ratingAvg,
                views: movie.views,
                isPublished: movie.isPublished,
                flags: movie.flag || [],
            }));
            res.json({
                success: true,
                data,
                searchInfo: {
                    keyword: result.keyword,
                    totalResults: result.pagination.total,
                },
                pagination: result.pagination,
            });
        }
        catch (error) {
            console.error("Error in searchMovies:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    static async getMovieAndSameFranchise(req, res) {
        try {
            const { slug } = req.params;
            const lang = req.query.lang || "vi";
            if (!slug) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu slug",
                });
            }
            const movie = await movie_service_1.MovieService.getMovieBySlug(slug, lang);
            if (!movie || !movie.isPublished) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy phim",
                });
            }
            let relatedMovies = [];
            if (movie.franchiseId) {
                relatedMovies = await movie_service_1.MovieService.getMoviesByFranchise(
                // movie.franchiseId._id,
                lang);
            }
            const formattedMovie = {
                id: movie._id,
                title: movie.title,
                slug: movie.slug,
                description: movie.description,
                poster: movie.poster,
                thumbnail: movie.thumbnail,
                banner: movie.banner,
                backdrop: movie.backdrop,
                trailerUrl: movie.trailerUrl,
                type: movie.type,
                // year: movie.relasedYear,
                country: movie.country,
                // duration: movie.duration,
                currentEpisode: movie.currentEpisode,
                totalEpisodes: movie.totalEpisodes,
                // seasonOrLabel: movie.seasonOrLabel,
                rating: movie.ratingAvg,
                views: movie.views,
                // franchise: movie.franchiseId
                //   ? {
                //       id: movie.franchiseId._id,
                //       name: movie.franchiseId.name,
                //     }
                //   : null,
                genres: movie.genres?.map((g) => ({
                    id: g._id,
                    name: g.name,
                    slug: g.slug,
                })) || [],
                cast: movie.cast || [],
                // director: movie.director
                //   ? {
                //       id: movie.director._id,
                //       name: movie.director.name,
                //     }
                //   : null,
                // flags: movie.flag || [],
            };
            const formattedRelatedMovies = relatedMovies
                .filter((m) => m._id.toString() !== movie._id.toString())
                .map((movie) => ({
                id: movie._id,
                title: movie.title,
                slug: movie.slug,
                description: movie.description,
                poster: movie.poster,
                thumbnail: movie.thumbnail,
                banner: movie.banner,
                backdrop: movie.backdrop,
                trailerUrl: movie.trailerUrl,
                type: movie.type,
                year: movie.relasedYear,
                country: movie.country,
                duration: movie.duration,
                currentEpisode: movie.currentEpisode,
                totalEpisodes: movie.totalEpisodes,
                seasonOrLabel: movie.seasonOrLabel,
                rating: movie.ratingAvg,
                views: movie.views,
                franchise: movie.franchiseId
                    ? {
                        id: movie.franchiseId._id,
                        name: movie.franchiseId.name,
                    }
                    : null,
                genres: movie.genres?.map((g) => ({
                    id: g._id,
                    name: g.name,
                    slug: g.slug,
                })) || [],
                cast: movie.cast || [],
                director: movie.director
                    ? {
                        id: movie.director._id,
                        name: movie.director.name,
                    }
                    : null,
                flags: movie.flag || [],
            }));
            res.json({
                success: true,
                data: {
                    movie: formattedMovie,
                    relatedMovies: formattedRelatedMovies,
                },
            });
        }
        catch (error) {
            console.error("Error in getMovieAndSameFranchise:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Lỗi khi lấy thông tin phim",
            });
        }
    }
    static async getMoviesByType(req, res) {
        try {
            const { type } = req.params;
            const { page = 1, limit = 24, sort_field = "updatedAt", sort_type = "desc", country, year, lang = "vi", } = req.query;
            const result = await movie_service_1.MovieService.getMoviesByType(type, {
                page: parseInt(page),
                limit: parseInt(limit),
                sort_field: sort_field,
                sort_type: sort_type,
                country: country,
                year: year,
                lang: lang,
            });
            const data = result.movies.map((movie) => ({
                id: movie._id,
                title: movie.title,
                slug: movie.slug,
                description: movie.description,
                poster: movie.poster,
                thumbnail: movie.thumbnail,
                banner: movie.banner,
                backdrop: movie.backdrop,
                trailerUrl: movie.trailerUrl,
                type: movie.type,
                year: movie.relasedYear,
                country: movie.country,
                duration: movie.duration,
                currentEpisode: movie.currentEpisode,
                totalEpisodes: movie.totalEpisodes,
                seasonOrLabel: movie.seasonOrLabel,
                rating: movie.ratingAvg,
                views: movie.views,
                isPublished: movie.isPublished,
                franchise: movie.franchiseId
                    ? {
                        id: movie.franchiseId._id,
                        name: movie.franchiseId.name,
                    }
                    : null,
                genres: movie.genres?.map((g) => ({
                    id: g._id,
                    name: g.name,
                    slug: g.slug,
                })) || [],
                cast: movie.cast || [],
                director: movie.director
                    ? {
                        id: movie.director._id,
                        name: movie.director.name,
                    }
                    : null,
                flags: movie.flag || [],
            }));
            res.json({
                success: true,
                data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            console.error("Error in getMoviesByType:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    static async getFullDetails(req, res) {
        try {
            const { slug } = req.params;
            const lang = req.query.lang || "vi";
            const { episode, server } = req.query;
            if (!slug) {
                return res.status(400).json({
                    success: false,
                    message: "Slug is required",
                });
            }
            // Lấy toàn bộ thông tin movie
            const fullData = await movie_service_1.MovieService.getMovieFullDetails(slug, lang);
            // Nếu có chỉ định episode và server cụ thể
            let specificEpisode = null;
            if (episode && server) {
                const episodeData = await episode_model_1.EpisodeModel.findOne({
                    movieId: fullData.movie.id,
                    serverId: server,
                    $or: [
                        { episodeOrLabel: episode },
                        { "slug.vi": episode },
                        { "slug.en": episode },
                    ],
                    isPublished: true,
                }).lean();
                if (episodeData) {
                    specificEpisode = movie_service_1.MovieService.formatEpisode(episodeData, lang);
                }
            }
            // Tăng lượt xem
            // await MovieService.incrementViewCount(fullData.movie.id);
            res.json({
                success: true,
                data: fullData,
            });
        }
        catch (error) {
            if (error.message === "Movie not found") {
                return res.status(404).json({
                    success: false,
                    message: "Movie not found",
                });
            }
            console.error("Error in getFullDetails:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    /**
     * Lấy danh sách episodes theo server
     */
    static async getEpisodesByServer(req, res) {
        try {
            const { movieId, serverId } = req.params;
            const lang = req.query.lang || "vi";
            if (!movieId || !serverId) {
                return res.status(400).json({
                    success: false,
                    message: "Movie ID and Server ID are required",
                });
            }
            const result = await movie_service_1.MovieService.getEpisodesByServer(movieId, serverId, lang);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error("Error in getEpisodesByServer:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    /**
     * Lấy thông tin episode cụ thể
     */
    static async getEpisodeDetail(req, res) {
        try {
            const { movieId, episodeId } = req.params;
            const lang = req.query.lang || "vi";
            const episode = await episode_model_1.EpisodeModel.findOne({
                _id: episodeId,
                movieId,
                isPublished: true,
            })
                .populate("serverId", "name baseUrl isActive")
                .lean();
            if (!episode) {
                return res.status(404).json({
                    success: false,
                    message: "Episode not found",
                });
            }
            const movie = await movie_model_1.MovieModel.findById(movieId)
                .select("title slug type")
                .lean();
            const formattedEpisode = movie_service_1.MovieService.formatEpisode(episode, lang);
            // Lấy danh sách episodes cùng server
            const serverEpisodes = await episode_model_1.EpisodeModel.find({
                movieId,
                serverId: episode.serverId,
                isPublished: true,
                _id: { $ne: episodeId },
            })
                .sort({ episodeOrLabel: 1 })
                .limit(5)
                .lean();
            const formattedServerEpisodes = serverEpisodes.map((ep) => movie_service_1.MovieService.formatEpisode(ep, lang));
            res.json({
                success: true,
                data: {
                    episode: formattedEpisode,
                    movie: movie
                        ? {
                            id: movie._id,
                            title: movie.title instanceof Map
                                ? movie.title.get(lang) || movie.title.get("vi") || ""
                                : movie.title || "",
                            slug: movie.slug instanceof Map
                                ? movie.slug.get(lang) || movie.slug.get("vi") || ""
                                : movie.slug || "",
                            type: movie.type,
                        }
                        : null,
                    server: episode.serverId,
                    // ? {
                    //     id: episode.serverId._id,
                    //     name: episode.serverId.name,
                    //     baseUrl: episode.serverId.baseUrl,
                    //     isActive: episode.serverId.isActive,
                    //   }
                    // : null,
                    // otherEpisodes: formattedServerEpisodes,
                    // nextEpisode: formattedServerEpisodes.find(ep =>
                    //   parseInt(ep.episodeOrLabel) > parseInt(formattedEpisode.episodeOrLabel)
                    // )
                },
            });
        }
        catch (error) {
            console.error("Error in getEpisodeDetail:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    // ===== ADMIN =====
    static async getAll(req, res) {
        try {
            const { page = 1, limit = 24, sort_field = "createdAt", sort_type = "desc", search = "", status, type = "all", } = req.query;
            const result = await movie_service_1.MovieService.getAllMovies({
                page: parseInt(page),
                limit: parseInt(limit),
                sort_field: sort_field,
                sort_type: sort_type,
                search: search,
                status: status,
                type: type,
            });
            const data = result.movies.map((movie) => ({
                id: movie._id,
                title: movie.title,
                slug: movie.slug,
                description: movie.description,
                poster: movie.poster,
                thumbnail: movie.thumbnail,
                banner: movie.banner,
                backdrop: movie.backdrop,
                trailerUrl: movie.trailerUrl,
                type: movie.type,
                year: movie.relasedYear,
                country: movie.country,
                duration: movie.duration,
                currentEpisode: movie.currentEpisode,
                totalEpisodes: movie.totalEpisodes,
                seasonOrLabel: movie.seasonOrLabel,
                rating: movie.ratingAvg,
                views: movie.views,
                isPublished: movie.isPublished,
                createdAt: movie.createdAt,
                updatedAt: movie.updatedAt,
                defaultLang: movie.defaultLang,
                franchise: movie.franchiseId
                    ? {
                        id: movie.franchiseId._id,
                        name: movie.franchiseId.name,
                    }
                    : null,
                genres: movie.genres?.map((g) => ({
                    id: g._id,
                    name: g.name,
                })) || [],
                cast: movie.cast || [],
                director: movie.director
                    ? {
                        id: movie.director._id,
                        name: movie.director.name,
                    }
                    : null,
                flags: movie.flag || [],
            }));
            res.json({
                success: true,
                data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            console.error("Error in getAll:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    static async getOne(req, res) {
        try {
            const { id } = req.params;
            const movie = await movie_service_1.MovieService.getMovieById(id);
            const data = {
                id: movie._id,
                title: movie.title,
                slug: movie.slug,
                description: movie.description,
                poster: movie.poster,
                thumbnail: movie.thumbnail,
                banner: movie.banner,
                backdrop: movie.backdrop,
                trailerUrl: movie.trailerUrl,
                type: movie.type,
                // year: movie.relasedYear,
                // country: movie.country,
                // duration: movie.duration,
                currentEpisode: movie.currentEpisode,
                totalEpisodes: movie.totalEpisodes,
                // seasonOrLabel: movie.seasonOrLabel,
                rating: movie.ratingAvg,
                views: movie.views,
                isPublished: movie.isPublished,
                // createdAt: movie.createdAt,
                // updatedAt: movie.updatedAt,
                defaultLang: movie.defaultLang,
                // franchise: movie.franchiseId
                //   ? {
                //       id: movie.franchiseId._id,
                //       name: movie.franchiseId.name,
                //     }
                //   : null,
                genres: movie.genres?.map((g) => ({
                    id: g._id,
                    name: g.name,
                    slug: g.slug,
                })) || [],
                cast: movie.cast || [],
                // director: movie.director
                //   ? {
                //       id: movie.director._id,
                //       name: movie.director.name,
                //     }
                //   : null,
                // flags: movie.flag || [],
            };
            res.json({
                success: true,
                data,
            });
        }
        catch (error) {
            if (error.message === "Movie not found") {
                return res.status(404).json({
                    success: false,
                    message: "Movie not found",
                });
            }
            console.error("Error in getOne:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    static async create(req, res) {
        try {
            const movie = await movie_service_1.MovieService.createMovie(req.body);
            res.status(201).json({
                success: true,
                data: movie,
            });
        }
        catch (error) {
            console.error("Error in create:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { lang } = req.query;
            const movie = await movie_service_1.MovieService.updateMovie(id, req.body, lang);
            res.json({
                success: true,
                data: movie,
            });
        }
        catch (error) {
            if (error.message === "Movie not found") {
                return res.status(404).json({
                    success: false,
                    message: "Movie not found",
                });
            }
            console.error("Error in update:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            await movie_service_1.MovieService.deleteMovie(id);
            res.json({
                success: true,
                message: "Movie deleted successfully",
            });
        }
        catch (error) {
            if (error.message === "Movie not found") {
                return res.status(404).json({
                    success: false,
                    message: "Movie not found",
                });
            }
            console.error("Error in delete:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }
    static async togglePublish(req, res) {
        try {
            const { id } = req.params;
            const { isPublished } = req.body;
            const movie = await movie_service_1.MovieService.togglePublishStatus(id, isPublished);
            res.json({
                success: true,
                data: movie,
            });
        }
        catch (error) {
            if (error.message === "Movie not found") {
                return res.status(404).json({
                    success: false,
                    message: "Movie not found",
                });
            }
            console.error("Error in togglePublish:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }
    static async bulkUpdate(req, res) {
        try {
            const { ids, ...data } = req.body;
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid or empty ids array",
                });
            }
            const result = await movie_service_1.MovieService.bulkUpdateMovies(ids, data);
            res.json({
                success: true,
                data: result,
                message: `${result.length} movies updated successfully`,
            });
        }
        catch (error) {
            console.error("Error in bulkUpdate:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }
    static async bulkDelete(req, res) {
        try {
            const { ids } = req.body;
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid or empty ids array",
                });
            }
            const result = await movie_service_1.MovieService.bulkDeleteMovies(ids);
            res.json({
                success: true,
                data: result,
                message: `${result.deletedCount} movies deleted successfully`,
            });
        }
        catch (error) {
            console.error("Error in bulkDelete:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }
    static async getStats(req, res) {
        try {
            const stats = await movie_service_1.MovieService.getMovieStats();
            res.json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            console.error("Error in getStats:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }
}
exports.MovieController = MovieController;
