import { Request, Response } from "express";
import { EpisodeService } from "./episode.service";
import { IEpisode } from "../../types/episode.type";
import { getLocalizedValue } from "../../utils/i18n.util";

export class EpisodeController {
  // ===== PUBLIC =====
  static async getAllEpisode(req: Request, res: Response) {
    const lang = (req.query.lang as string) || "vi";

    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : undefined;

    const episodes = await EpisodeService.getAllEpisode(limit);

    const data = episodes.map((ep: IEpisode) => ({
      id: ep.id,
      title: getLocalizedValue(ep.title, lang, ep.defaultLang),
      description: ep.description
        ? getLocalizedValue(ep.description, lang, ep.defaultLang)
        : undefined,
      slug: getLocalizedValue(ep.slug, lang, ep.defaultLang),
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

  static async getByMovie(req: Request, res: Response) {
    const lang = (req.query.lang as string) || "vi";

    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : undefined;

    const episodes = await EpisodeService.getByMovie(req.params.movieId, limit);

    const data = episodes.map((ep: IEpisode) => ({
      id: ep.id,
      title: getLocalizedValue(ep.title, lang, ep.defaultLang),
      slug: getLocalizedValue(ep.slug, lang, ep.defaultLang),
      episodeOrLabel: ep.episodeOrLabel,
      duration: ep.duration,
      thumbnail: ep.thumbnail,
      videoUrl: ep.videoUrl,
    }));

    res.json({ success: true, data });
  }

  static async getDetail(req: Request, res: Response) {
    const episode = await EpisodeService.getDetail(req.params.id);
    res.json({ success: true, data: episode });
  }

  // ===== ADMIN / USER =====
  static async getAll(req: Request, res: Response) {
    const episodes = await EpisodeService.getAll();
    res.json({ success: true, data: episodes });
  }

  static async create(req: Request, res: Response) {
    const episode = await EpisodeService.create(req.body);
    res.status(201).json({ success: true, data: episode });
  }
  static async createFromText(req: Request, res: Response) {
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
        .filter((line: string) => line.trim() !== "")
        .map((line: string) => {
          const [episodeOrLabel, videoUrl] = line
            .split("|")
            .map((item) => item.trim());

          // Tạo title từ episodeOrLabel
          let title = "";
          if (episodeOrLabel.toLowerCase() === "full") {
            title = `Tập đầy đủ`;
          } else if (!isNaN(Number(episodeOrLabel))) {
            title = `Tập ${episodeOrLabel}`;
          } else {
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
      const createdEpisodes = await EpisodeService.createFromText(episodesData);

      res.status(201).json({
        success: true,
        message: `Đã tạo thành công ${createdEpisodes.length} tập phim`,
        data: createdEpisodes,
      });
    } catch (error: any) {
      console.error("Error creating episodes from text:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi khi tạo episodes từ text",
      });
    }
  }
  static async update(req: Request, res: Response) {
    const episode = await EpisodeService.update(req.params.id, req.body);
    res.json({ success: true, data: episode });
  }

  static async delete(req: Request, res: Response) {
    await EpisodeService.delete(req.params.id);
    res.json({ success: true });
  }
}
