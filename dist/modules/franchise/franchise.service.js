"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FranchiseService = void 0;
const http_error_1 = require("../../errors/http.error");
const franchise_model_1 = require("../../models/franchise.model");
class FranchiseService {
    // ===== PUBLIC =====
    static async getAllActive() {
        return franchise_model_1.FranchiseModel.find({ isPublished: true })
            .sort({ createdAt: 1 })
            .populate("movies");
    }
    static async getBySlug(slug, lang) {
        const franchise = await franchise_model_1.FranchiseModel.findOne({
            [`slug.${lang}`]: slug,
            isPublished: true,
        }).populate("movies");
        if (!franchise)
            throw new http_error_1.NotFoundError("Franchise not found");
        return franchise;
    }
    // ===== ADMIN =====
    static async getAll() {
        return franchise_model_1.FranchiseModel.find().sort({ createdAt: -1 }).populate("movies");
    }
    static async create(data) {
        return franchise_model_1.FranchiseModel.create(data);
    }
    static async update(id, data) {
        const franchise = await franchise_model_1.FranchiseModel.findByIdAndUpdate(id, data, {
            new: true,
        }).populate("movies");
        if (!franchise)
            throw new http_error_1.NotFoundError("Franchise not found");
        return franchise;
    }
    static async delete(id) {
        const franchise = await franchise_model_1.FranchiseModel.findByIdAndDelete(id);
        if (!franchise)
            throw new http_error_1.NotFoundError("Franchise not found");
    }
}
exports.FranchiseService = FranchiseService;
