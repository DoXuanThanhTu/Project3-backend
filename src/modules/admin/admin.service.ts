import { MovieModel } from "../../models/movie.model";
import { Request, Response } from "express";
import { MovieService } from "../movie/movie.service";
import { NotFoundError } from "../../errors/http.error";
import { FranchiseModel } from "../../models/franchise.model";
import { GenreModel } from "../../models/genre.model";
import { PersonModel } from "../../models/person.model";
import { EpisodeModel } from "../../models/episode.model";
import { success } from "zod";
import { ServerModel } from "../../models/server.model";
import { UserModel } from "../../models/user.model";
import { comparePassword, hashPassword } from "../../utils/hash";

export class AdminService {
  static async getMovieById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const movie = await MovieModel.findById(id)
        .populate("genres")
        .populate("franchiseId")
        .populate("cast")
        .populate("director");

      if (!movie) throw new NotFoundError("Movie not found");

      return movie;
    } catch (error: any) {
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
  static async getAllMovies(req: Request, res: Response) {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const skip = limitNum > 0 ? (pageNum - 1) * limitNum : 0;

    const query = MovieModel.find({})
      .populate("genres", "_id title")
      .populate("franchiseId", "_id title")
      .sort({ createdAt: -1 });

    if (limitNum > 0) {
      query.skip(skip).limit(limitNum);
    }

    const [movies, total] = await Promise.all([
      query,
      MovieModel.countDocuments({}),
    ]);

    return {
      success: true,
      data: movies,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: limitNum > 0 ? Math.ceil(total / limitNum) : 1,
      },
    };
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
  //Franshie
  static async getAllFranchises() {
    // Implementation for getting all franchises
    const franchises = await FranchiseModel.find({}).populate(
      "movies",
      "_id title slug"
    );
    return franchises;
  }
  static async getFranchiseById(req: Request, res: Response) {
    // Implementation for getting a franchise by ID
    const id = req.params.id;
    const franchise = await FranchiseModel.findById(id).populate(
      "movies",
      "_id title slug"
    );
    return franchise;
  }
  //Genre endpoints
  static async getAllGenres() {
    // Implementation for getting all genres
    // This would typically involve querying the Genre model
    const genres = await GenreModel.find({}); // TODO: Implement actual database query
    return genres;
  }
  static async getGenreById(req: Request, res: Response) {
    const id = req.params.id;
    const genre = await GenreModel.findById(id);
    if (!genre) {
      throw new Error("Genre not found");
    }
    return genre;
  }
  //Person endpoints
  static async getAllPeople() {
    // Implementation for getting all people
    // This would typically involve querying the Person model
    const people = await PersonModel.find({});
    return people;
  }
  //Eposide
  static async getAllEpisodes(req: Request, res: Response) {
    const {
      movieId,
      serverId,
      search,
      page = 1,
      limit = 10,
      sortType = "asc",
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const sortDirection = sortType === "desc" ? -1 : 1;

    const skip = limitNum > 0 ? (pageNum - 1) * limitNum : 0;

    /* ---------------- BUILD FILTER ---------------- */
    const filter: any = {};

    if (movieId) filter.movieId = movieId;
    if (serverId) filter.serverId = serverId;
    if (search) {
      const regex = new RegExp(search as string, "i");

      filter.$or = [{ episodeOrLabel: regex }];
    }

    /* ---------------- QUERY ---------------- */
    const query = EpisodeModel.find(filter)
      .populate("movieId", "_id title slug")
      .populate("serverId", "_id name");

    if (limitNum > 0) {
      query.skip(skip).limit(limitNum);
    }

    const [episodes, total] = await Promise.all([
      query,
      EpisodeModel.countDocuments(filter),
    ]);

    /* ---------------- RESPONSE ---------------- */
    return {
      success: true,
      data: episodes,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: limitNum > 0 ? Math.ceil(total / limitNum) : 1,
      },
    };
  }

  static async getEposideById(req: Request, res: Response) {
    const id = req.params.id;
    const episode = await EpisodeModel.findById(id)
      .populate("movieId", "_id title slug")
      .populate("serverId", "_id name");

    if (!episode) throw new NotFoundError("Episode not found");
    return episode;
  }
  static async updateManyEp() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const result = await EpisodeModel.updateMany(
      {
        movieId: "69579fbf1f87b4b723127c8a",
        createdAt: {
          $gte: startOfToday,
          $lte: endOfToday,
        },
      },
      {
        $set: { movieId: "695ba473527c644fcf6432ad" },
      }
    );

    return result;
  }
  static async deleteEp() {
    const result = await EpisodeModel.deleteMany({
      movieId: "6952834592236aa1b51b6097",
    });
    return result;
  }
  static async getAllServers(req: Request, res: Response) {
    const servers = await ServerModel.find({});
    return servers;
  }
  // ======================= USER =======================

  // GET /master/users
  static async getAllUsers(req: Request, res: Response) {
    try {
      const { search, role, isActive, page = 1, limit = 10 } = req.query;

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const skip = limitNum > 0 ? (pageNum - 1) * limitNum : 0;

      /* ---------- FILTER ---------- */
      const filter: any = {};

      if (role) filter.role = role;
      if (isActive !== undefined) filter.isActive = isActive === "true";

      if (search) {
        const regex = new RegExp(search as string, "i");
        filter.$or = [
          // { username: regex },
          { email: regex },
          { displayName: regex },
        ];
      }

      /* ---------- QUERY ---------- */
      const query = UserModel.find(filter)
        .select("-password")
        .sort({ createdAt: -1 });

      if (limitNum > 0) {
        query.skip(skip).limit(limitNum);
      }

      const [users, total] = await Promise.all([
        query,
        UserModel.countDocuments(filter),
      ]);

      return {
        success: true,
        data: users,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: limitNum > 0 ? Math.ceil(total / limitNum) : 1,
        },
      };
    } catch (error) {
      console.error("Error getAllUsers:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  // GET /master/users/:id
  static async getUserById(req: Request, res: Response) {
    const { id } = req.params;

    const user = await UserModel.findById(id).select("-password");
    if (!user) throw new NotFoundError("User not found");

    return user;
  }

  // POST /master/users
  static async createUser(req: Request, res: Response) {
    const { password, ...rest } = req.body;

    const hashedPassword = await hashPassword(password);

    const user = await UserModel.create({
      ...rest,
      password: hashedPassword,
    });

    return {
      success: true,
      data: user,
    };
  }

  // PUT /master/users/:id
  static async updateUser(req: Request, res: Response) {
    const { id } = req.params;

    const user = await UserModel.findByIdAndUpdate(id, req.body, {
      new: true,
    }).select("-password");

    if (!user) throw new NotFoundError("User not found");

    return {
      success: true,
      data: user,
    };
  }

  // DELETE /master/users/:id
  static async deleteUser(req: Request, res: Response) {
    const { id } = req.params;

    const user = await UserModel.findByIdAndDelete(id);
    if (!user) throw new NotFoundError("User not found");

    return {
      success: true,
      message: "User deleted successfully",
    };
  }

  // PUT /master/users/:id/change-password
  static async changePassword(req: Request, res: Response) {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    const user = await UserModel.findById(id);
    if (!user) throw new NotFoundError("User not found");

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    return {
      success: true,
      message: "Password changed successfully",
    };
  }
}
