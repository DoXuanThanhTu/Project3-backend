import { Request, Response } from "express";
import { MovieService } from "./movie.service";
import { getLocalizedValue } from "../../utils/i18n.util";
import { get } from "node:http";
import { da, de } from "zod/v4/locales";
import { IMovie } from "../../types/movie.type";

export class MovieController {
  // ===== USER =====

  static async getPublished(req: Request, res: Response) {
    const movies = await MovieService.getPublishedMovies();
    const lang = (req.query.lang as string) || "vi";

    const data = movies.map((movie: any) => ({
      id: movie._id,
      fransies: movie.fransies,
      title: getLocalizedValue(movie.title, lang, movie.defaultLang),
      slug: getLocalizedValue(movie.slug, lang, movie.defaultLang),
      description: getLocalizedValue(
        movie.description,
        lang,
        movie.defaultLang
      ),
      poster: movie.poster,
      thumbnail: movie.thumbnail,
      banner: movie.banner,
      trailerUrl: movie.trailerUrl,
      lang: lang,
      genres: movie.genres.map((g: any) =>
        getLocalizedValue(g.name, lang, g.defaultLang)
      ),
      cast: movie.cast,
      director: movie.director,
      rating: movie.ratingAvg,
      views: movie.views,
    }));

    res.json({ success: true, data });
  }

  static async getMovieByFranchise(req: Request, res: Response) {
    const movies = await MovieService.getMoviesByFranchise(
      req.params.franchiseId
    );
    const lang = (req.query.lang as string) || "vi";

    const data = movies.map((movie: IMovie) => ({
      id: movie.id,
      fransies: movie.franchiseId,
      title: getLocalizedValue(movie.title, lang, movie.defaultLang),
      slug: getLocalizedValue(movie.slug, lang, movie.defaultLang),
      description: getLocalizedValue(
        movie.description,
        lang,
        movie.defaultLang
      ),
      poster: movie.poster,
      thumbnail: movie.thumbnail,
      banner: movie.banner,
      trailerUrl: movie.trailerUrl,
      lang: lang,
      genres: movie.genres?.map((g: any) =>
        getLocalizedValue(g.name, lang, g.defaultLang)
      ),
      cast: movie.cast,
      director: movie.director,
      rating: movie.ratingAvg,
      views: movie.views,
    }));
    console.log(data);

    res.json({ success: true, data });
  }
  static async getDetail(req: Request, res: Response) {
    const lang = (req.query.lang as string) || "vi";
    const movie = await MovieService.getMovieBySlug(req.params.slug, lang);

    res.json({
      success: true,
      data: {
        id: movie._id,
        title: getLocalizedValue(movie.title, lang, movie.defaultLang),
        slug: getLocalizedValue(movie.slug, lang, movie.defaultLang),

        description: getLocalizedValue(
          movie.description,
          lang,
          movie.defaultLang
        ),
        genres: movie.genres?.map((g: any) =>
          getLocalizedValue(g.name, lang, g.defaultLang)
        ),
        poster: movie.poster,
        thumbnail: movie.thumbnail,

        banner: movie.banner,
        trailerUrl: movie.trailerUrl,
        cast: movie.cast,
        director: movie.director,
        rating: movie.ratingAvg,
        views: movie.views,
      },
    });
  }
  static async getByGenre(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const {
        page = 1,
        limit = 24,
        sort_field = "modified.time",
        sort_type = "desc",
        country,
        year,
        lang = "vi",
      } = req.query;
      console.log("Received params:", req.query);
      // Validate parameters
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 24;

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

      // Validate sort_type
      if (sort_type !== "asc" && sort_type !== "desc") {
        return res.status(400).json({
          success: false,
          message: "sort_type must be 'asc' or 'desc'",
        });
      }

      // Validate sort_field
      const allowedSortFields = ["modified.time", "year", "_id"];
      if (!allowedSortFields.includes(sort_field as string)) {
        return res.status(400).json({
          success: false,
          message: "Invalid sort_field",
        });
      }

      const result = await MovieService.getMoviesByGenreSlug(slug, {
        page: pageNum,
        limit: limitNum,
        sort_field: sort_field as string,
        sort_type: sort_type as "asc" | "desc",
        country: country as string | undefined,
        year: year as string | undefined,
        lang: lang as string,
      });

      // Format response
      const data = result.movies.map((movie: any) => ({
        id: movie._id,
        title: getLocalizedValue(
          movie.title,
          lang as string,
          movie.defaultLang
        ),
        slug: getLocalizedValue(movie.slug, lang as string, movie.defaultLang),
        description: getLocalizedValue(
          movie.description,
          lang as string,
          movie.defaultLang
        ),
        poster: movie.poster,
        thumbnail: movie.thumbnail,
        banner: movie.banner,
        trailerUrl: movie.trailerUrl,
        year: movie.year,
        country: movie.country,
        type: movie.type,
        rating: movie.ratingAvg,
        views: movie.views,
        genres: movie.genres?.map((g: any) => ({
          id: g._id,
          name: getLocalizedValue(g.name, lang as string, g.defaultLang),
          slug: getLocalizedValue(g.slug, lang as string, g.defaultLang),
        })),
        director: movie.director,
      }));

      // Format genre info
      const genreInfo = {
        id: result.genre._id,
        name: getLocalizedValue(
          result.genre.name,
          lang as string,
          result.genre.defaultLang
        ),
        slug: getLocalizedValue(
          result.genre.slug,
          lang as string,
          result.genre.defaultLang
        ),
        description: getLocalizedValue(
          result.genre.description,
          lang as string,
          result.genre.defaultLang
        ),
      };

      res.json({
        success: true,
        data,
        genre: genreInfo,
        pagination: result.pagination,
      });
    } catch (error: any) {
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
  static async searchMovies(req: Request, res: Response) {
    try {
      const { name } = req.params; // Lấy từ path parameter
      const {
        page = 1,
        limit = 24,
        sort_field = "modified.time",
        sort_type = "desc",
        country,
        year,
        lang = "vi",
      } = req.query;

      // Validate parameters
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 24;

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

      if (!name || name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Search keyword is required",
        });
      }

      // Validate sort_type
      if (sort_type !== "asc" && sort_type !== "desc") {
        return res.status(400).json({
          success: false,
          message: "sort_type must be 'asc' or 'desc'",
        });
      }

      // Validate sort_field
      const allowedSortFields = ["modified.time", "year", "_id", "relevance"];
      if (!allowedSortFields.includes(sort_field as string)) {
        return res.status(400).json({
          success: false,
          message: "Invalid sort_field",
        });
      }

      const result = await MovieService.searchMovies(name, {
        page: pageNum,
        limit: limitNum,
        sort_field: sort_field as string,
        sort_type: sort_type as "asc" | "desc",
        country: country as string | undefined,
        year: year as string | undefined,
        lang: lang as string,
      });

      // Format response
      const data = result.movies.map((movie: any) => ({
        id: movie._id,
        title: getLocalizedValue(
          movie.title,
          lang as string,
          movie.defaultLang
        ),
        slug: getLocalizedValue(movie.slug, lang as string, movie.defaultLang),
        description: getLocalizedValue(
          movie.description,
          lang as string,
          movie.defaultLang
        ),
        poster: movie.poster,
        thumbnail: movie.thumbnail,
        banner: movie.banner,
        trailerUrl: movie.trailerUrl,
        year: movie.year,
        country: movie.country,
        type: movie.type,
        rating: movie.ratingAvg,
        views: movie.views,
        genres: movie.genres.map((g: any) =>
          getLocalizedValue(g.name, lang as string, g.defaultLang)
        ),
        director: movie.director,
        // Thêm score nếu có (cho tìm kiếm theo relevance)
        score: movie.score,
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
    } catch (error: any) {
      console.error("Error in searchMovies:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  static async getMovieAndSameFranchise(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const lang = (req.query.lang as string) || "vi";

      if (!slug) {
        return res.status(400).json({
          success: false,
          message: "Thiếu slug",
        });
      }

      const movie = await MovieService.getMovieBySlug(slug, lang);

      if (!movie || !movie.isPublished) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy phim",
        });
      }

      let relatedMovies: IMovie[] = [];
      if (movie.franchiseId) {
        relatedMovies = await MovieService.getMoviesByFranchise(
          movie.franchiseId,
          lang
        );
      }

      const formattedMovie = {
        id: movie._id,
        franchise: movie.franchiseId,
        title: getLocalizedValue(movie.title, lang, movie.defaultLang),
        slug: getLocalizedValue(movie.slug, lang, movie.defaultLang),
        description: getLocalizedValue(
          movie.description,
          lang,
          movie.defaultLang
        ),
        poster: movie.poster,
        thumbnail: movie.thumbnail,
        banner: movie.banner,
        trailerUrl: movie.trailerUrl,
        lang: lang,
        genres: movie.genres?.map((g: any) =>
          getLocalizedValue(g.name, lang, g.defaultLang)
        ),
        cast: movie.cast,
        director: movie.director,
        rating: movie.ratingAvg,
        views: movie.views,
      };

      const formattedRelatedMovies = relatedMovies
        .filter((m) => m.id !== formattedMovie.id.toString()) // loại bỏ movie trùng id
        .map((movie) => ({
          id: movie.id,
          franchise: movie.franchiseId,
          title: getLocalizedValue(movie.title, lang, movie.defaultLang),
          slug: getLocalizedValue(movie.slug, lang, movie.defaultLang),
          description: movie.description
            ? getLocalizedValue(movie.description, lang, movie.defaultLang)
            : undefined,
          poster: movie.poster,
          thumbnail: movie.thumbnail,
          banner: movie.banner,
          trailerUrl: movie.trailerUrl,
          lang,
          genres: movie.genres?.map((g: any) =>
            getLocalizedValue(g.name, lang, g.defaultLang)
          ),
          cast: movie.cast,
          director: movie.director,
          rating: movie.ratingAvg,
          views: movie.views,
        }));

      res.json({
        success: true,
        data: {
          movie: formattedMovie,
          relatedMovies: formattedRelatedMovies,
        },
      });
    } catch (error: any) {
      console.error("Error in getMovieAndSameFranchise:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi khi lấy thông tin phim",
      });
    }
  }

  // ===== ADMIN =====

  static async getAll(req: Request, res: Response) {
    const {
      page = 1,
      limit = 24,
      sort_field = "modified.time",
      sort_type = "desc",
      country,
      year,
      lang = "vi",
    } = req.query;
    const movies = await MovieService.getAllMovies();
    const data = movies.map((movie: any) => ({
      id: movie.id,
      franchise: movie.franchiseId,
      title: movie.title,
      slug: movie,
      description: movie.description,
      poster: movie.poster,
      thumbnail: movie.thumbnail,
      banner: movie.banner,
      trailerUrl: movie.trailerUrl,
      defaultLang: movie.defaultLang,
      genres: movie.genres,
      cast: movie.cast,
      director: movie.director,
      rating: movie.ratingAvg,
      views: movie.views,
    }));
    res.json({ success: true, data: data });
  }

  static async create(req: Request, res: Response) {
    const movie = await MovieService.createMovie(req.body);
    res.status(201).json({ success: true, data: movie });
  }

  static async update(req: Request, res: Response) {
    const movie = await MovieService.updateMovie(req.params.id, req.body);
    res.json({ success: true, data: movie });
  }

  static async delete(req: Request, res: Response) {
    await MovieService.deleteMovie(req.params.id);
    res.json({ success: true });
  }
}
