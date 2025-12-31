"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const http_error_1 = require("../../errors/http.error");
const user_model_1 = require("../../models/user.model");
class UserService {
    static async getAllUsers() {
        return user_model_1.UserModel.find().select("-password");
    }
    static async getUserById(userId) {
        const user = await user_model_1.UserModel.findById(userId).select("-password");
        if (!user)
            throw new http_error_1.NotFoundError();
        return user;
    }
    static async updateUser(id, data) {
        const user = await user_model_1.UserModel.findByIdAndUpdate(id, data, {
            new: true,
        });
        if (!user)
            throw new http_error_1.NotFoundError("User not found");
        return user;
    }
    static async updateUserRole(userId, role) {
        return user_model_1.UserModel.findByIdAndUpdate(userId, { role }, { new: true }).select("-password");
    }
    static async updateUserStatus(userId, status) {
        return user_model_1.UserModel.findByIdAndUpdate(userId, { status }, { new: true }).select("-password");
    }
}
exports.UserService = UserService;
