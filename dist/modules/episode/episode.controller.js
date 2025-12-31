"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EpisodeController = void 0;
const episode_service_1 = require("./episode.service");
const i18n_util_1 = require("../../utils/i18n.util");
class EpisodeController {
    // ===== PUBLIC =====
    static async getAllEpisode(req, res) {
        const lang = req.query.lang || "vi";
        const limit = req.query.limit
            ? parseInt(req.query.limit, 10)
            : undefined;
        const episodes = await episode_service_1.EpisodeService.getAllEpisode(limit);
        const data = episodes.map((ep) => ({
            id: ep.id,
            title: (0, i18n_util_1.getLocalizedValue)(ep.title, lang, ep.defaultLang),
            description: ep.description
                ? (0, i18n_util_1.getLocalizedValue)(ep.description, lang, ep.defaultLang)
                : undefined,
            slug: (0, i18n_util_1.getLocalizedValue)(ep.slug, lang, ep.defaultLang),
            episodeOrLabel: ep.episodeOrLabel,
            duration: ep.duration,
            thumbnail: ep.thumbnail,
            videoUrl: ep.videoUrl,
            isPublished: ep.isPublished,
            createdAt: ep.createdAt,
            updatedAt: ep.updatedAt,
            movie: ep.movieId || null,
        }));
        res.json({ success: true, data });
    }
    static async getByMovie(req, res) {
        const lang = req.query.lang || "vi";
        const limit = req.query.limit
            ? parseInt(req.query.limit, 10)
            : undefined;
        const episodes = await episode_service_1.EpisodeService.getByMovie(req.params.movieId, limit);
        const data = episodes.map((ep) => ({
            id: ep.id,
            title: (0, i18n_util_1.getLocalizedValue)(ep.title, lang, ep.defaultLang),
            slug: (0, i18n_util_1.getLocalizedValue)(ep.slug, lang, ep.defaultLang),
            episodeOrLabel: ep.episodeOrLabel,
            duration: ep.duration,
            thumbnail: ep.thumbnail,
            videoUrl: ep.videoUrl,
        }));
        res.json({ success: true, data });
    }
    static async getDetail(req, res) {
        const episode = await episode_service_1.EpisodeService.getDetail(req.params.id);
        res.json({ success: true, data: episode });
    }
    // ===== ADMIN / USER =====
    static async getAll(req, res) {
        const episodes = await episode_service_1.EpisodeService.getAll();
        res.json({ success: true, data: episodes });
    }
    static async create(req, res) {
        const episode = await episode_service_1.EpisodeService.create(req.body);
        res.status(201).json({ success: true, data: episode });
    }
    static async createFromText(req, res) {
        try {
            const { movieId, serverId, text, lang = "vi" } = req.body;
            if (!movieId || !serverId || !text) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu các trường bắt buộc: movieId, serverId, text",
                });
            }
            // Phân tích text thành mảng episodes
            const episodesData = text
                .split("\n")
                .filter((line) => line.trim() !== "")
                .map((line) => {
                const [episodeOrLabel, videoUrl] = line
                    .split("|")
                    .map((item) => item.trim());
                // Tạo title từ episodeOrLabel
                let title = "";
                if (episodeOrLabel.toLowerCase() === "full") {
                    title = `Tập đầy đủ`;
                }
                else if (!isNaN(Number(episodeOrLabel))) {
                    title = `Tập ${episodeOrLabel}`;
                }
                else {
                    title = episodeOrLabel;
                }
                return {
                    movieId,
                    serverId,
                    title: { [lang]: title },
                    slug: {
                        [lang]: `tap-${episodeOrLabel
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`,
                    },
                    episodeOrLabel,
                    videoUrl,
                    defaultLang: lang,
                    isPublished: true,
                };
            });
            // Gọi service để tạo episodes
            const createdEpisodes = await episode_service_1.EpisodeService.createFromText(episodesData);
            res.status(201).json({
                success: true,
                message: `Đã tạo thành công ${createdEpisodes.length} tập phim`,
                data: createdEpisodes,
            });
        }
        catch (error) {
            console.error("Error creating episodes from text:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Lỗi khi tạo episodes từ text",
            });
        }
    }
    static async update(req, res) {
        const episode = await episode_service_1.EpisodeService.update(req.params.id, req.body);
        res.json({ success: true, data: episode });
    }
    static async delete(req, res) {
        await episode_service_1.EpisodeService.delete(req.params.id);
        res.json({ success: true });
    }
}
exports.EpisodeController = EpisodeController;
