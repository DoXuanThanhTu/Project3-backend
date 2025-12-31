"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonService = void 0;
const http_error_1 = require("../../errors/http.error");
const person_model_1 = require("../../models/person.model");
class PersonService {
    // ===== PUBLIC =====
    static async getAllActive(role) {
        const filter = { isActive: true };
        if (role)
            filter.roles = role;
        return person_model_1.PersonModel.find(filter).sort({ createdAt: -1 });
    }
    static async getBySlug(slug, lang) {
        const person = await person_model_1.PersonModel.findOne({
            [`slug.${lang}`]: slug,
            isActive: true,
        });
        if (!person)
            throw new http_error_1.NotFoundError("Person not found");
        return person;
    }
    // ===== ADMIN =====
    static async getAll() {
        return person_model_1.PersonModel.find().sort({ createdAt: -1 });
    }
    static async create(data) {
        return person_model_1.PersonModel.create(data);
    }
    static async update(id, data) {
        const person = await person_model_1.PersonModel.findByIdAndUpdate(id, data, {
            new: true,
        });
        if (!person)
            throw new http_error_1.NotFoundError("Person not found");
        return person;
    }
    static async delete(id) {
        const person = await person_model_1.PersonModel.findByIdAndDelete(id);
        if (!person)
            throw new http_error_1.NotFoundError("Person not found");
    }
}
exports.PersonService = PersonService;
