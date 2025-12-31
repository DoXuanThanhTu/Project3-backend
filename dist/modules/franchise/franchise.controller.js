"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FranchiseController = void 0;
const franchise_service_1 = require("./franchise.service");
const i18n_util_1 = require("../../utils/i18n.util");
class FranchiseController {
    // ===== PUBLIC =====
    static async getActive(req, res) {
        const lang = req.query.lang || "vi";
        const franchises = await franchise_service_1.FranchiseService.getAllActive();
        const data = franchises.map((f) => ({
            id: f._id,
            title: (0, i18n_util_1.getLocalizedValueMap)(f.title, lang, f.defaultLang),
            slug: (0, i18n_util_1.getLocalizedValueMap)(f.slug, lang, f.defaultLang),
            description: (0, i18n_util_1.getLocalizedValueMap)(f.description, lang, f.defaultLang),
            movies: f.movies
                ? f.movies.map((m) => ({
                    id: m._id,
                    name: (0, i18n_util_1.getLocalizedValueMap)(m.title, lang, m.defaultLang),
                    slug: (0, i18n_util_1.getLocalizedValueMap)(m.slug, lang, m.defaultLang),
                    description: (0, i18n_util_1.getLocalizedValueMap)(m.description, lang, m.defaultLang),
                }))
                : [],
        }));
        res.json({ success: true, data });
    }
    static async getDetail(req, res) {
        const lang = req.query.lang || "vi";
        const franchise = await franchise_service_1.FranchiseService.getBySlug(req.params.slug, lang);
        res.json({
            success: true,
            data: {
                id: franchise._id,
                title: (0, i18n_util_1.getLocalizedValueMap)(franchise.title, lang, franchise.defaultLang),
                slug: (0, i18n_util_1.getLocalizedValueMap)(franchise.slug, lang, franchise.defaultLang),
                description: (0, i18n_util_1.getLocalizedValueMap)(franchise.description, lang, franchise.defaultLang),
                movies: franchise.movies
                    ? franchise.movies.map((m) => ({
                        id: m._id,
                        title: (0, i18n_util_1.getLocalizedValueMap)(m.title, lang, m.defaultLang),
                        slug: (0, i18n_util_1.getLocalizedValueMap)(m.slug, lang, m.defaultLang),
                        description: (0, i18n_util_1.getLocalizedValueMap)(m.description, lang, m.defaultLang),
                    }))
                    : [],
            },
        });
    }
    // ===== ADMIN =====
    static async getAll(req, res) {
        const franchises = await franchise_service_1.FranchiseService.getAll();
        res.json({
            success: true,
            data: franchises,
        });
    }
    static async create(req, res) {
        const franchise = await franchise_service_1.FranchiseService.create(req.body);
        res.status(201).json({
            success: true,
            data: franchise,
        });
    }
    static async update(req, res) {
        const franchise = await franchise_service_1.FranchiseService.update(req.params.id, req.body);
        res.json({
            success: true,
            data: franchise,
        });
    }
    static async delete(req, res) {
        await franchise_service_1.FranchiseService.delete(req.params.id);
        res.json({ success: true });
    }
}
exports.FranchiseController = FranchiseController;
