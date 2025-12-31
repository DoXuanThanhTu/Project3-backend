"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
class UserController {
    static async getAll(req, res) {
        const users = await user_service_1.UserService.getAllUsers();
        res.json({ success: true, data: users });
    }
    static async getById(req, res) {
        const user = await user_service_1.UserService.getUserById(req.params.id);
        res.json({ success: true, data: user });
    }
    static async update(req, res) {
        const user = await user_service_1.UserService.updateUser(req.params.id, req.body);
        res.json({ success: true, data: user });
    }
    static async updateRole(req, res) {
        const user = await user_service_1.UserService.updateUserRole(req.params.id, req.body.role);
        res.json({ success: true, data: user });
    }
    static async updateStatus(req, res) {
        const user = await user_service_1.UserService.updateUserStatus(req.params.id, req.body.status);
        res.json({ success: true, data: user });
    }
}
exports.UserController = UserController;
