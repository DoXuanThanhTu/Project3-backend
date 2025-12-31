"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerService = void 0;
const http_error_1 = require("../../errors/http.error");
const server_model_1 = require("../../models/server.model");
class ServerService {
    // ===== PUBLIC =====
    static async getAllActive() {
        return server_model_1.ServerModel.find({ isActive: true }).sort({ createdAt: 1 });
    }
    static async getDetail(id) {
        const server = await server_model_1.ServerModel.findById(id);
        if (!server)
            throw new http_error_1.NotFoundError("Server not found");
        return server;
    }
    // ===== ADMIN =====
    static async getAll() {
        return server_model_1.ServerModel.find().sort({ createdAt: -1 });
    }
    static async create(data) {
        return server_model_1.ServerModel.create(data);
    }
    static async update(id, data) {
        const server = await server_model_1.ServerModel.findByIdAndUpdate(id, data, { new: true });
        if (!server)
            throw new http_error_1.NotFoundError("Server not found");
        return server;
    }
    static async delete(id) {
        const server = await server_model_1.ServerModel.findByIdAndDelete(id);
        if (!server)
            throw new http_error_1.NotFoundError("Server not found");
    }
}
exports.ServerService = ServerService;
