"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonController = void 0;
const person_service_1 = require("./person.service");
const i18n_util_1 = require("../../utils/i18n.util");
class PersonController {
    // ===== PUBLIC =====
    static async getActive(req, res) {
        const lang = req.query.lang || "vi";
        const role = req.query.role;
        const persons = await person_service_1.PersonService.getAllActive(role);
        const data = persons.map((p) => ({
            id: p._id,
            name: (0, i18n_util_1.getLocalizedValue)(p.name, lang, p.defaultLang),
            slug: (0, i18n_util_1.getLocalizedValue)(p.slug, lang, p.defaultLang),
            avatar: p.avatar,
            roles: p.roles,
        }));
        res.json({ success: true, data });
    }
    static async getDetail(req, res) {
        const lang = req.query.lang || "vi";
        const person = await person_service_1.PersonService.getBySlug(req.params.slug, lang);
        res.json({
            success: true,
            data: {
                id: person._id,
                name: (0, i18n_util_1.getLocalizedValueMap)(person.name, lang, person.defaultLang),
                bio: (0, i18n_util_1.getLocalizedValueMap)(person.bio, lang, person.defaultLang),
                avatar: person.avatar,
                cover: person.cover,
                birthday: person.birthday,
                country: person.country,
                roles: person.roles,
            },
        });
    }
    // ===== ADMIN =====
    static async getAll(req, res) {
        const persons = await person_service_1.PersonService.getAll();
        res.json({ success: true, data: persons });
    }
    static async create(req, res) {
        const person = await person_service_1.PersonService.create(req.body);
        res.status(201).json({ success: true, data: person });
    }
    static async update(req, res) {
        const person = await person_service_1.PersonService.update(req.params.id, req.body);
        res.json({ success: true, data: person });
    }
    static async delete(req, res) {
        await person_service_1.PersonService.delete(req.params.id);
        res.json({ success: true });
    }
}
exports.PersonController = PersonController;
