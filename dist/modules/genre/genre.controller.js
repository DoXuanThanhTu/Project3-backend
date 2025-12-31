"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenreController = void 0;
const genre_service_1 = require("./genre.service");
const i18n_util_1 = require("../../utils/i18n.util");
class GenreController {
    // ===== PUBLIC =====
    static async getActive(req, res) {
        const lang = req.query.lang || "vi";
        const genres = await genre_service_1.GenreService.getAllActive();
        const data = genres.map((g) => ({
            id: g._id,
            title: (0, i18n_util_1.getLocalizedValueMap)(g.title, lang, g.defaultLang),
            slug: (0, i18n_util_1.getLocalizedValueMap)(g.slug, lang, g.defaultLang),
            description: (0, i18n_util_1.getLocalizedValueMap)(g.description, lang, g.defaultLang),
        }));
        res.json({ success: true, data });
    }
    static async getDetail(req, res) {
        const lang = req.query.lang || "vi";
        const genre = await genre_service_1.GenreService.getBySlug(req.params.slug, lang);
        res.json({
            success: true,
            data: {
                id: genre._id,
                title: (0, i18n_util_1.getLocalizedValueMap)(genre.title, lang, genre.defaultLang),
                slug: (0, i18n_util_1.getLocalizedValueMap)(genre.slug, lang, genre.defaultLang),
                description: (0, i18n_util_1.getLocalizedValueMap)(genre.description, lang, genre.defaultLang),
            },
        });
    }
    // ===== ADMIN =====
    static async getAll(req, res) {
        const genres = await genre_service_1.GenreService.getAll();
        res.json({ success: true, data: genres });
    }
    static async create(req, res) {
        const genre = await genre_service_1.GenreService.create(req.body);
        res.status(201).json({ success: true, data: genre });
    }
    static async update(req, res) {
        const genre = await genre_service_1.GenreService.update(req.params.id, req.body);
        res.json({ success: true, data: genre });
    }
    static async delete(req, res) {
        await genre_service_1.GenreService.delete(req.params.id);
        res.json({ success: true });
    }
}
exports.GenreController = GenreController;
