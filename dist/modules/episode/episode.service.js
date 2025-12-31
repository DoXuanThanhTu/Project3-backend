"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EpisodeService = void 0;
const mongoose_1 = require("mongoose");
const http_error_1 = require("../../errors/http.error");
const episode_model_1 = require("../../models/episode.model");
class EpisodeService {
    // ===== PUBLIC =====
    static async getAllEpisode(limit) {
        const query = episode_model_1.EpisodeModel.find({ isPublished: true })
            .sort({ createdAt: -1 })
            .populate("movieId")
            .populate("serverId");
        if (limit && limit > 0) {
            query.limit(limit);
        }
        return query;
    }
    static async getByMovie(movieId, limit) {
        const id = new mongoose_1.Types.ObjectId(movieId);
        const query = episode_model_1.EpisodeModel.find({ movieId: id, isPublished: true })
            .sort({ createdAt: 1 })
            .populate("movieId")
            .populate("serverId");
        if (limit && limit > 0) {
            query.limit(limit);
        }
        return query;
    }
    static async getDetail(id) {
        const episode = await episode_model_1.EpisodeModel.findById(id)
            .populate("movieId")
            .populate("serverId");
        if (!episode)
            throw new http_error_1.NotFoundError("Episode not found");
        return episode;
    }
    // ===== ADMIN / USER =====
    static async getAll() {
        return episode_model_1.EpisodeModel.find().sort({ createdAt: -1 }).populate("movieId");
    }
    static async create(data) {
        return episode_model_1.EpisodeModel.create(data);
    }
    static async createFromText(episodesData) {
        try {
            // Sử dụng bulk write để insert nhiều documents cùng lúc
            const operations = episodesData.map((episode) => ({
                insertOne: {
                    document: episode,
                },
            }));
            const result = await episode_model_1.EpisodeModel.bulkWrite(operations);
            // Lấy các episodes vừa tạo
            const createdEpisodes = await episode_model_1.EpisodeModel.find({
                movieId: episodesData[0].movieId,
                serverId: episodesData[0].serverId,
            }).sort({ episodeOrLabel: 1 });
            return createdEpisodes;
        }
        catch (error) {
            console.error("Error in createFromText:", error);
            throw error;
        }
    }
    static async update(id, data) {
        const episode = await episode_model_1.EpisodeModel.findByIdAndUpdate(id, data, {
            new: true,
        }).populate("movieId");
        if (!episode)
            throw new http_error_1.NotFoundError("Episode not found");
        return episode;
    }
    static async delete(id) {
        const episode = await episode_model_1.EpisodeModel.findByIdAndDelete(id);
        if (!episode)
            throw new http_error_1.NotFoundError("Episode not found");
    }
}
exports.EpisodeService = EpisodeService;
