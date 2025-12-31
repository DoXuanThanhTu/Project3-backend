"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const refreshToken_model_1 = require("../../models/refreshToken.model");
const user_model_1 = require("../../models/user.model");
const hash_1 = require("../../utils/hash");
const jwt_1 = require("../../utils/jwt");
const http_error_1 = require("../../errors/http.error");
const REFRESH_EXPIRE_MS = 7 * 24 * 60 * 60 * 1000;
class AuthService {
    static async register(email, password, meta) {
        const user = await user_model_1.UserModel.create({
            email,
            password: await (0, hash_1.hashPassword)(password),
        });
        return this.issueTokens(user, meta);
    }
    static async login(email, password, meta) {
        const user = await user_model_1.UserModel.findOne({ email });
        if (!user) {
            console.log("Khong co user");
            throw new http_error_1.UnauthorizedError();
        }
        console.log(password, user.password);
        const ok = await (0, hash_1.comparePassword)(password, user.password);
        if (!ok) {
            console.log("mk k đúng", password);
            throw new http_error_1.UnauthorizedError();
        }
        return this.issueTokens(user, meta);
    }
    static async refresh(oldRefreshToken) {
        const payload = (0, jwt_1.verifyRefreshToken)(oldRefreshToken);
        const tokenHash = this.hashToken(oldRefreshToken);
        const record = await refreshToken_model_1.RefreshTokenModel.findOne({
            userId: payload.userId,
            tokenHash,
            revoked: false,
        });
        if (!record || record.expiresAt < new Date()) {
            throw new http_error_1.UnauthorizedError();
        }
        // Rotation
        record.revoked = true;
        record.lastUsedAt = new Date();
        await record.save();
        const user = await user_model_1.UserModel.findById(payload.userId);
        if (!user)
            throw new http_error_1.UnauthorizedError();
        return this.issueTokens(user, {
            deviceId: record.deviceId || "",
            userAgent: record.userAgent || "",
            ipAddress: record.ipAddress || "",
        });
    }
    static async logout(refreshToken) {
        const tokenHash = this.hashToken(refreshToken);
        await refreshToken_model_1.RefreshTokenModel.updateOne({ tokenHash }, { revoked: true });
    }
    static async logoutAll(userId) {
        await refreshToken_model_1.RefreshTokenModel.updateMany({ userId }, { revoked: true });
    }
    // ===== PRIVATE =====
    static async issueTokens(user, meta) {
        const refreshToken = (0, jwt_1.signRefreshToken)({ userId: user._id });
        const tokenHash = this.hashToken(refreshToken);
        await refreshToken_model_1.RefreshTokenModel.create({
            userId: user._id,
            tokenHash,
            expiresAt: new Date(Date.now() + REFRESH_EXPIRE_MS),
            ...meta,
        });
        return {
            accessToken: (0, jwt_1.signAccessToken)({
                userId: user._id,
                role: user.role,
            }),
            refreshToken,
            user,
        };
    }
    static hashToken(token) {
        return crypto_1.default.createHash("sha256").update(token).digest("hex");
    }
}
exports.AuthService = AuthService;
