import { MovieModel } from "../../models/movie.model";

export class AdminService {
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
