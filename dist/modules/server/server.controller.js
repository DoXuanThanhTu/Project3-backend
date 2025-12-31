"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerController = void 0;
const server_service_1 = require("./server.service");
class ServerController {
    // ===== PUBLIC =====
    static async getActive(req, res) {
        const servers = await server_service_1.ServerService.getAllActive();
        res.json({ success: true, data: servers });
    }
    static async getDetail(req, res) {
        const server = await server_service_1.ServerService.getDetail(req.params.id);
        res.json({ success: true, data: server });
    }
    // ===== ADMIN =====
    static async getAll(req, res) {
        const servers = await server_service_1.ServerService.getAll();
        res.json({ success: true, data: servers });
    }
    static async create(req, res) {
        const server = await server_service_1.ServerService.create(req.body);
        res.status(201).json({ success: true, data: server });
    }
    static async update(req, res) {
        const server = await server_service_1.ServerService.update(req.params.id, req.body);
        res.json({ success: true, data: server });
    }
    static async delete(req, res) {
        await server_service_1.ServerService.delete(req.params.id);
        res.json({ success: true });
    }
}
exports.ServerController = ServerController;
