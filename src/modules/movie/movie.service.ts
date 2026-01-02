import { IMovie } from "../../types/movie.type";
import { NotFoundError } from "../../errors/http.error";
import { MovieModel } from "../../models/movie.model";
import { GenreModel } from "../../models/genre.model";
import { ServerModel } from "../../models/server.model";
import { EpisodeModel } from "../../models/episode.model";
import { IEpisode } from "../../types/episode.type";
import mongoose, { mongo, ObjectId, Types } from "mongoose";
import { IServer } from "../../types/server.type";
import { fr } from "zod/v4/locales";
import { getLocalizedValue, getLocalizedValueMap } from "../../utils/i18n.util";
import { get } from "node:http";
type EpisodeMeta = {
  episode: IEpisode;
  typePriority: number;
  episodeNumber: number | null;
  createdAt: Date;
};

export class MovieService {
  // ===== USER =====
  private static normalizeEpisode(ep: IEpisode): EpisodeMeta {
    const label = ep.episodeOrLabel?.toLowerCase() || "";

    let typePriority = 4; // other
    let episodeNumber: number | null = null;

    // ===== Xác định loại =====
    if (/^\d+$/.test(label) || /tập\s*\d+|ep\s*\d+/.test(label)) {
      typePriority = 1; // episode thường
    } else if (/special/.test(label)) {
      typePriority = 2;
    } else if (/ova|movie|extra/.test(label)) {
      typePriority = 3;
    }

    // ===== Extract số =====
    const matches = label.match(/\d+/g);
    if (matches?.length) {
      episodeNumber = parseInt(matches[matches.length - 1], 10);
    }

    return {
      episode: ep,
      typePriority,
      episodeNumber,
      createdAt: ep.createdAt ?? new Date(0),
    };
  }

  static async getPublishedMovies(
    options: {
      page?: number;
      limit?: number;
      sort_field?: string;
      sort_type?: "asc" | "desc";
      country?: string;
      year?: string;
      lang?: string;
    } = {}
  ) {
    const {
      page = 1,
      limit = 24,
      sort_field = "updatedAt",
      sort_type = "desc",
      country,
      year,
      lang = "vi",
    } = options;

    const query: any = {
      isPublished: true,
    };

    // Lọc theo quốc gia nếu có
    if (country) {
      const countries = country.split(",").map((c) => c.trim());
      query.country = { $in: countries };
    }

    // Lọc theo năm nếu có
    if (year) {
      query.relasedYear = parseInt(year);
    }

    // Xử lý sắp xếp
    let sortOption: any = {};
    const sortFieldMap: Record<string, string> = {
      "modified.time": "updatedAt",
      year: "relasedYear",
      _id: "_id",
      rating: "ratingAvg",
      views: "views",
    };

    const dbSortField = sortFieldMap[sort_field] || "updatedAt";
    sortOption[dbSortField] = sort_type === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const [movies, total] = await Promise.all([
      MovieModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sortOption)
        .populate("genres")
        .populate("franchiseId", "_id title")
        .populate("director"),
      MovieModel.countDocuments(query),
    ]);

    return {
      movies: movies.map((movie) => this.formatMovieMap(movie, lang)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getMovieBySlug(slug: string, lang: string) {
    const movie = await MovieModel.findOne({
      [`slug.${lang}`]: slug,
      isPublished: true,
    })
      .populate("genres")
      .populate("franchiseId", "_id title")
      .populate("cast")
      .populate("director");

    if (!movie) throw new NotFoundError("Movie not found");

    // tăng view
    // movie.views += 1;
    // await movie.save();
    return this.formatMovieMap(movie, lang);
  }

  static async getMoviesByGenreSlug(
    genreSlug: string,
    options: {
      page: number;
      limit: number;
      sort_field: string;
      sort_type: "asc" | "desc";
      country?: string;
      year?: string;
      lang?: string;
    }
  ) {
    const {
      page = 1,
      limit = 24,
      sort_field = "updatedAt",
      sort_type = "desc",
      country,
      year,
      lang = "vi",
    } = options;

    // Tìm thể loại dựa trên slug
    const genre = await GenreModel.findOne({
      [`slug.${lang}`]: genreSlug,
      isActive: true,
    });

    if (!genre) {
      throw new NotFoundError("Genre not found");
    }

    // Xây dựng query
    const query: any = {
      isPublished: true,
      genres: { $in: [genre._id] },
    };

    // Lọc theo quốc gia nếu có
    if (country) {
      const countries = country.split(",").map((c) => c.trim());
      query.country = { $in: countries };
    }

    // Lọc theo năm nếu có
    if (year) {
      query.relasedYear = parseInt(year);
    }

    // Xử lý sắp xếp
    let sortOption: any = {};
    const sortFieldMap: Record<string, string> = {
      "modified.time": "updatedAt",
      year: "relasedYear",
      _id: "_id",
      rating: "ratingAvg",
      views: "views",
    };

    const dbSortField = sortFieldMap[sort_field] || "updatedAt";
    sortOption[dbSortField] = sort_type === "asc" ? 1 : -1;

    // Tính toán phân trang
    const skip = (page - 1) * limit;

    // Thực hiện query
    const [movies, total] = await Promise.all([
      MovieModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sortOption)
        .populate("franchiseId", "_id title")
        .populate("genres")
        .populate("director"),
      MovieModel.countDocuments(query),
    ]);

    return {
      movies: movies.map((movie) => this.formatMovieMap(movie, lang)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      genre,
    };
  }

  static async searchMovies(
    keyword: string,
    options: {
      page: number;
      limit: number;
      sort_field: string;
      sort_type: "asc" | "desc";
      country?: string;
      year?: string;
      lang?: string;
    }
  ) {
    const {
      page = 1,
      limit = 24,
      sort_field = "updatedAt",
      sort_type = "desc",
      country,
      year,
      lang = "vi",
    } = options;

    const regex = keyword ? new RegExp(keyword, "i") : null;

    const sortFieldMap: Record<string, string> = {
      "modified.time": "updatedAt",
      year: "relasedYear",
      _id: "_id",
      rating: "ratingAvg",
      views: "views",
      relevance: "updatedAt",
    };
    const dbSortField = sortFieldMap[sort_field] || "updatedAt";
    const sortOption: any = { [dbSortField]: sort_type === "asc" ? 1 : -1 };

    const matchStage: any = { isPublished: true };
    if (country) {
      matchStage.country = { $in: country.split(",").map((c) => c.trim()) };
    }
    if (year) {
      matchStage.relasedYear = parseInt(year);
    }

    const pipeline: any[] = [
      { $match: matchStage },
      {
        $addFields: {
          titleArray: { $objectToArray: "$title" },
          slugArray: { $objectToArray: "$slug" },
          descriptionArray: { $objectToArray: "$description" },
        },
      },
    ];

    if (regex) {
      pipeline.push({
        $match: {
          $or: [
            { "titleArray.v": regex },
            { "slugArray.v": regex },
            { "descriptionArray.v": regex },
          ],
        },
      });
    }

    pipeline.push({ $sort: sortOption });
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    const movies = await MovieModel.aggregate(pipeline);
    const total = await MovieModel.countDocuments(matchStage);

    return {
      movies: movies.map((movie) => ({
        id: movie._id,
        title: getLocalizedValue(movie.title, lang, movie.defaultLang),
        slug: getLocalizedValue(movie.slug, lang, movie.defaultLang),
        description: getLocalizedValue(
          movie.description,
          lang,
          movie.defaultLang
        ),
        poster: movie.poster,
        thumbnail: movie.thumbnail,
        type: movie.type,
        year: movie.year,
        ratingAvg: movie.ratingAvg,
        views: movie.views,
        totalEpisodes: movie.totalEpisodes,
        currentEpisode: movie.currentEpisode,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      keyword,
    };
  }

  static async getMoviesByFranchise(franchiseId: string, lang: string = "vi") {
    const id = new Types.ObjectId(franchiseId);
    const movies = await MovieModel.find({ franchiseId: id, isPublished: true })
      .sort({ createdAt: -1 })
      .populate("franchiseId", "title _id")
      .populate("genres")
      .populate("director");
    return movies.map((movie) => this.formatMovieMap(movie, lang));
  }

  static async getMovieById(id: string, lang: string = "vi") {
    const movie = await MovieModel.findById(id)
      .populate("genres")
      .populate("franchiseId", "title _id")
      .populate("cast")
      .populate("director");

    if (!movie) throw new NotFoundError("Movie not found");
    return this.formatMovieMap(movie, lang);
  }

  static async getMoviesByType(
    type: string,
    options: {
      page?: number;
      limit?: number;
      sort_field?: string;
      sort_type?: "asc" | "desc";
      country?: string;
      year?: string;
      lang?: string;
    } = {}
  ) {
    const {
      page = 1,
      limit = 24,
      sort_field = "updatedAt",
      sort_type = "desc",
      country,
      year,
      lang = "vi",
    } = options;

    const query: any = {
      isPublished: true,
      type: type.toUpperCase(),
    };

    // Lọc theo quốc gia nếu có
    if (country) {
      const countries = country.split(",").map((c) => c.trim());
      query.country = { $in: countries };
    }

    // Lọc theo năm nếu có
    if (year) {
      query.relasedYear = parseInt(year);
    }

    // Xử lý sắp xếp
    let sortOption: any = {};
    const sortFieldMap: Record<string, string> = {
      "modified.time": "updatedAt",
      year: "relasedYear",
      _id: "_id",
      rating: "ratingAvg",
      views: "views",
    };

    const dbSortField = sortFieldMap[sort_field] || "updatedAt";
    sortOption[dbSortField] = sort_type === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;
    const [movies, total] = await Promise.all([
      MovieModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sortOption)
        .populate("genres")
        .populate("franchiseId", "_id title")
        .populate("director"),
      MovieModel.countDocuments(query),
    ]);
    // console.log(movies);
    return {
      movies: movies.map((movie) => this.formatMovieMap(movie, lang)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy toàn bộ thông tin chi tiết của movie bao gồm episodes, servers, genres, franchise, etc.
   */
  static async getMovieFullDetails(slug: string, lang: string = "vi") {
    try {
      // 1. Lấy thông tin cơ bản của movie
      const movie = await MovieModel.findOne({
        [`slug.${lang}`]: slug,
        isPublished: true,
      })
        .populate("franchiseId", "title slug")
        .populate("genres", "title slug")
        .populate("director", "name")
        .populate("cast", "name avatar")
        .lean();

      if (!movie) {
        throw new Error("Movie not found");
      }

      // 2. Lấy tất cả server đang hoạt động
      const activeServers = await ServerModel.find({ isActive: true })
        .select("_id name baseUrl isActive")
        .lean();

      // 3. Lấy tất cả episodes của movie này, được phân theo server
      const episodes = await EpisodeModel.find({
        movieId: movie._id,
        isPublished: true,
      })
        .sort({ episodeOrLabel: 1 })
        .lean();
      // 4. Nhóm episodes theo server
      const serversWithEpisodes = await this.groupEpisodesByServer(
        episodes,
        activeServers,
        lang
      );

      // 5. Lấy thông tin đầy đủ của các thể loại
      const genresDetails = await GenreModel.find({
        _id: { $in: movie.genres || [] },
      })
        .select("title slug description")
        .lean();

      // 6. Lấy các movie cùng franchise (nếu có)
      let sameFranchiseMovies: IMovie[] = [];
      if (movie.franchiseId) {
        sameFranchiseMovies = await MovieModel.find({
          franchiseId: movie.franchiseId,
          _id: { $ne: movie._id },
          isPublished: true,
        })
          .populate("franchiseId", "_id title")
          .populate("genres", "_id title slug")
          .lean();
      }

      // 7. Lấy các movie cùng thể loại (có thể dùng để đề xuất)
      const resRelatedByGenre = await MovieModel.find({
        genres: { $in: movie.genres || [] },
        _id: { $ne: movie._id },

        isPublished: true,
      })
        .limit(8)
        .populate("genres", "_id title slug")
        .populate("franchiseId", "_id title")
        .select("_id title slug poster thumbnail type year ratingAvg views")
        .lean();
      const relatedByGenre = resRelatedByGenre;

      // 8. Format movie data
      const formattedMovie = this.formatMovieForDetail(movie, lang);

      // 9. Format các movie liên quan
      const formattedSameFranchise = sameFranchiseMovies.map((movie) =>
        this.formatMovieForDetail(movie, lang)
      );

      const formattedRelatedByGenre = relatedByGenre.map((m) =>
        this.formatMovieForDetail(m, lang)
      );

      return {
        movie: formattedMovie,
        servers: serversWithEpisodes,
        sameFranchise: formattedSameFranchise,
        relatedByGenre: formattedRelatedByGenre,
        meta: {
          totalEpisodes: episodes.length,
          totalServers: serversWithEpisodes.length,
          hasEpisodes: episodes.length > 0,
          isSeries: movie.type === "SERIES" || movie.type === "EPISODE",
        },
      };
    } catch (error) {
      console.error("Error in getMovieFullDetails:", error);
      throw error;
    }
  }

  /**
   * Nhóm episodes theo server
   */
  private static async groupEpisodesByServer(
    episodes: IEpisode[],
    servers: IServer[],
    lang: string
  ) {
    /**
     * ===============================
     * 1. Map server
     * ===============================
     */
    const serverMap = new Map<string, IServer>(
      servers.map((s) => [s._id.toString(), s])
    );
    // console.log(serverMap);
    /**
     * ===============================
     * 2. Group + normalize episode
     * ===============================
     */
    let grouped = new Map<string, EpisodeMeta[]>();
    for (const ep of episodes) {
      if (!ep.serverId) continue;
      const serverId = ep.serverId.toString();

      if (!grouped.has(serverId)) {
        grouped.set(serverId, []);
      }

      grouped.get(serverId)!.push(this.normalizeEpisode(ep));
    }
    /**
     * ===============================
     * 3. Build result
     * ===============================
     */
    const result: {
      server: {
        id: string;
        name: string;
        baseUrl: string;
        isActive: boolean;
      };
      episodes: IEpisode[];
      totalEpisodes: number;
      latestEpisode: IEpisode | null;
    }[] = [];

    for (const [serverId, metas] of grouped) {
      const server = serverMap.get(serverId);
      if (!server || metas.length === 0) continue;

      /**
       * ---- Sort episodes ----
       */
      metas.sort((a, b) => {
        // 1. Ưu tiên loại episode
        if (a.typePriority !== b.typePriority) {
          return a.typePriority - b.typePriority;
        }

        // 2. Cùng loại → so số tập
        if (a.episodeNumber !== null && b.episodeNumber !== null) {
          return a.episodeNumber - b.episodeNumber;
        }

        // 3. Fallback → createdAt
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

      /**
       * ---- Latest episode (mới nhất thật sự) ----
       */
      const latestMeta = metas.reduce((latest, cur) =>
        cur.createdAt > latest.createdAt ? cur : latest
      );

      /**
       * ---- Format episode cho client ----
       */
      const formattedEpisodes = metas.map((m) =>
        this.formatEpisode(m.episode, lang)
      );

      result.push({
        server: {
          id: server._id.toString(),
          name: server.name,
          baseUrl: server.baseUrl,
          isActive: server.isActive,
        },
        episodes: formattedEpisodes,
        totalEpisodes: formattedEpisodes.length,
        latestEpisode: this.formatEpisode(latestMeta.episode, lang),
      });
    }

    /**
     * ===============================
     * 4. Sort server theo thứ tự input
     * ===============================
     */
    const serverOrder = new Map(
      servers.map((s, index) => [s._id.toString(), index])
    );

    result.sort((a, b) => {
      const indexA = serverOrder.get(a.server.id) ?? Infinity;
      const indexB = serverOrder.get(b.server.id) ?? Infinity;
      return indexA - indexB;
    });

    return result;
  }

  /**
   * Format episode data
   */
  static formatEpisode(episode: IEpisode, lang: string): any {
    return {
      id: episode.id,
      movieId: episode.movieId,
      serverId: episode.serverId,
      title: getLocalizedValue(episode.title, lang, episode.defaultLang),
      description: getLocalizedValue(
        episode.description,
        lang,
        episode.defaultLang
      ),
      slug:
        getLocalizedValue(episode.slug, lang, episode.defaultLang) ||
        `tap-${episode.episodeOrLabel}`,
      episodeOrLabel: episode.episodeOrLabel,
      duration: episode.duration,
      thumbnail: episode.thumbnail,
      videoUrl: episode.videoUrl,
      isPublished: episode.isPublished,
      createdAt: episode.createdAt,
      updatedAt: episode.updatedAt,
    };
  }

  /**
   * Format movie cho trang chi tiết
   */
  private static formatMovieForDetail(movie: any, lang: string): any {
    return {
      id: movie._id,
      title: getLocalizedValue(movie.title, lang, movie.defaultLang),
      slug: getLocalizedValue(movie.slug, lang, movie.defaultLang),
      description: getLocalizedValue(
        movie.description,
        lang,
        movie.defaultLang
      ),

      franchise: movie.franchiseId
        ? {
            id: movie.franchiseId._id,
            title: getLocalizedValue(
              movie.franchiseId.title,
              lang as string,
              movie.defaultLang
            ),
          }
        : null,
      genres:
        movie.genres?.map((g: any) => ({
          id: g._id,
          title: getLocalizedValue(g.title, lang as string, movie.defaultLang),
          slug: getLocalizedValue(g.slug, lang as string, movie.defaultLang),
        })) || [],
      poster: movie.poster,
      thumbnail: movie.thumbnail,
      type: movie.type,
      year: movie.year,
      ratingAvg: movie.ratingAvg,
      views: movie.views,
      totalEpisodes: movie.totalEpisodes,
      currentEpisode: movie.currentEpisode,
    };
  }

  /**
   * Format movie cho danh sách
   */
  private static formatMovieMap(movie: any, lang: string): any {
    return {
      id: movie._id,
      title: getLocalizedValueMap(movie.title, lang, movie.defaultLang),
      slug: getLocalizedValueMap(movie.slug, lang, movie.defaultLang),
      description: getLocalizedValueMap(
        movie.description,
        lang,
        movie.defaultLang
      ),
      franchise: movie.franchiseId
        ? {
            id: movie.franchiseId._id,
            title: getLocalizedValueMap(
              movie.franchiseId.title,
              lang as string,
              movie.defaultLang
            ),
          }
        : null,
      genres:
        movie.genres?.map((g: any) => ({
          id: g._id,
          title: getLocalizedValueMap(
            g.title,
            lang as string,
            movie.defaultLang
          ),
          slug: getLocalizedValueMap(g.slug, lang as string, movie.defaultLang),
        })) || [],
      poster: movie.poster,
      thumbnail: movie.thumbnail,
      banner: movie.banner,
      backdrop: movie.backdrop,
      type: movie.type,
      year: movie.year,
      ratingAvg: movie.ratingAvg,
      views: movie.views,
      totalEpisodes: movie.totalEpisodes,
      currentEpisode: movie.currentEpisode,
    };
  }

  /**
   * Tăng lượt xem cho movie
   */
  static async incrementViewCount(movieId: string): Promise<void> {
    try {
      await MovieModel.findByIdAndUpdate(movieId, {
        $inc: { views: 1 },
      });
    } catch (error) {
      console.error("Error incrementing view count:", error);
    }
  }

  /**
   * Lấy danh sách episodes theo server
   */
  static async getEpisodesByServer(
    movieId: string,
    serverId: string,
    lang: string = "vi"
  ) {
    try {
      const episodes = await EpisodeModel.find({
        movieId,
        serverId,
        isPublished: true,
      })
        .sort({ episodeOrLabel: 1 })
        .lean();

      const server = await ServerModel.findById(serverId)
        .select("name baseUrl isActive")
        .lean();

      return {
        server: {
          id: server?._id,
          name: server?.name,
          baseUrl: server?.baseUrl,
          isActive: server?.isActive,
        },
        episodes: episodes.map((ep) => this.formatEpisode(ep, lang)),
      };
    } catch (error) {
      console.error("Error in getEpisodesByServer:", error);
      throw error;
    }
  }

  // ===== ADMIN =====

  static async getAllMovies(
    options: {
      page?: number;
      limit?: number;
      sort_field?: string;
      sort_type?: "asc" | "desc";
      search?: string;
      status?: string;
      type?: string;
    } = {}
  ) {
    const {
      page = 1,
      limit = 24,
      sort_field = "createdAt",
      sort_type = "asc",
      search = "",
      status,
      type,
    } = options;

    const query: any = {};

    // Tìm kiếm
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        // { description: { $regex: search, $options: "i" } },
      ];
    }

    // Lọc theo status
    if (status === "published") {
      query.isPublished = true;
    } else if (status === "unpublished") {
      query.isPublished = false;
    }

    // Lọc theo type
    if (type && type !== "all") {
      query.type = type.toUpperCase();
    }

    // Xử lý sắp xếp
    let sortOption: any = {};
    const sortFieldMap: Record<string, string> = {
      "modified.time": "updatedAt",
      year: "relasedYear",
      _id: "_id",
      rating: "ratingAvg",
      views: "views",
      created: "createdAt",
    };

    const dbSortField = sortFieldMap[sort_field] || "createdAt";
    sortOption[dbSortField] = sort_type === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const [movies, total] = await Promise.all([
      MovieModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sortOption)
        .populate("genres", "name _id")
        .populate("franchiseId", "name _id")
        .populate("director", "name _id"),
      MovieModel.countDocuments(query),
    ]);

    return {
      movies: movies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async createMovie(data: IMovie) {
    return MovieModel.create(data);
  }

  static async updateMovie(
    id: string,
    data: Partial<IMovie>,
    lang: string = "vi"
  ) {
    const movie = await MovieModel.findByIdAndUpdate(id, data, {
      new: true,
    })
      .populate("genres")
      .populate("franchiseId", "name _id")
      .populate("director", "name _id");

    if (!movie) throw new NotFoundError("Movie not found");
    return this.formatMovieMap(movie, lang);
  }

  static async deleteMovie(id: string) {
    const movie = await MovieModel.findByIdAndDelete(id);
    if (!movie) throw new NotFoundError("Movie not found");
    return this.formatMovieForDetail(movie, "vi");
  }

  static async togglePublishStatus(id: string, isPublished: boolean) {
    const movie = await MovieModel.findByIdAndUpdate(
      id,
      { isPublished },
      { new: true }
    );
    if (!movie) throw new NotFoundError("Movie not found");
    return this.formatMovieForDetail(movie, "vi");
  }

  static async bulkUpdateMovies(ids: string[], data: Partial<IMovie>) {
    await MovieModel.updateMany({ _id: { $in: ids } }, data);

    // Lấy các document đã cập nhật
    const updatedMovies = await MovieModel.find({ _id: { $in: ids } });
    return updatedMovies.map((movie) => this.formatMovieForDetail(movie, "vi"));
  }

  static async bulkDeleteMovies(ids: string[]) {
    const result = await MovieModel.deleteMany({ _id: { $in: ids } });
    return result;
  }

  static async getMovieStats() {
    const [
      totalMovies,
      publishedMovies,
      unpublishedMovies,
      totalViews,
      averageRating,
    ] = await Promise.all([
      MovieModel.countDocuments(),
      MovieModel.countDocuments({ isPublished: true }),
      MovieModel.countDocuments({ isPublished: false }),
      MovieModel.aggregate([
        { $group: { _id: null, totalViews: { $sum: "$views" } } },
      ]),
      MovieModel.aggregate([
        { $match: { ratingAvg: { $gt: 0 } } },
        { $group: { _id: null, avgRating: { $avg: "$ratingAvg" } } },
      ]),
    ]);

    return {
      totalMovies,
      publishedMovies,
      unpublishedMovies,
      totalViews: totalViews[0]?.totalViews || 0,
      averageRating: averageRating[0]?.avgRating || 0,
    };
  }
}
