"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
class AuthController {
    static async register(req, res) {
        const data = await auth_service_1.AuthService.register(req.body.email, req.body.password, AuthController.getMeta(req));
        AuthController.setRefreshCookie(res, data.refreshToken);
        res.status(201).json({
            success: true,
            user: data.user,
            accessToken: data.accessToken,
        });
    }
    static async login(req, res) {
        const data = await auth_service_1.AuthService.login(req.body.email, req.body.password, AuthController.getMeta(req));
        AuthController.setRefreshCookie(res, data.refreshToken);
        res.json({
            success: true,
            user: data.user,
            accessToken: data.accessToken,
        });
    }
    static async refresh(req, res) {
        const refreshToken = req.cookies.refreshToken;
        const data = await auth_service_1.AuthService.refresh(refreshToken);
        AuthController.setRefreshCookie(res, data.refreshToken);
        res.json({
            success: true,
            accessToken: data.accessToken,
        });
    }
    static async logout(req, res) {
        const refreshToken = req.cookies.refreshToken;
        await auth_service_1.AuthService.logout(refreshToken);
        res.clearCookie("refreshToken", {
            path: "/api/auth/refresh",
        });
        res.json({ success: true });
    }
    static setRefreshCookie(res, token) {
        res.cookie("refreshToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/api/auth/refresh",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }
    static getMeta(req) {
        return {
            userAgent: req.headers["user-agent"],
            ipAddress: req.ip,
            deviceId: req.headers["x-device-id"],
        };
    }
}
exports.AuthController = AuthController;
