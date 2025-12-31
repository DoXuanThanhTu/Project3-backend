"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenreService = void 0;
const http_error_1 = require("../../errors/http.error");
const genre_model_1 = require("../../models/genre.model");
class GenreService {
    // ===== PUBLIC =====
    static async getAllActive() {
        return genre_model_1.GenreModel.find({ isActive: true }).sort({ createdAt: 1 });
    }
    static async getBySlug(slug, lang) {
        const genre = await genre_model_1.GenreModel.findOne({
            [`slug.${lang}`]: slug,
            isActive: true,
        });
        if (!genre)
            throw new http_error_1.NotFoundError("Genre not found");
        return genre;
    }
    // ===== ADMIN =====
    static async getAll() {
        return genre_model_1.GenreModel.find().sort({ createdAt: -1 });
    }
    static async create(data) {
        return genre_model_1.GenreModel.create(data);
    }
    static async update(id, data) {
        const genre = await genre_model_1.GenreModel.findByIdAndUpdate(id, data, {
            new: true,
        });
        if (!genre)
            throw new http_error_1.NotFoundError("Genre not found");
        return genre;
    }
    static async delete(id) {
        const genre = await genre_model_1.GenreModel.findByIdAndDelete(id);
        if (!genre)
            throw new http_error_1.NotFoundError("Genre not found");
    }
}
exports.GenreService = GenreService;
