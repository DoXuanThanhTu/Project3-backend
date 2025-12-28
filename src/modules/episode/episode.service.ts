import { NotFoundError } from "../../errors/http.error";
import { EpisodeModel } from "../../models/episode.model";
import { IEpisode } from "../../types/episode.type";

export class EpisodeService {
  // ===== PUBLIC =====
  static async getAllEpisode(limit?: number) {
    const query = EpisodeModel.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .populate("movieId")
      .populate("serverId");

    if (limit && limit > 0) {
      query.limit(limit);
    }

    return query;
  }

  static async getByMovie(movieId: string, limit?: number) {
    const query = EpisodeModel.find({ movieId: movieId, isPublished: true })
      .sort({ createdAt: 1 })
      .populate("movieId")
      .populate("serverId");

    if (limit && limit > 0) {
      query.limit(limit);
    }
    return query;
  }

  static async getDetail(id: string) {
    const episode = await EpisodeModel.findById(id)
      .populate("movieId")
      .populate("serverId");

    if (!episode) throw new NotFoundError("Episode not found");
    return episode;
  }

  // ===== ADMIN / USER =====
  static async getAll() {
    return EpisodeModel.find().sort({ createdAt: -1 }).populate("movieId");
  }

  static async create(data: IEpisode) {
    return EpisodeModel.create(data);
  }
  static async createFromText(episodesData: Partial<IEpisode>[]) {
    try {
      // Sử dụng bulk write để insert nhiều documents cùng lúc
      const operations = episodesData.map((episode) => ({
        insertOne: {
          document: episode,
        },
      }));

      const result = await EpisodeModel.bulkWrite(operations);

      // Lấy các episodes vừa tạo
      const createdEpisodes = await EpisodeModel.find({
        movieId: episodesData[0].movieId,
        serverId: episodesData[0].serverId,
      }).sort({ episodeOrLabel: 1 });

      return createdEpisodes;
    } catch (error) {
      console.error("Error in createFromText:", error);
      throw error;
    }
  }
  static async update(id: string, data: Partial<IEpisode>) {
    const episode = await EpisodeModel.findByIdAndUpdate(id, data, {
      new: true,
    }).populate("movieId");

    if (!episode) throw new NotFoundError("Episode not found");
    return episode;
  }

  static async delete(id: string) {
    const episode = await EpisodeModel.findByIdAndDelete(id);
    if (!episode) throw new NotFoundError("Episode not found");
  }
}
