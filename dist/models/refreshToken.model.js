"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenModel = void 0;
const mongoose_1 = require("mongoose");
const refreshTokenSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    deviceId: String,
    userAgent: String,
    ipAddress: String,
    revoked: { type: Boolean, default: false },
    lastUsedAt: Date,
}, { timestamps: true });
exports.RefreshTokenModel = (0, mongoose_1.model)("RefreshToken", refreshTokenSchema);
